import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { AircraftCode } from '@/data/fleet';

/**
 * Real aircraft models (Sketchfab, CC-BY-4.0 — see public/models/CREDITS.md),
 * chosen specifically because their base livery carries no manufacturer or
 * airline branding. Only add a code here after visually confirming that.
 */
const MODEL_PATHS: Partial<Record<AircraftCode, string>> = {
  '789': '/models/789/scene.gltf',
  '330': '/models/330/scene.gltf',
  '350': '/models/350/scene.glb',
};

export function hasGltfModel(code: AircraftCode): boolean {
  return code in MODEL_PATHS;
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

/** Caller must check `hasGltfModel(code)` before rendering this component. */
export function GltfAirplaneModel({ code }: { code: AircraftCode }) {
  const path = MODEL_PATHS[code]!;
  const { scene } = useGLTF(path);
  const group = useRef<THREE.Group>(null);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    recolorToLivery(clone);

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.6 / maxDim;
    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={group} rotation={[0.04, 0, 0]}>
      <primitive object={model} />
    </group>
  );
}

for (const path of Object.values(MODEL_PATHS)) {
  useGLTF.preload(path);
}
