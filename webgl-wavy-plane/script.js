import * as THREE from "https://threejs.org/build/three.module.js";

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  45,
  windowWidth / windowHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 1.5);

const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
let geometry;
let material;
let mesh;

function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

textureLoader.load(
  "https://images.unsplash.com/photo-1602826347632-fc49a8675be6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&w=2370",
  (texture) => {
    geometry = new THREE.PlaneGeometry(1, 1, 64, 64);
    material = new THREE.ShaderMaterial({
      uniforms: {
        image: { value: texture },
        sizeImage: {
          value: new THREE.Vector2(
            texture.image.naturalWidth,
            texture.image.naturalHeight
          ),
        },
        planeSize: {
          value: new THREE.Vector2(1, 1),
        },
        rotation: { value: degToRad(6.27) },
        amp: { value: 0.14 },
        time: { value: 0 },
      },
      vertexShader: `
      uniform float rotation; // plane rotation
      uniform float time;
      uniform float amp; // sine amplifier
      varying vec2 vUv;
      varying float vPosZ;

      mat4 rotationZ(in float angle) {
        return mat4(
          cos(angle),		-sin(angle),	0,	0,
          sin(angle),		cos(angle),		0,	0,
          0,				    0,		        1,	0,
          0,				    0,		        0,	1
        );
      }      
        
      void main() {
        vUv = uv;
        vec4 pos = vec4(position, 1.0) * rotationZ(rotation);
        pos.z += sin(uv.x * 6.0 + uv.y * 0.7 + time * 0.002) * amp;
        vPosZ = pos.z;

        gl_Position = projectionMatrix * modelViewMatrix * pos;
      }
    `,
      fragmentShader: `
      uniform vec2 planeSize;
      uniform vec2 sizeImage;
      uniform sampler2D image;

      varying vec2 vUv;
      varying float vPosZ;

      vec4 coverTexture(sampler2D tex, vec2 imgSize, vec2 ouv) {
        vec2 s = planeSize;
        vec2 i = imgSize;
        float rs = s.x / s.y;
        float ri = i.x / i.y;
        vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
        vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
        vec2 uv = ouv * s / new + offset;
    
        return texture2D(tex, uv);
      }    

      void main() {
        vec2 uv = vUv;

        gl_FragColor = coverTexture(image, sizeImage, uv);
        gl_FragColor.rgb *= 1.0 - smoothstep(1.0, -4.0, vPosZ);

      }
    `,
    });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    onResize();
    window.addEventListener("resize", onResize);
  }
);

function render() {
  if (material) {
    material.uniforms.time.value += 5;
  }

  renderer.render(scene, camera);
}

function animate() {
  render();
  requestAnimationFrame(animate);
}

function onResize() {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(windowWidth, windowHeight);
  camera.aspect = windowWidth / windowHeight;
  camera.updateProjectionMatrix();
}

animate();
