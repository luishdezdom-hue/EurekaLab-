/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CharacterType } from '../../types';

export type CharacterAnimationState =
  | 'idle'
  | 'blink'
  | 'breathe'
  | 'lookAround'
  | 'wave'
  | 'walk'
  | 'celebrate'
  | 'concentrate'
  | 'achievement';

export interface CharacterRig {
  root: THREE.Group;
  pelvis: THREE.Group;
  torso: THREE.Group;
  chest: THREE.Group;
  neck: THREE.Group;
  head: THREE.Group;
  // Limbs
  leftShoulder: THREE.Group;
  rightShoulder: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftForearm: THREE.Group;
  rightForearm: THREE.Group;
  leftHand: THREE.Group;
  rightHand: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftKnee: THREE.Group;
  rightKnee: THREE.Group;
  leftFoot: THREE.Group;
  rightFoot: THREE.Group;
  // Face & Facial Features
  leftEyeGroup?: THREE.Group;
  rightEyeGroup?: THREE.Group;
  leftUpperLid?: THREE.Mesh;
  rightUpperLid?: THREE.Mesh;
  leftLowerLid?: THREE.Mesh;
  rightLowerLid?: THREE.Mesh;
  leftEyebrow?: THREE.Group;
  rightEyebrow?: THREE.Group;
  noseMesh?: THREE.Mesh;
  mouthGroup?: THREE.Group;
  smileMesh?: THREE.Mesh;
  cheeksGroup?: THREE.Group;
  // Hair & Accessories
  hairGroup?: THREE.Group;
  clothingGroup?: THREE.Group;
  accessoriesGroup?: THREE.Group;
  specialUnlockableGroup?: THREE.Group;
  glowMesh?: THREE.Mesh;
  haloGroup?: THREE.Group;
  capeMesh?: THREE.Mesh;
  // Metadata
  characterType: CharacterType;
  outfitId: string;
  hairstyleId: string;
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  suitColor: string;
  pantsColor: string;
  shoesColor: string;
  shoesId: string;
  // Kinematic Controllers
  setBlink: (amount: number) => void;
  setExpression: (expr: 'happy' | 'thinking' | 'victory' | 'curious' | 'wink') => void;
  updateAnimation: (
    delta: number,
    elapsed: number,
    state: CharacterAnimationState,
    lookTarget?: { x: number; y: number }
  ) => void;
}

export interface BuildCharacterOptions {
  characterType?: CharacterType;
  outfitId?: string;
  suitColor?: string;
  pantsColor?: string;
  skinColor?: string;
  eyeColor?: string;
  hairstyleId?: string;
  hairColor?: string;
  shoesId?: string;
  shoesColor?: string;
  headgearId?: string;
  accessoryId?: string;
  specialUnlockableId?: string;
  expression?: 'happy' | 'thinking' | 'victory' | 'curious' | 'wink';
}

/**
 * Procedural Iris Texture Generator:
 * Creates a realistic, high-resolution iris map with radial striae, limbal ring, and pupil gradient.
 */
function createProceduralIrisTexture(irisColorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const cx = 128;
    const cy = 128;

    // Sclera base
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);

    // Limbal ring (dark outer edge of iris)
    const limbalGrad = ctx.createRadialGradient(cx, cy, 75, cx, cy, 110);
    limbalGrad.addColorStop(0, irisColorHex);
    limbalGrad.addColorStop(0.85, irisColorHex);
    limbalGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = limbalGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 110, 0, Math.PI * 2);
    ctx.fill();

    // Radial striae / iris fibers
    ctx.save();
    ctx.translate(cx, cy);
    const numRays = 48;
    for (let i = 0; i < numRays; i++) {
      ctx.rotate((Math.PI * 2) / numRays);
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)';
      ctx.lineWidth = i % 3 === 0 ? 2.5 : 1.2;
      ctx.beginPath();
      ctx.moveTo(35, 0);
      ctx.lineTo(105, 0);
      ctx.stroke();
    }
    ctx.restore();

    // Inner bright collarette ring
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 58, 0, Math.PI * 2);
    ctx.stroke();

    // Central deep black pupil
    ctx.fillStyle = '#050811';
    ctx.beginPath();
    ctx.arc(cx, cy, 42, 0, Math.PI * 2);
    ctx.fill();

    // Secondary soft inner shadow in pupil
    const pupilGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 42);
    pupilGrad.addColorStop(0, '#000000');
    pupilGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = pupilGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 42, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Soft Cheek Blush Texture
 */
function createProceduralBlushTexture(blushColorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
    grad.addColorStop(0, blushColorHex);
    grad.addColorStop(0.55, blushColorHex + '99');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * PBR Material Generator Helper with balanced roughness and metalness
 */
const createPbrMat = (
  color: number | string,
  roughness = 0.45,
  metalness = 0.05,
  emissive?: number | string,
  emissiveIntensity = 0.5
) => {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
    emissive: emissive ? new THREE.Color(emissive) : new THREE.Color(0x000000),
    emissiveIntensity: emissive ? emissiveIntensity : 0,
  });
};

/**
 * Builds the complete 3D articulated volumetric character matching EDUQUEST's 3 avatars:
 * 1. Niño Explorador: Realistic volumetric head, brown layered hair with spiky tufts, dark/brown eyes,
 *    sculpted nose, smiling mouth, skin-toned ears, blue shirt with white center patch, white cuffs,
 *    black pants, athletic white sneakers with laces.
 * 2. Niña Aventurera: Volumetric head, purple hair with space buns and front bangs, cyan headband,
 *    vibrant blush cheeks, expressive eyes, blue shirt, dark pants, athletic sneakers.
 * 3. Robot Chistera: Dark navy polished chasis, Victorian top hat with ribbon, glowing circular cyan eyes,
 *    side bolt ears, glowing chest reactor core, silver cuffs, dark legs, blue boots.
 */
