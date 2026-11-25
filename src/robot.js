import * as T from 'three';
const up=new T.Vector3(0,1,0);
const point=b=>b.getWorldPosition(new T.Vector3());
function align(bone,child,direction){
 const rotation=new T.Quaternion().setFromUnitVectors(point(child).sub(point(bone)).normalize(),direction.clone().normalize());
 const world=bone.getWorldQuaternion(new T.Quaternion()).premultiply(rotation);
 bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(world));bone.updateWorldMatrix(false,true);
}
function solve([a,b,c],target,pole){
 const start=point(a),mid=point(b),end=point(c),l1=start.distanceTo(mid),l2=mid.distanceTo(end);
 const axis=target.clone().sub(start),len=T.MathUtils.clamp(axis.length(),Math.abs(l1-l2)+.0001,l1+l2-.0001);axis.normalize();
 const side=pole.clone().addScaledVector(axis,-axis.dot(pole));if(side.lengthSq()<.00001)return;side.normalize();
 const along=(len*len+l1*l1-l2*l2)/(2*len);
 const joint=start.clone().addScaledVector(axis,along).addScaledVector(side,Math.sqrt(Math.max(0,l1*l1-along*along)));
 align(a,b,joint.sub(start));align(b,c,start.addScaledVector(axis,len).sub(point(b)));
}
export function fitRobot(asset,guide){
 const model=asset.scene;model.rotation.y=-Math.PI/2;
 const bounds=new T.Box3().setFromObject(model,true),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
 const scale=2.25/size.y;const holder=new T.Group();holder.scale.setScalar(scale);holder.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);holder.add(model);guide.add(holder);guide.updateWorldMatrix(true,true);
 const bones={};model.traverse(n=>{if(n.isBone)bones[n.name.replace(/[^a-z0-9]/gi,'').toLowerCase()]=n;if(n.isMesh){n.castShadow=true;n.receiveShadow=true}});
 const joint=n=>bones[n.toLowerCase()];const chain=(...names)=>names.map(joint);
 const arms=[chain('ruka1L05','ruka2L06','ruka2Lend015'),chain('ruka1R07','ruka2R08','ruka2Rend016')],legs=[chain('Noga1L09','Noga2L010','Noga2Lend017'),chain('Noga1R011','Noga2R012','Noga2Rend018')];
 const head=joint('Head02'),spine=joint('spina01');if(!head||!spine||[...arms,...legs].flat().some(x=>!x))throw Error('Supplied AION skeleton is incompatible');
 const rest=new Map(Object.values(bones).map(b=>[b,b.quaternion.clone()]));const feet=legs.map(l=>guide.worldToLocal(point(l[2])));const homeHand=guide.worldToLocal(point(arms[1][2]));let phase=0,reach=0,prev=guide.position.clone(),time=0;
 const targetHand=new T.Vector3();
 return function update(dt,state,focus){
 time+=dt;for(const [bone,pose] of rest)bone.quaternion.copy(pose);
 const distance=guide.position.distanceTo(prev);prev.copy(guide.position);const walk=state==='Walk';if(walk)phase+=Math.min(distance,.32)/.74*Math.PI*2;
 const pointing=!!focus&&['Point','Present','Explain','Speak'].includes(state);
 reach=T.MathUtils.damp(reach,pointing?1:0,7,dt);
 head.rotateY(Math.sin(time*1.4)*(state==='LookAround'?.09:.025));head.rotateX(Math.sin(time*(state==='Speak'?5:2))*.032);spine.rotateZ(Math.sin(time*1.3)*.022);
 guide.updateWorldMatrix(true,true);const forward=new T.Vector3(0,0,1).applyQuaternion(guide.quaternion),right=new T.Vector3(1,0,0).applyQuaternion(guide.quaternion);
 for(let i=0;i<2;i++){let cycle=((phase/(2*Math.PI)+i*.5)%1+1)%1;let swing=cycle>=.5,u=(cycle% .5)*2;let stride=walk?(swing?T.MathUtils.smoothstep(u,0,1)-.5:.5-u)*.37:0;
 const ankle=guide.localToWorld(feet[i].clone());ankle.y=guide.position.y+Math.max(.02,feet[i].y)+(walk&&swing?.105*Math.sin(Math.PI*u):0);
 solve(legs[i],ankle.addScaledVector(forward,stride),forward);
 if(walk)arms[i][0].rotateX(Math.sin(phase+i*Math.PI)*.24)}
 if(reach>.01){let shoulder=point(arms[1][0]),at=focus||targetHand;let wanted=at.clone().sub(shoulder).normalize().multiplyScalar(.75).add(shoulder);targetHand.copy(at);
 solve(arms[1],guide.localToWorld(homeHand.clone()).lerp(wanted,reach),right.clone().negate().addScaledVector(up,-.6))}
 };
}

