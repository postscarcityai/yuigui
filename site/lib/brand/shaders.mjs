// The brand lab's materials, as fragment shaders (GLSL ES 1.0, WebGL1).
// Each one draws the whole frame: the ground and the mark in that medium.
// Uniforms: u_p and u_q are per-shader knobs (0 to 1), u_mouse is 0 to 1 with y up.
// See gl.mjs for the masks (m0 sharp, m1 small blur, m2 big blur, id piece colors).

export const PRELUDE = `
precision highp float;
uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse; uniform vec4 u_p; uniform vec4 u_q;
uniform sampler2D u_m0; uniform sampler2D u_m1; uniform sampler2D u_m2; uniform sampler2D u_id;
uniform vec3 u_bg; uniform vec3 u_mark; uniform vec3 u_ink; uniform vec3 u_c1; uniform vec3 u_c2; uniform vec3 u_c3;
varying vec2 v_uv;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
vec2 h22(vec2 p){float n=h21(p);return vec2(n,h21(p+n+17.1));}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1.,0.)),u.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*vn(p);p=r*p*2.03+11.7;a*=.5;}return v;}
vec3 vor(vec2 p){vec2 i=floor(p),f=fract(p);float d1=8.,d2=8.;vec2 id=vec2(0.);
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 r=g+h22(i+g)-f;float d=dot(r,r);
    if(d<d1){d2=d1;d1=d;id=i+g;}else if(d<d2){d2=d;}}
  return vec3(sqrt(d1),sqrt(d2),h21(id));}
float M0(vec2 uv){return texture2D(u_m0,uv).r;}
float M1(vec2 uv){return texture2D(u_m1,uv).r;}
float M2(vec2 uv){return texture2D(u_m2,uv).r;}
// long thin paper fibers at a few angles (hanji)
float fibers(vec2 p){float f=0.;for(int k=0;k<4;k++){float a=float(k)*1.37+.3;vec2 q=mat2(cos(a),-sin(a),sin(a),cos(a))*p;
  q+=vec2(fbm(q*1.3+float(k)),0.)*1.4;
  float n=vn(vec2(q.x*3.4,q.y*38.)+float(k)*7.);f+=smoothstep(.8,.97,n)*smoothstep(.35,.8,vn(q*2.+float(k)*3.1));}return f;}
float grain(){return h21(gl_FragCoord.xy+fract(u_time*7.)*91.)-.5;}
vec2 grad1(vec2 uv){vec2 e=1.5/u_res;return vec2(M1(uv+vec2(e.x,0.))-M1(uv-vec2(e.x,0.)),M1(uv+vec2(0.,e.y))-M1(uv-vec2(0.,e.y)));}
vec3 hanji(vec2 p,vec3 base){
  vec3 c=base*(.965+.05*fbm(p*2.2)+.02*fbm(p*14.));
  c+=vec3(.02)*fibers(p*3.2)-vec3(.012)*fibers(p*5.1+9.);
  return c;}
`;

