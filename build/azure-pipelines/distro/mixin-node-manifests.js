"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
function log(...args) {
    console.log(`[${new Date().toLocaleTimeString('en', { hour12: false })}]`, '[distro]', ...args);
}
function mixin(target, dependencies) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWl4aW4tbm9kZS1tYW5pZmVzdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtaXhpbi1ub2RlLW1hbmlmZXN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLHlCQUF5QjtBQUV6QixTQUFTLEdBQUcsQ0FBQyxHQUFHLElBQVc7SUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNqRyxDQUFDO0FBRUQsU0FBUyxLQUFLLENBQUMsTUFBYyxFQUFFLFlBQXNCO0lBQ3BELEdBQUcsQ0FBQyxvQ0FBb0MsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUVsRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxnQ0FBZ0MsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2hHLE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsNkJBQTZCLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFOUUsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEdBQUcsTUFBTSxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNyRixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEdBQUcsTUFBTSxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFakUsS0FBSyxNQUFNLFVBQVUsSUFBSSxZQUFZLEVBQUU7UUFDdEMsY0FBYyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFckYsTUFBTSxFQUFFLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxVQUFVLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFdkMsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixVQUFVLGVBQWUsQ0FBQyxDQUFDO1NBQ3hFO1FBRUQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyx5Q0FBeUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqRixXQUFXLElBQUksTUFBTSxDQUFDO0tBQ3RCO0lBRUQsRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFHLE1BQU0sZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM1RixFQUFFLENBQUMsYUFBYSxDQUFDLEdBQUcsTUFBTSxZQUFZLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRTdELEdBQUcsQ0FBQyxtQ0FBbUMsTUFBTSxLQUFLLENBQUMsQ0FBQztBQUNyRCxDQUFDO0FBRUQsU0FBUyxJQUFJO0lBQ1osR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFFMUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsZ0NBQWdDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUVoRyxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDeEQsS0FBSyxDQUFDLEdBQUcsRUFBRSxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNoRDtBQUNGLENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQyJ9