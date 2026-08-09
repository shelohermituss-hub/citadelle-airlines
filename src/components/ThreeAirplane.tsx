import { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import type { BodyType, AircraftCode } from '@/data/fleet';
import { GltfAirplaneModel, hasGltfModel } from './GltfAirplaneModel';

interface AirplaneProps {
  onLoad?: () => void;
  bodyType?: BodyType;
  aircraftCode?: AircraftCode;
}

const GOLD = '#F2A81D';
const BLACK = '#141414';
const FUSELAGE = '#F7F6F3';
const FUSELAGE_SHADE = '#E4E1DA';
const METAL = '#3a3a3a';

/** Canvas-generated window-strip texture — far cheaper than one mesh per window. */
function useWindowTexture(count: number) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(20,20,20,0.85)';
    const margin = 18;
    const usable = canvas.width - margin * 2;
    const gap = usable / count;
    for (let i = 0; i < count; i++) {
      const cx = margin + gap * i + gap / 2;
      ctx.beginPath();
      ctx.ellipse(cx, canvas.height / 2, gap * 0.24, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [count]);
}

function Wing({
  side,
  spanLen,
  narrow,
}: {
  side: 1 | -1;
  spanLen: number;
  narrow: boolean;
}) {
  const winglet = narrow ? 0.22 : 0.28;
  const WING_ROOT_COLOR = '#CBC8C1';
  const WING_TIP_COLOR = '#AFACA5';
  const rootZ = 0.32;
  const rootSpan = spanLen * 0.58;
  const tipSpan = spanLen * 0.42;
  return (
    <group>
      {/* Root segment — wide chord, attaches flush to the fuselage */}
      <mesh position={[0.08, -0.06, side * (rootZ + rootSpan / 2)]} rotation={[0, 0, side * 0.05]}>
        <boxGeometry args={[0.72, 0.065, rootSpan]} />
        <meshStandardMaterial color={WING_ROOT_COLOR} metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Tip segment — swept aft, tapered, slight dihedral */}
      <mesh
        position={[-0.26, 0.07, side * (rootZ + rootSpan + tipSpan / 2)]}
        rotation={[0, 0, side * 0.14]}
      >
        <boxGeometry args={[0.32, 0.045, tipSpan]} />
        <meshStandardMaterial color={WING_TIP_COLOR} metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Winglet — canted up at the tip */}
      <mesh
        position={[-0.4, 0.14 + winglet * 0.45, side * (rootZ + spanLen - 0.03)]}
        rotation={[0, 0, side * 0.5]}
      >
        <boxGeometry args={[0.16, winglet, 0.025]} />
        <meshStandardMaterial color={GOLD} metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Engine({ side, x, z }: { side: 1 | -1; x: number; z: number }) {
  return (
    <group position={[x, -0.42, side * z]}>
      {/* Pylon connecting engine to wing */}
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[0.1, 0.26, 0.045]} />
        <meshStandardMaterial color="#AFACA5" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Nacelle body */}
      <mesh position={[-0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.135, 0.4, 16]} />
        <meshStandardMaterial color={FUSELAGE} metalness={0.4} roughness={0.35} />
      </mesh>
      {/* Dark intake face (flat disc, not a ring) */}
      <mesh position={[0.21, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.128, 20]} />
        <meshStandardMaterial color={BLACK} metalness={0.6} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
      {/* Exhaust cone */}
      <mesh position={[-0.24, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.1, 16]} />
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function AirplaneModel({ bodyType = 'narrow' }: { bodyType?: BodyType }) {
  const group = useRef<THREE.Group>(null);
  const narrow = bodyType === 'narrow';
  const fLen = narrow ? 1 : 1.18;
  const fRad = narrow ? 1 : 1.22;
  const spanLen = narrow ? 1.15 : 1.55;
  const windowTexture = useWindowTexture(narrow ? 16 : 22);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.15;
    }
  });

  const fuselageProfile = useMemo(
    () => [
      new THREE.Vector2(0.0, -1.55),
      new THREE.Vector2(0.14, -1.42),
      new THREE.Vector2(0.3, -1.15),
      new THREE.Vector2(0.34, -0.55),
      new THREE.Vector2(0.34, 0.85),
      new THREE.Vector2(0.29, 1.15),
      new THREE.Vector2(0.11, 1.42),
      new THREE.Vector2(0.0, 1.52),
    ],
    [],
  );

  return (
    <group ref={group} rotation={[0.06, 0, 0]}>
      <group scale={[fLen, fRad, fRad]}>
        {/* Fuselage — lathe-revolved tapered tube, nose at +X */}
        <group rotation={[0, 0, -Math.PI / 2]}>
          <mesh>
            <latheGeometry args={[fuselageProfile, 28]} />
            <meshStandardMaterial color={FUSELAGE} metalness={0.25} roughness={0.35} />
          </mesh>
        </group>

        {/* Cockpit windshield tint */}
        <mesh position={[1.32, 0.06, 0]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.14, 0.12, 0.34]} />
          <meshStandardMaterial color={BLACK} metalness={0.5} roughness={0.2} opacity={0.85} transparent />
        </mesh>

        {/* Gold cheatline stripe — a thin band along each side of the
            fuselage, just below the windows. */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.346, 0.346, 2.2, 28, 1, true, -0.42, 0.16]} />
          <meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.346, 0.346, 2.2, 28, 1, true, 3.39, 0.16]} />
          <meshStandardMaterial color={GOLD} metalness={0.35} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>

        {/* Window strip (both sides) */}
        <mesh position={[-0.1, 0.08, 0.343]} rotation={[0, 0, 0]}>
          <planeGeometry args={[2.1, 0.09]} />
          <meshBasicMaterial map={windowTexture} transparent toneMapped={false} />
        </mesh>
        <mesh position={[-0.1, 0.08, -0.343]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2.1, 0.09]} />
          <meshBasicMaterial map={windowTexture} transparent toneMapped={false} />
        </mesh>
      </group>

      {/* Main wings */}
      <group scale={[fLen, fRad, 1]}>
        <Wing side={1} spanLen={spanLen} narrow={narrow} />
        <Wing side={-1} spanLen={spanLen} narrow={narrow} />
      </group>

      {/* Engines under wings */}
      <Engine side={1} x={narrow ? 0.26 : 0.3} z={narrow ? 0.58 : 0.72} />
      <Engine side={-1} x={narrow ? 0.26 : 0.3} z={narrow ? 0.58 : 0.72} />

      {/* Vertical stabilizer (tail fin) — swept, gold/black livery */}
      <group position={[-1.28 * fLen, 0.08, 0]}>
        <mesh position={[0.05, 0.28, 0]} rotation={[0, 0, -0.18]}>
          <boxGeometry args={[0.5, 0.56, 0.032]} />
          <meshStandardMaterial color={FUSELAGE} metalness={0.25} roughness={0.4} />
        </mesh>
        <mesh position={[-0.06, 0.5, 0]} rotation={[0, 0, -0.18]}>
          <boxGeometry args={[0.3, 0.42, 0.034]} />
          <meshStandardMaterial color={GOLD} metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[-0.1, 0.62, 0]} rotation={[0, 0, -0.18]}>
          <boxGeometry args={[0.18, 0.2, 0.036]} />
          <meshStandardMaterial color={BLACK} metalness={0.3} roughness={0.4} />
        </mesh>
      </group>

      {/* Horizontal stabilizers */}
      <group position={[-1.3 * fLen, 0.02, 0]}>
        <mesh position={[0, 0, 0.28]} rotation={[0, 0, 0.05]}>
          <boxGeometry args={[0.34, 0.028, 0.42]} />
          <meshStandardMaterial color={FUSELAGE_SHADE} metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, -0.28]} rotation={[0, 0, -0.05]}>
          <boxGeometry args={[0.34, 0.028, 0.42]} />
          <meshStandardMaterial color={FUSELAGE_SHADE} metalness={0.3} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

export default function ThreeAirplane({ onLoad, bodyType = 'narrow', aircraftCode }: AirplaneProps) {
  const controls = useRef(null);
  const useGltf = aircraftCode ? hasGltfModel(aircraftCode) : false;

  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <Canvas
      camera={useGltf ? { position: [4.6, 2.3, 4.6], fov: 32 } : { position: [4.0, 1.1, 2.6], fov: 30 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Local lights only — no Environment CDN fetch, so the scene never
          hangs on a blocked/slow network (ad blockers, firewalls, offline). */}
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 5, 5]} intensity={1.1} castShadow />
      <directionalLight position={[-5, 3, -4]} intensity={0.4} />
      <directionalLight position={[0, -3, 2]} intensity={0.25} color="#F2A81D" />

      {useGltf && aircraftCode ? (
        <Suspense fallback={null}>
          <GltfAirplaneModel code={aircraftCode} />
        </Suspense>
      ) : (
        <AirplaneModel bodyType={bodyType} />
      )}

      <ContactShadows position={[0, -0.8, 0]} opacity={0.3} scale={7} blur={2.5} far={2} />

      <OrbitControls
        ref={controls}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate={false}
      />
    </Canvas>
  );
}