export const SHADERS = {
  // The sketch: cocoa paper pieces lifted off warm paper. p.x lift, p.y torn-rim fibers.
  paper: `
void main(){
  vec2 uv=v_uv; vec2 p=gl_FragCoord.xy/u_res.y;
  float lift=u_p.x;
  vec3 ground=hanji(p,u_bg);
  vec2 so=vec2(.004,-.010)*(.35+lift*1.6);
  float sh=M2(uv-so*1.4)*.6+M1(uv-so)*.4;
  ground*=1.-.26*sh*(.45+lift*.8);
  float m=M0(uv); float s=M1(uv);
  vec3 piece=u_mark*(.93+.1*fbm(p*5.+3.)+.03*fbm(p*40.));
  // a torn edge shows the paper's white core
  float rim=m*(1.-smoothstep(.5,.78,s));
  float tornW=smoothstep(.35,.75,fbm(p*55.))*u_p.y;
  piece=mix(piece,mix(u_bg,vec3(1.),.4),rim*tornW*.8);
  // light from the top left across the lifted piece
  vec2 g=grad1(uv); piece*=1.+dot(g,vec2(-.6,.8))*1.8*lift;
  gl_FragColor=vec4(mix(ground,piece,m)+grain()*.018,1.);
}`,

  // Hanji and meok: ink blooming into mulberry paper. p.x bloom 0..1, p.y dry brush, p.z halo.
  meok: `
void main(){
  vec2 uv=v_uv; vec2 p=gl_FragCoord.xy/u_res.y;
  vec3 paper=hanji(p,u_bg);
  float fib=fibers(p*3.2);
  float b=clamp(u_p.x,0.,1.); b=1.-pow(1.-b,2.2);
  float n=fbm(p*6.)*.5+fbm(p*26.)*.35+fbm(p*90.)*.15;
  float s=M1(uv), s2=M2(uv);
  float thr=mix(1.35,.5,b);
  float field=s+(n-.5)*.42+fib*.06;
  float ink=smoothstep(thr-.02,thr+.06,field);
  float hthr=mix(1.2,.22,b);
  float halo=smoothstep(hthr,hthr+.3,s2+fib*.3+(n-.5)*.3)*(1.-ink)*u_p.z*(.25+fib*.9+.4*smoothstep(.45,.75,fbm(p*11.)));
  float wet=ink*(1.-smoothstep(thr+.02,thr+.2,field));
  // dry brush: pale streaks along the stroke
  vec2 q=mat2(.7,-.7,.7,.7)*p;
  float dry=smoothstep(.72,.92,vn(vec2(q.x*5.,q.y*150.)+fbm(q*3.)*3.))*smoothstep(.55,.85,vn(q*2.5))*smoothstep(.5,.85,1.-s+n*.5)*u_p.y;
  // sumi: a little grayer in the body, darkest where the wet edge pools
  vec3 body=mix(u_mark,mix(u_mark,paper,.28),smoothstep(.3,.9,fbm(p*4.+2.))*.8);
  vec3 inkc=mix(body,u_mark*.8,wet);
  vec3 col=mix(paper,mix(paper,u_mark,.1+.08*fbm(p*12.)),halo);
  col=mix(col,inkc,ink*(1.-dry*.7));
  gl_FragColor=vec4(col+grain()*.02,1.);
}`,

  // Seoul quiet: the mark pressed into oat stone, lit from the mouse. p.x depth, p.y clay fill.
  quiet: `
void main(){
  vec2 uv=v_uv; vec2 p=gl_FragCoord.xy/u_res.y;
  vec3 stone=u_bg*(.955+.06*fbm(p*2.)+.025*fbm(p*20.));
  vec3 v=vor(p*42.); float chip=1.-smoothstep(.05,.14,v.x);
  stone=mix(stone,mix(u_c1,u_c2,v.z),chip*step(.72,v.z)*.35);
  stone+=vec3(.012)*(h21(floor(gl_FragCoord.xy*.5))-.5);
  vec2 g=grad1(uv);
  float depth=.6+u_p.x*1.8;
  vec3 nrm=normalize(vec3(g*depth*9.,1.));
  vec2 lp=u_mouse-uv; vec3 L=normalize(vec3(lp*1.2,.55));
  float dif=dot(nrm,L);
  float m=M0(uv); float s=M1(uv);
  // inside the recess: a little darker, the wall facing away in shadow
  float floor_=smoothstep(.55,.95,s);
  vec3 col=stone*(.9+.22*dif);
  col=mix(col,col*(.9-.05*u_p.x),m);
  vec3 clay=u_mark*(.94+.08*fbm(p*9.))*(.92+.14*dif);
  col=mix(col,clay,floor_*u_p.y);
  // soft ambient occlusion around the rim
  col*=1.-.07*(M2(uv)-m)*u_p.x;
  gl_FragColor=vec4(col+grain()*.012,1.);
}`,

  // Celadon: the mark as a glazed tile. p.x crackle 0..1, p.y sweep position, p.z pooling.
  celadon: `
void main(){
  vec2 uv=v_uv; vec2 p=gl_FragCoord.xy/u_res.y;
  vec3 ground=u_bg*(.96+.05*fbm(p*3.))+vec3(.012)*sin(gl_FragCoord.x*1.3)*sin(gl_FragCoord.y*1.3);
  vec2 so=vec2(.006,-.012);
  ground*=1.-.22*M2(uv-so);
  float m=M0(uv); float s=M1(uv);
  vec2 g=grad1(uv); vec3 nrm=normalize(vec3(-g*7.,1.));
  // thin glaze at the rim shows clay; deep jade pools in the middle
  float th=smoothstep(.5,.95,s);
  vec3 glaze=mix(u_c1,u_mark,th*.85+.15*fbm(p*4.));
  glaze=mix(u_c2,glaze,smoothstep(.0,.35,th)*.85+.15);
  // crackle: big cells, then fine
  vec3 v1=vor(p*9.); vec3 v2=vor(p*24.+3.);
  float k1=1.-smoothstep(.0,.028,v1.y-v1.x);
  float k2=1.-smoothstep(.0,.02,v2.y-v2.x);
  float grow=u_p.x;
  float crack=k1*step(v1.z,grow*1.1)+k2*step(v2.z,grow*1.3-.25)*.6;
  glaze*=1.-crack*.28*th;
  glaze+=vec3(.04,.05,.03)*crack*(1.-th);
  // light
  vec3 L=normalize(vec3(-.4,.6,.7));
  float dif=max(dot(nrm,L),0.);
  float spec=pow(max(dot(reflect(-L,nrm),vec3(0.,0.,1.)),0.),30.)*.5;
  float sweep=exp(-pow((uv.x*.8+uv.y*.5-u_p.y*1.9+.2)*6.,2.))*.35;
  glaze=glaze*(.82+.25*dif)+vec3(spec+sweep*(.4+.6*th));
  gl_FragColor=vec4(mix(ground,glaze,m)+grain()*.012,1.);
}`,

  // Bojagi: a patchwork cloth with light behind it; the six pieces are the colored patches.
  // p.x breeze, p.y backlight, p.z stitch visibility.
  bojagi: `
void main(){
  vec2 uv=v_uv;
  float t=u_time;
  uv.x+=.004*u_p.x*sin(uv.y*7.+t*1.1)+.002*u_p.x*sin(uv.y*17.-t*1.7);
  uv.y+=.002*u_p.x*sin(uv.x*9.+t*.8);
  vec2 asp=vec2(u_res.x/u_res.y,1.);
  // an irregular patchwork: rows of uneven height, each row cut into uneven pieces, some cut again
  vec2 q=uv*asp;
  float row=floor(q.y*2.2+h21(vec2(floor(q.x*.7),3.))*.6);
  float ry=fract(q.y*2.2+h21(vec2(floor(q.x*.7),3.))*.6);
  float xs=q.x*(1.6+1.4*h21(vec2(row,1.)))+h21(vec2(row,2.))*3.;
  vec2 c=vec2(floor(xs),row); float fx=fract(xs);
  float cut=.25+.5*h21(c+5.1);
  vec2 id=c; float dEdge=min(min(fx,1.-fx)*.6,min(ry,1.-ry)*.45);
  if(h21(c+9.7)<.55){ id+=vec2(0.,step(cut,ry)*.5); dEdge=min(dEdge,abs(ry-cut)*.45); }
  else if(h21(c+2.2)<.5){ id+=vec2(step(cut,fx)*.5,0.); dEdge=min(dEdge,abs(fx-cut)*.6); }
  float tone=h21(id*3.1+.7);
  vec3 patch=u_bg*(.9+.12*tone)*mix(vec3(1.),vec3(1.03,1.,.95),step(.5,h21(id+1.3)));
  patch=mix(patch,u_c3,step(.84,tone)*.28);
  // backlight: a window glow from the top
  float glow=.72+u_p.y*.45*(smoothstep(-.2,1.,uv.y)+.25*fbm(uv*3.));
  // the weave
  float weave=.95+.05*sin(gl_FragCoord.x*1.9)*sin(gl_FragCoord.y*1.9)+.03*(vn(gl_FragCoord.xy*vec2(.08,1.2))-.5);
  vec3 col=patch*glow*weave;
  // seams between patches: a folded edge, darker, with a line of stitches
  float seam=1.-smoothstep(.0,.006,dEdge);
  float seam2=1.-smoothstep(.006,.014,dEdge);
  col*=1.-.2*seam-.05*seam2;
  // the mark's patches
  float m=M0(uv); float s=M1(uv);
  vec3 pc=texture2D(u_id,uv).rgb;
  vec3 lit=pc*(.7+u_p.y*.5*smoothstep(-.2,1.,uv.y)+.08*fbm(uv*8.))*weave*(1.-.12*seam);
  col=mix(col,lit,m);
  float rim=smoothstep(.3,.5,s)*(1.-smoothstep(.5,.72,s));
  col*=1.-.22*rim;
  float st=step(.55,fract((gl_FragCoord.x+gl_FragCoord.y)/9.));
  col=mix(col,u_bg*1.08,rim*st*.55*u_p.z);
  gl_FragColor=vec4(col+grain()*.012,1.);
}`,

  // Pop: a die-cut holo foil sticker. p.x tilt response, p.y sparkle, mouse moves the light.
  holo: `
vec3 pal(float t){return .8+.2*cos(6.2832*(t+vec3(0.,.33,.67)));}
void main(){
  vec2 uv=v_uv; vec2 p=gl_FragCoord.xy/u_res.y;
  vec3 ground=u_bg*(.97+.04*fbm(p*3.));
  float big=M2(uv);
  float cutS=smoothstep(.1,.16,big);
  float shadow=smoothstep(.05,.2,M2(uv-vec2(-.004,.012)));
  ground*=1.-.14*shadow*(1.-cutS);
  float m=M0(uv); float s=M1(uv);
  vec2 g=grad1(uv); vec3 nrm=normalize(vec3(-g*5.+(vec2(fbm(p*9.),fbm(p*9.+4.))-.5)*.25,1.));
  vec2 tilt=(u_mouse-.5)*u_p.x;
  float h=uv.x*.7+uv.y*.45+dot(nrm.xy,vec2(.8,.6))*1.2+tilt.x*1.4-tilt.y+fbm(p*2.5)*.35+u_time*.03;
  vec3 foil=pal(h);
  foil=mix(foil,vec3(dot(foil,vec3(.33))),.25)*mix(vec3(1.),u_mark*1.15,.35);
  float band=pow(.5+.5*sin((uv.x-uv.y)*9.+tilt.x*6.+u_time*.4),6.);
  foil+=vec3(.25)*band;
  float sp=step(.996,h21(floor(gl_FragCoord.xy/2.5)))*(.5+.5*sin(u_time*6.+h21(floor(gl_FragCoord.xy/2.5))*40.));
  foil+=vec3(sp)*u_p.y;
  vec3 col=mix(ground,vec3(1.),cutS);
  col=mix(col,foil,m);
  col*=1.-.08*(1.-smoothstep(.45,.6,s))*m;
  gl_FragColor=vec4(col+grain()*.01,1.);
}`,
};

export const SHADER_NAMES = Object.keys(SHADERS);