export function buildProceduralCharacter(
  optionsOrType: CharacterType | BuildCharacterOptions = 'boy',
  outfitParam?: string,
  customColorParam?: string
): CharacterRig {
  const options: BuildCharacterOptions =
    typeof optionsOrType === 'string'
      ? {
          characterType: optionsOrType,
          outfitId: outfitParam || 'sport',
          suitColor: customColorParam || '#0284c7',
        }
      : optionsOrType;

  const characterType: CharacterType = options.characterType || 'boy';
  const outfitId = options.outfitId || (characterType === 'robot' ? 'hat' : 'sport');
  const suitColor = options.suitColor || (characterType === 'robot' ? '#0f172a' : '#0284c7');
  const pantsColor = options.pantsColor || (characterType === 'robot' ? '#090d16' : '#0f172a');
  const shoesColor = options.shoesColor || (characterType === 'robot' ? '#1d4ed8' : '#f8fafc');
  const shoesId = options.shoesId || 'shoes_sneakers';
  const hairstyleId =
    options.hairstyleId ||
    (characterType === 'girl'
      ? 'girl_twintails'
      : characterType === 'robot'
      ? 'robot_core'
      : 'boy_sport');
  const hairColor =
    options.hairColor ||
    (characterType === 'girl'
      ? '#7e22ce'
      : characterType === 'robot'
      ? '#06b6d4'
      : '#451a03');

  // Human default skin: warm beige tone, customizable
  const skinColor =
    options.skinColor ||
    (characterType === 'robot' ? '#0f172a' : '#ffdfcb');

  // Eye iris color
  const eyeColor =
    options.eyeColor ||
    (characterType === 'robot'
      ? '#06b6d4'
      : characterType === 'girl'
      ? '#4338ca'
      : '#1e3a8a');

  const headgearId = options.headgearId || '';
  const accessoryId = options.accessoryId || '';
  const specialUnlockableId = options.specialUnlockableId || '';
  const initialExpression = options.expression || 'happy';

  const root = new THREE.Group();
  root.name = `Character_${characterType}`;

  // =========================================================================
  // SKELETAL HIERARCHY SETUP
  // =========================================================================
  const hipY = 0.65;
  const torsoBaseY = 0.76;
  const chestBaseY = 0.22;
  const neckBaseY = 0.26;
  const headBaseY = 0.12;

  // 1. Pelvis / Hips (Root of body movements)
  const pelvis = new THREE.Group();
  pelvis.position.set(0, hipY, 0);
  root.add(pelvis);

  // 2. Spine / Torso (Breathing, waist rotation)
  const torso = new THREE.Group();
  torso.position.set(0, torsoBaseY - hipY, 0);
  pelvis.add(torso);

  // 3. Chest / Upper Torso (Chest expansion, shoulder origins)
  const chest = new THREE.Group();
  chest.position.set(0, chestBaseY, 0);
  torso.add(chest);

  // 4. Neck
  const neck = new THREE.Group();
  neck.position.set(0, neckBaseY, 0);
  chest.add(neck);

  // 5. Head (Pitch, Yaw, Roll, Nodding)
  const head = new THREE.Group();
  head.position.set(0, headBaseY, 0);
  neck.add(head);

  // 6. Shoulders & Arms
  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(-0.32, 0.16, 0);
  chest.add(leftShoulder);

  const rightShoulder = new THREE.Group();
  rightShoulder.position.set(0.32, 0.16, 0);
  chest.add(rightShoulder);

  const leftArm = new THREE.Group();
  leftShoulder.add(leftArm);

  const rightArm = new THREE.Group();
  rightShoulder.add(rightArm);

  const leftForearm = new THREE.Group();
  leftForearm.position.set(0, -0.22, 0);
  leftArm.add(leftForearm);

  const rightForearm = new THREE.Group();
  rightForearm.position.set(0, -0.22, 0);
  rightArm.add(rightForearm);

  const leftHand = new THREE.Group();
  leftHand.position.set(0, -0.22, 0);
  leftForearm.add(leftHand);

  const rightHand = new THREE.Group();
  rightHand.position.set(0, -0.22, 0);
  rightForearm.add(rightHand);

  // 7. Legs & Feet
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.14, 0, 0);
  pelvis.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.14, 0, 0);
  pelvis.add(rightLeg);

  const leftKnee = new THREE.Group();
  leftKnee.position.set(0, -0.28, 0);
  leftLeg.add(leftKnee);

  const rightKnee = new THREE.Group();
  rightKnee.position.set(0, -0.28, 0);
  rightLeg.add(rightKnee);

  const leftFoot = new THREE.Group();
  leftFoot.position.set(0, -0.32, 0);
  leftKnee.add(leftFoot);

  const rightFoot = new THREE.Group();
  rightFoot.position.set(0, -0.32, 0);
  rightKnee.add(rightFoot);

  // Facial feature refs
  let leftUpperLid: THREE.Mesh | undefined;
  let rightUpperLid: THREE.Mesh | undefined;
  let leftLowerLid: THREE.Mesh | undefined;
  let rightLowerLid: THREE.Mesh | undefined;
  let leftEyebrow: THREE.Group | undefined;
  let rightEyebrow: THREE.Group | undefined;
  let noseMesh: THREE.Mesh | undefined;
  let mouthGroup: THREE.Group | undefined;
  let smileMesh: THREE.Mesh | undefined;
  let cheeksGroup: THREE.Group | undefined;
  let glowMesh: THREE.Mesh | undefined;
  let haloGroup: THREE.Group | undefined;
  let capeMesh: THREE.Mesh | undefined;

  const hairGroup = new THREE.Group();
  head.add(hairGroup);

  const clothingGroup = new THREE.Group();
  torso.add(clothingGroup);

  const accessoriesGroup = new THREE.Group();
  root.add(accessoriesGroup);

  const specialUnlockableGroup = new THREE.Group();
  root.add(specialUnlockableGroup);

  // =========================================================================
  // MATERIALS CONFIGURATION
  // =========================================================================
  const skinMat = createPbrMat(skinColor, 0.48, 0.02);
  const shirtMat = createPbrMat(suitColor, 0.45, 0.05);
  const pantsMat = createPbrMat(pantsColor, 0.55, 0.04);
  const shoesMat = createPbrMat(shoesColor, 0.35, 0.05);
  const whiteMat = createPbrMat(0xf8fafc, 0.25, 0.02);
  const hairMat = createPbrMat(hairColor, 0.45, 0.04);
  const eyeIrisTexture = createProceduralIrisTexture(eyeColor);
  const eyeIrisMat = new THREE.MeshBasicMaterial({ map: eyeIrisTexture });
  const scleraMat = createPbrMat(0xfcfcfc, 0.15, 0.02);
  const pupilCatchlightMat = createPbrMat(0xffffff, 0.05, 0.0, 0xffffff, 0.8);
  const mouthMat = createPbrMat(0xdc2626, 0.35, 0.04);
  const innerMouthMat = createPbrMat(0x881337, 0.5, 0.0);
  const teethMat = createPbrMat(0xf8fafc, 0.15, 0.0);
  const goldMetalMat = createPbrMat(0xfbbf24, 0.2, 0.9, 0xd97706, 0.2);
  const cyanGlowMat = createPbrMat(0x38bdf8, 0.15, 0.2, 0x06b6d4, 1.8);
  const darkNavyMat = createPbrMat(0x0f172a, 0.35, 0.75);
  const silverMetalMat = createPbrMat(0xe2e8f0, 0.15, 0.95);

  // =========================================================================
  // BUILD ANATOMICAL DETAILS (HUMAN / ROBOT)
  // =========================================================================
  if (characterType === 'boy' || characterType === 'girl') {
    // -----------------------------------------------------------------------
    // 1. VOLUMETRIC 3D HEAD & JAW
    // -----------------------------------------------------------------------
    const craniumGeo = new THREE.SphereGeometry(0.26, 32, 28);
    craniumGeo.scale(1.0, 1.05, 1.02);
    const craniumMesh = new THREE.Mesh(craniumGeo, skinMat);
    craniumMesh.castShadow = true;
    head.add(craniumMesh);

    // Sculpted Chin & Jaw Volume (gives real 3D facial mass, not flat)
    const jawGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.16, 24);
    jawGeo.scale(1.0, 0.9, 1.05);
    const jawMesh = new THREE.Mesh(jawGeo, skinMat);
    jawMesh.position.set(0, -0.15, 0.06);
    head.add(jawMesh);

    // -----------------------------------------------------------------------
    // 2. VOLUMETRIC 3D EYES (Sclera + Iris + Pupil + Catchlight + Eyelids)
    // -----------------------------------------------------------------------
    const buildEye = (isL: boolean) => {
      const eyeContainer = new THREE.Group();
      eyeContainer.position.set(isL ? -0.092 : 0.092, 0.042, 0.22);

      // Eye Socket shadow inset
      const socketGeo = new THREE.SphereGeometry(0.046, 20, 16);
      const socketMat = createPbrMat(skinColor, 0.6, 0.0);
      const socketMesh = new THREE.Mesh(socketGeo, socketMat);
      socketMesh.scale.set(1.05, 1.05, 0.4);
      socketMesh.position.z = -0.01;
      eyeContainer.add(socketMesh);

      // White Sclera Eyeball
      const scleraGeo = new THREE.SphereGeometry(0.042, 24, 20);
      const sclera = new THREE.Mesh(scleraGeo, scleraMat);
      eyeContainer.add(sclera);

      // 3D Iris Plane / Disk with procedural iris fibers
      const irisGeo = new THREE.CircleGeometry(0.027, 24);
      const iris = new THREE.Mesh(irisGeo, eyeIrisMat);
      iris.position.set(0, 0, 0.0415);
      eyeContainer.add(iris);

      // Specular Reflection Catchlights (gives living spark!)
      const catchlight1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.007, 10, 10),
        pupilCatchlightMat
      );
      catchlight1.position.set(-0.01, 0.01, 0.0428);
      eyeContainer.add(catchlight1);

      const catchlight2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.0035, 8, 8),
        pupilCatchlightMat
      );
      catchlight2.position.set(0.008, -0.008, 0.0428);
      eyeContainer.add(catchlight2);

      // Upper Eyelid (Rotates down for natural blinking & expressions)
      const upperLidGeo = new THREE.SphereGeometry(
        0.044,
        24,
        14,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.48
      );
      const upperLid = new THREE.Mesh(upperLidGeo, skinMat);
      upperLid.rotation.x = -Math.PI * 0.48; // Fully open default
      eyeContainer.add(upperLid);

      // Lower Eyelid (Subtle upward flex for smiling eyes)
      const lowerLidGeo = new THREE.SphereGeometry(
        0.0435,
        20,
        10,
        0,
        Math.PI * 2,
        Math.PI * 0.6,
        Math.PI * 0.38
      );
      const lowerLid = new THREE.Mesh(lowerLidGeo, skinMat);
      lowerLid.rotation.x = Math.PI * 0.38; // Retracted default
      eyeContainer.add(lowerLid);

      if (isL) {
        leftUpperLid = upperLid;
        leftLowerLid = lowerLid;
      } else {
        rightUpperLid = upperLid;
        rightLowerLid = lowerLid;
      }

      head.add(eyeContainer);
    };

    buildEye(true);
    buildEye(false);

    // -----------------------------------------------------------------------
    // 3. 3D SCULPTED EYEBROWS (Expressive curved bevels)
    // -----------------------------------------------------------------------
    const buildEyebrow = (isL: boolean) => {
      const browGroup = new THREE.Group();
      browGroup.position.set(isL ? -0.095 : 0.095, 0.108, 0.235);

      const browShape = new THREE.Shape();
      browShape.moveTo(-0.042, -0.008);
      browShape.quadraticCurveTo(0, 0.018, 0.042, -0.004);
      browShape.quadraticCurveTo(0, 0.006, -0.042, -0.008);

      const extrudeSettings = {
        depth: 0.014,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.004,
        bevelThickness: 0.004,
      };

      const browGeo = new THREE.ExtrudeGeometry(browShape, extrudeSettings);
      const browMesh = new THREE.Mesh(browGeo, hairMat);
      browMesh.scale.x = isL ? 1 : -1;
      browMesh.castShadow = true;
      browGroup.add(browMesh);

      head.add(browGroup);
      if (isL) leftEyebrow = browGroup;
      else rightEyebrow = browGroup;
    };

    buildEyebrow(true);
    buildEyebrow(false);

    // -----------------------------------------------------------------------
    // 4. 3D SCULPTED NOSE (Nasal bridge & bulbous rounded tip)
    // -----------------------------------------------------------------------
    const noseGroup = new THREE.Group();
    noseGroup.position.set(0, 0.005, 0.252);

    // Nose Bridge
    const bridgeGeo = new THREE.CylinderGeometry(0.012, 0.018, 0.05, 12);
    const bridgeMesh = new THREE.Mesh(bridgeGeo, skinMat);
    bridgeMesh.position.set(0, 0.02, 0.005);
    noseGroup.add(bridgeMesh);

    // Rounded Nose Tip
    const tipGeo = new THREE.SphereGeometry(0.022, 16, 14);
    tipGeo.scale(1.1, 0.85, 1.2);
    const tipMesh = new THREE.Mesh(tipGeo, skinMat);
    tipMesh.castShadow = true;
    noseGroup.add(tipMesh);

    head.add(noseGroup);
    noseMesh = tipMesh;

    // -----------------------------------------------------------------------
    // 5. 3D SCULPTED MOUTH & LIPS
    // -----------------------------------------------------------------------
    mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.082, 0.245);

    // Upper Lip (Curved arc with Cupid's bow contour)
    const upperLipGeo = new THREE.TorusGeometry(0.038, 0.009, 10, 20, Math.PI * 0.75);
    upperLipGeo.rotateZ(Math.PI * 1.12);
    const upperLip = new THREE.Mesh(upperLipGeo, mouthMat);
    mouthGroup.add(upperLip);

    // Lower Lip (Fuller rounded volume)
    const lowerLipGeo = new THREE.SphereGeometry(0.024, 16, 12);
    lowerLipGeo.scale(1.5, 0.5, 0.6);
    const lowerLip = new THREE.Mesh(lowerLipGeo, mouthMat);
    lowerLip.position.set(0, -0.014, 0.004);
    mouthGroup.add(lowerLip);

    // Inner Smile Aperture & Teeth shine
    const smileBackdrop = new THREE.Mesh(
      new THREE.SphereGeometry(0.026, 14, 10),
      innerMouthMat
    );
    smileBackdrop.scale.set(1.4, 0.6, 0.3);
    smileBackdrop.position.set(0, -0.006, -0.006);
    mouthGroup.add(smileBackdrop);

    const teethBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.042, 0.008, 0.01),
      teethMat
    );
    teethBar.position.set(0, 0.002, 0.002);
    mouthGroup.add(teethBar);

    head.add(mouthGroup);
    smileMesh = upperLip;

    // -----------------------------------------------------------------------
    // 6. 3D SCULPTED EARS (Helix, lobe and ear canal)
    // -----------------------------------------------------------------------
    const buildEar = (isL: boolean) => {
      const earGroup = new THREE.Group();
      earGroup.position.set(isL ? -0.265 : 0.265, 0.01, 0.02);
      earGroup.rotation.y = isL ? -0.15 : 0.15;

      // Outer Helix Rim
      const helix = new THREE.Mesh(
        new THREE.TorusGeometry(0.045, 0.012, 10, 18, Math.PI * 1.3),
        skinMat
      );
      helix.rotation.z = isL ? -0.4 : 0.4;
      earGroup.add(helix);

      // Ear Lobe
      const lobe = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 12, 12),
        skinMat
      );
      lobe.scale.set(0.6, 1.2, 0.8);
      lobe.position.set(0, -0.038, 0);
      earGroup.add(lobe);

      head.add(earGroup);
    };

    buildEar(true);
    buildEar(false);

    // -----------------------------------------------------------------------
    // 7. 3D VOLUMETRIC CHEEKS & BLUSH
    // -----------------------------------------------------------------------
    cheeksGroup = new THREE.Group();
    head.add(cheeksGroup);

    const blushTexture = createProceduralBlushTexture(
      characterType === 'girl' ? '#ef4444' : '#f87171'
    );
    const blushMat = new THREE.MeshBasicMaterial({
      map: blushTexture,
      transparent: true,
      opacity: characterType === 'girl' ? 0.95 : 0.55,
      depthWrite: false,
    });

    [-0.145, 0.145].forEach((cheekX) => {
      const blushPlane = new THREE.Mesh(
        new THREE.CircleGeometry(characterType === 'girl' ? 0.038 : 0.028, 20),
        blushMat
      );
      blushPlane.position.set(cheekX, -0.035, 0.23);
      cheeksGroup?.add(blushPlane);
    });

    // -----------------------------------------------------------------------
    // 8. 3D VOLUMETRIC HAIRSTYLES (Layered strands, bangs, buns, spikes)
    // -----------------------------------------------------------------------
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.274, 28, 22, 0, Math.PI * 2, 0, Math.PI * 0.62),
      hairMat
    );
    hairCap.rotation.x = -0.18;
    hairCap.castShadow = true;
    hairGroup.add(hairCap);

    if (hairstyleId.startsWith('boy') || (characterType === 'boy' && !hairstyleId.startsWith('girl'))) {
      if (hairstyleId === 'boy_spiky') {
        // Hero Spikes: 9 distinct conical locks pointing upward with volume
        const spikeData = [
          { x: -0.16, y: 0.22, z: 0.14, rx: 0.45, rz: 0.35, s: 0.13 },
          { x: -0.1, y: 0.27, z: 0.18, rx: 0.5, rz: 0.2, s: 0.15 },
          { x: -0.04, y: 0.3, z: 0.2, rx: 0.55, rz: 0.08, s: 0.16 },
          { x: 0.03, y: 0.3, z: 0.2, rx: 0.55, rz: -0.06, s: 0.16 },
          { x: 0.1, y: 0.27, z: 0.18, rx: 0.5, rz: -0.18, s: 0.15 },
          { x: 0.16, y: 0.22, z: 0.14, rx: 0.45, rz: -0.32, s: 0.13 },
          // Crown spikes
          { x: 0.0, y: 0.36, z: 0.0, rx: 0.0, rz: 0.0, s: 0.17 },
          { x: -0.09, y: 0.34, z: -0.08, rx: -0.2, rz: 0.2, s: 0.14 },
          { x: 0.09, y: 0.34, z: -0.08, rx: -0.2, rz: -0.2, s: 0.14 },
        ];
        spikeData.forEach((sp) => {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.045, sp.s * 1.6, 8), hairMat);
          spike.position.set(sp.x, sp.y, sp.z);
          spike.rotation.set(sp.rx, 0, sp.rz);
          spike.castShadow = true;
          hairGroup.add(spike);
        });
      } else if (hairstyleId === 'boy_messy') {
        // Wavy Explorer Hair: layered curved tufts with natural variation
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 1.8 - Math.PI * 0.9;
          const tuft = new THREE.Mesh(
            new THREE.SphereGeometry(0.075, 12, 10),
            hairMat
          );
          tuft.scale.set(0.9, 1.4, 0.8);
          tuft.position.set(
            Math.sin(angle) * 0.21,
            0.2 + (i % 3) * 0.04,
            Math.cos(angle) * 0.18 + 0.04
          );
          tuft.rotation.set(0.3, angle, 0.2);
          tuft.castShadow = true;
          hairGroup.add(tuft);
        }
      } else if (hairstyleId === 'boy_sidepart') {
        // Sleek side part with combed locks
        const sideVolume = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 20, 16),
          hairMat
        );
        sideVolume.scale.set(1.05, 0.85, 1.05);
        sideVolume.position.set(0.04, 0.16, 0.02);
        hairGroup.add(sideVolume);
      } else {
        // Default boy_sport: matching Reference Image 1 with spiky fringe and sideburns
        const fringePositions = [
          { x: -0.15, y: 0.22, z: 0.15, rx: 0.45, rz: 0.35, s: 0.1 },
          { x: -0.09, y: 0.26, z: 0.18, rx: 0.5, rz: 0.2, s: 0.11 },
          { x: -0.03, y: 0.28, z: 0.2, rx: 0.55, rz: 0.08, s: 0.12 },
          { x: 0.04, y: 0.28, z: 0.2, rx: 0.55, rz: -0.06, s: 0.12 },
          { x: 0.1, y: 0.26, z: 0.18, rx: 0.5, rz: -0.18, s: 0.11 },
          { x: 0.15, y: 0.22, z: 0.15, rx: 0.45, rz: -0.32, s: 0.1 },
          { x: 0.0, y: 0.34, z: 0.02, rx: 0.0, rz: 0.0, s: 0.13 },
        ];
        fringePositions.forEach((sp) => {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.042, sp.s * 1.5, 7), hairMat);
          spike.position.set(sp.x, sp.y, sp.z);
          spike.rotation.set(sp.rx, 0, sp.rz);
          spike.castShadow = true;
          hairGroup.add(spike);
        });
      }
    } else {
      // GIRL HAIRSTYLES
      if (hairstyleId === 'girl_buns' || hairstyleId === 'girl_twintails') {
        // Double Space Buns / Ponytails with volumetric locks
        [-0.19, 0.19].forEach((bunX, idx) => {
          const bunMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.105, 22, 22),
            hairMat
          );
          bunMesh.position.set(bunX, 0.23, 0.01);
          bunMesh.castShadow = true;
          hairGroup.add(bunMesh);

          // Decorative Ribbon Ties on Space Buns
          const ribbon = new THREE.Mesh(
            new THREE.TorusGeometry(0.075, 0.016, 8, 24),
            createPbrMat(0x06b6d4, 0.35, 0.2, 0x06b6d4, 0.3)
          );
          ribbon.position.set(bunX, 0.17, 0.01);
          ribbon.rotation.x = Math.PI / 2;
          hairGroup.add(ribbon);

          // Flowing locks if twintails
          if (hairstyleId === 'girl_twintails') {
            const tailGeo = new THREE.CylinderGeometry(0.045, 0.02, 0.34, 16);
            tailGeo.scale(1, 1, 0.6);
            const tail = new THREE.Mesh(tailGeo, hairMat);
            tail.position.set(bunX * 1.25, 0.02, -0.04);
            tail.rotation.z = idx === 0 ? 0.35 : -0.35;
            tail.rotation.x = 0.2;
            tail.castShadow = true;
            hairGroup.add(tail);
          }
        });

        // Turquoise / Cyan Front Headband (matching Reference Image 2)
        const headband = new THREE.Mesh(
          new THREE.TorusGeometry(0.272, 0.024, 12, 32),
          createPbrMat(0x06b6d4, 0.3, 0.2, 0x06b6d4, 0.3)
        );
        headband.position.set(0, 0.14, 0.02);
        headband.rotation.x = -0.2;
        hairGroup.add(headband);
      } else if (hairstyleId === 'girl_bob') {
        // Melena Bob
        const bobMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.285, 24, 20),
          hairMat
        );
        bobMesh.scale.set(1.08, 0.95, 1.05);
        bobMesh.position.set(0, 0.04, -0.02);
        hairGroup.add(bobMesh);
      } else {
        // Long Waves
        for (let w = 0; w < 8; w++) {
          const waveAngle = (w / 8) * Math.PI - Math.PI * 0.5;
          const wave = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.02, 0.42, 12),
            hairMat
          );
          wave.position.set(Math.sin(waveAngle) * 0.24, -0.06, Math.cos(waveAngle) * 0.2 - 0.05);
          wave.rotation.z = Math.sin(waveAngle) * 0.3;
          wave.castShadow = true;
          hairGroup.add(wave);
        }
      }
    }

    // -----------------------------------------------------------------------
    // 9. 3D VOLUMETRIC TORSO & OUTFITS
    // -----------------------------------------------------------------------
    // Sculpted Cylindrical Torso with Waist Contour
    const torsoMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.2, 0.48, 28),
      shirtMat
    );
    torsoMesh.castShadow = true;
    torso.add(torsoMesh);

    // Specific Outfits
    if (outfitId === 'sport' && characterType === 'boy') {
      // White rectangular badge/chest patch (Iconic to Reference Image 1)
      const chestPatch = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.24, 0.025),
        whiteMat
      );
      chestPatch.position.set(0, 0.03, 0.21);
      chestPatch.castShadow = true;
      torso.add(chestPatch);
    } else if (outfitId === 'explorer') {
      // Safari Utility Vest with pockets & collar
      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.16, 0.025, 10, 24, Math.PI),
        createPbrMat(0x854d0e, 0.5, 0.05)
      );
      collar.rotation.x = -Math.PI * 0.5;
      collar.position.set(0, 0.24, 0.02);
      torso.add(collar);

      [-0.09, 0.09].forEach((pocketX) => {
        const pocket = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.09, 0.03),
          createPbrMat(0xa16207, 0.5, 0.05)
        );
        pocket.position.set(pocketX, 0.04, 0.215);
        torso.add(pocket);
      });
    } else if (outfitId === 'futuristic') {
      // Sci-Fi Quantum Cyber Armor with Glowing Plasma Core
      const chestPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.32, 0.04),
        createPbrMat(0x1e293b, 0.2, 0.8)
      );
      chestPlate.position.set(0, 0.04, 0.21);
      torso.add(chestPlate);

      const core = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.075, 0.02, 24),
        cyanGlowMat
      );
      core.rotation.x = Math.PI / 2;
      core.position.set(0, 0.04, 0.235);
      torso.add(core);
      glowMesh = core;
    }

    // Belt with 3D Metallic Buckle
    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.21, 0.045, 24),
      createPbrMat(0x18181b, 0.5, 0.1)
    );
    belt.position.set(0, -0.22, 0);
    torso.add(belt);

    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.05, 0.02),
      goldMetalMat
    );
    buckle.position.set(0, -0.22, 0.215);
    torso.add(buckle);

    // -----------------------------------------------------------------------
    // 10. 3D ARMS & HANDS (Palm + Thumb + 4 Articulated Fingers)
    // -----------------------------------------------------------------------
    const buildHumanArm = (isL: boolean) => {
      const armGroup = isL ? leftArm : rightArm;
      const forearmGroup = isL ? leftForearm : rightForearm;
      const handGroup = isL ? leftHand : rightHand;

      // Upper arm
      const upperMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.062, 0.22, 18),
        shirtMat
      );
      upperMesh.position.y = -0.11;
      upperMesh.castShadow = true;
      armGroup.add(upperMesh);

      // Forearm
      const lowerMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.062, 0.058, 0.22, 18),
        characterType === 'boy' ? shirtMat : skinMat
      );
      lowerMesh.position.y = -0.11;
      lowerMesh.castShadow = true;
      forearmGroup.add(lowerMesh);

      // Wrist Cuff
      const cuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.066, 0.066, 0.04, 18),
        characterType === 'boy' ? whiteMat : skinMat
      );
      cuff.position.y = -0.21;
      forearmGroup.add(cuff);

      // 3D Volumetric Hand (Palm + Thumb + 4 Fingers!)
      const palm = new THREE.Mesh(
        new THREE.BoxGeometry(0.065, 0.07, 0.045),
        skinMat
      );
      palm.position.y = -0.035;
      palm.castShadow = true;
      handGroup.add(palm);

      // Thumb
      const thumb = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.014, 0.04, 10),
        skinMat
      );
      thumb.position.set(isL ? 0.036 : -0.036, -0.02, 0.015);
      thumb.rotation.z = isL ? -0.5 : 0.5;
      thumb.rotation.x = 0.3;
      handGroup.add(thumb);

      // 4 Fingers
      for (let f = 0; f < 4; f++) {
        const finger = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.011, 0.048, 8),
          skinMat
        );
        finger.position.set((f - 1.5) * 0.017, -0.08, 0);
        handGroup.add(finger);
      }
    };

    buildHumanArm(true);
    buildHumanArm(false);

    // -----------------------------------------------------------------------
    // 11. 3D LEGS & VOLUMETRIC SHOES (Soles, Laces, Tongue, Toe Cap)
    // -----------------------------------------------------------------------
    const buildHumanLeg = (isL: boolean) => {
      const legGroup = isL ? leftLeg : rightLeg;
      const kneeGroup = isL ? leftKnee : rightKnee;
      const footGroup = isL ? leftFoot : rightFoot;

      // Thigh
      const thighMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.07, 0.28, 18),
        pantsMat
      );
      thighMesh.position.y = -0.14;
      thighMesh.castShadow = true;
      legGroup.add(thighMesh);

      // Shin
      const shinMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.065, 0.28, 18),
        pantsMat
      );
      shinMesh.position.y = -0.14;
      shinMesh.castShadow = true;
      kneeGroup.add(shinMesh);

      // 3D Sneaker / Boot Architecture
      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(0, -0.04, 0.04);

      if (shoesId === 'shoes_boots') {
        // Lug-soled explorer boot
        const sole = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.04, 0.26),
          createPbrMat(0x18181b, 0.7, 0.1)
        );
        sole.position.set(0, -0.02, 0.02);
        shoeGroup.add(sole);

        const bootBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.12, 0.24),
          createPbrMat(0x78350f, 0.5, 0.05)
        );
        bootBody.position.set(0, 0.04, 0.01);
        bootBody.castShadow = true;
        shoeGroup.add(bootBody);
      } else {
        // Athletic Sneaker with white sole, tongue and laces (matching Reference Images 1 & 2)
        const sole = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, 0.038, 0.25),
          shoesMat
        );
        sole.position.set(0, -0.019, 0.02);
        sole.castShadow = true;
        shoeGroup.add(sole);

        const shoeBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.09, 0.22),
          shoesMat
        );
        shoeBody.position.set(0, 0.035, 0.015);
        shoeBody.castShadow = true;
        shoeGroup.add(shoeBody);

        // Toe Cap bumper
        const toeBumper = new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
          shoesMat
        );
        toeBumper.scale.set(1.05, 0.5, 1.1);
        toeBumper.position.set(0, 0.015, 0.1);
        shoeGroup.add(toeBumper);

        // Laces bar accents
        for (let l = 0; l < 3; l++) {
          const lace = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.012, 0.018),
            createPbrMat(0x0284c7, 0.3, 0.0)
          );
          lace.position.set(0, 0.085, 0.02 + l * 0.035);
          shoeGroup.add(lace);
        }
      }

      footGroup.add(shoeGroup);
    };

    buildHumanLeg(true);
    buildHumanLeg(false);
  }

  // =========================================================================
  // CHARACTER 3: ROBOT CHISTERA (Polished Chasis, Victorian Top Hat, Glowing Eyes)
  // Matching Reference Image 3: /public/assets/aistudio/image_2afa485a.png
  // =========================================================================
  else {
    // 1. Dark Navy Metallic Box Head
    const headBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.38, 0.36),
      darkNavyMat
    );
    headBox.castShadow = true;
    head.add(headBox);

    // 2. Victorian Top Hat with Silk Ribbon
    const hatGroup = new THREE.Group();
    hatGroup.position.set(0, 0.22, 0);

    const hatBrim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.36, 0.024, 24),
      createPbrMat(0x09090b, 0.4, 0.1)
    );
    hatBrim.castShadow = true;
    hatGroup.add(hatBrim);

    const hatCrown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.24, 0.34, 24),
      createPbrMat(0x09090b, 0.4, 0.1)
    );
    hatCrown.position.y = 0.17;
    hatCrown.castShadow = true;
    hatGroup.add(hatCrown);

    const hatBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.242, 0.242, 0.05, 24),
      createPbrMat(0x92400e, 0.5, 0.1) // Brown ribbon matching image 3
    );
    hatBand.position.y = 0.04;
    hatGroup.add(hatBand);

    hairGroup.add(hatGroup);

    // 3. Glowing Circular Cyan Eyes
    [-0.11, 0.11].forEach((eyeX, idx) => {
      const eyeMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.065, 0.02, 20),
        cyanGlowMat
      );
      eyeMesh.rotation.x = Math.PI / 2;
      eyeMesh.position.set(eyeX, 0.04, 0.185);
      head.add(eyeMesh);

      // Upper eyelid shutter for robot
      const shutter = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.06, 0.025),
        darkNavyMat
      );
      shutter.position.set(eyeX, 0.08, 0.19);
      shutter.scale.y = 0.01;
      head.add(shutter);
      if (idx === 0) leftUpperLid = shutter;
      else rightUpperLid = shutter;
    });

    // 4. Side Bolt Ears (Silver Cylinders)
    [-0.24, 0.24].forEach((earX) => {
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.08, 16),
        silverMetalMat
      );
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(earX, 0, 0);
      head.add(bolt);
    });

    // 5. Dark Navy Box Torso with Gap
    const torsoBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.44, 0.34),
      darkNavyMat
    );
    torsoBox.castShadow = true;
    torso.add(torsoBox);

    // 6. Glowing Cyan Circular Chest Power Core
    const coreMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.02, 24),
      cyanGlowMat
    );
    coreMesh.rotation.x = Math.PI / 2;
    coreMesh.position.set(0, 0.02, 0.175);
    torso.add(coreMesh);
    glowMesh = coreMesh;

    // 7. Cylindrical Arms with Silver Ring Cuffs
    const buildRobotArm = (isL: boolean) => {
      const armGroup = isL ? leftArm : rightArm;
      const forearmGroup = isL ? leftForearm : rightForearm;
      const handGroup = isL ? leftHand : rightHand;

      const armMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.22, 16),
        darkNavyMat
      );
      armMesh.position.y = -0.11;
      armMesh.castShadow = true;
      armGroup.add(armMesh);

      const foreMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.058, 0.22, 16),
        darkNavyMat
      );
      foreMesh.position.y = -0.11;
      foreMesh.castShadow = true;
      forearmGroup.add(foreMesh);

      // Silver Ring Cuff at wrist (Iconic to Reference Image 3)
      const cuff = new THREE.Mesh(
        new THREE.TorusGeometry(0.065, 0.014, 8, 20),
        silverMetalMat
      );
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -0.21;
      forearmGroup.add(cuff);

      // Metal Claws / Robot Fingers
      const palm = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.05, 0.04),
        silverMetalMat
      );
      palm.position.y = -0.03;
      handGroup.add(palm);

      [-0.02, 0.02].forEach((clawX) => {
        const claw = new THREE.Mesh(
          new THREE.BoxGeometry(0.015, 0.045, 0.02),
          silverMetalMat
        );
        claw.position.set(clawX, -0.06, 0);
        handGroup.add(claw);
      });
    };

    buildRobotArm(true);
    buildRobotArm(false);

    // 8. Legs with Blue Block Shoes (Iconic to Reference Image 3)
    const buildRobotLeg = (isL: boolean) => {
      const legGroup = isL ? leftLeg : rightLeg;
      const kneeGroup = isL ? leftKnee : rightKnee;
      const footGroup = isL ? leftFoot : rightFoot;

      const thigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.068, 0.068, 0.28, 16),
        createPbrMat(0x090d16, 0.5, 0.2) // Black legs
      );
      thigh.position.y = -0.14;
      thigh.castShadow = true;
      legGroup.add(thigh);

      const shin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.068, 0.068, 0.28, 16),
        createPbrMat(0x090d16, 0.5, 0.2)
      );
      shin.position.y = -0.14;
      shin.castShadow = true;
      kneeGroup.add(shin);

      // Blue Block Shoe
      const shoe = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.09, 0.22),
        createPbrMat(shoesColor || 0x1d4ed8, 0.4, 0.3)
      );
      shoe.position.set(0, -0.04, 0.04);
      shoe.castShadow = true;
      footGroup.add(shoe);
    };

    buildRobotLeg(true);
    buildRobotLeg(false);
  }

  // =========================================================================
  // ACCESSORIES (Glasses, Headphones, Cap, Backpack, Cape, Medal)
  // =========================================================================
  if (accessoryId === 'acc_goggles') {
    // 3D Circular Scientist Glasses
    const glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.045, 0.245);

    [-0.092, 0.092].forEach((gx) => {
      const frame = new THREE.Mesh(
        new THREE.TorusGeometry(0.048, 0.007, 10, 24),
        goldMetalMat
      );
      frame.position.x = gx;
      glassesGroup.add(frame);

      const lens = new THREE.Mesh(
        new THREE.CircleGeometry(0.046, 20),
        new THREE.MeshPhysicalMaterial({
          color: 0x93c5fd,
          transmission: 0.85,
          opacity: 0.9,
          transparent: true,
          roughness: 0.05,
          ior: 1.5,
        })
      );
      lens.position.set(gx, 0, 0.002);
      glassesGroup.add(lens);
    });

    // Nose Bridge
    const bridge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.06, 8),
      goldMetalMat
    );
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0, 0.01);
    glassesGroup.add(bridge);

    head.add(glassesGroup);
  } else if (accessoryId === 'acc_cap') {
    // Baseball Sports Cap
    const cap = new THREE.Group();
    cap.position.set(0, 0.22, 0.02);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.275, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      createPbrMat(suitColor, 0.5, 0.05)
    );
    cap.add(dome);

    const visor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.015, 20, 1, false, 0, Math.PI * 0.7),
      createPbrMat(0x0f172a, 0.4, 0.05)
    );
    visor.rotation.x = 0.2;
    visor.position.set(0, -0.01, 0.1);
    cap.add(visor);

    head.add(cap);
  } else if (accessoryId === 'acc_backpack') {
    // Explorer Backpack with Straps on back
    const backpack = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.32, 0.16),
      createPbrMat(0xb45309, 0.6, 0.05)
    );
    backpack.position.set(0, 0.02, -0.21);
    backpack.castShadow = true;
    torso.add(backpack);
  }

  // =========================================================================
  // SPECIAL UNLOCKABLES (Star Crown, Cosmic Halo, Legend Cape)
  // =========================================================================
  if (specialUnlockableId === 'unlockable_crown') {
    const crown = new THREE.Group();
    crown.position.set(0, 0.36, 0);

    const baseRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.02, 10, 24),
      goldMetalMat
    );
    baseRing.rotation.x = Math.PI / 2;
    crown.add(baseRing);

    for (let c = 0; c < 5; c++) {
      const angle = (c / 5) * Math.PI * 2;
      const point = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.1, 6),
        goldMetalMat
      );
      point.position.set(Math.cos(angle) * 0.18, 0.05, Math.sin(angle) * 0.18);
      crown.add(point);
    }
    head.add(crown);
  } else if (specialUnlockableId === 'unlockable_halo') {
    haloGroup = new THREE.Group();
    haloGroup.position.set(0, 0.42, 0);

    const haloRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.018, 12, 32),
      createPbrMat(0xfef08a, 0.1, 0.1, 0xfacc15, 2.5)
    );
    haloRing.rotation.x = Math.PI / 2;
    haloGroup.add(haloRing);
    head.add(haloGroup);
  }

  // =========================================================================
  // KINEMATIC CONTROLLERS (BLINK, EXPRESSIONS & UNIFIED ANIMATION ENGINE)
  // =========================================================================
  const setBlink = (amount: number) => {
    const clamped = Math.max(0, Math.min(1, amount));
    if (characterType !== 'robot') {
      const targetAngle = -Math.PI * 0.48 + clamped * Math.PI * 0.48;
      if (leftUpperLid) leftUpperLid.rotation.x = targetAngle;
      if (rightUpperLid) rightUpperLid.rotation.x = targetAngle;
      if (leftLowerLid) leftLowerLid.rotation.x = Math.PI * 0.38 - clamped * 0.2;
      if (rightLowerLid) rightLowerLid.rotation.x = Math.PI * 0.38 - clamped * 0.2;
    } else {
      if (leftUpperLid) leftUpperLid.scale.y = Math.max(0.01, clamped * 1.8);
      if (rightUpperLid) rightUpperLid.scale.y = Math.max(0.01, clamped * 1.8);
    }
  };

  const setExpression = (expr: 'happy' | 'thinking' | 'victory' | 'curious' | 'wink') => {
    if (expr === 'wink') {
      if (rightUpperLid) rightUpperLid.rotation.x = 0;
      if (leftUpperLid) leftUpperLid.rotation.x = -Math.PI * 0.48;
      if (rightEyebrow) rightEyebrow.rotation.z = -0.15;
      if (leftEyebrow) leftEyebrow.rotation.z = 0.1;
    } else if (expr === 'thinking') {
      if (leftUpperLid) leftUpperLid.rotation.x = -Math.PI * 0.32;
      if (rightUpperLid) rightUpperLid.rotation.x = -Math.PI * 0.32;
      if (leftEyebrow) leftEyebrow.rotation.z = 0.25;
      if (rightEyebrow) rightEyebrow.rotation.z = -0.1;
      if (mouthGroup) mouthGroup.position.y = -0.075;
    } else if (expr === 'victory') {
      if (leftUpperLid) leftUpperLid.rotation.x = -Math.PI * 0.48;
      if (rightUpperLid) rightUpperLid.rotation.x = -Math.PI * 0.48;
      if (leftEyebrow) leftEyebrow.position.y = 0.125;
      if (rightEyebrow) rightEyebrow.position.y = 0.125;
      if (mouthGroup) mouthGroup.scale.set(1.2, 1.2, 1.0);
    } else if (expr === 'curious') {
      if (leftEyebrow) leftEyebrow.position.y = 0.13;
      if (rightEyebrow) rightEyebrow.position.y = 0.095;
      if (leftUpperLid) leftUpperLid.rotation.x = -Math.PI * 0.48;
      if (rightUpperLid) rightUpperLid.rotation.x = -Math.PI * 0.44;
    } else {
      // happy
      if (leftUpperLid) leftUpperLid.rotation.x = -Math.PI * 0.48;
      if (rightUpperLid) rightUpperLid.rotation.x = -Math.PI * 0.48;
      if (leftEyebrow) leftEyebrow.rotation.z = 0;
      if (rightEyebrow) rightEyebrow.rotation.z = 0;
      if (mouthGroup) mouthGroup.scale.set(1.0, 1.0, 1.0);
    }
  };

  setExpression(initialExpression);

  // Unified State Machine Animation Updater
  const updateAnimation = (
    delta: number,
    elapsed: number,
    state: CharacterAnimationState,
    lookTarget?: { x: number; y: number }
  ) => {
    // 1. Natural Breathing & Pulsing (Runs universally)
    const breathRate = 2.4;
    const breathCycle = Math.sin(elapsed * breathRate);
    const chestExpansion = 1.0 + breathCycle * 0.025;
    torso.scale.set(chestExpansion, 1.0 + breathCycle * 0.012, chestExpansion);

    if (glowMesh) {
      const pulse = 1.2 + Math.sin(elapsed * 4.5) * 0.5;
      (glowMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }

    if (haloGroup) {
      haloGroup.rotation.y = elapsed * 1.5;
      haloGroup.position.y = 0.42 + Math.sin(elapsed * 2) * 0.025;
    }

    // 2. Head Tracking towards user lookTarget / mouse
    if (lookTarget) {
      const targetYaw = THREE.MathUtils.clamp(lookTarget.x * 0.55, -0.6, 0.6);
      const targetPitch = THREE.MathUtils.clamp(-lookTarget.y * 0.45, -0.4, 0.4);
      head.rotation.y = THREE.MathUtils.damp(head.rotation.y, targetYaw, 6, delta);
      head.rotation.x = THREE.MathUtils.damp(head.rotation.x, targetPitch, 6, delta);
    }

    // 3. Periodic Natural Eye Blinking
    const blinkCycle = elapsed % 3.6;
    if (blinkCycle < 0.16) {
      const blinkAmt = Math.sin((blinkCycle / 0.16) * Math.PI);
      setBlink(blinkAmt);
    } else {
      setBlink(0);
    }

    // 4. ANIMATION STATES
    if (state === 'idle') {
      root.position.y = breathCycle * 0.015;
      pelvis.rotation.set(0, 0, 0);
      torso.rotation.set(0, 0, 0);

      // Relaxed Arm drape with micro-sways
      rightArm.rotation.set(
        Math.sin(elapsed * 1.5) * 0.03,
        0,
        -0.18 + Math.sin(elapsed * 2.0) * 0.03
      );
      leftArm.rotation.set(
        -Math.sin(elapsed * 1.5) * 0.03,
        0,
        0.18 - Math.sin(elapsed * 2.0) * 0.03
      );

      rightForearm.rotation.set(0.18, 0, 0);
      leftForearm.rotation.set(0.18, 0, 0);

      leftLeg.rotation.set(0, 0, 0);
      rightLeg.rotation.set(0, 0, 0);
      leftKnee.rotation.set(0, 0, 0);
      rightKnee.rotation.set(0, 0, 0);
    } else if (state === 'breathe') {
      // Pronounced Deep Breathing Exercise
      const deepBreath = Math.sin(elapsed * 1.8);
      root.position.y = deepBreath * 0.035;
      torso.scale.set(1.0 + deepBreath * 0.055, 1.0 + deepBreath * 0.03, 1.0 + deepBreath * 0.055);
      head.rotation.x = -deepBreath * 0.06;
      rightArm.rotation.z = -0.25 - deepBreath * 0.08;
      leftArm.rotation.z = 0.25 + deepBreath * 0.08;
    } else if (state === 'lookAround') {
      // Curious Inquisitive Head Inspection
      const lookTime = elapsed * 1.8;
      head.rotation.y = Math.sin(lookTime) * 0.45;
      head.rotation.z = Math.cos(lookTime * 0.5) * 0.12;
      head.rotation.x = -Math.abs(Math.sin(lookTime * 0.5)) * 0.15;
    } else if (state === 'wave') {
      // Warm, Friendly Hand Wave
      root.position.y = breathCycle * 0.015;
      rightArm.rotation.z = -2.25;
      rightArm.rotation.x = 0.12;
      rightForearm.rotation.z = Math.sin(elapsed * 8.5) * 0.5;
      rightForearm.rotation.x = 0.15;

      leftArm.rotation.z = 0.18;
      head.rotation.y = -0.18;
      head.rotation.z = -0.06;
      setExpression('happy');
    } else if (state === 'walk') {
      // Kinematic Walk Cycle (1.8 Hz strides)
      const walkPhase = elapsed * 5.8;
      const legStride = 0.52;

      // Vertical body bounce & hip sway
      root.position.y = Math.abs(Math.sin(walkPhase)) * 0.045;
      pelvis.rotation.y = Math.sin(walkPhase) * 0.1;
      torso.rotation.y = -Math.sin(walkPhase) * 0.08;

      // Alternating Legs
      leftLeg.rotation.x = Math.sin(walkPhase) * legStride;
      rightLeg.rotation.x = -Math.sin(walkPhase) * legStride;

      // Knees bend naturally on backward swing
      leftKnee.rotation.x = Math.max(0, -Math.sin(walkPhase + 0.3) * 0.65);
      rightKnee.rotation.x = Math.max(0, Math.sin(walkPhase + 0.3) * 0.65);

      // Opposite Arms Swing
      leftArm.rotation.x = -Math.sin(walkPhase) * 0.42;
      rightArm.rotation.x = Math.sin(walkPhase) * 0.42;
      leftArm.rotation.z = 0.18;
      rightArm.rotation.z = -0.18;
      leftForearm.rotation.x = 0.25;
      rightForearm.rotation.x = 0.25;
    } else if (state === 'celebrate') {
      // Joyous Jump & Arms Raised in Triumph
      const jumpCycle = (elapsed * 2.8) % (Math.PI * 2);
      const isAirborne = Math.sin(jumpCycle) > 0;
      const jumpHeight = isAirborne ? Math.sin(jumpCycle) * 0.38 : 0;

      root.position.y = jumpHeight;

      if (isAirborne) {
        // Arms high in victory V-shape
        rightArm.rotation.z = -2.55;
        leftArm.rotation.z = 2.55;
        rightArm.rotation.x = 0.1;
        leftArm.rotation.x = 0.1;

        // Knees tucked
        leftLeg.rotation.x = -0.3;
        rightLeg.rotation.x = -0.3;
        leftKnee.rotation.x = 0.4;
        rightKnee.rotation.x = 0.4;

        setExpression('victory');
      } else {
        // Landing squish
        rightArm.rotation.z = -1.8;
        leftArm.rotation.z = 1.8;
        leftLeg.rotation.x = 0.1;
        rightLeg.rotation.x = 0.1;
      }
    } else if (state === 'concentrate') {
      // Thoughtful Thinking Stance (Hand to Chin)
      rightArm.rotation.z = -1.9;
      rightArm.rotation.x = 0.45;
      rightForearm.rotation.x = 1.25;
      rightForearm.rotation.z = -0.4;

      leftArm.rotation.z = 1.25;
      leftArm.rotation.x = 0.25;
      leftForearm.rotation.x = 0.8;
      leftForearm.rotation.z = 0.4;

      head.rotation.y = 0.22;
      head.rotation.z = 0.12;
      head.rotation.x = Math.sin(elapsed * 1.5) * 0.04 - 0.05;

      setExpression('thinking');
    } else if (state === 'achievement') {
      // Superhero Level-Up Pose (Fist Raised High, Chest Out)
      torso.scale.set(1.08, 1.05, 1.08);
      root.position.y = 0.04;

      // Right fist straight to the sky
      rightArm.rotation.z = -2.85;
      rightArm.rotation.x = 0.05;
      rightForearm.rotation.x = 0;

      // Left hand firmly resting on hip
      leftArm.rotation.z = 0.85;
      leftArm.rotation.x = -0.35;
      leftForearm.rotation.x = 0.85;
      leftForearm.rotation.z = 0.45;

      head.rotation.x = -0.15;
      head.rotation.y = Math.sin(elapsed * 1.2) * 0.1;
      setExpression('victory');
    }
  };

  return {
    root,
    pelvis,
    torso,
    chest,
    neck,
    head,
    leftShoulder,
    rightShoulder,
    leftArm,
    rightArm,
    leftForearm,
    rightForearm,
    leftHand,
    rightHand,
    leftLeg,
    rightLeg,
    leftKnee,
    rightKnee,
    leftFoot,
    rightFoot,
    leftUpperLid,
    rightUpperLid,
    leftLowerLid,
    rightLowerLid,
    leftEyebrow,
    rightEyebrow,
    noseMesh,
    mouthGroup,
    smileMesh,
    cheeksGroup,
    hairGroup,
    clothingGroup,
    accessoriesGroup,
    specialUnlockableGroup,
    glowMesh,
    haloGroup,
    capeMesh,
    characterType,
    outfitId,
    hairstyleId,
    hairColor,
    skinColor,
    eyeColor,
    suitColor,
    pantsColor,
    shoesColor,
    shoesId,
    setBlink,
    setExpression,
    updateAnimation,
  };
}
