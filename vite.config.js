import {plateNote} from './src/site-copy.js';
import {defineConfig,loadEnv} from 'vite';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {seoAssets,seoHead} from './src/seo.js';

export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'SITE_');
 const siteUrl=mode==='pages-preview'?'':(process.env.SITE_URL??env.SITE_URL??'');
 const pages=Object.fromEntries(['home','lithophane','fan','nameplates','keyrings','clickers','desk','coasters'].map(key=>[key,seoAssets(siteUrl,key)]));
 const assets=pages.home;
 if(mode==='production'&&!assets.url)console.warn('SITE_URL is unset: building a noindex preview. Set the production HTTPS origin to enable the canonical URL and sitemap.');
 const themeBoot=readFileSync(new URL('./src/theme-boot.js',import.meta.url),'utf8');
 const themeHash="'sha256-"+createHash('sha256').update(themeBoot).digest('base64')+"'";
 const schemaHashes=Object.values(pages).map(p=>"'sha256-"+createHash('sha256').update(p.schema).digest('base64')+"'").join(' ');
 const base=assets.url?new URL(assets.url).pathname:'/';
 return {base,build:{rollupOptions:{input:{home:"index.html",lithophane:"lithophane/index.html",fan:"folding-fan/index.html",nameplates:"nameplates/index.html",keyrings:"keyrings/index.html",clickers:"clickers/index.html",desk:"desk/index.html",coasters:"coasters/index.html"}}},plugins:[{
  name:'static-site-seo',
  transformIndexHtml(html,ctx){const page=ctx.path.includes("coasters/")?"coasters":ctx.path.includes("desk/")?"desk":ctx.path.includes("clickers/")?"clickers":ctx.path.includes("nameplates/")?"nameplates":ctx.path.includes("keyrings/")?"keyrings":ctx.path.includes("folding-fan/")?"fan":ctx.path.includes("lithophane/")?"lithophane":"home";return {html:html.replace(/(<main\b[^>]*>)/,`$1<p class="plate-note">${plateNote}</p>`),tags:[{tag:"script",children:themeBoot,injectTo:"head-prepend"},...seoHead(pages[page])]};},
  generateBundle(){
   this.emitFile({type:'asset',fileName:'robots.txt',source:assets.robots});
   if(assets.sitemap)this.emitFile({type:'asset',fileName:'sitemap.xml',source:assets.sitemap});
   this.emitFile({type:'asset',fileName:'_headers',source:`${base}*\n  Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval' ${themeHash} ${schemaHashes}; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; worker-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n${assets.url?'':'  X-Robots-Tag: noindex, nofollow\n'}`});
  }
 }]};
});
