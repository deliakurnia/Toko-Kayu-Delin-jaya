import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { WoodType, ThreeAnnotation } from '../types';
import { INITIAL_WOODS } from '../data/woodData';
import { dbService } from '../services/dbService';
import { RotateCw, Play, Pause, Layers, ZoomIn, ZoomOut, Sparkles, Compass, ShoppingBag, Boxes } from 'lucide-react';

interface ThreeDVisualizerProps {
  selectedWood?: WoodType;
  initialWood?: WoodType;
  onSelectWood?: (wood: WoodType) => void;
  onOrderSelectedWood?: (wood: WoodType) => void;
  woods?: WoodType[];
  allWoods?: WoodType[];
  isDark?: boolean;
}

type ModelShape = 'slab' | 'timber' | 'bench' | 'cylinder';

export const ThreeDVisualizer: React.FC<ThreeDVisualizerProps> = ({
  selectedWood,
  initialWood,
  onSelectWood,
  onOrderSelectedWood,
  woods,
  allWoods,
  isDark = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [modelShape, setModelShape] = useState<ModelShape>('slab');
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [activeAnnotation, setActiveAnnotation] = useState<ThreeAnnotation | null>(null);
  const [screenAnnotations, setScreenAnnotations] = useState<{ annotation: ThreeAnnotation; x: number; y: number; visible: boolean }[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [cutawayWireframe, setCutawayWireframe] = useState<boolean>(false);

  // Determine available woods list and active wood safely
  const availableWoods = (woods && woods.length > 0)
    ? woods
    : (allWoods && allWoods.length > 0)
    ? allWoods
    : INITIAL_WOODS;

  const [internalWood, setInternalWood] = useState<WoodType>(() => {
    return selectedWood || initialWood || availableWoods[0] || INITIAL_WOODS[0];
  });

  useEffect(() => {
    if (selectedWood) {
      setInternalWood(selectedWood);
    } else if (initialWood) {
      setInternalWood(initialWood);
    }
  }, [selectedWood, initialWood]);

  // Listen to live SSE stock updates & new wood creation
  useEffect(() => {
    const unsubscribe = dbService.subscribe((event) => {
      if (event.type === 'WOOD_STOCK_UPDATED') {
        const updated = event.payload as WoodType;
        if (internalWood && (internalWood.id === updated.id || internalWood.slug === updated.slug)) {
          setInternalWood(prev => ({ ...prev, ...updated }));
        }
      }
    });

    const handleWindowUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<WoodType>;
      if (customEvent.detail && internalWood && (internalWood.id === customEvent.detail.id || internalWood.slug === customEvent.detail.slug)) {
        setInternalWood(prev => ({ ...prev, ...customEvent.detail }));
      }
    };
    window.addEventListener('woodCatalogUpdated', handleWindowUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('woodCatalogUpdated', handleWindowUpdate);
    };
  }, [internalWood]);

  const activeWood = internalWood || selectedWood || initialWood || availableWoods[0] || INITIAL_WOODS[0];

  // References for Three.js instance
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const currentMeshRef = useRef<THREE.Mesh | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const autoRotateRef = useRef<boolean>(isAutoRotate);
  const reqAnimationRef = useRef<number | null>(null);

  autoRotateRef.current = isAutoRotate;

  // 3D Anchor points for Three UI tags
  const annotations: ThreeAnnotation[] = [
    {
      id: 'grain',
      label: 'Kerapatan Serat',
      sublabel: 'Urat Alami Kelas 1',
      position: [0.7, 0.4, 0.2],
      description: `Pola serat kayu ${activeWood?.name || 'Kayu Pilihan'} berkarakter khas. Bebas cacat mata mati dan tidak retak berkat proses pengeringan bertahap.`
    },
    {
      id: 'hardness',
      label: 'Kekerasan (Janka)',
      sublabel: activeWood?.characteristics?.kekerasan ? activeWood.characteristics.kekerasan.split('(')[0].trim() : 'Keras & Ulet',
      position: [-0.6, 0.35, -0.3],
      description: `Tingkat resistensi tekanan tinggi (${activeWood?.characteristics?.kekerasan || '-'}). Cocok untuk konstruksi menahan beban berat.`
    },
    {
      id: 'moisture',
      label: 'Kadar Air (MC)',
      sublabel: activeWood?.characteristics?.kadarAir ? activeWood.characteristics.kadarAir.split('(')[0].trim() : '10% - 12%',
      position: [0.1, -0.2, 0.45],
      description: `Kadar air terstandarisasi ekspor (${activeWood?.characteristics?.kadarAir || '-'}). Mencegah kayu melintir, menyusut, atau pecah setelah difinishing.`
    }
  ];

  // Helper: Procedural Wood Texture Canvas Generator
  const generateWoodTexture = useCallback((wood: WoodType): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Base background tone
    ctx.fillStyle = wood.textureColorHex || '#8D6E63';
    ctx.fillRect(0, 0, 1024, 1024);

    // Generate organic wooden annual rings & streaks
    const isEboni = wood.slug === 'eboni';
    const isJati = wood.slug === 'jati';
    const isSonokeling = wood.slug === 'sonokeling';

    const numStreaks = isEboni ? 85 : isSonokeling ? 60 : 45;
    for (let i = 0; i < numStreaks; i++) {
      const y = (i / numStreaks) * 1024;
      ctx.beginPath();

      if (isEboni) {
        // High contrast black & deep caramel lines
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(10, 8, 7, 0.85)' : 'rgba(165, 95, 45, 0.4)';
        ctx.lineWidth = 4 + Math.random() * 8;
      } else if (isSonokeling) {
        // Purple-black to dark chocolate waves
        ctx.strokeStyle = i % 3 === 0 ? 'rgba(38, 18, 28, 0.75)' : 'rgba(84, 45, 30, 0.45)';
        ctx.lineWidth = 3 + Math.random() * 7;
      } else if (isJati) {
        // Golden honey with rich teak brown rings
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(120, 72, 28, 0.55)' : 'rgba(218, 160, 80, 0.35)';
        ctx.lineWidth = 2 + Math.random() * 6;
      } else {
        // Gaharu - rich dark resinous specks
        ctx.strokeStyle = 'rgba(40, 25, 18, 0.65)';
        ctx.lineWidth = 3 + Math.random() * 5;
      }

      ctx.moveTo(0, y);
      const cp1x = 300 + Math.sin(i * 0.4) * 80;
      const cp1y = y + (Math.sin(i * 0.7) * 40);
      const cp2x = 700 + Math.cos(i * 0.5) * 80;
      const cp2y = y + (Math.cos(i * 0.6) * 35);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, 1024, y + (Math.random() * 15 - 7));
      ctx.stroke();
    }

    // Add fine wood pore noise
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let p = 0; p < data.length; p += 4) {
      const noise = (Math.random() - 0.5) * 14;
      data[p] = Math.min(255, Math.max(0, data[p] + noise));
      data[p + 1] = Math.min(255, Math.max(0, data[p + 1] + noise));
      data[p + 2] = Math.min(255, Math.max(0, data[p + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.5, 1.5);
    return texture;
  }, []);

  // Update Geometry based on ModelShape
  const updateGeometry = useCallback((shape: ModelShape, wood: WoodType, wireframe: boolean) => {
    if (!meshGroupRef.current || !sceneRef.current) return;

    // Remove existing children
    while (meshGroupRef.current.children.length > 0) {
      const obj = meshGroupRef.current.children[0];
      meshGroupRef.current.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    const texture = generateWoodTexture(wood);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: wood.roughness || 0.38,
      metalness: wood.metalness || 0.08,
      wireframe: wireframe
    });

    if (shape === 'slab') {
      // Natural Live Edge Slab (Chamfered box)
      const geom = new THREE.BoxGeometry(2.4, 0.22, 1.2, 16, 4, 16);
      // Subtle organic deformation on edges to simulate live natural edge
      const pos = geom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const z = pos.getZ(i);
        const x = pos.getX(i);
        if (Math.abs(z) > 0.55) {
          const wobble = Math.sin(x * 3.5) * 0.045 + Math.cos(x * 7.0) * 0.02;
          pos.setZ(i, z + wobble);
        }
      }
      geom.computeVertexNormals();
      const mesh = new THREE.Mesh(geom, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      meshGroupRef.current.add(mesh);
      currentMeshRef.current = mesh;
    } else if (shape === 'timber') {
      // Timber Beam / Balok Kayu Mentah
      const geom = new THREE.BoxGeometry(2.2, 0.45, 0.5, 8, 4, 8);
      const mesh = new THREE.Mesh(geom, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      meshGroupRef.current.add(mesh);
      currentMeshRef.current = mesh;
    } else if (shape === 'cylinder') {
      // Raw Log Trunk / Gelondongan
      const geom = new THREE.CylinderGeometry(0.55, 0.58, 2.0, 32, 8);
      const mesh = new THREE.Mesh(geom, material);
      mesh.rotation.z = Math.PI / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      meshGroupRef.current.add(mesh);
      currentMeshRef.current = mesh;
    } else if (shape === 'bench') {
      // Crafted Minimalist Bench (Compound Object)
      const benchGroup = new THREE.Group();
      
      // Bench top
      const topGeom = new THREE.BoxGeometry(2.0, 0.12, 0.7);
      const topMesh = new THREE.Mesh(topGeom, material);
      topMesh.position.y = 0.35;
      topMesh.castShadow = true;
      benchGroup.add(topMesh);

      // 4 Legs
      const legGeom = new THREE.CylinderGeometry(0.045, 0.035, 0.7, 16);
      const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x221E1C,
        roughness: 0.6,
        metalness: 0.4
      });

      const legPositions: [number, number, number][] = [
        [-0.85, 0, -0.22],
        [0.85, 0, -0.22],
        [-0.85, 0, 0.22],
        [0.85, 0, 0.22]
      ];

      legPositions.forEach(([x, y, z]) => {
        const leg = new THREE.Mesh(legGeom, legMaterial);
        leg.position.set(x, y, z);
        leg.castShadow = true;
        benchGroup.add(leg);
      });

      meshGroupRef.current.add(benchGroup);
    }
  }, [generateWoodTexture]);

  // Project 3D annotation coordinates to 2D screen positions (Three UI)
  const updateScreenAnnotations = useCallback(() => {
    if (!cameraRef.current || !rendererRef.current || !meshGroupRef.current) return;

    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const canvas = renderer.domElement;
    const rect = canvas.getBoundingClientRect();

    const projected = annotations.map(annot => {
      const v = new THREE.Vector3(...annot.position);
      // Transform local position with mesh group's world matrix
      v.applyMatrix4(meshGroupRef.current!.matrixWorld);
      v.project(camera);

      // Check if point is facing the camera
      const isBehindCamera = v.z > 1.0;
      const x = ((v.x + 1) * rect.width) / 2;
      const y = ((-v.y + 1) * rect.height) / 2;

      return {
        annotation: annot,
        x,
        y,
        visible: !isBehindCamera && x >= 10 && x <= rect.width - 10 && y >= 10 && y <= rect.height - 10
      };
    });

    setScreenAnnotations(projected);
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(2.8, 1.8, 3.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff8f0, isDark ? 0.9 : 1.2);
    scene.add(ambientLight);

    const mainDirectionalLight = new THREE.DirectionalLight(0xfff3df, 1.5);
    mainDirectionalLight.position.set(4, 6, 4);
    mainDirectionalLight.castShadow = true;
    mainDirectionalLight.shadow.mapSize.width = 1024;
    mainDirectionalLight.shadow.mapSize.height = 1024;
    scene.add(mainDirectionalLight);

    const fillLight = new THREE.DirectionalLight(0xb0d5f0, 0.6);
    fillLight.position.set(-4, -2, -3);
    scene.add(fillLight);

    // Warm bounce light from bottom
    const bounceLight = new THREE.PointLight(0xc9a34e, 0.8, 8);
    bounceLight.position.set(0, -1.2, 0);
    scene.add(bounceLight);

    // Shadow catcher floor
    const floorGeom = new THREE.PlaneGeometry(12, 12);
    const floorMat = new THREE.ShadowMaterial({ opacity: isDark ? 0.4 : 0.15 });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.55;
    floor.receiveShadow = true;
    scene.add(floor);

    // Mesh Group
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    // Build initial geometry
    updateGeometry(modelShape, activeWood, cutawayWireframe);

    // Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      reqAnimationRef.current = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (meshGroupRef.current && autoRotateRef.current && !isDraggingRef.current) {
        meshGroupRef.current.rotation.y += 0.35 * delta;
      }

      renderer.render(scene, camera);
      updateScreenAnnotations();
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updateScreenAnnotations();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (reqAnimationRef.current) cancelAnimationFrame(reqAnimationRef.current);
      renderer.dispose();
    };
  }, []);

  // Update geometry when wood or shape or wireframe changes
  useEffect(() => {
    updateGeometry(modelShape, activeWood, cutawayWireframe);
  }, [modelShape, activeWood, cutawayWireframe, updateGeometry]);

  // Mouse Orbit / Touch Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !meshGroupRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    meshGroupRef.current.rotation.y += deltaX * 0.008;
    meshGroupRef.current.rotation.x = Math.max(-0.6, Math.min(0.6, meshGroupRef.current.rotation.x + deltaY * 0.005));

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const currentZ = cameraRef.current.position.length();
    const factor = direction === 'in' ? 0.85 : 1.15;
    const newZ = Math.max(1.8, Math.min(5.5, currentZ * factor));
    cameraRef.current.position.normalize().multiplyScalar(newZ);
    setZoomLevel(Number((3.2 / newZ).toFixed(1)));
  };

  return (
    <div id="three-visualizer-container" className="relative w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#16191f] border border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors duration-300">
      
      {/* Top Header Controls Bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-white/90 dark:bg-[#0f1115]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Three.js Interactive 3D
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                WebGL Studio
              </span>
              {/* Live Real-time Stock Indicator */}
              {activeWood?.stockStatus === 'ready' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                  <span>Siap Kirim ({activeWood.stockVolumeM3 ?? 18.5} m³)</span>
                </span>
              )}
              {activeWood?.stockStatus === 'low_stock' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-950 animate-pulse" />
                  <span>Sisa Terbatas ({activeWood.stockSlabsCount ?? 3} Slab)</span>
                </span>
              )}
              {activeWood?.stockStatus === 'out_of_stock' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>Habis • Inden Penebangan</span>
                </span>
              )}
              {activeWood?.stockStatus === 'pre_order' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>Pre-Order Oven Kiln-Dry</span>
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-display">
              Inspeksi Serat &amp; Material: {activeWood?.name || 'Kayu Pilihan'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Order CTA if callback provided */}
          {onOrderSelectedWood && (
            <button
              onClick={() => onOrderSelectedWood(activeWood)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pesan Spesimen Ini</span>
            </button>
          )}

          {/* Model Shape Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#16191f] border border-slate-200 dark:border-slate-800 text-xs">
            {(
              [
                { id: 'slab', label: 'Live Edge Slab' },
                { id: 'timber', label: 'Balok Mentah' },
                { id: 'bench', label: 'Furniture Jadi' },
                { id: 'cylinder', label: 'Kayu Gelondongan' }
              ] as const
            ).map(shape => (
              <button
                key={shape.id}
                onClick={() => setModelShape(shape.id)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  modelShape === shape.id
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {shape.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas Stage */}
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-[420px] md:h-[480px] cursor-grab active:cursor-grabbing relative overflow-hidden"
      />

      {/* THREE UI: Integrated 3D Coordinate-Anchored Floating Annotations */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {screenAnnotations.map(({ annotation, x, y, visible }) => {
          if (!visible) return null;
          const isSelected = activeAnnotation?.id === annotation.id;

          return (
            <div
              key={annotation.id}
              style={{
                transform: `translate(${x}px, ${y}px)`,
                position: 'absolute',
                left: 0,
                top: 0
              }}
              className="pointer-events-auto -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
            >
              <div className="relative group">
                {/* 3D Anchor Pin */}
                <button
                  onClick={() => setActiveAnnotation(isSelected ? null : annotation)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-md transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 scale-105'
                      : 'bg-white/95 dark:bg-[#16191f]/95 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:scale-105'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{annotation.label}</span>
                </button>

                {/* Pulsing Target Dot */}
                <div className="w-1.5 h-1.5 mx-auto mt-0.5 rounded-full bg-emerald-500" />

                {/* Floating Spec Detail Tooltip */}
                {isSelected && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 rounded-xl bg-white dark:bg-[#16191f] text-slate-900 dark:text-slate-100 shadow-xl border border-slate-200 dark:border-slate-800 text-xs z-30">
                    <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{annotation.label}</span>
                      <span className="font-mono text-[10px] text-slate-400">THREE-UI</span>
                    </div>
                    <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">{annotation.sublabel}</div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {annotation.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Floating Control Pill & Wood Switcher */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/95 dark:bg-[#0f1115]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 shadow-md">
        
        {/* Wood Material Quick Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mr-1 hidden sm:inline">
            Pilihan Kayu:
          </span>
          {availableWoods.map(wood => (
            <button
              key={wood.id}
              onClick={() => {
                setInternalWood(wood);
                if (onSelectWood) onSelectWood(wood);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeWood?.id === wood.id
                  ? 'bg-emerald-600 text-white shadow-xs dark:bg-emerald-500 dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-[#16191f] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1c212a]'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: wood.textureColorHex }}
              />
              <span className="whitespace-nowrap">{wood.name ? wood.name.split('(')[0].trim() : 'Kayu'}</span>
            </button>
          ))}
        </div>

        {/* Viewport Control Tools */}
        <div className="flex items-center gap-1">
          {/* Wireframe toggle */}
          <button
            onClick={() => setCutawayWireframe(!cutawayWireframe)}
            title="Toggle Wireframe Mesh"
            className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              cutawayWireframe
                ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950'
                : 'bg-slate-100 dark:bg-[#16191f] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1c212a]'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Auto rotate toggle */}
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            title={isAutoRotate ? 'Jeda Rotasi Otomatis' : 'Mulai Rotasi'}
            className="p-2 rounded-lg bg-slate-100 dark:bg-[#16191f] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1c212a] transition-colors cursor-pointer"
          >
            {isAutoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Zoom controls */}
          <button
            onClick={() => handleZoom('in')}
            title="Zoom In"
            className="p-2 rounded-lg bg-slate-100 dark:bg-[#16191f] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1c212a] transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleZoom('out')}
            title="Zoom Out"
            className="p-2 rounded-lg bg-slate-100 dark:bg-[#16191f] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1c212a] transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Watermark badge */}
      <div className="absolute bottom-20 left-4 pointer-events-none hidden md:block">
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>Klik pin untuk Three UI metadata • Drag kursor untuk orbit 360°</span>
        </div>
      </div>
    </div>
  );
};
