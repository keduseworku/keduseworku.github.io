'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createLensingScene } from './lensing';

const chapters = ['Universe', 'Lensing', 'About'];
const chapterIds = ['universe', 'lensing', 'perspective'];
const failWorld = () => document.documentElement.classList.add('no-webgl');

function World() {
  const mount = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mount.current) return;
    const host = mount.current;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' }); }
    catch { failWorld(); return; }
    const mobile = window.innerWidth < 700;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.15 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#05080e');
    const camera = new THREE.PerspectiveCamera(47, window.innerWidth / window.innerHeight, .1, 220);
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), .65, .65, .7);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    let seed = 71403;
    const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
    const time = { value: 0 };
    const sceneFade = { value: 1 };
    function geometry(points: THREE.Vector3[]) {
      const g = new THREE.BufferGeometry().setFromPoints(points); geometries.push(g); return g;
    }
    const fieldMaterial = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      uniforms: { time },
      vertexShader: `varying vec3 local; varying vec3 viewNormal; varying vec3 viewPosition;
      void main(){local=position; vec4 v=modelViewMatrix*vec4(position,1.);viewPosition=-v.xyz;viewNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*v;}`,
      fragmentShader: `varying vec3 local; varying vec3 viewNormal; varying vec3 viewPosition;
      void main(){float fresnel=pow(1.-abs(dot(normalize(viewNormal),normalize(viewPosition))),3.);
      float bands=pow(.5+.5*sin(local.y*89.+sin(local.x*11.)*.7+sin(local.z*13.)*.7),12.);
      float fine=pow(.5+.5*sin(local.y*270.),16.);
      vec3 col=mix(vec3(.09,.22,.46),vec3(.58,.76,1.15),fresnel);
      float alpha=(fresnel*.3+bands*.042+fine*.016)*exp(-length(viewPosition)*.01);
      gl_FragColor=vec4(col,alpha);}`
    }); materials.push(fieldMaterial);
    const pathMaterial = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { time, sceneFade },
      vertexShader: `attribute float phase; attribute vec3 tint; varying float pathPhase; varying vec3 col; varying float distanceToCamera;
      void main(){pathPhase=phase;col=tint;vec4 v=modelViewMatrix*vec4(position,1.);distanceToCamera=-v.z;gl_Position=projectionMatrix*v;}`,
      fragmentShader: `uniform float time;uniform float sceneFade;varying float pathPhase;varying vec3 col;varying float distanceToCamera;
      void main(){float pulse=pow(max(0.,1.-fract(pathPhase-time*.045)*14.),3.);
      float alpha=(.25+pulse*.75)*exp(-max(distanceToCamera,0.)*.012);
      gl_FragColor=vec4(col*(.8+pulse*2.),alpha*sceneFade);}`
    }); materials.push(pathMaterial);
    function line(points: THREE.Vector3[], color: THREE.Color, offset: number, parent: THREE.Object3D = scene) {
      const g=geometry(points),phase=new Float32Array(points.length),tints=new Float32Array(points.length*3);
      for(let i=0;i<points.length;i++){phase[i]=i/(points.length-1)+offset;color.toArray(tints,i*3);}
      g.setAttribute('phase',new THREE.BufferAttribute(phase,1));g.setAttribute('tint',new THREE.BufferAttribute(tints,3));
      parent.add(new THREE.Line(g,pathMaterial));
    }
    const blue=new THREE.Color('#74a6e8');
    const ice=new THREE.Color('#b6d4f5');
    const amber=new THREE.Color('#dfa16c');
    // Nested contours and open trajectories evoke a gravitational potential.
    // These are designed illustrations, not numerical Cheetah output.
    function halo(center: THREE.Vector3, radius: number, phase: number) {
      const group=new THREE.Group();group.position.copy(center);group.rotation.set(.2,.1,-.4+phase*.1);scene.add(group);
      const shellGeometry=new THREE.SphereGeometry(radius,112,72);geometries.push(shellGeometry);
      const shell=new THREE.Mesh(shellGeometry,fieldMaterial);shell.scale.set(1,1.1,.88);group.add(shell);
      for(let layer=0;layer<3;layer++){
        const inner=new THREE.Mesh(shellGeometry,fieldMaterial);inner.scale.setScalar(.66+layer*.105);inner.rotation.z=.3*layer;group.add(inner);
      }
      for(let j=0;j<62;j++){
        const latitude=(j/61-.5)*Math.PI*.94;
        const r=radius*Math.cos(latitude),y=radius*Math.sin(latitude)*1.1;
        const points=Array.from({length:181},(_,i)=>{
          const a=i/180*Math.PI*2;
          const warp=.018*Math.sin(a*11+latitude*8)+.013*Math.sin(a*23);
          return new THREE.Vector3(Math.cos(a)*(r+warp),y+warp*.5,Math.sin(a)*(r+warp)*.88);
        });
        line(points,j%9===0?amber:blue,j*.031+phase,group);
      }
      // Incoming and outgoing paths: off-axis, curved, and continuously flowing.
      for(let j=0;j<52;j++){
        const angle=j/52*Math.PI*2;
        const impact=radius*(.48+random()*.95);
        const c=Math.cos(angle),s=Math.sin(angle);
        const curve=new THREE.CatmullRomCurve3([
          new THREE.Vector3(-16,c*impact*1.8,s*impact*1.9-5),
          new THREE.Vector3(-7,c*impact*1.15,s*impact-1.8),
          new THREE.Vector3(0,c*impact*.64,s*impact*.65),
          new THREE.Vector3(7,c*impact*.9,s*impact+2.4),
          new THREE.Vector3(17,c*impact*1.3,s*impact*1.5+7),
        ]);
        line(curve.getPoints(160),j%4===0?amber:ice,j*.097+phase,group);
      }
      return group;
    }
    const neutrino = halo(new THREE.Vector3(4,.8,-2),4.6,0);
    const haloParts=neutrino.children.map((object,i)=>({object,position:object.position.clone(),rotation:object.rotation.clone(),scale:object.scale.clone(),offset:new THREE.Vector3(Math.sin(i*2.39)*9,Math.cos(i*1.73)*7,Math.sin(i*.87)*8)}));
    const lens = createLensingScene(false);
    scene.add(lens.mesh);geometries.push(lens.geometry);materials.push(lens.material);
    // Filament bundles connect the scenes and supply close foreground parallax.
    for(let j=0;j<54;j++){
      const angle=j/54*Math.PI*2;
      const r=7+random()*8;
      const curve=new THREE.CatmullRomCurve3(Array.from({length:9},(_,k)=>{
        const a=angle+Math.sin(k*.8)*.28;
        return new THREE.Vector3(Math.cos(a)*r+Math.sin(k*1.4)*2,Math.sin(a)*r*.63,-k*13+15);
      }));
      line(curve.getPoints(240),j%7===0?amber:blue,j*.14);
    }
    const pointsMaterial=new THREE.ShaderMaterial({
      transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time,pixelRatio:{value:renderer.getPixelRatio()}},
      vertexShader:`uniform float time;uniform float pixelRatio;attribute float seed;varying float alpha;varying vec3 tint;
      void main(){vec4 v=modelViewMatrix*vec4(position,1.);alpha=.5+.5*seed;tint=mix(vec3(.46,.67,1.),vec3(1.,.76,.5),step(.85,seed));gl_Position=projectionMatrix*v;gl_PointSize=clamp(100./max(1.,-v.z),1.1,5.)*pixelRatio;}`,
      fragmentShader:`varying float alpha;varying vec3 tint;void main(){float r=length(gl_PointCoord-.5);float glow=exp(-r*r*18.);gl_FragColor=vec4(tint*1.8,glow*alpha*(1.-smoothstep(.35,.5,r)));}`
    });materials.push(pointsMaterial);
    function points(points:THREE.Vector3[],parent:THREE.Object3D){const g=geometry(points);g.setAttribute('seed',new THREE.Float32BufferAttribute(points.map(()=>random()),1));parent.add(new THREE.Points(g,pointsMaterial));}
    const sky=new THREE.Group();scene.add(sky);
    const stars=Array.from({length:mobile?1700:3000},()=>{
      const a=random()*Math.PI*2,y=random()*2-1,r=Math.sqrt(1-y*y)*145;
      return new THREE.Vector3(Math.cos(a)*r,y*145,Math.sin(a)*r);
    });points(stars,sky);
    // A sequence of held compositions, connected by gentle eased moves.
    const v=(x:number,y:number,z:number)=>new THREE.Vector3(x,y,z);
    const shots=[
      {at:0,position:v(-.5,.65,22),gaze:v(0,.2,-2)},
      {at:.10,position:v(-.5,.65,22),gaze:v(0,.2,-2)},
      {at:.20,position:v(4,3,17),gaze:v(4,.8,-2)},
      {at:.275,position:v(4,3,17),gaze:v(4,.8,-2)},
      {at:.345,position:v(7,4,15),gaze:v(4,.8,-2)},
      {at:.425,position:v(6,2,11),gaze:v(4,.8,-2)},
      {at:.49,position:v(.8,.1,-8),gaze:v(-3.8,.4,-29)},
    ];
    const lensPath=new THREE.CatmullRomCurve3([v(.8,.1,-8),v(-1,.8,-12),v(-3.8,.4,-17),v(-3.8,.4,-22),v(-3.8,.4,-34)],false,'centripetal');
    const lensGaze=new THREE.CatmullRomCurve3([v(-3.8,.4,-29),v(-3.8,.4,-29),v(-3.8,.4,-32),v(-3.8,.4,-40),v(-3.8,.4,-49)],false,'centripetal');
    // Continuous particle streams occupy the halo volume. Constant luminosity,
    // closed paths, and soft sprites avoid wrapping pops and surface interference.
    const potentialFade={value:0};
    const potentialGeometry=new THREE.BufferGeometry();geometries.push(potentialGeometry);
    const count=mobile?10000:22000;
    const seeds=new Float32Array(count*3);
    for(let i=0;i<count;i++){seeds[i*3]=random();seeds[i*3+1]=random();seeds[i*3+2]=random();}
    potentialGeometry.setAttribute('position',new THREE.BufferAttribute(seeds,3));
    const potentialMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending,uniforms:{fade:potentialFade,time,pixelRatio:{value:renderer.getPixelRatio()}},
      vertexShader:`uniform float time;uniform float pixelRatio;varying vec3 tint;
      void main(){
        float lane=position.y;float spread=position.z;
        float angle=position.x*6.283185+time*(.045+.022*lane);
        float radius=1.4+4.7*pow(lane,.65);
        float inclination=(spread-.5)*1.7;
        vec3 p=vec3(radius*cos(angle),radius*sin(angle)*sin(inclination),radius*sin(angle)*cos(inclination));
        p.y+=sin(angle*2.+lane*6.283185)*.35;
        float twist=lane*1.7;float c=cos(twist),s=sin(twist);p.xz=mat2(c,-s,s,c)*p.xz;
        tint=mix(vec3(.25,.53,.85),vec3(.65,.81,1.),spread);
        tint=mix(tint,vec3(.88,.6,.34),smoothstep(.94,1.,lane)*.7);
        vec4 view=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*view;
        gl_PointSize=clamp(38./max(2.,-view.z),1.8,3.5)*pixelRatio;
      }`,
      fragmentShader:`uniform float fade;varying vec3 tint;
      void main(){float r=length(gl_PointCoord-.5);float alpha=exp(-r*r*16.)*(1.-smoothstep(.35,.5,r));gl_FragColor=vec4(tint,alpha*fade*.24);}`
    });materials.push(potentialMaterial);
    const potential=new THREE.Points(potentialGeometry,potentialMaterial);potential.position.set(4,.8,-2);potential.frustumCulled=false;potential.renderOrder=20;scene.add(potential);
    const neutrinoFade={value:1};
    const neutrinoLineMaterial=pathMaterial.clone();neutrinoLineMaterial.uniforms={time,sceneFade:neutrinoFade};materials.push(neutrinoLineMaterial);
    neutrino.traverse(o=>{if(o instanceof THREE.Line)o.material=neutrinoLineMaterial;});
    fieldMaterial.uniforms.fade=neutrinoFade;
    fieldMaterial.fragmentShader=fieldMaterial.fragmentShader.replace('varying vec3 local;','uniform float fade;varying vec3 local;').replace('vec4(col,alpha)','vec4(col,alpha*fade)');
    // Light paths give the illustrative image plane a spatial approach.
    const rays=new THREE.Group();scene.add(rays);
    const rayMaterial=pathMaterial.clone();rayMaterial.uniforms={time,sceneFade:{value:0}};materials.push(rayMaterial);
    for(let i=0;i<32;i++){
      const a=i/32*Math.PI*2,r=3.5+(i%4)*.32;
      const curve=new THREE.CatmullRomCurve3([v(-3.8+Math.cos(a)*8,.4+Math.sin(a)*6,-45),v(-3.8+Math.cos(a)*r,.4+Math.sin(a)*r,-29),v(-3.8+Math.cos(a)*.7,.4+Math.sin(a)*.7,-16),v(-3.8,.4,-7)]);
      line(curve.getPoints(100),i%6===0?amber:blue,i*.063,rays);
    }
    rays.traverse(o=>{if(o instanceof THREE.Line)o.material=rayMaterial;});
    const gaze=new THREE.Vector3();
    let current=0,target=0,px=0,py=0,frame=0,previous=performance.now();
    let lensStart=.23,lensEnd=.52,aboutStart=.85;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');let reduced=media.matches;
    let paused=false;const pauseMotion=(event:Event)=>{paused=(event as CustomEvent<boolean>).detail;};window.addEventListener('pause-world',pauseMotion);const motion=()=>{reduced=media.matches;};media.addEventListener('change',motion);
    const scroll=()=>{target=window.scrollY/Math.max(1,document.documentElement.scrollHeight-window.innerHeight);};
    const pointer=(e:PointerEvent)=>{px=e.clientX/window.innerWidth-.5;py=e.clientY/window.innerHeight-.5;};
    const bounds=()=>{const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);const el=document.getElementById('lensing');if(el){lensStart=(el.offsetTop-window.innerHeight*.2)/max;lensEnd=(el.offsetTop+el.offsetHeight-window.innerHeight*.9)/max;}const about=document.getElementById('perspective');if(about)aboutStart=(about.offsetTop-window.innerHeight*.15)/max;};
    const resize=()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);composer.setSize(window.innerWidth,window.innerHeight);lens.mesh.position.set(-3.8,.4,-29);bounds();scroll();};
    const lost=(e:Event)=>{e.preventDefault();failWorld();};renderer.domElement.addEventListener('webglcontextlost',lost);
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('pointermove',pointer,{passive:true});window.addEventListener('resize',resize);bounds();scroll();
    function animate(now:number){
      frame=requestAnimationFrame(animate);if(document.hidden){previous=now;return;}
      const dt=Math.min((now-previous)/1000,.05);previous=now;current+=(target-current)*(1-Math.exp(-dt*4.8));
      const p=reduced?(target<lensStart?0:target<=lensEnd?(lensStart+lensEnd)*.5:.96):current;
      const local=THREE.MathUtils.clamp((p-lensStart)/(lensEnd-lensStart),0,1);
      const entry=THREE.MathUtils.clamp(p/lensStart,0,1);
      if(p<lensStart){
        const timeline=p*.49/lensStart;
        let index=0;while(index<shots.length-2&&timeline>shots[index+1].at)index++;
        const from=shots[index],to=shots[index+1],blend=THREE.MathUtils.smoothstep(timeline,from.at,to.at);
        camera.position.copy(from.position).lerp(to.position,blend);gaze.copy(from.gaze).lerp(to.gaze,blend);
      }
      else if(p<=lensEnd){camera.position.copy(lensPath.getPoint(local));gaze.copy(lensGaze.getPoint(local));}
      else {const end=THREE.MathUtils.smoothstep(p,lensEnd,1);camera.position.set(-3.8+end*2,.4,-34-end*12);gaze.set(-3.8,.4,-55);}
      const gathered=THREE.MathUtils.smoothstep(p,.025,.19);
      const fieldIn=THREE.MathUtils.smoothstep(p,.28,.335);
      const fieldOut=1-THREE.MathUtils.smoothstep(p,lensStart-.075,lensStart-.005);
      bloom.strength=THREE.MathUtils.lerp(.65,.12,fieldIn*fieldOut);
      potentialFade.value=fieldIn*fieldOut;potential.visible=potentialFade.value>.001;
      neutrinoFade.value=(1-fieldIn)*fieldOut;neutrino.visible=neutrinoFade.value>.001;
      for(const part of haloParts){
        part.object.position.copy(part.position).addScaledVector(part.offset,(1-gathered)*.55);
        part.object.rotation.set(part.rotation.x+(1-gathered)*.4,part.rotation.y,part.rotation.z+(1-gathered)*.35);
        part.object.scale.copy(part.scale).multiplyScalar(1+(1-gathered)*.22);
      }
      if(window.innerWidth<700){camera.position.z+=p<lensStart?4:2;}
      if(!reduced){camera.position.x+=px*.22;camera.position.y-=py*.16;if(!paused)time.value+=dt;}
      camera.lookAt(gaze);camera.rotation.z=0;
      const presence=THREE.MathUtils.smoothstep(p,lensStart-.025,lensStart+.01)*(1-THREE.MathUtils.smoothstep(local,.83,1));
      lens.mesh.visible=presence>.001;lens.visibility.value=presence;
      lens.strength.value=reduced?1:THREE.MathUtils.smoothstep(local,.08,.5);
      rayMaterial.uniforms.sceneFade.value=presence*THREE.MathUtils.smoothstep(local,.28,.48)*(1-THREE.MathUtils.smoothstep(local,.68,.88))*.48;
      rays.visible=rayMaterial.uniforms.sceneFade.value>.001;
      sceneFade.value=(1-fieldIn*.97)*(1-presence*.94)*(1-THREE.MathUtils.smoothstep(p,lensEnd,aboutStart)*.85);
      sky.position.copy(camera.position);composer.render();
    }
    frame=requestAnimationFrame(animate);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('pause-world',pauseMotion);window.removeEventListener('scroll',scroll);window.removeEventListener('pointermove',pointer);window.removeEventListener('resize',resize);media.removeEventListener('change',motion);renderer.domElement.removeEventListener('webglcontextlost',lost);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());composer.passes.forEach(p=>p.dispose());composer.dispose();renderer.dispose();renderer.domElement.remove();};
  },[]);
  return <div className="world" ref={mount} aria-hidden="true"/>;
}

