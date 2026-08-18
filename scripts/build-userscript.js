const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

const header = `// ==UserScript==
// @name         ${manifest.name}
// @namespace    locrz
// @version      ${manifest.version}
// @description  ${manifest.description}
// @match        https://github.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

`;

const source = fs.readFileSync(path.join(root, 'src', 'exclude-drafts.js'), 'utf8');
fs.writeFileSync(path.join(root, 'github-exclude-draft-prs.user.js'), header + source);
