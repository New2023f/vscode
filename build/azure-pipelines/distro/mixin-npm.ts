/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as cp from 'child_process';

function log(...args: any[]): void {
	console.log(`[${new Date().toLocaleTimeString('en', { hour12: false })}]`, '[distro]', ...args);
}

function mixin(target: string, dependencies: string[]) {
	log(`Mixing in distro npm dependencies: ${target}`);

	const distroPackageJson = JSON.parse(fs.readFileSync('.build/distro/npm/package.json', 'utf8'));
	const distroYarnLock = fs.readFileSync('.build/distro/npm/yarn.lock', 'utf8');

	const ossPackageJson = JSON.parse(fs.readFileSync(`${target}/package.json`, 'utf8'));
	let ossYarnLock = fs.readFileSync(`${target}/yarn.lock`, 'utf8');

	for (const dependency of dependencies) {
		fs.cpSync(`.build/distro/npm/node_modules/${dependency}`, `${target}/node_modules/${dependency}`, { recursive: true, force: true });
		ossPackageJson.dependencies[dependency] = distroPackageJson.dependencies[dependency];

		const rx = new RegExp(`^"?${dependency}@.*\n(?:  .*\n)*\n`, 'm');
		const match = distroYarnLock.match(rx);

		if (!match || match.length < 1) {
			throw new Error(`Could not find dependency ${dependency} in yarn.lock`);
		}

		const result = match[0].replace(/^  dependencies:.*\n(?:    .*\n)*(\n)/mg, '$1');
		ossYarnLock += result;
	}

	fs.writeFileSync(`${target}/package.json`, JSON.stringify(ossPackageJson, null, 2), 'utf8');
	fs.writeFileSync(`${target}/yarn.lock`, ossYarnLock, 'utf8');

	log(`Mixed in distro npm dependencies: ${target} ✔︎`);
}

function main() {
	log(`Installing distro npm dependencies...`);
	cp.execSync(`yarn`, { stdio: 'inherit', cwd: '.build/distro/npm' });
	log('Installed distro npm dependencies ✔︎');

	log(`Mixing in distro npm dependencies...`);
	const distroPackageJson = JSON.parse(fs.readFileSync('.build/distro/npm/package.json', 'utf8'));

	for (const target of Object.keys(distroPackageJson.distro)) {
		mixin(target, distroPackageJson.distro[target]);
	}
}

if (process.env['npm_config_arch'] === 'armv7l') {
	process.env['npm_config_arch'] = 'arm';
}

main();
