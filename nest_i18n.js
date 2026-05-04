const fs = require('fs');
const path = require('path');

function nestJson(flatJson) {
  const nested = {};
  for (const key in flatJson) {
    const parts = key.split('.');
    let current = nested;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = flatJson[key];
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }
  return nested;
}

const locales = ['en', 'am'];
const baseDir = path.join(process.cwd(), 'frontend', 'public', 'locales');

locales.forEach(lng => {
  const filePath = path.join(baseDir, lng, 'common.json');
  if (fs.existsSync(filePath)) {
    const flatJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const nestedJson = nestJson(flatJson);
    fs.writeFileSync(filePath, JSON.stringify(nestedJson, null, 2), 'utf8');
    console.log(`Nested ${lng}/common.json`);
  }
});
