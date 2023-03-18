"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const cp = require("child_process");
function log(...args) {
    console.log(`[${new Date().toLocaleTimeString('en', { hour12: false })}]`, '[distro]', ...args);
}
function mixin(target, dependencies) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWl4aW4tbm9kZS1tb2R1bGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWl4aW4tbm9kZS1tb2R1bGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcseUJBQXlCO0FBQ3pCLG9DQUFvQztBQUVwQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLElBQVc7SUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNqRyxDQUFDO0FBRUQsU0FBUyxLQUFLLENBQUMsTUFBYyxFQUFFLFlBQXNCO0lBQ3BELEdBQUcsQ0FBQyxnQ0FBZ0MsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUU5QyxLQUFLLE1BQU0sVUFBVSxJQUFJLFlBQVksRUFBRTtRQUN0QyxFQUFFLENBQUMsTUFBTSxDQUFDLGtDQUFrQyxVQUFVLEVBQUUsRUFBRSxHQUFHLE1BQU0saUJBQWlCLFVBQVUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUNwSTtJQUVELEdBQUcsQ0FBQywrQkFBK0IsTUFBTSxLQUFLLENBQUMsQ0FBQztBQUNqRCxDQUFDO0FBRUQsU0FBUyxJQUFJO0lBQ1osR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7SUFDN0MsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUM7SUFDcEUsR0FBRyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7SUFFNUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsZ0NBQWdDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUVoRyxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDeEQsS0FBSyxDQUFDLEdBQUcsRUFBRSxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNoRDtBQUNGLENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQyJ9