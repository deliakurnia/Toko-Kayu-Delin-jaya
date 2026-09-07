import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeMiniWoodSpecimenProps {
  className?: string;
  isDark?: boolean;
}

export const ThreeMiniWoodSpecimen: React.FC<ThreeMiniWoodSpecimenProps> = ({
  className = '',
  isDark = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 40;
    const height = container.clientHeight || 40;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.2, 1.8, 2.5);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Procedural Wood Grain Texture Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Golden Amber Base
      ctx.fillStyle = '#b47334';
      ctx.fillRect(0, 0, 128, 128);

      // Fine Wood Growth Rings
      for (let i = 0; i < 16; i++) {
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(70, 38, 14, 0.35)' : 'rgba(215, 155, 80, 0.25)';
        ctx.lineWidth = 2 + (i % 3);
        ctx.beginPath();
        ctx.ellipse(64, 64, 8 + i * 7, 5 + i * 5, Math.PI / 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);

    // Geometry: Solid Timber Slab Block with beveled edges
    const geometry = new THREE.BoxGeometry(1.2, 0.6, 1.2);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.35,
      metalness: 0.1,
      color: 0xffffff
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Subtle edge hairline
    const edgesGeom = new THREE.EdgesGeometry(geometry);
    const edgesMat = new THREE.LineBasicMaterial({
      color: isDark ? 0xf59e0b : 0xd97706,
      transparent: true,
      opacity: 0.35
    });
    const line = new THREE.LineSegments(edgesGeom, edgesMat);
    mesh.add(line);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.4 : 1.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    dirLight.position.set(3, 4, 2);
    scene.add(dirLight);

    const warmPointLight = new THREE.PointLight(0xf59e0b, 1.8, 10);
    warmPointLight.position.set(-2, 1, 1);
    scene.add(warmPointLight);

    // Mouse interactive tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseRef.current.targetX = x * 1.5;
      mouseRef.current.targetY = y * 1.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth damping rotation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      mesh.rotation.y += 0.012;
      mesh.rotation.x = mouseRef.current.y * 0.5;
      mesh.rotation.z = -mouseRef.current.x * 0.3;

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      edgesGeom.dispose();
      edgesMat.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-lg overflow-hidden shrink-0 select-none ${className}`}
      style={{ width: '38px', height: '38px' }}
      title="Miniatur WebGL 3D Spesimen Kayu Solid (Three.js)"
    />
  );
};
