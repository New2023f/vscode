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
	log(`Copying distro node modules: ${target}`);

	for (const dependency of dependencies) {
		fs.cpSync(`.build/distro/npm/node_modules/${dependency}`, `${target}/node_modules/${dependency}`, { recursive: true, force: true });
	}

	log(`Copied distro node modules: ${target} ✔︎`);
}

function main() {
	log(`Installing distro npm dependencies...`);
	cp.execSync(`yarn`, { stdio: 'inherit', cwd: '.build/distro/npm' });
	log('Installed distro npm dependencies ✔︎');

	const distroPackageJson = JSON.parse(fs.readFileSync('.build/distro/npm/package.json', 'utf8'));

	for (const cwd of Object.keys(distroPackageJson.distro)) {
		mixin(cwd, distroPackageJson.dependencies[cwd]);
	}
}

main();
