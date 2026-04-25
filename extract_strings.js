const fs = require('fs');
const path = require('path');

const dir = './frontend/src';
const result = new Set();

function walk(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      // Match Arabic strings (simplistic regex)
      const matches = content.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+/g);
      if (matches) {
        matches.forEach(m => result.add(m));
      }
    }
  }
}

walk(dir);
console.log('Total unique Arabic words/phrases:', result.size);
// Optionally write to a file
// fs.writeFileSync('arabic_words.json', JSON.stringify(Array.from(result), null, 2));
