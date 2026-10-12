import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./Heart3D.css";

export default function Heart3D({
  accent = "#C41230",
  glow = "#FF4D6D",
  bpm = 62,
  interactive = true,
  imageSrc = "/images/realistic-heart.png",
  style = {},
}) {
  const mountRef = useRef(null);
  const heartRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const heart = heartRef.current;

    if (!mount || !heart) return;

    let disposed = false;
    let rafId = 0;

    // Scene for subtle 3D particles behind the anatomical heart.
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      Math.max(mount.clientWidth, 1) /
        Math.max(mount.clientHeight, 1),
      0.1,
      100
    );

    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.75)
    );

    renderer.setSize(
      mount.clientWidth || 400,
      mount.clientHeight || 400
    );

    renderer.setClearColor(0x000000, 0);
    mount.prepend(renderer.domElement);

    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.pointerEvents = "none";

    // Floating particles.
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: glow,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(
      particleGeometry,
      particleMaterial
    );

    scene.add(particles);

    // Mouse interaction.
    let mouseX = 0;
    let mouseY = 0;
    let tiltX = 0;
    let tiltY = 0;

    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();

      mouseX =
        ((event.clientX - rect.left) / rect.width - 0.5) * 2;

      mouseY =
        ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const onPointerLeave = () => {
      mouseX = 0;
      mouseY = 0;
    };

    if (interactive) {
      mount.addEventListener("pointermove", onPointerMove);
      mount.addEventListener("pointerleave", onPointerLeave);
    }

    // Responsive canvas.
    const resizeObserver = new ResizeObserver(() => {
      if (disposed) return;

      const width = mount.clientWidth;
      const height = mount.clientHeight;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    resizeObserver.observe(mount);

    // Animation loop.
    const clock = new THREE.Clock();
    const beatPeriod = 60 / Math.max(1, bpm);

    const animate = () => {
      if (disposed) return;

      rafId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const phase = (time % beatPeriod) / beatPeriod;

      // Natural two-stage heartbeat: lub-dub.
      const lub = Math.exp(
        -Math.pow((phase - 0.09) / 0.045, 2)
      );

      const dub = Math.exp(
        -Math.pow((phase - 0.28) / 0.055, 2)
      );

      const pulse = 1 + 0.045 * lub + 0.022 * dub;

      // Animate the realistic heart image.
      heart.style.transform = `
        translate3d(
          ${tiltY * 5}px,
          ${tiltX * -5}px,
          0
        )
        rotateX(${-tiltX * 5}deg)
        rotateY(${tiltY * 7}deg)
        scale(${pulse})
      `;

      // Smoothly follow the pointer.
      tiltX += (mouseY - tiltX) * 0.035;
      tiltY += (mouseX - tiltY) * 0.035;

      particles.rotation.y = time * 0.018;
      particles.rotation.x = Math.sin(time * 0.15) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);

      resizeObserver.disconnect();

      if (interactive) {
        mount.removeEventListener("pointermove", onPointerMove);
        mount.removeEventListener("pointerleave", onPointerLeave);
      }

      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [glow, bpm, interactive]);

  return (
    <div
      ref={mountRef}
      className="heart3d-stage"
      style={style}
      aria-label="Realistic anatomical 3D human heart illustration"
      role="img"
    >
      <div className="heart3d-glow" />

      <img
        ref={heartRef}
        className="heart3d-image"
        src={imageSrc}
        alt="Realistic anatomical human heart with coronary vessels, aorta, and pulmonary arteries"
        draggable="false"
        onError={(event) => {
          event.currentTarget.style.visibility = "hidden";
          console.error(
            "Heart image could not be loaded:",
            imageSrc
          );
        }}
      />

      <div className="heart3d-shadow" />
    </div>
  );
}