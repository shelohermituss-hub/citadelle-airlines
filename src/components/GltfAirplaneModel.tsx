import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { AircraftCode } from '@/data/fleet';

interface ModelConfig {
  path: string;
  /** Retint light "paint" surfaces to the Citadelle cream tone. Off for models kept as-provided. */
  retint: boolean;
  /** Material names to hide entirely (e.g. a manufacturer wordmark modeled as its own geometry). */
  hideMaterials?: string[];
}

/** See public/models/CREDITS.md for source/license per model. */
const MODELS: Partial<Record<AircraftCode, ModelConfig>> = {
  '320': { path: '/models/320/scene.gltf', retint: false, hideMaterials: ['Airbus_logo_material', 'NEO_material'] },
  '321': { path: '/models/321/scene.gltf', retint: false },
  '738': { path: '/models/738/scene.glb', retint: false },
  '789': { path: '/models/789/scene.gltf', retint: true },
  '330': { path: '/models/330/scene.gltf', retint: true },
  '350': { path: '/models/350/scene.glb', retint: true },
};

export function hasGltfModel(code: AircraftCode): boolean {
  return code in MODELS;
}

const CREAM = '#F7F6F3';

function recolorToLivery(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const mat of mats) {
      if (!(mat instanceof THREE.MeshStandardMaterial)) continue;
      const c = mat.color;
      const luminance = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
      // Only retint surfaces that are already light (fuselage/wing paint) —
      // leaves tires, windows, and dark engine parts untouched.
      if (luminance > 0.5) {
        mat.color = new THREE.Color(CREAM);
        mat.metalness = Math.min(mat.metalness, 0.35);
        mat.roughness = Math.max(mat.roughness, 0.4);
      }
    }
  });
}

function hideByMaterialName(root: THREE.Object3D, names: string[]) {
  const nameSet = new Set(names);
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    if (mats.some((m) => nameSet.has(m.name))) obj.visible = false;
  });
}

/** Caller must check `hasGltfModel(code)` before rendering this component. */
export function GltfAirplaneModel({ code }: { code: AircraftCode }) {
  const config = MODELS[code]!;
  const { scene } = useGLTF(config.path);
  const group = useRef<THREE.Group>(null);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    if (config.retint) recolorToLivery(clone);
    if (config.hideMaterials) hideByMaterialName(clone, config.hideMaterials);

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.6 / maxDim;
    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    return clone;
  }, [scene, config]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={group} rotation={[0.04, 0, 0]}>
      <primitive object={model} />
    </group>
  );
}

for (const config of Object.values(MODELS)) {
  useGLTF.preload(config.path);
}
