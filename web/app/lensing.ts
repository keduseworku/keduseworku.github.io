import * as THREE from 'three';

/** Illustrative softened elliptical lens potential. Not a MACS0647 mass model. */
export function createLensingScene(mobile: boolean) {
  const strength = { value: 0 };
  const visibility = { value: 0 };
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { strength, visibility },
    vertexShader: `varying vec2 imagePosition;
      void main(){imagePosition=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `
      uniform float strength;
      uniform float visibility;
      varying vec2 imagePosition;
      float hash(float n){return fract(sin(n*127.1+311.7)*43758.5453);}
      vec2 rotate2(vec2 p,float a){float c=cos(a),s=sin(a);return vec2(c*p.x-s*p.y,s*p.x+c*p.y);}
      float galaxy(vec2 p,vec2 center,vec2 size,float angle){
        vec2 q=rotate2(p-center,angle)/size;
        float r=length(q);
        float profile=exp(-r*2.5)*.62+exp(-r*r*7.)*.6;
        float knots=1.+.14*sin(q.x*9.+q.y*6.)*sin(q.y*11.-q.x*4.);
        return profile*knots;
      }
      vec2 deflection(vec2 theta){
        vec2 d=theta;
        vec2 mainHalo=1.08*vec2(.88*d.x,1.12*d.y)/sqrt(.88*d.x*d.x+1.12*d.y*d.y+.009);
        vec2 e=theta-vec2(-.76,.37);
        vec2 companion=.26*e/sqrt(dot(e,e)+.025);
        return mainHalo+companion+vec2(.045*theta.x,-.045*theta.y);
      }
      vec3 sourceLight(vec2 beta){
        vec3 color=vec3(0.);
        // Small extended sources close to the caustic create resolved arcs.
        color+=vec3(.39,.79,1.6)*galaxy(beta,vec2(.17,.12),vec2(.15,.065),.45)*2.;
        color+=vec3(.52,.83,1.5)*galaxy(beta,vec2(-.16,.26),vec2(.12,.053),-.7)*1.5;
        color+=vec3(1.6,.69,.34)*galaxy(beta,vec2(.35,-.26),vec2(.10,.047),.9)*1.6;
        color+=vec3(.7,1.,1.6)*galaxy(beta,vec2(-.45,-.11),vec2(.12,.055),1.8);
        for(int i=0;i<30;i++){
          float f=float(i)+1.;
          vec2 center=(vec2(hash(f),hash(f+74.))-.5)*6.6;
          float size=.035+hash(f+13.)*.11;
          vec3 tint=mix(vec3(.42,.66,1.25),vec3(1.1,.66,.38),hash(f+81.));
          color+=tint*galaxy(beta,center,vec2(size,size*(.3+hash(f+16.)*.5)),hash(f+4.)*6.28)*(.4+hash(f+6.));
        }
        return color;
      }
      vec3 foregroundLight(vec2 theta){
        vec3 color=vec3(1.15,.77,.42)*galaxy(theta,vec2(0.),vec2(.20,.29),-.4)*1.6;
        color+=vec3(1.,.64,.35)*galaxy(theta,vec2(-.76,.37),vec2(.14,.20),.55)*1.3;
        for(int i=0;i<17;i++){
          float f=float(i)+120.;
          float a=hash(f)*6.283;
          float r=.35+hash(f+7.)*2.2;
          vec2 center=vec2(cos(a)*r,sin(a)*r*.73);
          float size=.04+hash(f+3.)*.08;
          color+=vec3(.91,.69,.46)*galaxy(theta,center,vec2(size,size*.67),hash(f+2.)*6.28)*.7;
        }
        return color;
      }
      void main(){
        vec2 theta=imagePosition*vec2(3.7,2.9);
        vec2 beta=theta-strength*deflection(theta);
        vec3 light=sourceLight(beta)+foregroundLight(theta);
        float edge=1.-smoothstep(.72,1.,max(abs(imagePosition.x),abs(imagePosition.y)));
        gl_FragColor=vec4(light,visibility*edge);
      }
    `,
  });
  const geometry = new THREE.PlaneGeometry(32,25);
  const mesh = new THREE.Mesh(geometry,material);
  mesh.position.set(mobile ? 1 : -3.8,mobile ? -2.5 : .4,-29);
  mesh.visible=false;
  return { mesh, strength, visibility, geometry, material };
}
