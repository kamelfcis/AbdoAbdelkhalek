import fs from 'fs';
import path from 'path';

const dir = 'src/features/dashboard/sections';
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.jsx'))) {
  let body = fs.readFileSync(path.join(dir, file), 'utf8');
  body = body.replace(/\n\s*\{\/\*[^*]*\*\/\}\s*(?=\n\s*\);)/g, '');
  body = body.replace(/\n\s*\)\}\s*(?=\n\s*\);)/g, '\n');
  body = body.replace(/\bisRTL=\{isRTL\}/g, 'isRTL={c.isRTL}');
  body = body.replace(/\{t\(/g, '{c.t(');
  body = body.replace(/header=\{t\(/g, 'header={c.t(');
  body = body.replace(/No c\.reviews/g, 'No reviews');
  body = body.replace(/Search c\.reviews/g, 'Search reviews');
  body = body.replace(/'c\.reviews'/g, "'reviews'");
  fs.writeFileSync(path.join(dir, file), body);
}
console.log('Polished sections');
