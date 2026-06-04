import fs from 'fs';
import path from 'path';

const dir = 'src/features/dashboard/sections';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.jsx'));

for (const file of files) {
  let c = fs.readFileSync(path.join(dir, file), 'utf8');
  c = c.replace(/\bc\.isRTL=\{c\.isRTL\}/g, 'isRTL={c.isRTL}');
  c = c.replace(/c\.t\('total-c\.(\w+)/g, "c.t('total-$1");
  c = c.replace(/c\.t\('nav-c\.(\w+)/g, "c.t('nav-$1");
  c = c.replace(/setCurrentSection\('c\.(\w+)/g, "setCurrentSection('$1");
  c = c.replace(/Search c\.categories/g, 'Search categories');
  c = c.replace(/'c\.(\w+-stories)'/g, "'$1'");
  c = c.replace(/c\.success-c\.stories/g, 'c.successStories');
  c = c.replace(/c\.filtered-c\.(\w+)/g, 'c.filtered$1');
  c = c.replace(/c\.stats\.c\./g, 'c.stats.');
  c = c.replace(/label=\{c\.t\('([^']*)c\.([^']*)'\)/g, "label={c.t('$1$2')");
  fs.writeFileSync(path.join(dir, file), c);
}
console.log('Fixed', files.length, 'sections');