export default function Home(){
  const [progress,setProgress]=useState(0);
  const [motionPaused,setMotionPaused]=useState(false);
  const [active,setActive]=useState(0);
  const [lensProgress,setLensProgress]=useState(0);
  useEffect(()=>{const update=()=>{setProgress(window.scrollY/Math.max(1,document.documentElement.scrollHeight-window.innerHeight));let selected=0;chapterIds.forEach((id,i)=>{const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<window.innerHeight*.5)selected=i;});setActive(selected);const el=document.getElementById('lensing');if(el)setLensProgress(THREE.MathUtils.clamp((window.scrollY-el.offsetTop+window.innerHeight*.2)/(el.offsetHeight-window.innerHeight*.7),0,1));};update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update);};},[]);
  return <>
    <World/><div className={'vignette'+(active===1?' vignette-right':'')} aria-hidden="true"/>
    <a className="skip" href="#perspective">Skip to about</a>
    <header><a className="wordmark" href="#universe">KW<span className="brand-dot"/><span className="wordmark-note">KEDUSE WORKU</span></a><nav className="site-links" aria-label="Main navigation"><a href="/research/">Research</a><a href="/cv/">Résumé</a><a href="#perspective">About</a><a href="mailto:kworku2@jhu.edu">Email</a></nav></header>
    <main>
      <section id="universe" className="chapter opening"><div className="intro"><p className="eyebrow">01 / THE UNSEEN UNIVERSE</p><h1>Keduse<br/><em>Worku.</em></h1><p className="intro-copy">I work on astrophysics and inference.<br/>Here’s a little of what that looks like.</p><a className="enter" href="#field-orbit"><span className="arrow">↓</span> Take a look</a></div><span id="field-orbit" className="field-orbit-anchor"/><div className="research-note personal-note"><span className="research-rule"/><div>{progress<.17?<><p className="story-label">RELIC NEUTRINOS</p><h3>Neutrinos have been around<br/>a lot longer than we have.</h3><p className="story-body">Some of my research is on relic neutrinos, left over from the early universe. I study how gravity affects their motion. These animations take a few liberties, but that’s the physics behind them.</p></>:progress<.28?<><p className="story-label">MODELING</p><h3>Where do the particles go?</h3><p className="story-body">Following the trajectories gives me a way to work on that question. A model lets me try out the physics and see what follows from the assumptions I’ve made.</p></>:<><p className="story-label">HOW I THINK</p><h3>How much can we actually tell?</h3><p className="story-body">I use Bayesian inference to work with incomplete evidence. I want to know how much a result depends on the observations, and how much depends on what I assumed going in.</p></>}<p className="story-credit">Illustrative animation inspired by <a href="https://github.com/NNSSA/Cheetah" target="_blank" rel="noreferrer">Cheetah ↗</a></p></div></div></section>
      <section id="lensing" className="chapter lens-chapter"><div className="lens-reading"><div className="chapter-copy lens-copy"><p className="eyebrow">02 / MACS0647 · GRAVITATIONAL LENSING</p><h2>A closer look at<br/><em>distant galaxies.</em></h2><div className="lens-narrative"><p className={lensProgress<.3?'is-visible':''}>I’ve also worked with JWST observations. My collaborators and I studied distant galaxies behind a cluster called MACS0647, which magnifies their light.</p><p className={lensProgress>=.3&&lensProgress<.68?'is-visible':''}>The cluster’s gravity bends the light on its way to us. That helps us see faint galaxies, though it also stretches and distorts what we’re looking at.</p><p className={lensProgress>=.68?'is-visible':''}>We used images to find galaxy candidates, then spectroscopy to confirm redshifts. The distinction matters: a promising candidate still needs to be checked.</p></div><div className="research-stats"><div><strong>57</strong><span>galaxy candidates</span></div><div><strong>14</strong><span>confirmed redshifts</span></div><div><strong>9.25</strong><span>highest confirmed z</span></div></div><a className="text-link" href="/research/#macs-figure">Explore the MACS0647 research ↗</a><div className="lens-state" aria-hidden="true"><span>UNLENSED</span><div><i style={{transform:`scaleX(${lensProgress})`}}/></div><span>LENSED</span></div><p className="lens-disclaimer">Illustrative lensing field; not a reconstruction of MACS0647.</p></div></div><div className="lens-exploration-note personal-note"><p className="story-label">{lensProgress<.65?'WORKING WITH DATA':'COSMIC DAWN'}</p><h3>{lensProgress<.65?'There’s a lot to work out from a little light.':'Before these galaxies, what was happening?'}</h3><p className="story-body">{lensProgress<.65?'The image is what you see first. My interest is in working out what we can say from it, and being careful about what we can’t.':'Another project took me to Cosmic Dawn. I modeled how primordial magnetic fields could change when early structure forms, and what that would do to the 21-cm signal from hydrogen.'}</p><p className="story-credit">Illustrative light paths; not a reconstruction of MACS0647.</p></div></section>
      <section id="perspective" className="chapter ending portrait-section"><div className="portrait-layout"><figure className="portrait"><img src="/media/keduse-worku.jpg" alt="Keduse Worku" width="1144" height="1092" loading="lazy"/></figure><div className="chapter-copy"><p className="eyebrow">03 / A LITTLE MORE ABOUT ME</p><h2>And beyond<br/><em>astrophysics.</em></h2><div className="about-copy"><p>Astrophysics is my background. It’s given me a lot of practice working with models when the thing I want to understand is hard to observe directly.</p><p>I’m also interested in AI evaluation: figuring out what a model can do, where it gets things wrong, and whether we’re asking it useful questions in the first place. I want to be able to explain the results clearly, including the parts I’m still unsure about.</p></div><div className="end-links"><a href="/research/">Explore my research ↗</a><a href="/cv/">Résumé</a><a href="mailto:kworku2@jhu.edu">Email me</a><a href="https://github.com/Keduseworku" target="_blank" rel="noreferrer">GitHub ↗</a></div></div></div><a className="return" href="#universe">↑ Return to the beginning</a></section>
    </main>
    <nav className="chapter-nav" aria-label="Chapters">{chapters.map((name,i)=><a key={name} href={'#'+chapterIds[i]} aria-current={active===i?'step':undefined}><span className="nav-number">0{i+1}</span><span className="nav-line"/><span className="nav-name">{name}</span></a>)}</nav>
    <footer><span className="location">{chapters[active].toUpperCase()}<span className="footer-separator">/</span>KW</span><div className="depth"><span>{String(Math.round(progress*100)).padStart(3,'0')} %</span><div className="depth-track"><i style={{transform:`scaleX(${progress})`}}/></div><span>EXPLORE</span></div></footer>
    <button className="motion-control" type="button" aria-pressed={motionPaused} onClick={()=>{const next=!motionPaused;setMotionPaused(next);window.dispatchEvent(new CustomEvent('pause-world',{detail:next}));}}>{motionPaused?'Resume motion':'Pause motion'}</button>
    <p className="fallback">The 3D scene is unavailable on this device. You can still scroll to explore.</p>
  </>;
}
