'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * CinematicLayer
 * A transparent, additive-blended bokeh/particle field that floats slowly
 * over the video hero. Warm orange + soft white points, gentle sine-wave
 * drift, subtle mouse parallax on the camera. Fully self-disposing.
 */
export default function CinematicLayer({ className }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);
    camera.position.z = 420;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ---- Particle geometry -------------------------------------------------
    const COUNT = width < 700 ? 70 : 140;
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT); // phase offsets for sine drift
    const sizes = new Float32Array(COUNT);
    const warmth = new Float32Array(COUNT); // 0 = warm orange, 1 = cool white

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 900;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 500;
      seeds[i] = Math.random() * Math.PI * 2;
      sizes[i] = Math.random() * 14 + 4;
      warmth[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aWarmth', new THREE.BufferAttribute(warmth, 1));

    // Soft round sprite generated on a canvas — avoids external texture assets
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const ctx = spriteCanvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const spriteTexture = new THREE.CanvasTexture(spriteCanvas);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: spriteTexture },
        uTime: { value: 0 },
        uEmber: { value: new THREE.Color('#ff8a4a') },
        uMonitor: { value: new THREE.Color('#bcd6ec') },
      },
      vertexShader: `
        attribute float aSeed;
        attribute float aSize;
        attribute float aWarmth;
        varying float vWarmth;
        varying float vFade;
        uniform float uTime;

        void main() {
          vWarmth = aWarmth;
          vec3 p = position;
          p.x += sin(uTime * 0.15 + aSeed) * 18.0;
          p.y += cos(uTime * 0.12 + aSeed * 1.7) * 14.0;
          p.z += sin(uTime * 0.1 + aSeed * 2.3) * 12.0;

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          float dist = -mvPosition.z;
          vFade = smoothstep(650.0, 150.0, dist);
          gl_PointSize = aSize * (300.0 / dist);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec3 uEmber;
        uniform vec3 uMonitor;
        varying float vWarmth;
        varying float vFade;

        void main() {
          vec4 tex = texture2D(uTexture, gl_PointCoord);
          vec3 color = mix(uEmber, uMonitor, step(0.82, vWarmth));
          float alpha = tex.a * vFade * 0.55;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ---- Mouse parallax ------------------------------------------------
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    function handlePointerMove(e) {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      target.x = nx * 30;
      target.y = ny * -20;
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // ---- Resize ------------------------------------------------------------
    function handleResize() {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', handleResize);

    // ---- Render loop ---------------------------------------------------
    let rafId;
    const clock = new THREE.Clock();

    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        material.uniforms.uTime.value = t;
        current.x += (target.x - current.x) * 0.04;
        current.y += (target.y - current.y) * 0.04;
        camera.position.x = current.x;
        camera.position.y = current.y;
        camera.lookAt(0, 0, 0);
        points.rotation.y = Math.sin(t * 0.03) * 0.05;
      }

      renderer.render(scene, camera);
    }
    animate();

    // ---- Cleanup -------------------------------------------------------
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      spriteTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
