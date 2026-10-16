import test from 'node:test';
import assert from 'node:assert/strict';
import {siteOrigin,seoAssets,seoHead} from '../src/seo.js';
test('production SEO consistently targets the subpath',()=>{
 const a=seoAssets('https://imgdrop.app/lithophane');
 assert.equal(a.url,'https://imgdrop.app/lithophane/');assert.match(a.sitemap,/<loc>https:\/\/imgdrop.app\/lithophane\/<\/loc>/);
 assert.match(a.robots,/Sitemap: https:\/\/imgdrop.app\/lithophane\/sitemap.xml/);assert.match(a.robots,/User-agent: GPTBot\nDisallow: \/lithophane\//);assert.match(a.robots,/User-agent: \*\nAllow: \//);
 const tags=seoHead(a);assert.equal(tags.find(t=>t.attrs.rel==='canonical').attrs.href,a.url);
 assert.equal(tags.find(t=>t.attrs.property==='og:image').attrs.content,a.url+'social-card.png');assert.equal(tags.find(t=>t.attrs.rel==='icon').attrs.href,'/lithophane/favicon.svg');
 const schema=JSON.parse(a.schema);assert.equal(schema.url,a.url);assert.equal(schema.offers.price,'0');assert.equal(schema['@type'],'WebApplication');
});
test('unconfigured previews cannot advertise a fabricated canonical URL',()=>{
 const a=seoAssets('');assert.equal(a.sitemap,'');assert.match(a.robots,/Disallow: \//);assert.equal(seoHead(a).some(t=>t.attrs.rel==='canonical'),false);assert.equal(seoHead(a).find(t=>t.attrs.name==='robots').attrs.content,'noindex, nofollow');
});
test('invalid or unsafe site URLs fail configuration',()=>{
 for(const u of ['http://imgdrop.app','https://u:p@imgdrop.app','https://imgdrop.app/?x=1','https://imgdrop.app/#x','https://localhost','https://imgdrop.app/a&b','nope'])assert.throws(()=>siteOrigin(u));
});
