import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const dir='dist-preview',html=fs.readFileSync(`${dir}/index.html`,'utf8'),headers=fs.readFileSync(`${dir}/_headers`,'utf8');
assert.match(html,/<meta name="robots" content="noindex, nofollow"/);
assert.ok(!html.includes('rel="canonical"'));assert.ok(!html.includes('property="og:url"'));
assert.ok(!fs.existsSync(`${dir}/sitemap.xml`));assert.match(headers,/X-Robots-Tag: noindex, nofollow/);
assert.ok(headers.startsWith('/*\n'));assert.match(fs.readFileSync(`${dir}/robots.txt`,'utf8'),/User-agent: \*\nDisallow: \//);
const schema=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
assert.ok(headers.includes('sha256-'+createHash('sha256').update(schema).digest('base64')));
for(const match of html.matchAll(/(?:src|href)="(\/(?:assets\/[^"\s]+|favicon\.svg))"/g))assert.ok(fs.existsSync(dir+match[1]),`Missing asset ${match[1]}`);
console.log('Preview indexing policy, root assets, sitemap omission and CSP hash passed.');

for(const page of ['index.html','lithophane/index.html','folding-fan/index.html','nameplates/index.html','keyrings/index.html','clickers/index.html','desk/index.html','coasters/index.html','kitchen/index.html','bathroom/index.html','mounts/index.html']){
 const content=fs.readFileSync(`${dir}/${page}`,'utf8');
 assert.ok(!/japandi/i.test(content));assert.match(content,/A1 mini is selected by default; choose the optional 256 mm printer size/);
 assert.match(content,/<meta name="robots" content="noindex, nofollow"/);
 assert.ok(!content.includes('rel="canonical"'));
 const json=content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
 assert.ok(headers.includes('sha256-'+createHash('sha256').update(json).digest('base64')));
 for(const match of content.matchAll(/(?:src|href)="(\/(?:assets\/[^"\s]+|favicon\.svg))"/g))assert.ok(fs.existsSync(dir+match[1]),`Missing asset ${match[1]}`);
}
console.log('All preview pages have matching CSP hashes and existing assets.');

for(const script of fs.readFileSync(`${dir}/nameplates/index.html`,'utf8').matchAll(/<script>([\s\S]*?)<\/script>/g))assert.ok(headers.includes('sha256-'+createHash('sha256').update(script[1]).digest('base64')));
assert.match(headers,/wasm-unsafe-eval/);
