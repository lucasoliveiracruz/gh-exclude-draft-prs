const fs = require('node:fs');
const path = require('node:path');

const RAW_URL = 'https://raw.githubusercontent.com/lucasoliveiracruz/gh-exclude-draft-prs/main/github-exclude-draft-prs.user.js';
const HOMEPAGE = 'https://github.com/lucasoliveiracruz/gh-exclude-draft-prs';

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const [{js: sources}] = manifest.content_scripts;

const header = `// ==UserScript==
// @name         ${manifest.name}
// @namespace    ${HOMEPAGE}
// @version      ${manifest.version}
// @description  ${manifest.description}
// @homepageURL  ${HOMEPAGE}
// @supportURL   ${HOMEPAGE}/issues
// @downloadURL  ${RAW_URL}
// @updateURL    ${RAW_URL}
// @match        https://github.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

`;

const body = sources
	.map(source => fs.readFileSync(path.join(root, source), 'utf8'))
	.join('\n');

fs.writeFileSync(path.join(root, 'github-exclude-draft-prs.user.js'), header + body);
