/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';

interface IBuiltInExtension {
	readonly name: string;
	readonly version: string;
	readonly repo: string;
	readonly metadata: any;
}

interface OSSProduct {
	readonly builtInExtensions: IBuiltInExtension[];
	readonly webBuiltInExtensions?: IBuiltInExtension[];
}

interface Product {
	readonly builtInExtensions?: IBuiltInExtension[] | { 'include'?: IBuiltInExtension[]; 'exclude'?: string[] };
	readonly webBuiltInExtensions?: IBuiltInExtension[];
}

interface Package {
	dependencies?: { [namespace: string]: string };
}

function log(...args: any[]): void {
	console.log(`[${new Date().toLocaleTimeString('en', { hour12: false })}]`, ...args);
}

function mixin(quality: string | undefined) {
	if (!quality) {
		log('[mixin]', 'Missing VSCODE_QUALITY, skipping mixin');
		return;
	}

	log('[mixin]', `Mixing in distro sources...`);

	const basePath = `distro/mixin/${quality}`;

	for (const name of fs.readdirSync(basePath)) {
		const distroPath = path.join(basePath, name);
		const ossPath = path.relative(basePath, distroPath);

		if (ossPath === 'product.json' || ossPath === 'product.server.json') {
			const distro = JSON.parse(fs.readFileSync(distroPath, 'utf8')) as Product;
			const oss = JSON.parse(fs.readFileSync(ossPath, 'utf8')) as OSSProduct;
			let builtInExtensions = oss.builtInExtensions;

			if (Array.isArray(distro.builtInExtensions)) {
				log('[mixin]', 'Overwriting built-in extensions:', distro.builtInExtensions.map(e => e.name));

				builtInExtensions = distro.builtInExtensions;
			} else if (distro.builtInExtensions) {
				const include = distro.builtInExtensions['include'] ?? [];
				const exclude = distro.builtInExtensions['exclude'] ?? [];

				log('[mixin]', 'OSS built-in extensions:', builtInExtensions.map(e => e.name));
				log('[mixin]', 'Including built-in extensions:', include.map(e => e.name));
				log('[mixin]', 'Excluding built-in extensions:', exclude);

				builtInExtensions = builtInExtensions.filter(ext => !include.find(e => e.name === ext.name) && !exclude.find(name => name === ext.name));
				builtInExtensions = [...builtInExtensions, ...include];

				log('[mixin]', 'Final built-in extensions:', builtInExtensions.map(e => e.name));
			} else {
				log('[mixin]', 'Inheriting OSS built-in extensions', builtInExtensions.map(e => e.name));
			}

			const result = { webBuiltInExtensions: oss.webBuiltInExtensions, ...distro, builtInExtensions };
			fs.writeFileSync(ossPath, JSON.stringify(result, null, 2), 'utf8');
		} else {
			fs.cpSync(distroPath, ossPath, { force: true, recursive: true });
		}

		log('[mixin]', distroPath, '✔︎');
	}
}

function npm(linuxServer: boolean = false) {
	log(`[npm] Installing distro npm dependencies...`);

	const basePath = `distro/npm`;
	const manifestPaths = linuxServer ? [`remote/package.json`] : [
		`package.json`,
		`remote/package.json`,
		`remote/web/package.json`,
	];

	for (const manifestPath of manifestPaths) {
		const distroPath = path.join(basePath, manifestPath);
		const distro = JSON.parse(fs.readFileSync(distroPath, 'utf8')) as Package;
		const distroBasePath = path.dirname(distroPath);

		const ossPath = path.relative(basePath, distroPath);
		const ossBasePath = path.dirname(ossPath);

		cp.execSync(`yarn`, { stdio: 'inherit', cwd: distroBasePath });

		for (const dependency of Object.keys(distro.dependencies!)) {
			fs.cpSync(path.join(distroBasePath, 'node_modules', dependency), path.join(ossBasePath, 'node_modules', dependency), { recursive: true, force: true });
		}

		const oss = JSON.parse(fs.readFileSync(ossPath, 'utf8')) as Package;
		oss.dependencies = { ...oss.dependencies, ...distro.dependencies };
		fs.writeFileSync(ossPath, JSON.stringify(oss, null, 2), 'utf8');

		log('[npm]', distroPath, '✔︎');
	}
}

function patches() {
	log('[patch]', `Applying distro patches...`);

	const basePath = `distro/patches`;

	for (const patch of fs.readdirSync(basePath)) {
		cp.execSync(`git apply --ignore-whitespace --ignore-space-change ${basePath}/${patch}`, { stdio: 'inherit' });
		log('[patch]', patch, '✔︎');
	}
}

function main(args: string[]) {
	if (args.includes('--cli')) {
		patches();
	} else if (args.includes('--linux-server')) {
		npm();
	} else {
		mixin(process.env['VSCODE_QUALITY']);
		npm();
	}
}

main(process.argv.slice(2));
