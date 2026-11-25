import * as T from 'three';
import {titles,subtitles} from './story.js';
export function buildInstallations(api){
 const {campus,v,groupAt,wall,obj,rail,disk,ring,badge,ink,steel,brass,ice,lamps,cyan,aluminum,pearl,blueGlass}=api;
 const violet=new T.MeshStandardMaterial({color:0x9772dd,metalness:.35,roughness:.35,emissive:0x342252});
 function sat(g){
  let body=groupAt(g);obj(body,new T.CylinderGeometry(.39,.33,.68,8),brass,0,0,0);ring(body,0,.21,0,.38,.036,aluminum);disk(body,0,-.43,0,.19,.21,steel);disk(body,0,-.55,0,.14,.03,ice);
  let wings=[];for(let side of [-1,1]){let hinge=groupAt(body,side*.33,0,0);wings.push(hinge);rail(hinge,[0,0,0],[side*.32,0,0],.036,aluminum);
  wall(hinge,side*.86,0,0,1.16,.08,.71,aluminum);
  for(let x=0;x<6;x++)for(let z=0;z<3;z++)wall(hinge,side*(.34+x*.199),.052,-.23+z*.23,.177,.03,.202,blueGlass)}
  rail(body,[.18,.24,0],[.4,.69,0],.023,steel);const dish=obj(body,new T.SphereGeometry(.27,20,8,0,Math.PI*2,0,.76),pearl,.41,.75,0);dish.rotation.z=-.6;return {body,wings}
 }
 function preview(g,i){
 const stage=groupAt(g);let ticker;
 if(i===0){let s=sat(stage);s.body.position.y=1.25;s.body.rotation.x=.29;wall(stage,0,.04,0,2.9,.09,1.45,steel);let beam=wall(stage,0,.11,0,.036,.03,1.35,ice);ticker=t=>{beam.position.x=Math.sin(t)*1.32;s.wings.forEach((w,j)=>w.rotation.z=Math.sin(t*.7)*.075*(j?1:-1))}}
 if(i===1){let pages=[];for(let j=0;j<4;j++){let h=groupAt(stage);pages.push(h);wall(h,0,0,0,.87,1.13,.05,pearl);for(let k=0;k<5;k++)wall(h,0,.31-k*.135,.03,.64-(k%2)*.11,.021,.016,ink)}ticker=t=>pages.forEach((p,j)=>{p.position.set((j-1.5)*(.43+.13*Math.sin(t)),.75+.1*Math.sin(t+j),-.1*j);p.rotation.y=-.32+j*.14})}
 if(i===2){let bars=[];for(let j=0;j<29;j++)bars.push(wall(stage,(j-14)*.095,.91,0,.056,.2,.085,ice));ring(stage,0,.95,-.2,.88,.053,brass,0);ticker=t=>bars.forEach((b,j)=>b.scale.y=.13+Math.abs(Math.sin(j*.4-t*3))*1.18)}
 if(i===3){wall(stage,0,.39,0,2.8,.12,.9,steel);let items=[];for(let k=0;k<4;k++)items.push(wall(stage,0,.66,0,.36,.4,.39,brass));for(let j=0;j<7;j++)wall(stage,-1.12+j*.36,.98+j*.06,-.5,.10,.19+j*.11,.09,cyan);ticker=t=>items.forEach((p,j)=>p.position.x=((t*.42+j*.68)%2.7)-1.35)}
 if(i===4){for(let j=0;j<3;j++)disk(stage,(j-1)*.92,.56+j*.1,0,.33,.79,steel);rail(stage,[-.94,.85,0],[.95,.85,0],.065,brass);let packet=obj(stage,new T.OctahedronGeometry(.14),ice);ticker=t=>packet.position.set(Math.sin(t)*.97,1.12,0)}
 return ticker
 }
 function signal(g,start,end,color){let path=new T.LineCurve3(v(...start),v(...end));obj(g,new T.TubeGeometry(path,1,.018,5,false),color);const dot=obj(g,new T.OctahedronGeometry(.095),color);return t=>dot.position.copy(path.getPoint(t%1))}
 const plaza=groupAt(campus);const identity=groupAt(plaza,0,0,6.8);
 for(let x of [-3.4,3.4]){wall(identity,x,1.65,0,.12,3.2,.16,brass);disk(identity,x,.18,0,.31,.36,steel)}
 badge(identity,['MUHAMMAD HAMZA ALAM','AI / ML ENGINEER','COMPUTER SCIENCE  /  NED UNIVERSITY'],0,3.05,.03,7.3,2.05,'#12252a','#f5d6a2');wall(identity,0,1.99,0,7.4,.06,.13,ice);
 disk(plaza,3.7,.16,7.6,1.64,.32,ink);ring(plaza,3.7,.32,7.6,1.53,.032,brass);const stands=[],parking=[],previews=[],paths=[];
 for(let j=0;j<5;j++){const a=(j-2)*.66;let x=Math.sin(a)*8.7,z=Math.cos(a)*5.9-2;parking.push(v(x,0,z));let h=groupAt(plaza,x,0,z);stands.push(h);disk(h,0,.23,0,1.68,.33,ink);ring(h,0,.42,0,1.61,.04,brass);let m=groupAt(h,0,.48,0);previews.push(preview(m,j));badge(h,[titles[j],subtitles[j]],0,.73,1.12,3,.74);paths.push(signal(h,[0,.6,-.85],[-x*.5,2.9,-z*.5],j===1?violet:ice))}
 let active=-1,segment=-1,elapsed=0,sceneRoot=null,parts=null,goal=null,aim=null,effect=null;
 function boxLabel(g,text,x,y,z,w){return badge(g,text,x,y,z,w,w*.22,'#172b34','#e2f0eb')}
 function tickerPanel(g,x,y,z,w,h){
 let canvas=document.createElement('canvas');canvas.width=1024;canvas.height=328;let ctx=canvas.getContext('2d'),map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
 let m=new T.MeshBasicMaterial({map});wall(g,x,y,z-.09,w+.13,h+.12,.15,brass);obj(g,new T.PlaneGeometry(w,h),m,x,y,z+.005);let last='';
 return (title,lines)=>{let key=title+lines.join('');if(key===last)return;last=key;ctx.fillStyle='#10232c';ctx.fillRect(0,0,1024,328);ctx.fillStyle='#a6ded5';ctx.font='bold 44px Segoe UI';ctx.fillText(title,36,66,950);ctx.font='36px Segoe UI';ctx.fillStyle='#f1e5ca';lines.slice(0,4).forEach((s,i)=>ctx.fillText(s,36,128+i*54,948));map.needsUpdate=true}
 }
 function terrain(g){let s=sat(g);s.body.position.set(.3,4.46,1);s.body.scale.setScalar(1.35);
 const positions=new Float32Array(72*3),targets=[];for(let i=0;i<72;i++)targets.push(v((i%12-5.5)*.25,(i%3)*.045,(Math.floor(i/12)-2.5)*.15));
 let geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));let dust=new T.Points(geo,new T.PointsMaterial({color:0x9ae9e1,size:.052}));g.add(dust);dust.position.copy(s.body.position);dust.frustumCulled=false;
 let swath=wall(g,0,1.737,1,.055,.012,3.4,ice);let beam=obj(g,new T.ConeGeometry(1,1,3,1,true),new T.MeshBasicMaterial({color:0x5dc9d4,transparent:true,opacity:.13,depthWrite:false,side:T.DoubleSide}),0,3.04,1);beam.scale.set(.85,2.5,1.43);
 boxLabel(g,['TIME A   /   BEFORE'], -1.57,1.63,3,2.65);boxLabel(g,['TIME B   /   AFTER'],1.57,1.63,3,2.65);
 const display=tickerPanel(g,0,4.38,-4.1,6.8,1.65);
 return (n,t,sim)=>{let f=n===0?Math.min(1,t/2.1):1;s.body.scale.setScalar(.28+1.07*f);s.wings.forEach((w,j)=>w.rotation.z=(1-f)*(j?1:-1)*1.35);dust.visible=n===0&&f<1;
 if(dust.visible){targets.forEach((p,i)=>{let r=(1-f)*(1.1+i%5*.33);positions.set([p.x+r*Math.cos(i),p.y+r,p.z+r*Math.sin(i)],i*3)});geo.attributes.position.needsUpdate=true}
 let x=Math.sin(t*1.4)*2.65;beam.visible=swath.visible=n===1||n===2;swath.position.x=x;beam.position.x=x*.48;beam.rotation.z=Math.atan2(x-.3,2.65);if(n===2){let cut=Math.round(50+45*Math.sin(t));if(sim.cut!==cut){sim.cut=cut;sim.draw()}}
 if(n===4&&sim.encoder)sim.encoder.forEach((o,j)=>o.material=j===Math.floor(t*2)%6?ice:steel);
 display(['OBSERVATION PLATFORM','SURVEY SWATH','ALIGNED SURVEYS','CHANGE SEGMENTATION','SIAMESE U-NET','HELD-OUT EVALUATION'][n],n===5?['F1  0.857     IoU  0.749','Precision  0.834     128 images']:n===4?['Time A + Time B  →  shared ResNet18','Compare  →  decode  →  geographic events']:['Illustrative survey  /  two capture dates'])}
 }
 function library(g){let d=tickerPanel(g,0,4.6,-3,6.3,1.6),dots=[];for(let j=0;j<3;j++){let x=(j-1)*2.3;dots.push(signal(g,[x,2.2,-1.2],[x*.4,3.3,-3],violet));for(let k=0;k<3;k++)disk(g,x*.44,2.28+k*.25,-3.1,.37,.12,steel)}
 return(n,t,sim)=>{let names=['SOURCE DOCUMENT','CHUNK BOUNDARIES','EMBEDDING PROJECTION','VECTOR STORE  /  CHROMADB','MMR  /  EVIDENCE SELECTION','ANSWER  /  QWEN3-4B'];let doc=api.documents[sim.doc];d(names[n],n===0?[doc.title]:n===5?[doc.chunks[doc.match[sim.q]],'Source: '+doc.title+' · passage '+(doc.match[sim.q]+1)]:n===4?[doc.questions[sim.q],'Selected passage '+(doc.match[sim.q]+1)]:n===2?['Illustrative projection of high-dimensional vectors']:doc.chunks);dots.forEach((f,j)=>f(n>=2?t*.6+j/3:0))}
 }
 function acoustic(g){let d=tickerPanel(g,0,5.9,-1.5,6.9,1.45);let mic=groupAt(g,-4,3.1,1);obj(mic,new T.CapsuleGeometry(.25,.58,6,18),aluminum);for(let k=0;k<6;k++)ring(mic,0,.05+k*.1,0,.255,.018,ink);rail(mic,[0,-.58,0],[0,-1.42,0],.075,brass);let s=signal(g,[-3.9,3.1,.4],[3.55,3.1,.4],ice),out=[];for(let j=0;j<12;j++)out.push(wall(g,3.35+j*.12,3.15,.3,.06,.16,.09,cyan));
 return(n,t,sim)=>{let p=api.phrases[sim.phrase];d(['VOICE INPUT','IBM WATSON  /  STT','GPT-5 NANO','IBM WATSON  /  TTS','SPEECH → TEXT → REPLY → VOICE'][n],[n<2?p[0]:p[1],'Scripted sample']);s(t*.6);out.forEach((m,j)=>m.scale.y=n>=3?.18+.9*Math.abs(Math.sin(t*6-j*.4)):.1)}
 }
 function logistics(g){let board=tickerPanel(g,2.65,4.75,-7.5,7.9,1.7),bars=[],branches=[];for(let j=0;j<7;j++)bars.push(wall(g,-.45+j*.66,2.88,-7.2,.32,.5,.29,j===6?ice:brass));for(let j=0;j<3;j++){let x=-1+j*.86;branches.push(signal(g,[x,2,-6.9],[x+.38,2.56,-6.9],cyan),signal(g,[x+.38,2.56,-6.9],[x+.58,2.9,-6.9],ice))}
 return(n,t,s)=>{let sku=api.skus[s.sku],q=Math.round(Math.sqrt(2*s.D*s.S/s.H));board(['NEXORA  /  RECEIVING','MONTHLY DEMAND','RANDOM FOREST  /  SAMPLE FORECAST','ECONOMIC ORDER QUANTITY','REPLENISHMENT RELEASE'][n],[sku[0]+'  ·  '+(n<3?'History '+sku[4].join(' / '):'EOQ = √(2DS/H)'),n<3?'Forecast  '+sku[5]+' units / month':'D '+s.D+'   S $'+s.S+'   H $'+s.H+'    →    '+q+' units']);bars.forEach((b,j)=>{let h=(sku[4][j]||sku[5])/110*Math.min(1,t*2+.05);b.scale.y=h;b.position.y=2.5+h/2;b.visible=n>0&&(j<6||n>=2)});branches.forEach((f,j)=>f(n===2?t+j*.18:0))}
 }
 function etl(g){let board=tickerPanel(g,0,5.21,-5.8,8,1.85);for(let j=0;j<4;j++)boxLabel(g,[[ 'CSV','JSON','XML','WEB'][j]],-4.9+j*1.15,3.97,-5.3,1.04);let vessels=[];for(let j=0;j<4;j++)vessels.push(disk(g,5.65,.85+j*.36,-2.5,.67,.22,steel));let packet=signal(g,[-5.1,3.35,-3.1],[5.7,3.35,-3.1],ice);let bars=[];for(let j=0;j<2;j++)bars.push(wall(g,4+j*.65,2,-2,.35,.5,.22,brass));
 return(n,t,s)=>{let rows=api.rowsAt(s.dataset,Math.min(n,4)),ok=api.rowsAt(s.dataset,2);board(['EXTRACT  /  SOURCE RECORDS','CLEAN  /  TRIM & DEDUPLICATE','VALIDATE  /  INTEGER ≥ 0','TRANSFORM  /  SUM','LOAD  /  SUMMARY TABLE','ANALYZE  /  GROUPED QUANTITIES'][n],[(n===5?ok:rows).map(r=>r.join(' = ')).join('    /    '),n===5?'SUM(quantity) = '+rows[0][1]:n===2?'Rejected: '+(api.rowsAt(s.dataset,1).length-ok.length)+' invalid rows':'Local receiving-log example']);packet(.16*Math.min(n,4)+.13*((t*.7)%1));bars.forEach((b,j)=>{b.visible=n===5;let h=Number(ok[j]?.[1]||0)/7;b.scale.y=h;b.position.y=1.55+h/2})}
 }
 function museum(g){let rings=[],markers=[];for(let j=0;j<3;j++){let wheel=groupAt(g,0,3.85,2.5);wheel.rotation.z=.17*(j-1);ring(wheel,0,0,0,1.64-j*.25,.045,brass);let m=obj(wheel,new T.OctahedronGeometry(.09),ice,1.64-j*.25,0,0);rings.push(wheel);markers.push(m)}
 let pos=[[-8,1.1],[-5.85,-8],[-1.95,-8],[1.95,-8],[5.85,-8],[8,1.1]],sweeps=pos.map(([x,z])=>wall(g,x,1.65,z+.28,2.75,.035,.035,lamps));
 return(n,t)=>{rings.forEach((r,j)=>{r.rotation.y=Math.sin(t*.32+j)*.29;r.rotation.x=Math.sin(t*.27+j)*.14;markers[j].position.set((1.64-j*.25)*Math.cos(t*.52+j),0,(1.64-j*.25)*Math.sin(t*.52+j))});sweeps.forEach((s,j)=>{s.visible=j===n-1;s.position.y=1.62+Math.min(1,t*.54)*1.93})}
 }
 const builders=[terrain,library,acoustic,logistics,etl,museum];
 const aims=[[[0,4.4,1],[0,2.7,1],[0,1.8,1],[0,1.8,1],[0,3.25,-3.9],[0,4.38,-4.1]],[[0,2.4,-1],[0,2.4,-1],[0,3.15,-2],[0,3.3,-3],[0,3.7,-2],[0,4.3,-3]],[[-3.6,3,1],[-2.5,2.8,0],[0,2.8,0],[2.7,3,0],[0,3.5,0]],[[1.9,2,0],[2.6,4.45,-7.5],[2.6,3.4,-7],[2.6,4.45,-7.5],[1.9,1.6,1]],Array.from({length:6},(_,j)=>[j===5?0:(j-2)*2.3,j===5?4.9:3,-3]),[[0,3.6,2.5],[-8,2.6,1.1],[-5.85,2.6,-8],[-1.95,2.6,-8],[1.95,2.6,-8],[5.85,2.6,-8],[8,2.6,1.1],[0,3,-3]]];
 const eyes=[[-3.8,3.3,6.9],[0,3.2,7.6],[0,3.1,7.4],[-3.1,3,7.1],[-3,3.3,7],[0,3.25,9]];
 function cue(d,n,room,sim){if(d!==active||room!==sceneRoot){active=d;sceneRoot=room;parts=d===6?null:groupAt(room);effect=parts?builders[d](parts):null}segment=n;elapsed=0;plaza.visible=d===6;
 if(d===6){const idx=n-1;aim=n===0?v(.3,3.45,6.8):n===6?v(0,2.9,0):v(0,2.4,8.7);goal=n===0?v(-.7,3.5,18.8):n===6?v(0,6.2,22):v(.3,3.35,17.1);identity.visible=n===0;
 stands.forEach((h,j)=>{h.visible=j<=idx;if(j===idx&&n!==6){h.position.set(0,.18,8.1);h.scale.setScalar(.08)}})}
 else{aim=v(...aims[d][n]);goal=v(...eyes[d]);if(d===5&&n>0&&n<7){goal.x=aim.x*.88;goal.z=aim.z+5.3}else if(d===0&&n===5)goal.z=7.9;else if(d===3)goal.z-=Math.min(n,3)*1.08;else goal.x+=(n%3-1)*.55;effect(n,0,sim)}
 return {aim,goal}}
 function tick(dt,sim,reduced){elapsed+=dt;let t=reduced?3.5:elapsed;if(active===6){if(segment===0){identity.scale.setScalar(reduced?1:.76+.24*(1-Math.exp(-3*elapsed)))}stands.forEach((h,j)=>{if(!h.visible)return;let front=j===segment-1&&segment!==6;let pos=front?v(0,.36,8.1):parking[j];h.position.lerp(pos,reduced?1:1-Math.exp(-dt*3.4));let s=front?1.36:1;h.scale.lerp(v(s,s,s),reduced?1:1-Math.exp(-dt*4));previews[j](t);paths[j](t*.4+j*.1)})}else effect?.(segment,t,sim)}
 plaza.visible=false;return {cue,tick,clear(){active=-1;sceneRoot=null;effect=null;plaza.visible=false}}
}

