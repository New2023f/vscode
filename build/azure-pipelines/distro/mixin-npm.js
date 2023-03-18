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
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWl4aW4tbnBtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWl4aW4tbnBtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcseUJBQXlCO0FBQ3pCLG9DQUFvQztBQUVwQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLElBQVc7SUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNqRyxDQUFDO0FBRUQsU0FBUyxLQUFLLENBQUMsTUFBYyxFQUFFLFlBQXNCO0lBQ3BELEdBQUcsQ0FBQyxzQ0FBc0MsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUVwRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxnQ0FBZ0MsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2hHLE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsNkJBQTZCLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFOUUsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEdBQUcsTUFBTSxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNyRixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEdBQUcsTUFBTSxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFakUsS0FBSyxNQUFNLFVBQVUsSUFBSSxZQUFZLEVBQUU7UUFDdEMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxrQ0FBa0MsVUFBVSxFQUFFLEVBQUUsR0FBRyxNQUFNLGlCQUFpQixVQUFVLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDcEksY0FBYyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFckYsTUFBTSxFQUFFLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxVQUFVLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFdkMsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixVQUFVLGVBQWUsQ0FBQyxDQUFDO1NBQ3hFO1FBRUQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyx5Q0FBeUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqRixXQUFXLElBQUksTUFBTSxDQUFDO0tBQ3RCO0lBRUQsRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFHLE1BQU0sZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM1RixFQUFFLENBQUMsYUFBYSxDQUFDLEdBQUcsTUFBTSxZQUFZLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRTdELEdBQUcsQ0FBQyxxQ0FBcUMsTUFBTSxLQUFLLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBRUQsU0FBUyxJQUFJO0lBQ1osR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7SUFDN0MsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUM7SUFDcEUsR0FBRyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7SUFFNUMsR0FBRyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7SUFDNUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsZ0NBQWdDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUVoRyxLQUFLLE1BQU0sTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDM0QsS0FBSyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztLQUNoRDtBQUNGLENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQyJ9