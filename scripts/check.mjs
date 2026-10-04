import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFile(resolve(root, file), 'utf8');
const context = vm.createContext({ window: {} });
vm.runInContext(await read('content.js'), context);
vm.runInContext(await read('themes.js'), context);
const { copy, themes, fonts, screens, config } = context.window.SuperKeyboard;
const html = await read('index.html');
const css = await read('styles.css');

assert.equal(themes.length, 24, '24 themes');
assert.equal(new Set(themes.map(theme => theme.id)).size, 24, 'Theme IDs must be unique');
assert.equal(themes.filter(theme => !theme.premium).length, 6, '6 free themes');
assert.equal(fonts.length, 6, '6 font families');
assert.equal(screens.length, 5, '5 actual app screenshots');
for (const [key, pair] of Object.entries(copy)) {
  assert.equal(pair.length, 2, `${key}: Chinese and English required`);
  pair.forEach(value => assert.equal(typeof value, 'string', `${key}: text required`));
  const placeholders = value => (value.match(/\{\w+\}/g) || []).sort().join();
  assert.equal(placeholders(pair[0]), placeholders(pair[1]), `${key}: interpolation mismatch`);
}
for (const key of [...html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)].map(match => match[1])) {
  assert.ok(copy[key], `Missing translation: ${key}`);
}
for (const theme of themes) {
  assert.ok(copy[`category.${theme.category}`], `Unknown category: ${theme.category}`);
  for (const palette of [theme.light, theme.dark]) {
    assert.equal(palette.length, 6);
    palette.forEach(hex => assert.match(hex, /^[0-9A-F]{6}$/));
  }
  assert.equal(theme.name.length, 2);
}
const fontManifest = JSON.parse(await read('assets/font-sources.json'));
for (const font of fontManifest.fonts) {
  for (const [file, hash] of [[font.file, font.sha256], [font.licenseFile, font.licenseSha256]]) {
    const bytes = await readFile(resolve(root, 'assets', file));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash, `${file}: original source hash`);
  }
}
const assets = new Set([
  ...[...html.matchAll(/(?:src|href)="(assets\/[^"#?]+)"/g)].map(match => match[1]),
  ...[...css.matchAll(/url\('([^']+)'\)/g)].map(match => match[1]),
  ...screens.map(screen => `assets/screenshots/${screen.file}`)
]);
for (const file of assets) await access(resolve(root, file));
for (const url of Object.values(config)) assert.ok(url === null || new URL(url).protocol === 'https:', 'Downloads must be null or an HTTPS link');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Unique HTML IDs');
for (const target of [...html.matchAll(/href="#([^"]+)"/g)].map(match => match[1])) assert.ok(ids.includes(target), `Broken section anchor #${target}`);
console.log(`PASS · ${themes.length} themes (${themes.filter(theme => !theme.premium).length} free), ${fonts.length} fonts, ${screens.length} screenshots`);
console.log(`PASS · ${Object.keys(copy).length} bilingual strings, section anchors and ${assets.size} local assets`);
console.log('PASS · All 6 font binaries and license files match their original SHA-256 hashes');
