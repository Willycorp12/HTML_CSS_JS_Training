const fs = require('fs');
const path = require('path');
const indexPath = path.join(process.cwd(), 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');
const base = path.join(process.cwd(), 'screens');
const files = [];
const walk = dir => {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(path.relative(base, p).replace(/\\/g, '/'));
  });
};
walk(base);
const map = {};
files.forEach(f => { map[path.basename(f)] = 'screens/' + f; });
const mapString = JSON.stringify(map, null, 4);
const newBlock = `    window.screenPathMap = ${mapString};\n`;
const regex = /window\.screenPathMap = window\.screenPathMap \|\| \{[\s\S]*?\};\n/;
if (!regex.test(content)) {
  throw new Error('Map block not found');
}
content = content.replace(regex, newBlock);
content = content.replace(/function loadScreen\(file, menuElement = null, title = ''\) \{\r?\n\r?\n    fetch\(resolveScreenPath\(file\)\)/, `function loadScreen(file, menuElement = null, title = '') {\n    const normalizedFile = file.split('/').pop();\n\n    fetch(resolveScreenPath(file)`);
content = content.replace(/if \(file === "([^"]+)"\)/g, (m, p1) => `if (normalizedFile === "${p1}")`);
fs.writeFileSync(indexPath, content, 'utf8');
console.log('Updated index.html mapping and normalized init comparisons.');
