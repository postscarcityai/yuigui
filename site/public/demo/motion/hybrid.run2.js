const W=api.w,H=api.h,E=api.ease,S=api.seg,cl=api.clamp,lp=api.lerp,TAU=Math.PI*2;
const HOT='#ff6a45',C1='#58d6ff',C2='#a68cff',PALE='#e6ecff',INK='#0b0d16';
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const toA=h=>typeof h==='string'?hx(h):h;
const mixA=(a,b,k)=>{const A=toA(a),B=toA(b);return A.map((v,i)=>v+(B[i]-v)*k);};
const mix=(a,b,k)=>'rgb('+mixA(a,b,k).map(Math.round)+')';
const rgb=x=>mix(x,x,0);
const fr=x=>x-Math.floor(x),hash=i=>fr(Math.sin(i*127.1+11.7)*43758.5453);
const glow=(col,b)=>{c.shadowColor=rgb(col);c.shadowBlur=b;};
const ball=(x,y,r,col)=>{const g=c.createRadialGradient(x-r*.3,y-r*.35,r*.05,x,y,r);g.addColorStop(0,mix(col,'#ffffff',.7));g.addColorStop(.45,rgb(col));g.addColorStop(1,mix(col,INK,.75));c.fillStyle=g;glow(col,16);c.beginPath();c.arc(x,y,r,0,TAU);c.fill();};
const loopPath=(x,y,R,f)=>{c.beginPath();for(let j=0;j<=140;j++){const th=j/140*TAU,r=R+f(th),px=x+Math.cos(th)*r,py=y+Math.sin(th)*r;j?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();};
api.cam(0,0,1);
c.lineCap='round';c.lineJoin='round';
const out=E(S(t,26.8,28.4));
const cx=W/2+Math.sin(t*.4)*5*(1-out),cy=H*.44+Math.cos(t*.33)*4*(1-out);
const L=E(S(t,3.6,6))+E(S(t,9.2,11.4))+E(S(t,13.2,15.4))+E(S(t,17.2,19.6));
const notes=[[21,23.2,2,7,C1,'electron'],[23.2,25.4,3,10,HOT,'photon'],[25.4,27.4,5,14,C2,'graviton']];
const w=notes.map(([a0,b0])=>E(S(t,a0,a0+.5))*(1-E(S(t,b0-.45,b0))));
const sp=E(S(t,27.4,28.6));
const Q=[[0,0,HOT],[-58,66,C1],[58,66,C2]];
const qp=k=>k?[Q[k][0]+Math.sin(t*2.3+k)*3,Q[k][1]+Math.cos(t*1.9+k)*3]:[0,0];
const nucDraw=()=>{const B=[];for(let k=0;k<7;k++){const an=k*TAU/7+.2;B.push([Math.cos(an)*64+Math.sin(t*3+k)*1.6,Math.sin(an)*64+Math.cos(t*2.6+k)*1.6,14,k%2?C2:HOT]);}for(let k=0;k<6;k++){const an=k*TAU/6+.5;B.push([Math.cos(an)*35+Math.sin(t*3.4+k*2)*1.4,Math.sin(an)*35+Math.cos(t*2.9+k)*1.4,16,k%2?HOT:C2]);}B.push([0,0,17,HOT]);B.forEach(b=>ball(...b));};
const layer=(i,draw)=>{const d=L-i;const a=d<0?cl((d+.6)/.45):(i===4?1:1-cl((d-.5)/.4));if(a<=.004)return;const s=Math.pow(7,d);c.save();c.translate(cx,cy);c.rotate(-d*.35);c.scale(s,s);c.globalAlpha=a;draw(a,d);c.restore();c.globalAlpha=1;c.shadowBlur=0;};
// dust streams outward only while we zoom
for(let i=0;i<46;i++){const an=hash(i)*TAU,f=fr(hash(i+50)+L*.9+t*.015),r=f*f*260+6;c.globalAlpha=.5*Math.sin(f*Math.PI)*(.4+.6*hash(i+9));c.fillStyle=i%3?C2:C1;c.beginPath();c.arc(cx+Math.cos(an)*r,cy+Math.sin(an)*r,.6+f*1.6,0,TAU);c.fill();}
c.globalAlpha=1;
layer(0,(a,d)=>{const A=x=>c.globalAlpha=a*x;
A(.35*cl(1-d*2));c.strokeStyle=C1;c.lineWidth=2;glow(C1,8);
for(let k=-1;k<2;k++){c.beginPath();for(let y=-18;y>-112;y-=4){const x=k*34+Math.sin(y*.07+t*2.2+k*2)*7*(-y/110);y===-18?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();}
A(1);c.strokeStyle=C2;glow(C2,18);c.lineWidth=7;c.beginPath();c.ellipse(92,50,28,32,0,-1.9,1.9);c.stroke();
c.beginPath();c.moveTo(-95,0);c.bezierCurveTo(-95,85,-68,126,-38,128);c.lineTo(38,128);c.bezierCurveTo(68,126,95,85,95,0);c.closePath();c.fillStyle='#151b2e';c.fill();c.lineWidth=2.5;c.stroke();
c.beginPath();c.ellipse(0,0,95,22,0,0,TAU);c.fillStyle='#2a1410';c.fill();c.stroke();
c.save();c.scale(1,22/95);c.strokeStyle=HOT;c.lineWidth=3;glow(HOT,10);A(.35);for(let k=0;k<3;k++){c.beginPath();c.arc(0,0,30+k*20,t*.6+k*2,t*.6+k*2+1.6);c.stroke();}c.restore();
const p=.5+.5*Math.sin(t*4);A(cl(t-1.2));glow(HOT,20);c.fillStyle=mix(HOT,'#ffffff',.4);c.beginPath();c.arc(0,0,2.6+p*1.2,0,TAU);c.fill();
A(cl(d*2.2)*.8);c.strokeStyle=C1;c.lineWidth=.5;glow(C1,6);for(let k=0;k<3;k++){c.beginPath();c.ellipse(0,0,15.7,5.1,k*Math.PI/3+t*.05+.35,0,TAU);c.stroke();}
});
layer(1,(a)=>{const A=x=>c.globalAlpha=a*x;
for(let k=0;k<3;k++){c.save();c.rotate(k*Math.PI/3+t*.05);A(.45);c.strokeStyle=C1;c.lineWidth=1.2;glow(C1,10);c.beginPath();c.ellipse(0,0,110,36,0,0,TAU);c.stroke();const e=t*(1.5+k*.35)+k*2.1;A(1);c.fillStyle=mix(C1,'#ffffff',.5);glow(C1,18);c.beginPath();c.arc(110*Math.cos(e),36*Math.sin(e),4,0,TAU);c.fill();c.restore();}
A(1);c.save();c.rotate(.35);c.scale(1/7,1/7);nucDraw();c.restore();
});
layer(2,(a)=>{c.globalAlpha=a;nucDraw();c.save();c.rotate(.35);c.scale(1/7,1/7);[0,1,2].forEach(k=>{const[x,y]=qp(k);ball(x,y,17,Q[k][2]);});c.restore();});
layer(3,(a)=>{const A=x=>c.globalAlpha=a*x;
[[0,1],[1,2],[2,0]].forEach(([i,j])=>{const[x0,y0]=qp(i),[x1,y1]=qp(j),dx=x1-x0,dy=y1-y0,ln=Math.hypot(dx,dy),nx=-dy/ln,ny=dx/ln;c.beginPath();for(let s=0;s<=40;s++){const u=s/40,o=Math.sin(u*TAU*4-t*7)*5*Math.sin(u*Math.PI);const px=x0+dx*u+nx*o,py=y0+dy*u+ny*o;s?c.lineTo(px,py):c.moveTo(px,py);}A(.55);c.strokeStyle=mix(Q[i][2],Q[j][2],.5);c.lineWidth=2;glow(HOT,10);c.stroke();});
A(1);[2,1,0].forEach(k=>{const[x,y]=qp(k);ball(x,y,17,Q[k][2]);});
c.save();c.rotate(.35);c.scale(1/7,1/7);loopPath(0,0,70,th=>2*Math.sin(2*th+2*t));A(.9);c.strokeStyle=PALE;c.lineWidth=5;glow(PALE,8);c.stroke();c.restore();
});
layer(4,(a)=>{const A=x=>c.globalAlpha=a*x;
const gs=(col,lw,al)=>{A(al*.3);c.strokeStyle=rgb(col);c.lineWidth=lw*4;glow(col,26);c.stroke();A(al);c.strokeStyle=mix(col,'#ffffff',.4);c.lineWidth=lw;glow(col,12);c.stroke();};
let wm=0,km=0;w.forEach((v,k)=>{if(v>wm){wm=v;km=k;}});
const idle=1-wm;
const fS=th=>idle*(3*Math.sin(2*th+2*t)+1.5*Math.sin(3*th-1.3*t))+notes.reduce((s,n,k)=>s+w[k]*13*Math.sin(n[2]*th)*Math.cos(n[3]*t),0);
const fK=k=>th=>4.5*Math.sin(notes[k][2]*th)*Math.cos(notes[k][3]*t*.6)+Math.sin(2*th+t);
const fk1=fK(1),R=lp(70,34,sp);
notes.forEach((n,k)=>{if(w[k]<.01)return;c.lineWidth=1.2;c.strokeStyle=n[4];glow(n[4],10);for(let m=0;m<3;m++){const p=fr(t*.9+m/3);A(w[k]*(1-p)*.4);c.beginPath();c.arc(0,0,R+18+p*95,0,TAU);c.stroke();}const an=t*2.4+k;A(w[k]);c.fillStyle=mix(n[4],'#ffffff',.5);glow(n[4],20);c.beginPath();c.arc(Math.cos(an)*(R+30),Math.sin(an)*(R+30),3.5,0,TAU);c.fill();});
const lab=S(t,28.4,29.2),pul=S(t,28.6,29.4);
[0,2,1].forEach(k=>{const x=(k-1)*118*sp,al=k===1?1:cl(sp*3);if(al<=0)return;
const f=k===1?(th=>lp(fS(th),fk1(th),sp)):fK(k);
const col=k===1?mixA(mixA(PALE,notes[km][4],wm),HOT,sp):mixA(PALE,notes[k][4],sp);
loopPath(x,0,R,f);gs(col,lp(2.4,1.8,sp),al);
if(pul>0){const p=fr(t*.7+k*.33);c.beginPath();c.arc(x,0,R+8+p*24,0,TAU);A(pul*(1-p)*.35);c.strokeStyle=notes[k][4];c.lineWidth=1;glow(notes[k][4],8);c.stroke();}
if(lab>0){A(lab);c.fillStyle=notes[k][4];glow(notes[k][4],8);c.font='600 11px system-ui, sans-serif';c.textAlign='center';c.fillText(notes[k][5],x,R+26);}
});
});
c.globalAlpha=1;c.shadowBlur=0;
api.cam(0,0,1);
if(t>28.6)notes.forEach((n,k)=>api.hit(n[5],cx+(k-1)*118,cy,42));
api.caption('Here is a cup of cocoa.',0.3,3.6);
api.caption('Zoom in. It is all atoms.',4.2,8.9);
api.caption('In the middle, a tight ball.',9.5,13);
api.caption('Inside that, three tiny quarks.',13.5,17);
api.caption('Inside a quark? A tiny string!',17.4,20.9);
api.caption('Hum it low: an electron.',21.1,23.1);
api.caption('Hum higher: light!',23.3,25.3);
api.caption('Hum highest: gravity!',25.5,27.3);
api.caption('One string. Every song. Tap one!',27.6,30);
