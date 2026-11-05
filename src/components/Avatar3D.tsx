/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { StudentAvatar } from '../types';
import {
  buildProceduralCharacter,
  CharacterRig,
  CharacterAnimationState,
} from './3d/character3DBuilder';
import { audio } from '../services/audioService';

export type AvatarGesture =
  | 'idle'
  | 'blink'
  | 'breathe'
  | 'lookAround'
  | 'wave'
  | 'walk'
  | 'celebrate'
  | 'concentrate'
  | 'achievement'
  | 'jump'
  | 'spin'
  | 'dance';

interface Avatar3DProps {
  avatarConfig: StudentAvatar;
  interactive?: boolean;
  showControlsBar?: boolean;
  onGestureComplete?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  activeGestureProp?: AvatarGesture;
  cameraPreset?: 'full' | 'face' | 'torso' | 'shoes';
  onGestureChange?: (gesture: AvatarGesture) => void;
}

// Soft radial gradient contact shadow texture
function createRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.18)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({
  avatarConfig,
  interactive = true,
  showControlsBar = true,
  className = '',
  size = 'md',
  activeGestureProp,
  cameraPreset = 'full',
  onGestureChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentGesture, setCurrentGesture] = useState<AvatarGesture>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('¡Hola! Soy tu avatar 3D');

  const rigRef = useRef<CharacterRig | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // 360 Orbit State
  const rotationYRef = useRef<number>(0);
  const rotationXRef = useRef<number>(0);
  const zoomDistRef = useRef<number>(3.2);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync external activeGestureProp
  useEffect(() => {
    if (activeGestureProp) {
      triggerGesture(activeGestureProp);
    }
  }, [activeGestureProp]);

  const triggerGesture = (gesture: AvatarGesture, customMsg?: string) => {
    audio.playPop();
    setCurrentGesture(gesture);
    onGestureChange?.(gesture);

    if (customMsg) {
      setStatusMessage(customMsg);
    } else {
      switch (gesture) {
        case 'wave':
          setStatusMessage('¡Mucho gusto! ¡A explorar el saber!');
          break;
        case 'walk':
          setStatusMessage('¡Caminando con paso firme y seguro!');
          break;
        case 'celebrate':
          setStatusMessage('¡Festejando con alegría y energía!');
          break;
        case 'concentrate':
          setStatusMessage('¡Analizando y resolviendo el desafío!');
          break;
        case 'achievement':
          setStatusMessage('¡Logro superado! ¡Orgullo de estudiante!');
          break;
        case 'breathe':
          setStatusMessage('Inhalando calma, exhalando dudas...');
          break;
        case 'lookAround':
          setStatusMessage('Observando el mundo 360° con curiosidad');
          break;
        case 'blink':
          setStatusMessage('Parpadeo y enfoque visual al 100%');
          break;
        default:
          setStatusMessage('¡Listo para aprender y jugar!');
          break;
      }
    }
  };

  // Adjust camera preset target
  useEffect(() => {
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    if (cameraPreset === 'face') {
      cam.position.set(0, 1.48, 1.35);
      zoomDistRef.current = 1.35;
    } else if (cameraPreset === 'torso') {
      cam.position.set(0, 1.05, 2.0);
      zoomDistRef.current = 2.0;
    } else if (cameraPreset === 'shoes') {
      cam.position.set(0, 0.45, 1.8);
      zoomDistRef.current = 1.8;
    } else {
      // full
      cam.position.set(0, 1.1, 3.2);
      zoomDistRef.current = 3.2;
    }
  }, [cameraPreset]);

  // Reset 360 camera view
  const handleResetCamera = () => {
    rotationYRef.current = 0;
    rotationXRef.current = 0;
    zoomDistRef.current = 3.2;
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 1.1, 3.2);
      cameraRef.current.lookAt(0, 1.0, 0);
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 340;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.1, 3.2);
    camera.lookAt(0, 1.0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment Reflections
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // Fallback
    }

    // 3-Point Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x0284c7, 1.1);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    keyLight.position.set(3, 4.5, 3.5);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.shadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0004;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
    fillLight.position.set(-3, 2.5, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 0.9);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // Light Blue Floating Pedestal
    const pedestalGeo = new THREE.BoxGeometry(1.4, 0.038, 1.05);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xbfe9f7,
      roughness: 0.3,
      metalness: 0.08,
      transparent: true,
      opacity: 0.88,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, -0.019, 0);
    pedestal.receiveShadow = !isSoftwareGl;
    scene.add(pedestal);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(pedestalGeo),
      new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.7 })
    );
    pedestal.add(edges);

    // Soft Radial Ground Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(1.8, 1.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: createRadialShadowTexture(),
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.002;
    scene.add(shadowPlane);

    // Build the high-detail volumetric 3D character
    const rig = buildProceduralCharacter({
      characterType: avatarConfig.characterType || 'boy',
      outfitId: avatarConfig.outfitId || 'sport',
      suitColor: avatarConfig.suitColor || '#0284c7',
      pantsColor: avatarConfig.pantsColor,
      skinColor: avatarConfig.skinColor,
      eyeColor: avatarConfig.eyeColor,
      hairstyleId: avatarConfig.hairstyleId,
      hairColor: avatarConfig.hairColor,
      shoesId: avatarConfig.shoesId,
      shoesColor: avatarConfig.shoesColor,
      headgearId: avatarConfig.headgearId,
      accessoryId: avatarConfig.accessoryId,
      specialUnlockableId: avatarConfig.specialUnlockableId,
      expression: avatarConfig.expression || 'happy',
    });
    rigRef.current = rig;
    scene.add(rig.root);

    // Companion pet if equipped
    if (avatarConfig.petId) {
      const petGroup = new THREE.Group();
      petGroup.position.set(0.68, 1.25, 0.15);
      if (avatarConfig.petId === 'pet_jellyfish') {
        const bellGeo = new THREE.SphereGeometry(0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const bellMat = new THREE.MeshPhysicalMaterial({
          color: 0xec4899,
          emissive: 0xdb2777,
          emissiveIntensity: 0.5,
          transmission: 0.6,
          roughness: 0.1,
          thickness: 0.5,
          transparent: true,
          opacity: 0.9,
        });
        const bell = new THREE.Mesh(bellGeo, bellMat);
        petGroup.add(bell);

        for (let t = 0; t < 5; t++) {
          const tent = new THREE.Mesh(
            new THREE.CylinderGeometry(0.01, 0.005, 0.16, 6),
            new THREE.MeshStandardMaterial({ color: 0xf472b6 })
          );
          tent.position.set(
            Math.cos((t * Math.PI * 2) / 5) * 0.06,
            -0.09,
            Math.sin((t * Math.PI * 2) / 5) * 0.06
          );
          petGroup.add(tent);
        }
      }
      scene.add(petGroup);
    }

    // -----------------------------------------------------------------------
    // FULL 360-DEGREE ORBIT CONTROLS & POINTER TRACKING
    // -----------------------------------------------------------------------
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      // Calculate normalized pointer for head tracking
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerPosRef.current = { x: nx, y: ny };

      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;

      // 360 horizontal yaw rotation
      rotationYRef.current += dx * 0.015;
      // Clamped vertical pitch
      rotationXRef.current = THREE.MathUtils.clamp(
        rotationXRef.current + dy * 0.008,
        -0.45,
        0.55
      );

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomDistRef.current = THREE.MathUtils.clamp(
        zoomDistRef.current + e.deltaY * 0.003,
        1.2,
        4.6
      );
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDraggingRef.current = true;
        lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - lastMousePosRef.current.x;
      const dy = e.touches[0].clientY - lastMousePosRef.current.y;

      rotationYRef.current += dx * 0.015;
      rotationXRef.current = THREE.MathUtils.clamp(
        rotationXRef.current + dy * 0.008,
        -0.45,
        0.55
      );

      lastMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // -----------------------------------------------------------------------
    // CONTINUOUS ANIMATION LOOP
    // -----------------------------------------------------------------------
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const r = rigRef.current;
      if (!r) {
        renderer.render(scene, camera);
        return;
      }

      // Smooth manual drag rotation with spring damping
      r.root.rotation.y = THREE.MathUtils.damp(r.root.rotation.y, rotationYRef.current, 10, delta);
      r.root.rotation.x = THREE.MathUtils.damp(r.root.rotation.x, rotationXRef.current, 8, delta);

      // Camera smooth zoom positioning
      camera.position.z = THREE.MathUtils.damp(camera.position.z, zoomDistRef.current, 8, delta);

      // Run kinematic animation engine
      const mappedGesture: CharacterAnimationState =
        currentGesture === 'jump' || currentGesture === 'dance'
          ? 'celebrate'
          : currentGesture === 'spin'
          ? 'lookAround'
          : (currentGesture as CharacterAnimationState);
      r.updateAnimation(delta, elapsed, mappedGesture, pointerPosRef.current);

      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [
    avatarConfig.characterType,
    avatarConfig.outfitId,
    avatarConfig.suitColor,
    avatarConfig.pantsColor,
    avatarConfig.skinColor,
    avatarConfig.eyeColor,
    avatarConfig.hairstyleId,
    avatarConfig.hairColor,
    avatarConfig.shoesId,
    avatarConfig.shoesColor,
    avatarConfig.headgearId,
    avatarConfig.accessoryId,
    avatarConfig.specialUnlockableId,
    avatarConfig.expression,
    currentGesture,
  ]);

  const dimensionsClass =
    size === 'sm'
      ? 'w-48 h-52'
      : size === 'xl'
      ? 'w-full h-[480px] sm:h-[540px]'
      : size === 'lg'
      ? 'w-72 h-84 sm:w-84 sm:h-96'
      : 'w-64 h-72 sm:w-72 sm:h-80';

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className={`${dimensionsClass} relative cursor-grab active:cursor-grabbing transition-transform`}
        onClick={() => triggerGesture('wave', '¡Hola! ¡Qué gusto verte!')}
        title="Arrastra para girar al personaje en 3D 360° • Usa la rueda para Zoom"
      />

      {/* Floating 360 Orbit Badge & Reset Button */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
        <button
          onClick={handleResetCamera}
          className="bg-white/80 hover:bg-white text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-fun font-bold shadow-sm border border-slate-200 transition cursor-pointer flex items-center gap-1"
          title="Restablecer posición de cámara 360°"
        >
          <span>🔄</span> Centrar
        </button>
      </div>

      {/* Bubble speech tooltip */}
      <div className="mt-1 bg-white/95 backdrop-blur-md border border-sky-200 text-sky-950 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full shadow-lg text-center flex items-center gap-1.5 max-w-xs animate-float-gentle">
        <span className="text-sm">🫧</span>
        <span className="truncate">{statusMessage}</span>
      </div>

      {/* Real-time Interactive Animations Bar (8 States) */}
      {interactive && showControlsBar && (
        <div className="flex flex-wrap justify-center gap-1.5 mt-2.5 max-w-md">
          <button
            onClick={() => triggerGesture('wave', '¡Mucho gusto! ¡A explorar el saber!')}
            className={`px-2.5 py-1.5 text-xs font-bold font-fun rounded-xl transition cursor-pointer active:scale-95 border shadow-xs flex items-center gap-1 ${
              currentGesture === 'wave'
                ? 'bg-sky-500 text-white border-sky-600 scale-105 shadow-sky-500/30'
                : 'bg-sky-100 hover:bg-sky-200 text-sky-900 border-sky-300'
            }`}
          >
            <span>👋</span> Saludar
          </button>

          <button
            onClick={() => triggerGesture('walk', '¡Caminando con paso firme y seguro!')}
            className={`px-2.5 py-1.5 text-xs font-bold font-fun rounded-xl transition cursor-pointer active:scale-95 border shadow-xs flex items-center gap-1 ${
              currentGesture === 'walk'
                ? 'bg-indigo-500 text-white border-indigo-600 scale-105 shadow-indigo-500/30'
                : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border-indigo-300'
            }`}
          >
            <span>🚶</span> Caminar
          </button>

          <button
            onClick={() => triggerGesture('celebrate', '¡Festejando con alegría y energía!')}
            className={`px-2.5 py-1.5 text-xs font-bold font-fun rounded-xl transition cursor-pointer active:scale-95 border shadow-xs flex items-center gap-1 ${
              currentGesture === 'celebrate'
                ? 'bg-emerald-500 text-white border-emerald-600 scale-105 shadow-emerald-500/30'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
            }`}
          >
            <span>🎉</span> Celebrar
          </button>

          <button
            onClick={() => triggerGesture('concentrate', '¡Analizando y resolviendo el desafío!')}
            className={`px-2.5 py-1.5 text-xs font-bold font-fun rounded-xl transition cursor-pointer active:scale-95 border shadow-xs flex items-center gap-1 ${
              currentGesture === 'concentrate'
                ? 'bg-purple-500 text-white border-purple-600 scale-105 shadow-purple-500/30'
                : 'bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300'
            }`}
          >
            <span>🤔</span> Concentración
          </button>

          <button
            onClick={() => triggerGesture('achievement', '¡Victoria y maestría alcanzada!')}
            className={`px-2.5 py-1.5 text-xs font-bold font-fun rounded-xl transition cursor-pointer active:scale-95 border shadow-xs flex items-center gap-1 ${
              currentGesture === 'achievement'
                ? 'bg-amber-500 text-white border-amber-600 scale-105 shadow-amber-500/30'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
            }`}
          >
            <span>🏆</span> Logro
          </button>

          <button
            onClick={() => triggerGesture('breathe', 'Inhalando calma, exhalando dudas...')}
            className={`px-2.5 py-1.5 text-xs font-bold font-fun rounded-xl transition cursor-pointer active:scale-95 border shadow-xs flex items-center gap-1 ${
              currentGesture === 'breathe'
                ? 'bg-teal-500 text-white border-teal-600 scale-105 shadow-teal-500/30'
                : 'bg-teal-100 hover:bg-teal-200 text-teal-900 border-teal-300'
            }`}
          >
            <span>🌬️</span> Respirar
          </button>

          <button
            onClick={() => triggerGesture('lookAround', 'Mirando a los alrededores')}
            className={`px-2.5 py-1.5 text-xs font-bold font-fun rounded-xl transition cursor-pointer active:scale-95 border shadow-xs flex items-center gap-1 ${
              currentGesture === 'lookAround'
                ? 'bg-rose-500 text-white border-rose-600 scale-105 shadow-rose-500/30'
                : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300'
            }`}
          >
            <span>👀</span> Mirar
          </button>
        </div>
      )}
    </div>
  );
};
