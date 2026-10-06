const W=api.w,H=api.h,E=api.ease,S=api.seg,C=api.clamp,lp=api.lerp,TAU=Math.PI*2;
const HOT=[255,106,61],CY=[95,212,255],VI=[160,140,255],INK=[226,232,255];
const rg=(k,a)=>`rgba(${k[0]|0},${k[1]|0},${k[2]|0},${a})`;
const wmix=(ks,ws)=>{let o=[0,0,0],s=0;for(let i=0;i<ks.length;i++){s+=ws[i];for(let j=0;j<3;j++)o[j]+=ks[i][j]*ws[i];}return s?o.map(v=>v/s):ks[0];};
const glow=(k,b)=>{c.shadowColor=rg(k,0.9);c.shadowBlur=b;};
const fr=x=>x-Math.floor(x);
api.cam(0,0,1);
// zoom depth: 0 cup, 1 atom, 2 nucleus, 3 proton, 4 string
const L=0.15*S(t,0,4)+0.85*E(S(t,4,8))+E(S(t,10,13))+E(S(t,14.5,17))+E(S(t,18,20.5));
const pb=E(S(t,25.4,27.4)),K=8;
const cx=W/2+Math.sin(t*0.37)*5,cy=H*0.43+Math.cos(t*0.29)*4;
const NS=[2,4,7],AM=[11,8,6];
const loop=(R,w,k)=>{c.beginPath();for(let j=0;j<=180;j++){const a=j/180*TAU;let r=R;for(let q=0;q<3;q++)if(w[q])r+=w[q]*AM[q]*k*Math.sin(NS[q]*a+t*0.6)*Math.cos(t*(5+NS[q]*2.4)+q);const x=Math.cos(a)*r,y=Math.sin(a)*r;j?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();};
const e1=E(S(t,20.6,21.2)),e2=E(S(t,22.3,22.8)),e3=E(S(t,24,24.5));
const ws=[e1*(1-e2),e2*(1-e3),e3];
const scol=wmix([HOT,CY,HOT,VI],[1-e1,ws[0],ws[1],ws[2]]);
c.save();
for(let i=0;i<70;i++){const a=fr(Math.sin(i*127.1)*43758.5453)*TAU,sd=fr(Math.sin(i*311.7)*24634.6345);const k=fr(sd+L*0.45-pb*0.6+t*0.012);const r=12+k*k*340,z=1+k*1.6;c.fillStyle=rg(i%5?INK:CY,Math.sin(k*Math.PI)*0.35);c.fillRect(cx+Math.cos(a)*r,cy+Math.sin(a)*r,z,z);}
c.restore();
const LV=[
s=>{c.lineWidth=2/s;c.strokeStyle=rg(INK,0.7);c.beginPath();c.moveTo(-90,0);c.bezierCurveTo(-90,90,-70,135,-40,140);c.lineTo(40,140);c.bezierCurveTo(70,135,90,90,90,0);c.stroke();
c.beginPath();c.ellipse(84,55,30,34,0,-1.2,1.2);c.stroke();
c.fillStyle=rg(HOT,0.16);c.beginPath();c.ellipse(0,3,82,14,0,0,TAU);c.fill();
c.beginPath();c.ellipse(0,0,90,18,0,0,TAU);c.stroke();
c.strokeStyle=rg(INK,0.35);c.beginPath();c.ellipse(0,146,130,14,0,0,TAU);c.stroke();
c.strokeStyle=rg(HOT,0.4);c.beginPath();c.ellipse(0,3,34,6,0,t*0.8,t*0.8+2.2);c.stroke();
c.lineWidth=3/s;for(let j=0;j<3;j++){c.strokeStyle=rg(INK,0.22);c.beginPath();for(let y=-16;y>-125;y-=4){const x=-35+j*35+Math.sin(y*0.05+t*2+j)*8*(-y/120);y===-16?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();}},
s=>{glow(HOT,12);c.fillStyle=rg(HOT,0.9);c.beginPath();c.arc(0,0,5,0,TAU);c.fill();c.shadowBlur=0;
for(let k=0;k<3;k++){c.save();c.rotate(k*TAU/3+t*0.05);c.lineWidth=1.2/s;c.strokeStyle=rg(CY,0.3);c.beginPath();c.ellipse(0,0,115,40,0,0,TAU);c.stroke();
const a=t*(1.6+k*0.3)+k*2;glow(CY,10);c.fillStyle=rg(CY,1);c.beginPath();c.arc(115*Math.cos(a),40*Math.sin(a),4.5,0,TAU);c.fill();c.shadowBlur=0;c.restore();}},
s=>{const P=[];for(let k=0;k<6;k++){P.push([Math.cos(k*TAU/6+0.5)*45,Math.sin(k*TAU/6+0.5)*45]);}for(let k=0;k<6;k++){P.push([Math.cos(k*TAU/6)*25,Math.sin(k*TAU/6)*25]);}P.push([0,0]);
P.forEach((p,i)=>{const last=i===P.length-1,col=last||i%2?HOT:VI,x=p[0]+(last?0:Math.sin(t*5+i*1.7)*1.2),y=p[1]+(last?0:Math.cos(t*4.3+i)*1.2);
const g=c.createRadialGradient(x-4,y-4,1,x,y,12.5);g.addColorStop(0,rg(col,0.95));g.addColorStop(1,rg(col,0.25));if(last)glow(HOT,14);c.fillStyle=g;c.beginPath();c.arc(x,y,12.5,0,TAU);c.fill();c.shadowBlur=0;});},
s=>{const g=c.createRadialGradient(0,0,10,0,0,100);g.addColorStop(0,rg(HOT,0.12));g.addColorStop(1,rg(HOT,0.02));c.fillStyle=g;c.beginPath();c.arc(0,0,100,0,TAU);c.fill();
c.lineWidth=1.5/s;c.strokeStyle=rg(HOT,0.5);c.stroke();
for(let j=0;j<2;j++){const a=t*0.9+j*Math.PI,qx=Math.cos(a)*58,qy=Math.sin(a)*58,col=j?VI:CY;
c.lineWidth=1.2/s;c.strokeStyle=rg(INK,0.35);c.beginPath();for(let u=0;u<=30;u++){const f=u/30,w=Math.sin(f*TAU*4+t*6)*4;c.lineTo(qx*f-Math.sin(a)*w,qy*f+Math.cos(a)*w);}c.stroke();
glow(col,12);c.fillStyle=rg(col,1);c.beginPath();c.arc(qx,qy,11,0,TAU);c.fill();c.shadowBlur=0;}
glow(HOT,14);c.fillStyle=rg(HOT,1);c.beginPath();c.arc(0,0,11.25,0,TAU);c.fill();c.shadowBlur=0;},
s=>{const m=E(S(t,19.4,21));
if(m<1){glow(HOT,16);c.fillStyle=rg(HOT,0.95*(1-m));c.beginPath();c.arc(0,0,90,0,TAU);c.fill();}
[20.6,22.3,24].forEach((ts,i)=>{const q=S(t,ts,ts+1.4);if(q>0&&q<1){c.shadowBlur=0;c.lineWidth=1.5/s;c.strokeStyle=rg([CY,HOT,VI][i],(1-q)*0.5);c.beginPath();c.arc(0,0,90+q*120,0,TAU);c.stroke();}});
glow(scol,18);c.lineWidth=3/s;c.strokeStyle=rg(scol,m);loop(90,ws,1);c.stroke();
c.shadowBlur=0;c.lineWidth=1/s;c.strokeStyle=rg(scol,m*0.3);c.beginPath();c.arc(0,0,90,0,TAU);c.stroke();}
];
for(let i=0;i<5;i++){const d=L-i;let al=C((d+1.25)/0.55)*(i<4?1-C((d-0.35)/0.5):1);if(i===4)al*=1-pb;if(al<0.01)continue;
const s=Math.pow(K,d);c.save();c.translate(cx,cy);c.scale(s,s);c.globalAlpha=al;LV[i](s);c.restore();c.shadowBlur=0;}
if(pb>0){const SL=[[-118,CY,'electron','electron'],[0,HOT,'light','photon'],[118,VI,'gravity','graviton']];
c.save();c.translate(cx,cy);
SL.forEach((o,i)=>{const x=lp(0,o[0],pb),R=lp(90,32,pb),w=[0,0,0];w[i]=1;
c.save();c.translate(x,0);glow(o[1],14);c.lineWidth=2.5;c.strokeStyle=rg(o[1],pb);loop(R,w,R/90*1.4);c.stroke();
c.fillStyle=rg(o[1],pb*0.8);c.beginPath();c.arc(0,0,3,0,TAU);c.fill();c.shadowBlur=0;
const la=E(S(t,26.8,27.6));if(la>0){c.font='600 13px system-ui';c.textAlign='center';c.fillStyle=rg(o[1],la);c.fillText(o[2],0,R+26);}
if(t>27.6){const p=fr(t*0.7+i*0.33);c.lineWidth=1;c.strokeStyle=rg(o[1],(1-p)*0.35*la);c.beginPath();c.arc(0,0,R+6+p*22,0,TAU);c.stroke();}
c.restore();});
c.restore();}
api.cam(0,0,1);
if(t>27.2){api.hit('electron',cx-118,cy,46);api.hit('photon',cx,cy,46);api.hit('graviton',cx+118,cy,46);}
api.caption('Here is a cup of cocoa',0.3,4);
api.caption('Zoom in: tiny atoms, buzzing',4.3,8.8);
api.caption('In the middle, a tight huddle',9.2,13.3);
api.caption('Inside those, even tinier bits',13.7,17.8);
api.caption('Look closer. A dot? No...',18.2,20.5);
api.caption('A string! Hum low: electron',20.7,22.3);
api.caption('Hum higher: light',22.4,24);
api.caption('Highest hum: gravity',24.1,25.8);
api.caption('Tap a string, hear it',26.2,30);
