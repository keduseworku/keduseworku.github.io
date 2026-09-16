import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {home,research} from '../.prerender/prerender.js';
for (const [file,render] of [['index.html',home],['research/index.html',research]]) {
 const path=new URL('../dist/'+file,import.meta.url);
 const html=await readFile(path,'utf8');
 if(!html.includes('<!--ssr-->')) throw new Error('Missing prerender marker: '+file);
 await writeFile(path,html.replace('<!--ssr-->',render()));
}
// Retain public asset URLs used by papers, external links, and the existing CV.
await cp(new URL('../../assets/',import.meta.url),new URL('../dist/assets/',import.meta.url),{recursive:true});
const redirects={'projects':'/research/','publications':'/research/','about':'/#perspective','cv':'/assets/pdf/Keduse_Worku_Resume_2026.pdf','projects/1_project':'/research/#neutrinos','projects/2_project':'/research/#macs-figure','projects/3_project':'/research/#cosmic-dawn','projects/4_project':'/research/#earlier-work','projects/5_project':'/research/#earlier-work'};
for(const [route,dest] of Object.entries(redirects)){
 const dir=new URL('../dist/'+route+'/',import.meta.url);await mkdir(dir,{recursive:true});
 await writeFile(new URL('index.html',dir),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Keduse Worku</title><meta http-equiv="refresh" content="0;url=${dest}"><link rel="canonical" href="https://keduseworku.github.io${dest}"></head><body><p>This page is now at <a href="${dest}">${dest}</a>.</p></body></html>`);
}
await writeFile(new URL('../dist/.nojekyll',import.meta.url),'');
await writeFile(new URL('../dist/robots.txt',import.meta.url),'User-agent: *\nAllow: /\nSitemap: https://keduseworku.github.io/sitemap.xml\n');
await writeFile(new URL('../dist/sitemap.xml',import.meta.url),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://keduseworku.github.io/</loc></url><url><loc>https://keduseworku.github.io/research/</loc></url></urlset>');
await writeFile(new URL('../dist/404.html',import.meta.url),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — Keduse Worku</title><style>body{background:#05080e;color:#d2e0ef;font:18px/1.7 system-ui;margin:15vh 10%}a{color:#dcb088}h1{font-weight:400}</style></head><body><h1>This page has moved, or doesn’t exist.</h1><p><a href="/">Visit my homepage</a> or <a href="/research/">browse my research</a>.</p></body></html>');
console.log('Prerendered pages, preserved assets, and legacy redirects are ready.');
