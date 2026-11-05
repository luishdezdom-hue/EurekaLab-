/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import confetti from 'canvas-confetti';
import { Student } from '../../types';
import { GRID_MISSIONS, SCALE_MISSIONS, READING_MISSIONS } from '../../data/missions';
import { storage } from '../../services/storageService';
import { audio } from '../../services/audioService';
import { buildProceduralCharacter, CharacterRig } from './character3DBuilder';
import {
  getStylizedGrassTexture,
  getMountainCliffTexture,
  getCastleBrickTexture,
  getCobblestonePathTexture,
  getRunePlatformTexture,
  getSandBeachTexture,
  getWoodPlankTexture,
  getSignboardTexture,
  getCastleWindowTexture,
  getCrystalTexture,
  getWaterFoamTexture,
} from './proceduralTextures';
import { GameButton } from '../ui/GameButton';
import {
  Play,
  Check,
  Lock,
  ChevronUp,
  ChevronDown,
  Zap,
} from 'lucide-react';

interface WorldMap3DProps {
  student: Student;
  onSelectTab: (tab: 'home' | 'character' | 'math' | 'code' | 'reading', levelId?: number) => void;
  onStudentUpdated?: () => void;
}

// 10 3D Waypoint Nodes connecting all educational zones
export interface LevelNode3D {
  id: number;
  title: string;
  subtitle: string;
  zoneId: 'start' | 'reading' | 'math' | 'code' | 'science' | 'boss';
  zoneName: string;
  position: THREE.Vector3;
  rewardCoins: number;
  rewardXp: number;
  learningConcept: string;
  gameTarget: 'math' | 'code' | 'reading';
}

// ==========================================
// CONTINUOUS ANALYTICAL TERRAIN HEIGHT FIELD
// Natural mountain relief, ridges, valleys, and riverbed depressions
// ==========================================
export function getTerrainHeight(x: number, z: number): number {
  const d = Math.hypot(x, z);
  if (d > 28) return -0.4;

  const coastFactor = Math.max(0, Math.min(1, (28 - d) / 5.5));
  let h = 0.35;

  // 1. Central Summit Massif (Gran Castillo de Desafíos): x: 0, z: -9.8
  const dSummit = Math.hypot(x - 0, z - (-9.8));
  if (dSummit < 8.5) {
    const sFact = Math.max(0, 1 - dSummit / 8.5);
    // Fractal multi-peak craggy ridge
    const ridgeNoise =
      Math.sin(x * 1.4 + z * 0.8) * 0.45 +
      Math.cos(x * 0.9 - z * 1.2) * 0.35;
    h += (9.6 + ridgeNoise) * Math.pow(sFact, 1.7);
  }

  // 2. Northwest Crag (Zona de Ciencias & Cueva de Cristales): x: -11.5, z: -4.5
  const dNW = Math.hypot(x - (-11.5), z - (-4.5));
  if (dNW < 7.2) {
    const nwFact = Math.max(0, 1 - dNW / 7.2);
    const cragNoise = Math.sin(x * 1.6) * Math.cos(z * 1.6) * 0.4;
    h += (6.8 + cragNoise) * Math.pow(nwFact, 1.8);
  }

  // 3. Northeast Ridge (Zona de Programación): x: 11.5, z: -5.0
  const dNE = Math.hypot(x - 11.5, z - (-5.0));
  if (dNE < 7.0) {
    const neFact = Math.max(0, 1 - dNE / 7.0);
    const techRidge = Math.cos(x * 1.3 + z) * 0.35;
    h += (6.4 + techRidge) * Math.pow(neFact, 1.8);
  }

  // 4. East Plateau (Zona de Matemáticas): x: 11.0, z: 6.5
  const dMath = Math.hypot(x - 11.0, z - 6.5);
  if (dMath < 6.8) {
    const mFact = Math.max(0, 1 - dMath / 6.8);
    h += 3.4 * Math.pow(mFact, 1.5);
  }

  // 5. Southwest Forest Hills (Zona de Lectura): x: -10.0, z: 6.5
  const dRead = Math.hypot(x - (-10.0), z - 6.5);
  if (dRead < 6.8) {
    const rFact = Math.max(0, 1 - dRead / 6.8);
    h += 2.6 * Math.pow(rFact, 1.6);
  }

  // 6. Central Rocky Divider (Separates North Summit and Southern Valley): x: 0.5, z: 0.5
  const dCrag = Math.hypot(x - 0.5, z - 0.5);
  if (dCrag < 4.2) {
    const cFact = Math.max(0, 1 - dCrag / 4.2);
    h += 3.8 * Math.pow(cFact, 2.0);
  }

  // 7. Mountain Lake Basin at x: -2.5, z: -2.0
  const dLake = Math.hypot(x - (-2.5), z - (-2.0));
  if (dLake < 3.4) {
    const lFact = Math.max(0, 1 - dLake / 3.4);
    h -= 1.65 * Math.sin(lFact * Math.PI * 0.5);
  }

  // 8. River Channel Depression flowing down to southern ocean
  const riverX = -0.5 - 0.28 * z + 0.045 * z * z;
  if (z > -2.0 && z < 18.0) {
    const distRiver = Math.abs(x - riverX);
    if (distRiver < 2.3) {
      const rDepth = (1 - distRiver / 2.3) * 0.85;
      h -= rDepth;
    }
  }

  // 9. Southern Sandy Beach Flat Shelf (Bahía de Bienvenida): x: -12..1, z: 12..22
  if (z > 12 && x > -14 && x < 2) {
    h = Math.min(h, 0.45 + (18 - z) * 0.07);
  }

  // Natural organic rolling terrain harmonics
  const noise =
    0.34 * Math.sin(x * 0.42) * Math.cos(z * 0.38) +
    0.18 * Math.sin(x * 0.85 + z * 0.6);
  h += noise;

  return Math.max(0.12, h * coastFactor);
}

