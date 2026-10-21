export const title='Free Lithophane Maker · Photo to STL & 3MF | Design Studio';
export const description='Turn photos into 3D-printable lithophanes with free STL and 3MF downloads. Adjust crop, brightness and size privately in your browser. No uploads or account needed.';
export function siteOrigin(value){
 if(!value)return '';
 let u;try{u=new URL(value);}catch{throw Error('SITE_URL must be a valid HTTPS origin, such as https://your-domain.com/lithophane/.');}
 if(u.protocol!=='https:'||u.username||u.password||!/^\/[A-Za-z0-9_/-]*$/.test(u.pathname)||u.search||u.hash||u.port||u.hostname==='localhost'||!u.hostname.includes('.'))throw Error('SITE_URL must be a public HTTPS URL with a simple path and no port, credentials, query or fragment.');
 return u.origin+u.pathname.replace(/\/$/,'')+'/';
}
export const pageInfo={
 home:{path:'',title:'Design Studio · Personalised 3D-Printable Creations',description:'Choose a lithophane or folding fan, personalise it with your photos and download STL or 3MF files. Nameplates and keyrings are coming soon.'},
 lithophane:{path:'lithophane/',title,description},
 fan:{path:'folding-fan/',title:'Folding Fan Generator · Lithophane Studio',description:'Create a printable folding lithophane fan from a photo or twelve nature samples. Download numbered STL parts and multipart 3MF, with printable pivot parts.'}
};
export function seoAssets(value,page='home'){
 const baseUrl=siteOrigin(value),info=pageInfo[page];if(!info)throw Error('Unknown site page.');
 const url=baseUrl?baseUrl+info.path:'';
 const schema=JSON.stringify({'@context':'https://schema.org','@type':'WebApplication',name:page==='home'?'Design Studio':info.title,description:info.description,applicationCategory:'DesignApplication',operatingSystem:'Any modern browser',browserRequirements:'JavaScript and Web Workers required',isAccessibleForFree:true,offers:{'@type':'Offer',price:'0',priceCurrency:'GBP'},...(url?{url}:{}),featureList:page==='home'?['Lithophane generator','Folding fan generator','Browser-local photo processing']:page==='fan'?['Photo to folding fan STL and multipart 3MF','Twelve nature samples','Printable pivot parts','Browser-local processing']:['Photo to STL and 3MF','Custom panel dimensions','Crop, brightness, contrast and invert','Browser-local processing without photo uploads']});
 // These are cooperative crawler preferences, not access controls.
 const bots=['GPTBot','ClaudeBot','CCBot','Google-Extended','Bytespider','Amazonbot'];
 const robots=url?`# Search indexing allowed. Selected AI training crawlers are asked not to crawl.\nUser-agent: *\nAllow: /\n\n${bots.map(bot=>`User-agent: ${bot}\nDisallow: ${new URL(baseUrl).pathname}\n`).join('\n')}\nSitemap: ${baseUrl}sitemap.xml\n`:'# Preview build: configure SITE_URL for the production deployment.\nUser-agent: *\nDisallow: /\n';
 const sitemap=baseUrl?`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.values(pageInfo).map(p=>`<url><loc>${baseUrl+p.path}</loc></url>`).join('')}</urlset>\n`:'';
 return {url,baseUrl,info,schema,robots,sitemap};
}
export function seoHead(a){
 const {title,description}=a.info;
 const tag=(name,content)=>({tag:'meta',attrs:{name,content},injectTo:'head'});
 const og=(property,content)=>({tag:'meta',attrs:{property,content},injectTo:'head'});
 const tags=[tag('description',description),tag('robots',a.url?'index, follow, max-image-preview:large':'noindex, nofollow'),tag('theme-color','#faf7f1'),og('og:type','website'),og('og:locale','en_GB'),og('og:site_name','Design Studio'),og('og:title',title),og('og:description',description),tag('twitter:card','summary_large_image'),tag('twitter:title',title),tag('twitter:description',description),{tag:'link',attrs:{rel:'icon',type:'image/svg+xml',href:(a.url?new URL(a.baseUrl).pathname:'/')+'favicon.svg'},injectTo:'head'},{tag:'script',attrs:{type:'application/ld+json'},children:a.schema,injectTo:'head'}];
 if(a.url)tags.push({tag:'link',attrs:{rel:'canonical',href:a.url},injectTo:'head'},og('og:url',a.url),og('og:image',a.baseUrl+'social-card.png'),og('og:image:width','1200'),og('og:image:height','630'),og('og:image:alt','Design Studio — personalised 3D-printable creations.'),tag('twitter:image',a.baseUrl+'social-card.png'),tag('twitter:image:alt','Design Studio. Free photo to STL and 3MF, with no photo uploads.'));
 return tags;
}
