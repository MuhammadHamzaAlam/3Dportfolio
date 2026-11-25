import {readFile,writeFile,readdir} from 'node:fs/promises';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const root=new URL('./',import.meta.url);
const shell=await readFile(new URL('src/shell.html',root),'utf8');
const model=await readFile(new URL('assets/AION.glb',root));
const docs=await readFile(new URL('assets/credentials.json',root),'utf8');
const clips={};for(const filename of await readdir(new URL('assets/narration/',root))){if(!filename.endsWith('.mp3'))continue;clips[filename.slice(0,-4)]='data:audio/mpeg;base64,'+(await readFile(new URL('assets/narration/'+filename,root))).toString('base64')}
const bundle=await build({entryPoints:[fileURLToPath(new URL('src/city.js',root))],bundle:true,format:'iife',minify:true,write:false});
await writeFile(new URL('Innovation City.html',root),shell.replace('/*ASSETS*/',()=> 'window.NARRATION='+JSON.stringify(clips)+';window.PICS=[];window.DOCS='+docs+';window.ROBOT="'+model.toString('base64')+'";').replace('/*APP*/',()=>bundle.outputFiles[0].text.replaceAll('</script','<\\/script')));