export const WorldMap3D: React.FC<WorldMap3DProps> = ({
  student,
  onSelectTab,
  onStudentUpdated,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [isFollowingAvatar, setIsFollowingAvatar] = useState<boolean>(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isMovingAvatar, setIsMovingAvatar] = useState<boolean>(false);

  // Active student unlocked level (clamped 1-10)
  const unlockedLevel = Math.max(1, Math.min(student.progress.algoritmos || 2, 10));

  // Mutable refs for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const avatarRigRef = useRef<CharacterRig | null>(null);
  const levelMeshesRef = useRef<{ mesh: THREE.Mesh; id: number }[]>([]);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const waterfallMeshRef = useRef<THREE.Mesh | null>(null);
  const waterfallParticlesRef = useRef<THREE.Points | null>(null);
  const steamParticlesRef = useRef<THREE.Points | null>(null);
  const cloudsGroupRef = useRef<THREE.Group | null>(null);
  const castleBannerRef = useRef<THREE.Mesh | null>(null);
  const beaconRingsRef = useRef<THREE.Mesh[]>([]);
  const radarDishRef = useRef<THREE.Group | null>(null);
  const mathPolyhedraRef = useRef<THREE.Group | null>(null);
  const crystalsGroupRef = useRef<THREE.Group | null>(null);

  // Camera Orbit & Tracking State
  const cameraStateRef = useRef({
    targetPos: new THREE.Vector3(0, 3.5, 2.0),
    spherical: {
      radius: 28,
      theta: Math.PI / 4,
      phi: Math.PI / 3.4,
    },
    isDragging: false,
    lastX: 0,
    lastY: 0,
    smoothTarget: new THREE.Vector3(0, 3.5, 2.0),
  });

  // Avatar Movement State along Path
  const avatarMotionRef = useRef({
    currentLevel: unlockedLevel,
    isTraversing: false,
    pathProgress: 0,
    startWaypoint: new THREE.Vector3(),
    endWaypoint: new THREE.Vector3(),
    targetLevel: unlockedLevel,
  });

  // ==========================================
  // MASTER ADVENTURE PATH CONTROL POINTS
  // The road winds logically through all 5 educational zones without crossing mountains
  // ==========================================
  const masterPathPoints = useMemo<THREE.Vector3[]>(() => {
    const rawCoords: [number, number, number?][] = [
      // 1. Bahía de Bienvenida & Playa del Inicio
      [-8.0, 16.5, 0.45], // P0: Muelle y Playa
      [-9.8, 14.0],
      [-11.2, 11.2],

      // 2. Zona de Lectura: Gran Biblioteca & Faro de los Cuentos
      [-11.0, 8.5],
      [-9.5, 6.5], // P4: Plaza de la Biblioteca (Nodo 2)
      [-7.5, 5.8],

      // 3. Cruce del Río & Puente Rústico del Valle
      [-5.0, 5.2],
      [-2.8, 5.0, 1.45],
      [-0.5, 5.0, 1.75], // P8: Centro del Puente del Río (Nodo 3)
      [1.8, 5.2, 1.45],

      // 4. Zona de Matemáticas: Templo del Equilibrio & Balanza Dorada
      [4.5, 6.0],
      [8.5, 6.8],
      [11.5, 7.0], // P12: Plaza del Templo de Matemáticas (Nodo 4)
      [13.0, 4.5],

      // 5. Paso Oriental hacia la Zona de Programación
      [12.5, 1.5],
      [11.2, -1.5],
      [9.2, -4.5], // P16: Estación Tecnológica de Algoritmos (Nodo 5)
      [7.0, -6.5],

      // 6. Paso Alpino Norte & Encrucijada Real
      [4.0, -7.5],
      [0.5, -7.2], // P19: Encrucijada Real (Nodo 6)
      [-3.5, -7.0],

      // 7. Zona de Ciencias: Laboratorio Biosfera, Cueva de Cristales & Géiser
      [-7.0, -6.2],
      [-9.5, -5.0], // P22: Laboratorio Biosfera (Nodo 7)
      [-8.0, -2.5],

      // 8. Lago Alto, Cascada & Puente Colgante
      [-5.5, -1.2],
      [-2.5, -1.0], // P25: Mirador de la Cascada (Nodo 8)
      [0.0, -1.0, 3.85], // P26: Puente Alto de la Cascada
      [2.2, -1.8],

      // 9. Ascenso en Zigzag hacia la Cumbre del Gran Castillo
      [2.0, -4.0],
      [-1.0, -5.2],
      [1.5, -6.8], // P30: Puerta Monumental de los Campeones (Nodo 9)
      [0.0, -8.2],
      [0.0, -9.8], // P32: Salón del Trono - Gran Castillo de la Cumbre (Nodo 10)
    ];

    return rawCoords.map(([x, z, explicitY]) => {
      const y = explicitY !== undefined ? explicitY : getTerrainHeight(x, z) + 0.08;
      return new THREE.Vector3(x, y, z);
    });
  }, []);

  const pathCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(masterPathPoints, false, 'catmullrom', 0.25);
  }, [masterPathPoints]);

  const levelNodes = useMemo<LevelNode3D[]>(() => {
    return [
      {
        id: 1,
        title: 'Misión 1: Bahía del Explorador',
        subtitle: 'Primeros Pasos y Navegación Básica',
        zoneId: 'start',
        zoneName: 'Playa & Bahía de Bienvenida',
        position: masterPathPoints[0],
        rewardCoins: 20,
        rewardXp: 40,
        learningConcept: 'Secuencia lógica inicial y orientación espacial',
        gameTarget: 'code',
      },
      {
        id: 2,
        title: 'Misión 2: Biblioteca del Árbol Sabio',
        subtitle: 'Lectura Comprensiva y Vocabulario',
        zoneId: 'reading',
        zoneName: 'Zona de Lectura',
        position: masterPathPoints[4],
        rewardCoins: 25,
        rewardXp: 50,
        learningConcept: 'Extracción de ideas principales y comprensión literal',
        gameTarget: 'reading',
      },
      {
        id: 3,
        title: 'Misión 3: Puente del Río Esmeralda',
        subtitle: 'Cruce Fluvial y Evasión en Cuadrícula',
        zoneId: 'reading',
        zoneName: 'Cruce Fluvial del Valle',
        position: masterPathPoints[8],
        rewardCoins: 30,
        rewardXp: 60,
        learningConcept: 'Planificación de rutas seguras sobre puentes',
        gameTarget: 'code',
      },
      {
        id: 4,
        title: 'Misión 4: Templo del Equilibrio',
        subtitle: 'Balanza de Fracciones y Medios',
        zoneId: 'math',
        zoneName: 'Zona de Matemáticas',
        position: masterPathPoints[12],
        rewardCoins: 35,
        rewardXp: 75,
        learningConcept: 'Equivalencia de fracciones 1/2, 1/4 y proporciones',
        gameTarget: 'math',
      },
      {
        id: 5,
        title: 'Misión 5: Estación Tecnológica',
        subtitle: 'Algoritmos y Giros de Precisión',
        zoneId: 'code',
        zoneName: 'Zona de Programación',
        position: masterPathPoints[16],
        rewardCoins: 40,
        rewardXp: 90,
        learningConcept: 'Bucles de repetición y rotación de 90 grados',
        gameTarget: 'code',
      },
      {
        id: 6,
        title: 'Misión 6: Encrucijada de los Picos',
        subtitle: 'Decisiones y Ramas Condicionales',
        zoneId: 'code',
        zoneName: 'Paso Alpino Real',
        position: masterPathPoints[19],
        rewardCoins: 50,
        rewardXp: 110,
        learningConcept: 'Lógica condicional Si-Entonces para elegir caminos',
        gameTarget: 'code',
      },
      {
        id: 7,
        title: 'Misión 7: Laboratorio Biosfera',
        subtitle: 'Proporciones Científicas y Alquimia',
        zoneId: 'science',
        zoneName: 'Zona de Ciencias Naturales',
        position: masterPathPoints[22],
        rewardCoins: 60,
        rewardXp: 130,
        learningConcept: 'Mezcla de volúmenes, fracciones compuestas y análisis',
        gameTarget: 'math',
      },
      {
        id: 8,
        title: 'Misión 8: Mirador de la Cascada',
        subtitle: 'Comprensión Crítica de la Naturaleza',
        zoneId: 'science',
        zoneName: 'Garganta de la Cascada',
        position: masterPathPoints[25],
        rewardCoins: 75,
        rewardXp: 160,
        learningConcept: 'Lectura inferencial y deducción de causas naturales',
        gameTarget: 'reading',
      },
      {
        id: 9,
        title: 'Misión 9: Puerta de los Campeones',
        subtitle: 'Desafío Combinado de Fracciones y Código',
        zoneId: 'boss',
        zoneName: 'Bastión del Risco',
        position: masterPathPoints[30],
        rewardCoins: 90,
        rewardXp: 200,
        learningConcept: 'Integración interdisciplinaria: matemáticas + algoritmos',
        gameTarget: 'code',
      },
      {
        id: 10,
        title: 'Misión 10: Salón del Trono - Gran Castillo',
        subtitle: 'Maestro de la Lógica y Sabiduría Eureka',
        zoneId: 'boss',
        zoneName: 'Cumbre de Desafíos Especiales',
        position: masterPathPoints[32],
        rewardCoins: 150,
        rewardXp: 350,
        learningConcept: 'Pensamiento sistémico y resolución autónoma de problemas',
        gameTarget: 'math',
      },
    ];
  }, [masterPathPoints]);

  useEffect(() => {
    avatarMotionRef.current.currentLevel = unlockedLevel;
  }, [unlockedLevel]);

  const selectedMissionData = useMemo(() => {
    if (!selectedLevelId) return null;
    const node = levelNodes.find((n) => n.id === selectedLevelId);
    if (!node) return null;

    if (node.gameTarget === 'math') {
      const match = SCALE_MISSIONS.find((m) => m.id === selectedLevelId) || SCALE_MISSIONS[0];
      return { ...node, detailedObjective: match.explanation };
    } else if (node.gameTarget === 'reading') {
      const match = READING_MISSIONS.find((m) => m.id === selectedLevelId) || READING_MISSIONS[0];
      return { ...node, detailedObjective: match.subtitle };
    } else {
      const match = GRID_MISSIONS.find((m) => m.id === selectedLevelId) || GRID_MISSIONS[0];
      return { ...node, detailedObjective: match.objective };
    }
  }, [selectedLevelId, levelNodes]);

  // ==========================================
  // THREE.JS SCENE SETUP & LIFE-CYCLE
  // ==========================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 580;

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

    // Rich atmospheric sky with gradient horizon fog
    const skyColor = new THREE.Color(0x38bdf8);
    const fogColor = new THREE.Color(0xbbe8fc);
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2(fogColor, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 180);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    rendererRef.current = renderer;
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
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      // Fallback
    }

    // ==========================================
    // 3-POINT STUDIO LIGHTING RIG
    // Warm Golden Key + Cool Sky Fill + Purple Rim
    // ==========================================
    const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x0284c7, 0.95);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.95);
    sunLight.position.set(24, 36, 26);
    sunLight.castShadow = !isSoftwareGl;
    if (sunLight.shadow) {
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 90;
      const d = 28;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0003;
      sunLight.shadow.normalBias = 0.02;
    }
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    fillLight.position.set(-22, 20, -20);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xc084fc, 0.65);
    rimLight.position.set(0, 24, -30);
    scene.add(rimLight);

    // ==========================================
    // 1. ORGANIC SCULPTED ISLAND TERRAIN MESH
    // Sculpted with high density grid & vertex coloring
    // ==========================================
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);

    // High resolution grid with 130x130 vertices
    const terrainGeo = new THREE.PlaneGeometry(58, 58, 130, 130);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const px = posAttr.getX(i);
      const pz = posAttr.getZ(i);
      const py = getTerrainHeight(px, pz);
      posAttr.setY(i, py);
    }
    terrainGeo.computeVertexNormals();

    const grassTex = getStylizedGrassTexture();
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      map: grassTex,
      roughness: 0.82,
      metalness: 0.04,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = !isSoftwareGl;
    terrainGroup.add(terrainMesh);

    // Deep ocean base beneath island
    const seaFloorGeo = new THREE.CylinderGeometry(33, 35, 4.5, 48);
    const seaFloorMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.9 });
    const seaFloor = new THREE.Mesh(seaFloorGeo, seaFloorMat);
    seaFloor.position.y = -2.3;
    terrainGroup.add(seaFloor);

    // Golden sandy beach fringe along coast & South Bay
    const beachGeo = new THREE.RingGeometry(22, 28, 48, 8);
    beachGeo.rotateX(-Math.PI / 2);
    const sandTex = getSandBeachTexture();
    const beachMat = new THREE.MeshStandardMaterial({
      map: sandTex,
      roughness: 0.88,
      metalness: 0.02,
    });
    const beachMesh = new THREE.Mesh(beachGeo, beachMat);
    beachMesh.position.y = 0.14;
    beachMesh.receiveShadow = !isSoftwareGl;
    terrainGroup.add(beachMesh);

    // ==========================================
    // 2. SCULPTED NATURAL MOUNTAIN MASSIFS & ROCK RIDGES
    // (NO basic cone geometry: faceted procedural rock outcroppings)
    // ==========================================
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      map: getMountainCliffTexture(),
      roughness: 0.85,
      metalness: 0.12,
    });
    const snowMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.05,
    });

    // Helper to generate organic multi-faceted mountain massifs
    const createOrganicMountainMassif = (
      cx: number,
      cz: number,
      height: number,
      radius: number,
      hasSnow = true
    ) => {
      const mGroup = new THREE.Group();
      mGroup.position.set(cx, 0, cz);

      // Create multi-faceted craggy pyramid-dodecahedron composite
      const numCrags = 5;
      for (let c = 0; c < numCrags; c++) {
        const ang = (Math.PI * 2 * c) / numCrags;
        const subR = radius * (0.65 + Math.sin(c * 2) * 0.25);
        const subH = height * (0.75 + Math.cos(c * 3) * 0.25);

        // Displaced cylinder/pyramid crag
        const cragGeo = new THREE.CylinderGeometry(subR * 0.15, subR, subH, 7, 4);
        const cPos = cragGeo.attributes.position;
        for (let i = 0; i < cPos.count; i++) {
          const cy = cPos.getY(i);
          if (cy > -subH / 2 + 0.2 && cy < subH / 2 - 0.2) {
            const px = cPos.getX(i);
            const pz = cPos.getZ(i);
            const disp = Math.sin(px * 1.5) * Math.cos(pz * 1.5) * 0.35;
            cPos.setX(i, px + disp);
            cPos.setZ(i, pz + disp);
          }
        }
        cragGeo.computeVertexNormals();

        const cragMesh = new THREE.Mesh(cragGeo, rockMat);
        const ox = Math.cos(ang) * (radius * 0.35);
        const oz = Math.sin(ang) * (radius * 0.35);
        cragMesh.position.set(ox, subH / 2 + getTerrainHeight(cx + ox, cz + oz) * 0.4, oz);
        cragMesh.rotation.y = ang + 0.3;
        cragMesh.castShadow = !isSoftwareGl;
        cragMesh.receiveShadow = !isSoftwareGl;
        mGroup.add(cragMesh);
      }

      // High Alpine Snow Cap Blanket
      if (hasSnow) {
        const snowGeo = new THREE.DodecahedronGeometry(radius * 0.45, 1);
        snowGeo.scale(1.2, 0.7, 1.2);
        const snowMesh = new THREE.Mesh(snowGeo, snowMat);
        snowMesh.position.set(0, height * 0.88, 0);
        snowMesh.castShadow = !isSoftwareGl;
        mGroup.add(snowMesh);
      }

      terrainGroup.add(mGroup);
    };

    // 4 Natural Mountain Ranges around the island
    createOrganicMountainMassif(0, -9.8, 9.8, 6.8, true); // Summit Citadel
    createOrganicMountainMassif(-11.5, -4.5, 6.8, 5.2, true); // Science Crags
    createOrganicMountainMassif(11.5, -5.0, 6.5, 4.8, true); // Tech Heights
    createOrganicMountainMassif(0.5, 0.5, 4.0, 3.6, false); // Central Ridge Divider

    // ------------------------------------------
    // CUEVA DE CRISTALES MÁGICOS (Northwest Flank at x: -8.5, z: -5.8)
    // ------------------------------------------
    const cavernGroup = new THREE.Group();
    const caveH = getTerrainHeight(-8.5, -5.8);
    cavernGroup.position.set(-8.5, caveH + 0.2, -5.8);

    // Arched natural rock grotto mouth
    const archMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const caveArch = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.45, 8, 16, Math.PI), archMat);
    caveArch.rotation.x = Math.PI / 2;
    caveArch.position.set(0, 0, -0.2);
    cavernGroup.add(caveArch);

    // Glowing Crystal Geodes Cluster inside cave
    const crystalsCluster = new THREE.Group();
    const crystalColors = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981'];
    crystalColors.forEach((colorHex, idx) => {
      const cTex = getCrystalTexture(colorHex);
      const cMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        emissive: new THREE.Color(colorHex),
        emissiveIntensity: 1.2,
        roughness: 0.12,
        metalness: 0.85,
        map: cTex,
      });
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.32 + (idx % 2) * 0.1, 0), cMat);
      crystal.position.set((idx - 1.5) * 0.45, 0.22 + (idx % 2) * 0.14, (idx % 3) * 0.28);
      crystal.rotation.set(0.35, idx * 0.9, 0.25);
      crystalsCluster.add(crystal);
    });
    cavernGroup.add(crystalsCluster);
    crystalsGroupRef.current = crystalsCluster;
    scene.add(cavernGroup);

    // ==========================================
    // 3. CURVING COBBLESTONE ROAD WITH STONE CURBS
    // ==========================================
    const roadTubeGeo = new THREE.TubeGeometry(pathCurve, 160, 0.45, 8, false);
    const roadMesh = new THREE.Mesh(
      roadTubeGeo,
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        map: getCobblestonePathTexture(),
        roughness: 0.78,
      })
    );
    roadMesh.receiveShadow = !isSoftwareGl;
    scene.add(roadMesh);

    // ==========================================
    // 4. ANIMATED WATER: OCEAN, LAKES, RIVER & CASCADES
    // ==========================================
    const waterGroup = new THREE.Group();
    scene.add(waterGroup);

    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.12,
      metalness: 0.45,
      transparent: true,
      opacity: 0.88,
    });
    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(64, 64, 24, 24).rotateX(-Math.PI / 2), oceanMat);
    ocean.position.y = 0.04;
    waterGroup.add(ocean);
    waterMeshRef.current = ocean;

    // High Mountain Lake (Lago Esmeralda)
    const lakeMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      map: getWaterFoamTexture(),
      roughness: 0.08,
      metalness: 0.5,
      transparent: true,
      opacity: 0.92,
    });
    const lake = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 0.3, 24), lakeMat);
    lake.position.set(-2.5, 2.5, -2.0);
    waterGroup.add(lake);

    // River meandering down to southern ocean
    const riverCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.2, 2.2, -1.2),
      new THREE.Vector3(-1.4, 1.4, 1.8),
      new THREE.Vector3(-0.5, 0.45, 5.0),
      new THREE.Vector3(-2.2, 0.25, 9.0),
      new THREE.Vector3(-5.5, 0.15, 13.0),
      new THREE.Vector3(-9.0, 0.06, 17.5),
    ]);
    const riverTube = new THREE.TubeGeometry(riverCurve, 48, 1.15, 8, false);
    const riverMesh = new THREE.Mesh(riverTube, lakeMat);
    waterGroup.add(riverMesh);

    // Cascading Waterfall with Emissive Foam
    const fallGeo = new THREE.PlaneGeometry(1.8, 2.8, 8, 12);
    const fallMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.88,
    });
    const waterfall = new THREE.Mesh(fallGeo, fallMat);
    waterfall.position.set(-2.0, 1.8, -0.6);
    waterfall.rotation.set(0.3, 0.6, 0);
    waterGroup.add(waterfall);
    waterfallMeshRef.current = waterfall;

    // Waterfall Mist Particles
    const splashCount = 50;
    const splashGeo = new THREE.BufferGeometry();
    const splashPos = new Float32Array(splashCount * 3);
    for (let i = 0; i < splashCount; i++) {
      splashPos[i * 3] = -2.0 + (Math.random() - 0.5) * 1.4;
      splashPos[i * 3 + 1] = 0.5 + Math.random() * 0.8;
      splashPos[i * 3 + 2] = -0.5 + (Math.random() - 0.5) * 1.4;
    }
    splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPos, 3));
    const splashParticles = new THREE.Points(
      splashGeo,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15,
        transparent: true,
        opacity: 0.8,
      })
    );
    waterGroup.add(splashParticles);
    waterfallParticlesRef.current = splashParticles;

    // ------------------------------------------
    // BRIDGES 1 & 2 (Puente del Valle & Puente de la Cascada)
    // ------------------------------------------
    const woodPlankMat = new THREE.MeshStandardMaterial({
      map: getWoodPlankTexture(),
      roughness: 0.75,
    });
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });

    // Bridge 1 (Puente Rústico del Valle at z = 5.0)
    const bridge1 = new THREE.Group();
    bridge1.position.set(-0.5, 1.35, 5.0);
    const deck1 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.18, 1.5), woodPlankMat);
    deck1.position.y = 0.22;
    const rail1L = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.12, 0.12), woodPlankMat);
    rail1L.position.set(0, 0.62, -0.7);
    const rail1R = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.12, 0.12), woodPlankMat);
    rail1R.position.set(0, 0.62, 0.7);
    const pier1 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 1.8, 8), pierMat);
    pier1.position.set(-1.2, -0.6, 0);
    const pier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 1.8, 8), pierMat);
    pier2.position.set(1.2, -0.6, 0);
    bridge1.add(deck1, rail1L, rail1R, pier1, pier2);
    scene.add(bridge1);

    // Bridge 2 (Puente Alto de la Cascada at z = -1.0)
    const bridge2 = new THREE.Group();
    bridge2.position.set(0.0, 3.75, -1.0);
    const deck2 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.18, 1.3), woodPlankMat);
    const towerL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 1.8, 8), pierMat);
    towerL.position.set(-1.7, 0.5, 0);
    const towerR = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 1.8, 8), pierMat);
    towerR.position.set(1.7, 0.5, 0);
    bridge2.add(deck2, towerL, towerR);
    scene.add(bridge2);

    // ==========================================
    // 5. THE 5 DETAILED ZONE LANDMARKS
    // ==========================================
    const landmarksGroup = new THREE.Group();
    scene.add(landmarksGroup);

    // ------------------------------------------
    // ZONA 1: BIBLIOTECA DEL ÁRBOL SABIO & FARO (Lectura)
    // ------------------------------------------
    const readingGroup = new THREE.Group();
    const readingH = getTerrainHeight(-10.5, 6.5);
    readingGroup.position.set(-10.5, readingH, 6.5);

    const libraryTower = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.9, 4.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 })
    );
    libraryTower.position.y = 2.1;
    libraryTower.castShadow = !isSoftwareGl;

    const libraryRoof = new THREE.Mesh(
      new THREE.ConeGeometry(2.1, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.5 })
    );
    libraryRoof.position.y = 5.2;

    // Giant Open Tome Stone Monument
    const bookPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.5, 12), pierMat);
    bookPedestal.position.set(1.4, 0.25, 0.8);
    const bookL = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.08, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 })
    );
    bookL.position.set(1.15, 0.55, 0.8);
    bookL.rotation.z = -0.22;
    const bookR = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.08, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 })
    );
    bookR.position.set(1.65, 0.55, 0.8);
    bookR.rotation.z = 0.22;

    readingGroup.add(libraryTower, libraryRoof, bookPedestal, bookL, bookR);
    landmarksGroup.add(readingGroup);

    // ------------------------------------------
    // ZONA 2: TEMPLO DEL EQUILIBRIO & BALANZA DORADA (Matemáticas)
    // ------------------------------------------
    const mathGroup = new THREE.Group();
    const mathH = getTerrainHeight(12.0, 7.2);
    mathGroup.position.set(12.0, mathH, 7.2);

    const templeBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.6, 0.4, 16),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    );
    templeBase.position.y = 0.2;
    mathGroup.add(templeBase);

    for (let c = 0; c < 6; c++) {
      const angle = (Math.PI * 2 * c) / 6;
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.18, 2.5, 10),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 })
      );
      col.position.set(Math.cos(angle) * 1.8, 1.45, Math.sin(angle) * 1.8);
      mathGroup.add(col);
    }

    const templeDome = new THREE.Mesh(
      new THREE.SphereGeometry(2.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.3, metalness: 0.2 })
    );
    templeDome.position.y = 2.7;
    mathGroup.add(templeDome);

    // Giant Functional 3D Golden Scale Monument
    const scaleGroup = new THREE.Group();
    scaleGroup.position.set(-1.6, 0.4, -0.6);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
    });
    const scaleFulcrum = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 1.6, 8), goldMat);
    scaleFulcrum.position.y = 0.8;
    const scaleBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), goldMat);
    scaleBeam.rotation.z = Math.PI / 2;
    scaleBeam.position.y = 1.6;
    const panL = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.1, 12), goldMat);
    panL.position.set(-1.0, 1.0, 0);
    const panR = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.1, 12), goldMat);
    panR.position.set(1.0, 1.15, 0);
    scaleGroup.add(scaleFulcrum, scaleBeam, panL, panR);
    mathGroup.add(scaleGroup);

    // Rotating Polyhedra
    const polyCluster = new THREE.Group();
    polyCluster.position.set(0, 3.6, 0);
    ['#10b981', '#06b6d4', '#f59e0b'].forEach((col, i) => {
      const p = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.35 + i * 0.06, 0),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(col),
          emissive: new THREE.Color(col),
          emissiveIntensity: 0.6,
          metalness: 0.5,
          roughness: 0.2,
        })
      );
      p.position.set((i - 1) * 0.7, (i % 2) * 0.3, 0);
      polyCluster.add(p);
    });
    mathPolyhedraRef.current = polyCluster;
    mathGroup.add(polyCluster);
    landmarksGroup.add(mathGroup);

    // ------------------------------------------
    // ZONA 3: ESTACIÓN TECNOLÓGICA & TORRE DE ALGORITMOS (Programación)
    // ------------------------------------------
    const codeGroup = new THREE.Group();
    const codeH = getTerrainHeight(9.8, -5.0);
    codeGroup.position.set(9.8, codeH, -5.0);

    const techBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.7, 0.35, 12),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 })
    );
    techBase.position.y = 0.18;
    codeGroup.add(techBase);

    const serverTower = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 3.8, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
    );
    serverTower.position.y = 2.0;
    codeGroup.add(serverTower);

    // Rotating Satellite Radar Dish
    const dishGroup = new THREE.Group();
    dishGroup.position.set(0, 4.4, 0);
    const dishMast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
    );
    const dishBowl = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.5),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7, roughness: 0.3 })
    );
    dishBowl.position.y = 0.6;
    dishBowl.rotation.x = Math.PI / 4;
    dishGroup.add(dishMast, dishBowl);
    radarDishRef.current = dishGroup;
    codeGroup.add(dishGroup);
    landmarksGroup.add(codeGroup);

    // ------------------------------------------
    // ZONA 4: LABORATORIO BIOSFERA & GÉISER (Ciencias)
    // ------------------------------------------
    const scienceGroup = new THREE.Group();
    const sciH = getTerrainHeight(-10.0, -5.0);
    scienceGroup.position.set(-10.0, sciH, -5.0);

    const bioDome = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.1, 2),
      new THREE.MeshPhysicalMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: isSoftwareGl ? 0.45 : 0.65,
        roughness: 0.1,
        metalness: 0.1,
      })
    );
    bioDome.position.y = 1.6;
    scienceGroup.add(bioDome);

    // Rare Botanical Specimen
    const plantBloom = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.65, 0),
      new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 0.8 })
    );
    plantBloom.position.y = 1.9;
    scienceGroup.add(plantBloom);

    // Volcanic Steaming Geyser Cone
    const geyserCone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 1.2, 0.8, 12),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 })
    );
    geyserCone.position.set(2.4, 0.4, 0.8);
    scienceGroup.add(geyserCone);

    // Geyser Steam Particle Column
    const steamCount = 40;
    const steamGeo = new THREE.BufferGeometry();
    const steamPos = new Float32Array(steamCount * 3);
    for (let i = 0; i < steamCount; i++) {
      steamPos[i * 3] = -10.0 + 2.4 + (Math.random() - 0.5) * 0.4;
      steamPos[i * 3 + 1] = sciH + 0.8 + Math.random() * 1.5;
      steamPos[i * 3 + 2] = -5.0 + 0.8 + (Math.random() - 0.5) * 0.4;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
    const steamParticles = new THREE.Points(
      steamGeo,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.22,
        transparent: true,
        opacity: 0.65,
      })
    );
    scene.add(steamParticles);
    steamParticlesRef.current = steamParticles;

    landmarksGroup.add(scienceGroup);

    // ------------------------------------------
    // ZONA 5: DETAILED MEDIEVAL CASTLE (Cumbre de Desafíos Especiales)
    // Fortified curtain walls, towers, stained glass windows, portcullis, flags
    // ------------------------------------------
    const castleGroup = new THREE.Group();
    const summitH = getTerrainHeight(0, -9.8);
    castleGroup.position.set(0, summitH, -9.8);

    const stoneWallMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      map: getCastleBrickTexture(),
      roughness: 0.8,
    });
    const royalRoofMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.45,
    });
    const windowMat = new THREE.MeshStandardMaterial({
      map: getCastleWindowTexture(),
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });

    // Central Grand Keep
    const keep = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.6, 2.8), stoneWallMat);
    keep.position.y = 1.3;
    keep.castShadow = !isSoftwareGl;
    castleGroup.add(keep);

    // Stained glass glowing arched windows on keep walls
    const winFront = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.2), windowMat);
    winFront.position.set(0, 1.6, 1.42);
    const winBack = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.2), windowMat);
    winBack.position.set(0, 1.6, -1.42);
    winBack.rotation.y = Math.PI;
    castleGroup.add(winFront, winBack);

    // Central Grand Spire with Dormers
    const mainSpire = new THREE.Mesh(new THREE.ConeGeometry(0.95, 2.4, 12), royalRoofMat);
    mainSpire.position.y = 3.8;
    mainSpire.castShadow = !isSoftwareGl;
    castleGroup.add(mainSpire);

    // Royal Flagpole & Golden Eureka Crest Banner
    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8 })
    );
    flagPole.position.set(0, 5.2, 0);
    const flagGeo = new THREE.PlaneGeometry(0.85, 0.48, 8, 4);
    const flagMesh = new THREE.Mesh(
      flagGeo,
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.6,
        metalness: 0.6,
        roughness: 0.3,
      })
    );
    flagMesh.position.set(0.45, 5.4, 0);
    castleGroup.add(flagPole, flagMesh);
    castleBannerRef.current = flagMesh;

    // 4 Corner Cylindrical Towers with Conical Roofs & Window Slits
    const towerCorners = [
      [-1.5, -1.5],
      [1.5, -1.5],
      [-1.5, 1.5],
      [1.5, 1.5],
    ];
    towerCorners.forEach(([tx, tz]) => {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 3.2, 14), stoneWallMat);
      tower.position.set(tx, 1.6, tz);
      tower.castShadow = !isSoftwareGl;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.5, 14), royalRoofMat);
      roof.position.set(tx, 3.9, tz);
      roof.castShadow = !isSoftwareGl;
      castleGroup.add(tower, roof);
    });

    // Castle Portcullis Heavy Gate with Torches
    const gate = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 1.4, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 })
    );
    gate.position.set(0, 0.7, 1.45);
    castleGroup.add(gate);

    landmarksGroup.add(castleGroup);

    // ==========================================
    // 6. GHIBLI-STYLE PROCEDURAL 3D TREES & VEGETATION
    // Multi-branching trunks & multi-clump dense canopies
    // ==========================================
    const foliageGroup = new THREE.Group();
    scene.add(foliageGroup);

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const pineGreen1 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.75 });
    const pineGreen2 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 });
    const oakGreen = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7 });
    const palmGreen = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.65 });

    const addPineTree = (x: number, z: number, scale = 1.0) => {
      const y = getTerrainHeight(x, z);
      const tree = new THREE.Group();
      tree.position.set(x, y, z);
      tree.scale.setScalar(scale);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.9, 8), trunkMat);
      trunk.position.y = 0.45;
      trunk.castShadow = !isSoftwareGl;
      tree.add(trunk);

      for (let i = 0; i < 4; i++) {
        const mat = i % 2 === 0 ? pineGreen1 : pineGreen2;
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.95 - i * 0.18, 0.95, 8), mat);
        cone.position.y = 1.0 + i * 0.55;
        cone.castShadow = !isSoftwareGl;
        tree.add(cone);
      }
      foliageGroup.add(tree);
    };

    const addOakTree = (x: number, z: number, scale = 1.0) => {
      const y = getTerrainHeight(x, z);
      const oak = new THREE.Group();
      oak.position.set(x, y, z);
      oak.scale.setScalar(scale);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.24, 1.2, 8), trunkMat);
      trunk.position.y = 0.6;
      trunk.castShadow = !isSoftwareGl;
      oak.add(trunk);

      const clusterOffsets = [
        [0, 1.7, 0, 0.85],
        [-0.45, 1.45, 0.2, 0.65],
        [0.45, 1.5, -0.2, 0.7],
        [0.2, 1.4, 0.4, 0.6],
        [-0.2, 1.8, -0.3, 0.6],
      ];
      clusterOffsets.forEach(([cx, cy, cz, cr]) => {
        const clump = new THREE.Mesh(new THREE.DodecahedronGeometry(cr, 1), oakGreen);
        clump.position.set(cx, cy, cz);
        clump.castShadow = !isSoftwareGl;
        oak.add(clump);
      });
      foliageGroup.add(oak);
    };

    const addPalmTree = (x: number, z: number, scale = 1.0) => {
      const y = getTerrainHeight(x, z);
      const palm = new THREE.Group();
      palm.position.set(x, y, z);
      palm.scale.setScalar(scale);

      const trunkCurve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.2, 2.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 })
      );
      trunkCurve.position.set(0.15, 1.0, 0);
      trunkCurve.rotation.z = -0.15;
      palm.add(trunkCurve);

      for (let f = 0; f < 6; f++) {
        const ang = (Math.PI * 2 * f) / 6;
        const frond = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.6, 6), palmGreen);
        frond.position.set(Math.cos(ang) * 0.7 + 0.15, 2.0, Math.sin(ang) * 0.7);
        frond.rotation.set(Math.sin(ang) * 0.8, 0, -Math.cos(ang) * 0.8);
        palm.add(frond);
      }
      foliageGroup.add(palm);
    };

    const trees = [
      { type: 'palm', x: -10.5, z: 16.0, s: 1.1 },
      { type: 'palm', x: -6.0, z: 18.0, s: 0.95 },
      { type: 'palm', x: -12.0, z: 13.5, s: 1.05 },
      { type: 'palm', x: -7.5, z: 14.5, s: 0.9 },
      { type: 'oak', x: -13.0, z: 7.5, s: 1.2 },
      { type: 'oak', x: -12.5, z: 5.5, s: 1.1 },
      { type: 'oak', x: -11.5, z: 3.5, s: 1.0 },
      { type: 'oak', x: -8.5, z: 9.5, s: 1.05 },
      { type: 'oak', x: 6.5, z: 8.5, s: 1.1 },
      { type: 'oak', x: 9.0, z: 9.2, s: 1.0 },
      { type: 'pine', x: 14.5, z: 6.0, s: 1.0 },
      { type: 'pine', x: 14.0, z: 3.5, s: 1.05 },
      { type: 'pine', x: 12.0, z: -1.0, s: 1.0 },
      { type: 'pine', x: 13.5, z: -3.5, s: 1.1 },
      { type: 'pine', x: -12.5, z: -2.0, s: 0.95 },
      { type: 'pine', x: -13.0, z: -6.5, s: 1.0 },
      { type: 'pine', x: -4.5, z: 0.5, s: 0.85 },
      { type: 'pine', x: 3.5, z: -3.0, s: 0.8 },
    ];
    trees.forEach((t) => {
      if (t.type === 'palm') addPalmTree(t.x, t.z, t.s);
      else if (t.type === 'pine') addPineTree(t.x, t.z, t.s);
      else addOakTree(t.x, t.z, t.s);
    });

    // ==========================================
    // 7. LEVEL RUNIC PLATFORMS ALONG THE ROAD
    // ==========================================
    const levelPlatformsGroup = new THREE.Group();
    scene.add(levelPlatformsGroup);
    levelMeshesRef.current = [];
    beaconRingsRef.current = [];

    levelNodes.forEach((node) => {
      const isCompleted = unlockedLevel > node.id;
      const isCurrent = unlockedLevel === node.id;
      const isLocked = unlockedLevel < node.id;

      const pGroup = new THREE.Group();
      pGroup.position.copy(node.position);

      const status = isCompleted ? 'completed' : isCurrent ? 'current' : 'locked';
      const runeTex = getRunePlatformTexture(status);

      const baseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.95, 0.22, 24),
        new THREE.MeshStandardMaterial({
          color: isCompleted ? 0x064e3b : isCurrent ? 0x7c2d12 : 0x1e293b,
          roughness: 0.65,
        })
      );
      baseMesh.castShadow = !isSoftwareGl;
      pGroup.add(baseMesh);

      const discMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.72, 0.04, 24),
        new THREE.MeshStandardMaterial({
          map: runeTex,
          roughness: 0.25,
          metalness: 0.3,
          emissive: isCompleted
            ? new THREE.Color(0x10b981)
            : isCurrent
            ? new THREE.Color(0xf59e0b)
            : new THREE.Color(0x000000),
          emissiveIntensity: isCompleted ? 0.6 : isCurrent ? 1.0 : 0,
        })
      );
      discMesh.position.y = 0.12;
      pGroup.add(discMesh);

      // HitBox for Raycasting
      const hitBox = new THREE.Mesh(
        new THREE.CylinderGeometry(0.95, 0.95, 0.8, 12),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitBox.position.y = 0.3;
      pGroup.add(hitBox);
      levelMeshesRef.current.push({ mesh: hitBox, id: node.id });

      if (isCompleted) {
        const star = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.22, 0),
          new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            emissive: 0xfacc15,
            emissiveIntensity: 0.9,
            metalness: 0.8,
            roughness: 0.2,
          })
        );
        star.position.y = 0.45;
        pGroup.add(star);
      } else if (isCurrent) {
        const beacon = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.6, 5.0, 16),
          new THREE.MeshBasicMaterial({
            color: 0xf97316,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
        );
        beacon.position.y = 2.6;
        pGroup.add(beacon);

        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.85, 0.04, 10, 24),
          new THREE.MeshBasicMaterial({ color: 0xfde047 })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.26;
        pGroup.add(ring);
        beaconRingsRef.current.push(ring);
      } else {
        const lockBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.24, 0.12),
          new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.4 })
        );
        lockBody.position.y = 0.32;
        pGroup.add(lockBody);
      }

      levelPlatformsGroup.add(pGroup);
    });

    // ==========================================
    // 8. 3D AVATAR ON THE ACTIVE LEVEL
    // ==========================================
    const avatarRig = buildProceduralCharacter({
      characterType: student.avatar.characterType || 'boy',
      outfitId: student.avatar.outfitId || 'sport',
      suitColor: student.avatar.suitColor || '#0284c7',
      pantsColor: student.avatar.pantsColor,
      shoesColor: student.avatar.shoesColor,
      skinColor: student.avatar.skinColor,
      eyeColor: student.avatar.eyeColor,
      hairstyleId: student.avatar.hairstyleId,
      hairColor: student.avatar.hairColor,
      shoesId: student.avatar.shoesId,
      headgearId: student.avatar.headgearId,
      accessoryId: student.avatar.accessoryId,
      specialUnlockableId: student.avatar.specialUnlockableId,
      expression: student.avatar.expression || 'happy',
    });
    avatarRigRef.current = avatarRig;
    avatarRig.root.scale.setScalar(0.75);

    const startNode = levelNodes.find((n) => n.id === unlockedLevel) || levelNodes[0];
    avatarRig.root.position.copy(startNode.position);
    avatarRig.root.position.y += 0.28;
    scene.add(avatarRig.root);

    cameraStateRef.current.targetPos.copy(avatarRig.root.position);
    cameraStateRef.current.smoothTarget.copy(avatarRig.root.position);

    // ==========================================
    // 9. VOLUMETRIC DRIFTING CLOUDS
    // ==========================================
    const cloudsGroup = new THREE.Group();
    scene.add(cloudsGroup);
    cloudsGroupRef.current = cloudsGroup;

    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      transparent: true,
      opacity: 0.85,
    });

    for (let c = 0; c < 8; c++) {
      const cloud = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 4);
      for (let p = 0; p < numPuffs; p++) {
        const puff = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.85 + Math.random() * 0.75, 1),
          cloudMat
        );
        puff.position.set(
          (p - numPuffs / 2) * 0.95,
          (Math.random() - 0.5) * 0.35,
          (Math.random() - 0.5) * 0.7
        );
        cloud.add(puff);
      }
      cloud.position.set(
        (Math.random() - 0.5) * 36,
        8.5 + Math.random() * 4.5,
        (Math.random() - 0.5) * 36
      );
      cloudsGroup.add(cloud);
    }

    // ==========================================
    // MOUSE & TOUCH ORBIT CONTROLS
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.hud-overlay')) return;
      cameraStateRef.current.isDragging = true;
      cameraStateRef.current.lastX = e.clientX;
      cameraStateRef.current.lastY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      if (cameraStateRef.current.isDragging) {
        const dx = e.clientX - cameraStateRef.current.lastX;
        const dy = e.clientY - cameraStateRef.current.lastY;
        cameraStateRef.current.spherical.theta -= dx * 0.007;
        cameraStateRef.current.spherical.phi = Math.max(
          0.15,
          Math.min(Math.PI / 2.1, cameraStateRef.current.spherical.phi - dy * 0.007)
        );
        cameraStateRef.current.lastX = e.clientX;
        cameraStateRef.current.lastY = e.clientY;
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      cameraStateRef.current.isDragging = false;

      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseCoord, camera);
      const targets = levelMeshesRef.current.map((l) => l.mesh);
      const intersects = raycaster.intersectObjects(targets, false);

      if (intersects.length > 0) {
        const hit = levelMeshesRef.current.find((l) => l.mesh === intersects[0].object);
        if (hit) {
          audio.playPop();
          setSelectedLevelId(hit.id);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraStateRef.current.spherical.radius = Math.max(
        8,
        Math.min(42, cameraStateRef.current.spherical.radius + e.deltaY * 0.022)
      );
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Touch events
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        cameraStateRef.current.isDragging = true;
        cameraStateRef.current.lastX = e.touches[0].clientX;
        cameraStateRef.current.lastY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (cameraStateRef.current.isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - cameraStateRef.current.lastX;
        const dy = e.touches[0].clientY - cameraStateRef.current.lastY;
        cameraStateRef.current.spherical.theta -= dx * 0.009;
        cameraStateRef.current.spherical.phi = Math.max(
          0.15,
          Math.min(Math.PI / 2.1, cameraStateRef.current.spherical.phi - dy * 0.009)
        );
        cameraStateRef.current.lastX = e.touches[0].clientX;
        cameraStateRef.current.lastY = e.touches[0].clientY;
      }
    };
    const onTouchEnd = () => {
      cameraStateRef.current.isDragging = false;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // ==========================================
    // RENDER & KINEMATICS LOOP
    // ==========================================
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (waterMeshRef.current) {
        waterMeshRef.current.position.y = 0.04 + Math.sin(elapsed * 2.2) * 0.015;
      }

      if (waterfallMeshRef.current) {
        const mat = waterfallMeshRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.45 + Math.sin(elapsed * 6) * 0.15;
      }

      if (waterfallParticlesRef.current) {
        const posArr = waterfallParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < posArr.length / 3; i++) {
          posArr[i * 3 + 1] -= delta * 1.5;
          if (posArr[i * 3 + 1] < 0.3) {
            posArr[i * 3 + 1] = 1.8 + Math.random() * 0.5;
          }
        }
        waterfallParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (steamParticlesRef.current) {
        const sArr = steamParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < sArr.length / 3; i++) {
          sArr[i * 3 + 1] += delta * 1.2;
          if (sArr[i * 3 + 1] > sciH + 3.0) {
            sArr[i * 3 + 1] = sciH + 0.8;
          }
        }
        steamParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (radarDishRef.current) {
        radarDishRef.current.rotation.y += delta * 0.75;
      }

      if (mathPolyhedraRef.current) {
        mathPolyhedraRef.current.rotation.y += delta * 0.8;
      }

      if (crystalsGroupRef.current) {
        crystalsGroupRef.current.rotation.y = Math.sin(elapsed * 1.5) * 0.15;
      }

      if (castleBannerRef.current) {
        const flagPositions = castleBannerRef.current.geometry.attributes.position;
        for (let i = 0; i < flagPositions.count; i++) {
          const fx = flagPositions.getX(i);
          flagPositions.setZ(i, Math.sin(elapsed * 5.5 + fx * 4) * 0.07);
        }
        flagPositions.needsUpdate = true;
      }

      beaconRingsRef.current.forEach((ring) => {
        ring.rotation.z += delta * 1.6;
      });

      if (cloudsGroupRef.current) {
        cloudsGroupRef.current.children.forEach((cloud, i) => {
          cloud.position.x += delta * (0.35 + i * 0.05);
          if (cloud.position.x > 22) cloud.position.x = -22;
        });
      }

      // Avatar kinematic movement along path
      const motion = avatarMotionRef.current;
      const rig = avatarRigRef.current;

      if (rig) {
        if (motion.isTraversing) {
          motion.pathProgress += delta * 0.55;
          const t = Math.min(motion.pathProgress, 1.0);

          rig.root.position.lerpVectors(motion.startWaypoint, motion.endWaypoint, t);
          rig.root.position.y += Math.sin(t * Math.PI) * 0.28;

          const dir = new THREE.Vector3().subVectors(motion.endWaypoint, motion.startWaypoint).normalize();
          rig.root.rotation.y = Math.atan2(dir.x, dir.z);

          const walkCycle = elapsed * 10;
          rig.leftLeg.rotation.x = Math.sin(walkCycle) * 0.6;
          rig.rightLeg.rotation.x = -Math.sin(walkCycle) * 0.6;
          rig.leftArm.rotation.x = -Math.sin(walkCycle) * 0.5;
          rig.rightArm.rotation.x = Math.sin(walkCycle) * 0.5;

          if (rig.leftForearm) rig.leftForearm.rotation.x = 0.3 + Math.sin(walkCycle) * 0.2;
          if (rig.rightForearm) rig.rightForearm.rotation.x = 0.3 - Math.sin(walkCycle) * 0.2;

          if (t >= 1.0) {
            motion.isTraversing = false;
            motion.currentLevel = motion.targetLevel;
            setIsMovingAvatar(false);

            audio.playBalanceSuccess();
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#f59e0b', '#10b981', '#38bdf8', '#ec4899'],
            });

            rig.root.position.y = motion.endWaypoint.y;
            rig.rightArm.rotation.z = -2.0;
            rig.leftArm.rotation.z = 2.0;
            rig.leftLeg.rotation.x = 0;
            rig.rightLeg.rotation.x = 0;
          }
        } else {
          const currentPos = levelNodes.find((n) => n.id === motion.currentLevel)?.position;
          if (currentPos) {
            rig.root.position.y = currentPos.y + 0.28 + Math.sin(elapsed * 2.2) * 0.02;
          }

          rig.head.rotation.y = Math.sin(elapsed * 1.4) * 0.08;
          rig.rightArm.rotation.z = -0.18;
          rig.rightArm.rotation.x = 0;
          rig.leftArm.rotation.z = 0.18;
          rig.leftArm.rotation.x = 0;
          rig.leftLeg.rotation.x = 0;
          rig.rightLeg.rotation.x = 0;
          if (rig.leftForearm) rig.leftForearm.rotation.x = 0.2;
          if (rig.rightForearm) rig.rightForearm.rotation.x = 0.2;

          if (rig.setBlink) {
            const blinkCycle = elapsed % 3.5;
            if (blinkCycle < 0.2) {
              rig.setBlink(Math.sin((blinkCycle / 0.2) * Math.PI));
            } else {
              rig.setBlink(0);
            }
          }
        }

        if (isFollowingAvatar && rig) {
          cameraStateRef.current.targetPos.copy(rig.root.position);
        }
      }

      // Smooth camera interpolation
      const cState = cameraStateRef.current;
      cState.smoothTarget.lerp(cState.targetPos, delta * 3.5);

      const radius = cState.spherical.radius;
      const phi = cState.spherical.phi;
      const theta = cState.spherical.theta;

      camera.position.x = cState.smoothTarget.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = cState.smoothTarget.y + radius * Math.cos(phi);
      camera.position.z = cState.smoothTarget.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(cState.smoothTarget);

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
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
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
    student.avatar.characterType,
    student.avatar.outfitId,
    student.avatar.suitColor,
    student.avatar.hairstyleId,
    student.avatar.hairColor,
    student.avatar.shoesId,
    student.avatar.headgearId,
    student.avatar.accessoryId,
    student.avatar.expression,
    levelNodes,
    isFollowingAvatar,
    unlockedLevel,
    pathCurve,
  ]);

  const handleWalkToNextLevel = () => {
    if (unlockedLevel >= 10 || isMovingAvatar) return;
    const nextLvl = unlockedLevel + 1;
    const currentNode = levelNodes.find((n) => n.id === unlockedLevel);
    const nextNode = levelNodes.find((n) => n.id === nextLvl);
    if (!currentNode || !nextNode) return;

    audio.playPop();
    setIsMovingAvatar(true);

    avatarMotionRef.current.startWaypoint.copy(currentNode.position).add(new THREE.Vector3(0, 0.28, 0));
    avatarMotionRef.current.endWaypoint.copy(nextNode.position).add(new THREE.Vector3(0, 0.28, 0));
    avatarMotionRef.current.pathProgress = 0;
    avatarMotionRef.current.targetLevel = nextLvl;
    avatarMotionRef.current.isTraversing = true;

    storage.recordProgress(student.id, 'algoritmos', unlockedLevel, {
      score: 100,
      attempts: 1,
      hintsUsed: 0,
      timeSpentSeconds: 120,
      realLearningMastery: 95,
    });
    if (onStudentUpdated) onStudentUpdated();
  };

  const handleCameraPreset = (
    preset: 'overview' | 'math' | 'reading' | 'code' | 'science' | 'castle' | 'avatar'
  ) => {
    audio.playPop();
    setIsFollowingAvatar(false);

    if (preset === 'overview') {
      cameraStateRef.current.targetPos.set(0, 3.5, 1.5);
      cameraStateRef.current.spherical = { radius: 28, theta: Math.PI / 4, phi: Math.PI / 3.4 };
    } else if (preset === 'math') {
      cameraStateRef.current.targetPos.set(11.5, 4.0, 7.0);
      cameraStateRef.current.spherical = { radius: 10, theta: Math.PI / 3.2, phi: Math.PI / 3.0 };
    } else if (preset === 'reading') {
      cameraStateRef.current.targetPos.set(-10.0, 3.5, 6.5);
      cameraStateRef.current.spherical = { radius: 10, theta: -Math.PI / 3.5, phi: Math.PI / 3.0 };
    } else if (preset === 'code') {
      cameraStateRef.current.targetPos.set(9.5, 5.0, -4.5);
      cameraStateRef.current.spherical = { radius: 11, theta: Math.PI / 1.6, phi: Math.PI / 3.2 };
    } else if (preset === 'science') {
      cameraStateRef.current.targetPos.set(-9.5, 5.0, -5.0);
      cameraStateRef.current.spherical = { radius: 11, theta: -Math.PI / 1.6, phi: Math.PI / 3.2 };
    } else if (preset === 'castle') {
      cameraStateRef.current.targetPos.set(0, 9.5, -9.8);
      cameraStateRef.current.spherical = { radius: 13, theta: Math.PI / 2.2, phi: Math.PI / 3.2 };
    } else if (preset === 'avatar') {
      const activeNode = levelNodes.find((n) => n.id === unlockedLevel) || levelNodes[0];
      cameraStateRef.current.targetPos.copy(activeNode.position);
      cameraStateRef.current.spherical = { radius: 8.5, theta: Math.PI / 4, phi: Math.PI / 2.8 };
      setIsFollowingAvatar(true);
    }
  };

  const handleLaunchMission = (node: LevelNode3D) => {
    setSelectedLevelId(null);
    onSelectTab(node.gameTarget, node.id);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-3 border-sky-300/80 bg-slate-950 select-none">
      <div
        ref={mountRef}
        className="w-full h-[600px] sm:h-[680px] relative cursor-grab active:cursor-grabbing"
      />

      {/* Top Left: World Info Badge */}
      <div className="hud-overlay absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20 text-white shadow-xl flex items-center gap-2">
          <span className="text-xl">🏝️</span>
          <div>
            <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider block">
              Isla 3D de Aventuras • EurekaLab
            </span>
            <span className="text-xs sm:text-sm font-black font-fun text-white">
              Gráficos de Alta Fidelidad & PBR
            </span>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-white text-[11px] font-fun flex items-center gap-1.5 w-fit">
          <span className="text-amber-400">★</span>
          <span>Nivel {unlockedLevel}/10 Desbloqueado</span>
        </div>
      </div>

      {/* Top Right: Educational Zone Quick Teleport Cameras & Follow Avatar */}
      <div className="hud-overlay absolute top-4 right-4 z-20 flex flex-wrap items-center justify-end gap-1.5 max-w-md pointer-events-auto">
        <button
          onClick={() => handleCameraPreset('overview')}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold font-fun bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-white/20 shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1"
          title="Ver toda la isla con sus montañas y caminos"
        >
          <span>🗺️</span> Isla
        </button>

        <button
          onClick={() => handleCameraPreset('reading')}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold font-fun bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-400/40 shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1"
          title="Ir a la Zona de Lectura (Biblioteca)"
        >
          <span>📖</span> Lectura
        </button>

        <button
          onClick={() => handleCameraPreset('math')}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold font-fun bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-400/40 shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1"
          title="Ir a la Zona de Matemáticas (Templo & Balanza)"
        >
          <span>⚖️</span> Matemáticas
        </button>

        <button
          onClick={() => handleCameraPreset('code')}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold font-fun bg-sky-950/80 hover:bg-sky-900 text-sky-200 border border-sky-400/40 shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1"
          title="Ir a la Zona de Programación (Estación Tech)"
        >
          <span>🚀</span> Código
        </button>

        <button
          onClick={() => handleCameraPreset('science')}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold font-fun bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-400/40 shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1"
          title="Ir a la Zona de Ciencias (Laboratorio & Cueva)"
        >
          <span>🧪</span> Ciencias
        </button>

        <button
          onClick={() => handleCameraPreset('castle')}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold font-fun bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-400/40 shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1"
          title="Mirar hacia el Gran Castillo en la cumbre"
        >
          <span>🏰</span> Castillo
        </button>

        <button
          onClick={() => handleCameraPreset('avatar')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-fun transition active:scale-95 cursor-pointer flex items-center gap-1 border shadow-md ${
            isFollowingAvatar
              ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/50'
              : 'bg-slate-900/85 hover:bg-slate-800 text-slate-200 border-white/20'
          }`}
          title="Fijar y seguir al avatar en su recorrido"
        >
          <span>🚶</span> Seguir
        </button>
      </div>

      {/* Ergonomic Collapsible Bottom Control Dock */}
      <div
        className={`hud-overlay absolute left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-3 transition-all duration-300 pointer-events-auto ${
          isDockCollapsed ? 'bottom-2' : 'bottom-4'
        }`}
      >
        <div className="relative bg-slate-950/85 backdrop-blur-md border-2 border-white/20 rounded-3xl shadow-2xl p-3 sm:p-4 text-white overflow-hidden">
          <button
            onClick={() => {
              audio.playPop();
              setIsDockCollapsed(!isDockCollapsed);
            }}
            className="absolute top-2 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer flex items-center gap-1 text-xs"
          >
            <span>{isDockCollapsed ? 'Expandir Panel' : 'Minimizar'}</span>
            {isDockCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {!isDockCollapsed && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pr-20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-base shadow-sm">
                    {unlockedLevel}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      {levelNodes.find((n) => n.id === unlockedLevel)?.zoneName}
                    </span>
                    <span className="text-xs sm:text-sm font-black font-fun">
                      {levelNodes.find((n) => n.id === unlockedLevel)?.title}
                    </span>
                  </div>
                </div>

                {unlockedLevel < 10 && (
                  <GameButton
                    variant="accent"
                    size="sm"
                    onClick={handleWalkToNextLevel}
                    isLoading={isMovingAvatar}
                    icon={<Zap className="w-4 h-4 fill-amber-300 text-amber-300" />}
                  >
                    <span>{isMovingAvatar ? 'Caminando...' : 'Avanzar al Nivel ' + (unlockedLevel + 1)}</span>
                  </GameButton>
                )}
              </div>

              <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
                {levelNodes.map((n) => {
                  const isCompleted = unlockedLevel > n.id;
                  const isCurrent = unlockedLevel === n.id;
                  const isLocked = unlockedLevel < n.id;

                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        audio.playPop();
                        setSelectedLevelId(n.id);
                      }}
                      className={`relative group flex flex-col items-center p-1.5 rounded-2xl transition cursor-pointer shrink-0 ${
                        isCurrent
                          ? 'bg-amber-500/20 ring-2 ring-amber-400'
                          : isCompleted
                          ? 'bg-emerald-500/15 hover:bg-emerald-500/30'
                          : 'bg-white/5 opacity-60 hover:opacity-100'
                      }`}
                      title={`Nivel ${n.id}: ${n.title} (${n.zoneName})`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-fun font-bold text-xs shadow-md border-2 ${
                          isCompleted
                            ? 'bg-emerald-500 border-white text-white'
                            : isCurrent
                            ? 'bg-gradient-to-tr from-amber-400 to-orange-500 border-white text-white shadow-amber-400/50'
                            : 'bg-slate-800 border-slate-600 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : n.id}
                      </div>
                      <span className="text-[10px] font-fun mt-1 text-slate-300">Nvl {n.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Level Challenge Modal */}
      {selectedLevelId && selectedMissionData && (
        <div className="hud-overlay fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-3 border-amber-300/80 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div
              className={`p-4 text-white flex items-center justify-between ${
                selectedMissionData.gameTarget === 'math'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                  : selectedMissionData.gameTarget === 'reading'
                  ? 'bg-gradient-to-r from-rose-600 to-purple-600'
                  : 'bg-gradient-to-r from-sky-600 to-indigo-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-bold">
                  {selectedMissionData.id}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                    {selectedMissionData.zoneName}
                  </span>
                  <h3 className="font-fun font-black text-base leading-tight">
                    {selectedMissionData.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedLevelId(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition active:scale-90 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 bg-slate-50">
              <div className="bg-white p-3.5 rounded-2xl border border-sky-100 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Concepto Pedagógico y Objetivo:
                </span>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {selectedMissionData.detailedObjective || selectedMissionData.subtitle}
                </p>
                <div className="text-[11px] text-sky-700 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200 font-mono">
                  💡 {selectedMissionData.learningConcept}
                </div>
              </div>

              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs">
                <span className="font-bold text-amber-950 font-fun">Recompensas al superar:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                    +{selectedMissionData.rewardCoins} 🪙 Eurekas
                  </span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    +{selectedMissionData.rewardXp} XP
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedLevelId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cerrar
              </button>

              <GameButton
                variant={
                  selectedMissionData.id <= unlockedLevel
                    ? selectedMissionData.gameTarget
                    : 'secondary'
                }
                size="md"
                onClick={() => handleLaunchMission(selectedMissionData)}
                icon={
                  selectedMissionData.id <= unlockedLevel ? (
                    <Play className="w-4 h-4 fill-white" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )
                }
                disabled={selectedMissionData.id > unlockedLevel}
              >
                <span>
                  {selectedMissionData.id <= unlockedLevel
                    ? '¡Jugar Desafío Ahora!'
                    : 'Nivel Bloqueado'}
                </span>
              </GameButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
