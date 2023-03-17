"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
function log(...args) {
    console.log(`[${new Date().toLocaleTimeString('en', { hour12: false })}]`, ...args);
}
function mixin(quality) {
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
            const distro = JSON.parse(fs.readFileSync(distroPath, 'utf8'));
            const oss = JSON.parse(fs.readFileSync(ossPath, 'utf8'));
            let builtInExtensions = oss.builtInExtensions;
            if (Array.isArray(distro.builtInExtensions)) {
                log('[mixin]', 'Overwriting built-in extensions:', distro.builtInExtensions.map(e => e.name));
                builtInExtensions = distro.builtInExtensions;
            }
            else if (distro.builtInExtensions) {
                const include = distro.builtInExtensions['include'] ?? [];
                const exclude = distro.builtInExtensions['exclude'] ?? [];
                log('[mixin]', 'OSS built-in extensions:', builtInExtensions.map(e => e.name));
                log('[mixin]', 'Including built-in extensions:', include.map(e => e.name));
                log('[mixin]', 'Excluding built-in extensions:', exclude);
                builtInExtensions = builtInExtensions.filter(ext => !include.find(e => e.name === ext.name) && !exclude.find(name => name === ext.name));
                builtInExtensions = [...builtInExtensions, ...include];
                log('[mixin]', 'Final built-in extensions:', builtInExtensions.map(e => e.name));
            }
            else {
                log('[mixin]', 'Inheriting OSS built-in extensions', builtInExtensions.map(e => e.name));
            }
            const result = { webBuiltInExtensions: oss.webBuiltInExtensions, ...distro, builtInExtensions };
            fs.writeFileSync(ossPath, JSON.stringify(result, null, 2), 'utf8');
        }
        else {
            fs.cpSync(distroPath, ossPath, { force: true, recursive: true });
        }
        log('[mixin]', distroPath, '✔︎');
    }
}
function npm(linuxServer = false) {
    log(`[npm] Installing distro npm dependencies...`);
    const basePath = `distro/npm`;
    const manifestPaths = linuxServer ? [`remote/package.json`] : [
        `package.json`,
        `remote/package.json`,
        `remote/web/package.json`,
    ];
    for (const manifestPath of manifestPaths) {
        const distroPath = path.join(basePath, manifestPath);
        const distro = JSON.parse(fs.readFileSync(distroPath, 'utf8'));
        const distroBasePath = path.dirname(distroPath);
        const ossPath = path.relative(basePath, distroPath);
        const ossBasePath = path.dirname(ossPath);
        cp.execSync(`yarn`, { stdio: 'inherit', cwd: distroBasePath });
        for (const dependency of Object.keys(distro.dependencies)) {
            fs.cpSync(path.join(distroBasePath, 'node_modules', dependency), path.join(ossBasePath, 'node_modules', dependency), { recursive: true, force: true });
        }
        const oss = JSON.parse(fs.readFileSync(ossPath, 'utf8'));
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
function main(args) {
    if (args.includes('--cli')) {
        patches();
    }
    else if (args.includes('--linux-server')) {
        npm();
    }
    else {
        mixin(process.env['VSCODE_QUALITY']);
        npm();
    }
}
main(process.argv.slice(2));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWl4aW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtaXhpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0Isb0NBQW9DO0FBdUJwQyxTQUFTLEdBQUcsQ0FBQyxHQUFHLElBQVc7SUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ3JGLENBQUM7QUFFRCxTQUFTLEtBQUssQ0FBQyxPQUEyQjtJQUN6QyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ2IsR0FBRyxDQUFDLFNBQVMsRUFBRSx3Q0FBd0MsQ0FBQyxDQUFDO1FBQ3pELE9BQU87S0FDUDtJQUVELEdBQUcsQ0FBQyxTQUFTLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztJQUU5QyxNQUFNLFFBQVEsR0FBRyxnQkFBZ0IsT0FBTyxFQUFFLENBQUM7SUFFM0MsS0FBSyxNQUFNLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQzVDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRXBELElBQUksT0FBTyxLQUFLLGNBQWMsSUFBSSxPQUFPLEtBQUsscUJBQXFCLEVBQUU7WUFDcEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBWSxDQUFDO1lBQzFFLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFB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