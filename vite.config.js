import {defineConfig,loadEnv} from 'vite';
import {createHash} from 'node:crypto';
import {seoAssets,seoHead} from './src/seo.js';

export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'SITE_');
 const assets=seoAssets(mode==='pages-preview'?'':(process.env.SITE_URL??env.SITE_URL??''));
 if(mode==='production'&&!assets.url)console.warn('SITE_URL is unset: building a noindex preview. Set the production HTTPS origin to enable the canonical URL and sitemap.');
 const schemaHash=createHash('sha256').update(assets.schema).digest('base64');
 const base=assets.url?new URL(assets.url).pathname:'/';
 return {base,plugins:[{
  name:'static-site-seo',
  transformIndexHtml(){return {tags:seoHead(assets)};},
  generateBundle(){
   this.emitFile({type:'asset',fileName:'robots.txt',source:assets.robots});
   if(assets.sitemap)this.emitFile({type:'asset',fileName:'sitemap.xml',source:assets.sitemap});
   this.emitFile({type:'asset',fileName:'_headers',source:`${base}*\n  Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-${schemaHash}'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; worker-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n${assets.url?'':'  X-Robots-Tag: noindex, nofollow\n'}`});
  }
 }]};
});
