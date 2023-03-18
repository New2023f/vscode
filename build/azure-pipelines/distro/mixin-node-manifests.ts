/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';

function log(...args: any[]): void {
	console.log(`[${new Date().toLocaleTimeString('en', { hour12: false })}]`, '[distro]', ...args);
}

function mixin(target: string, dependencies: string[]) {
	log(`Mixing in distro node manifests: ${target}`);

	const distroPackageJson = JSON.parse(fs.readFileSync('.build/distro/npm/package.json', 'utf8'));
	const distroYarnLock = fs.readFileSync('.build/distro/npm/yarn.lock', 'utf8');

	const ossPackageJson = JSON.parse(fs.readFileSync(`${target}/package.json`, 'utf8'));
	let ossYarnLock = fs.readFileSync(`${target}/yarn.lock`, 'utf8');

	for (const dependency of dependencies) {
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

	log(`Mixed in distro node manifests: ${target} ✔︎`);
}

function main() {
	log(`Mixing in distro node manifests...`);

	const distroPackageJson = JSON.parse(fs.readFileSync('.build/distro/npm/package.json', 'utf8'));

	for (const cwd of Object.keys(distroPackageJson.distro)) {
		mixin(cwd, distroPackageJson.dependencies[cwd]);
	}
}

main();
