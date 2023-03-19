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
    log(`Mixing in distro npm dependencies...`);
    const distroPackageJson = JSON.parse(fs.readFileSync('.build/distro/npm/package.json', 'utf8'));
    for (const target of Object.keys(distroPackageJson.distro)) {
        mixin(target, distroPackageJson.distro[target]);
    }
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWl4aW4tbnBtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWl4aW4tbnBtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcseUJBQXlCO0FBRXpCLFNBQVMsR0FBRyxDQUFDLEdBQUcsSUFBVztJQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ2pHLENBQUM7QUFFRCxTQUFTLEtBQUssQ0FBQyxNQUFjLEVBQUUsWUFBc0I7SUFDcEQsR0FBRyxDQUFDLHNDQUFzQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBRXBELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLGdDQUFnQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDaEcsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyw2QkFBNkIsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUU5RSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxNQUFNLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3JGLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxNQUFNLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUVqRSxLQUFLLE1BQU0sVUFBVSxJQUFJLFlBQVksRUFBRTtRQUN0QyxFQUFFLENBQUMsTUFBTSxDQUFDLGtDQUFrQyxVQUFVLEVBQUUsRUFBRSxHQUFHLE1BQU0saUJBQWlCLFVBQVUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNwSSxjQUFjLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVyRixNQUFNLEVBQUUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLFVBQVUsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakUsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUV2QyxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLFVBQVUsZUFBZSxDQUFDLENBQUM7U0FDeEU7UUFFRCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLHlDQUF5QyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pGLFdBQVcsSUFBSSxNQUFNLENBQUM7S0FDdEI7SUFFRCxFQUFFLENBQUMsYUFBYSxDQUFDLEdBQUcsTUFBTSxlQUFlLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzVGLEVBQUUsQ0FBQyxhQUFhLENBQUMsR0FBRyxNQUFNLFlBQVksRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFN0QsR0FBRyxDQUFDLHFDQUFxQyxNQUFNLEtBQUssQ0FBQyxDQUFDO0FBQ3ZELENBQUM7QUFFRCxTQUFTLElBQUk7SUFDWixHQUFHLENBQUMsc0NBQXNDLENBQUMsQ0FBQztJQUM1QyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxnQ0FBZ0MsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBRWhHLEtBQUssTUFBTSxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUMzRCxLQUFLLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQ2hEO0FBQ0YsQ0FBQztBQUVELElBQUksRUFBRSxDQUFDIn0=