import * as THREE from "https://threejs.org/build/three.module.js";

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
let isPixelated = true;

const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  45,
  windowWidth / windowHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 1);

const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
let geometry;
let material;
let mesh;
const pixelSize = 10;
const textureSize = { width: 1, height: 1 };

textureLoader.load(
  "https://images.unsplash.com/photo-1606996475684-cff9883ef8d6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&w=2370&q=80",
  (texture) => {
    textureSize.width = texture.image.naturalWidth;
    textureSize.height = texture.image.naturalHeight;
    geometry = new THREE.PlaneGeometry();
    material = new THREE.ShaderMaterial({
      uniforms: {
        viewport: { value: new THREE.Vector2(windowWidth, windowHeight) },
        pixelSize: { value: pixelSize },
        image: { value: texture },
      },
      vertexShader: `
      varying vec2 vUv;
      uniform vec2 textureScale;

      void main() {
        vUv = uv;
        vec2 u_adjust_uv = vec2(1., 906. / 604.);
        vUv = vec2(0.5) + uv * u_adjust_uv - u_adjust_uv * 0.5;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }

    `,
      fragmentShader: `
      uniform vec2 viewport;
      uniform float pixelSize;
      uniform sampler2D image;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        vec2 dxy = pixelSize / viewport;
        vec2 coord = dxy * floor(uv / dxy);
        gl_FragColor = texture2D(image, coord);
      }

    `,
    });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    document.addEventListener("click", () => {
      gsap.to(material.uniforms.pixelSize, {
        duration: 0.7,
        value: isPixelated ? 0.01 : pixelSize,
        ease: "steps(30)",
      });
      isPixelated = !isPixelated;
    });

    onResize();
    window.addEventListener("resize", onResize);
  }
);

function render() {
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
  const imageAspectRatio = textureSize.width / textureSize.height;
  const aspectRatio = windowWidth / windowHeight;

  if (aspectRatio > 1) {
    mesh.scale.x = imageAspectRatio * aspectRatio;
    mesh.scale.y = imageAspectRatio * aspectRatio;
  } else {
    mesh.scale.x = (1 / aspectRatio) * imageAspectRatio;
    mesh.scale.y = (1 / aspectRatio) * imageAspectRatio;
  }

  if (material) {
    material.uniforms.viewport.value.x = windowWidth;
    material.uniforms.viewport.value.y = windowHeight;
  }

  renderer.setSize(windowWidth, windowHeight);
  camera.aspect = windowWidth / windowHeight;
  camera.updateProjectionMatrix();
}

animate();
