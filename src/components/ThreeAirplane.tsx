import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface AirplaneProps {
  onLoad?: () => void;
}

function AirplaneModel() {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) {
      // Slow continuous rotation when idle
      group.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={group} rotation={[0.1, 0, 0]} scale={1}>
      {/* Fuselage */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
        <capsuleGeometry args={[0.35, 2.2, 8, 16]} />
        <meshStandardMaterial color="#F7F6F3" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Nose cone */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[1.4, 0, 0]}>
        <coneGeometry args={[0.35, 0.5, 16]} />
        <meshStandardMaterial color="#E8E5E0" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Tail cone */}
      <mesh rotation={[0, 0, -Math.PI / 2]} position={[-1.35, 0, 0]}>
        <coneGeometry args={[0.35, 0.6, 16]} />
        <meshStandardMaterial color="#E8E5E0" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Vertical stabilizer (tail fin) — checker pattern gold/black */}
      <mesh position={[-1.2, 0.55, 0]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.5, 0.7, 0.04]} />
        <meshStandardMaterial color="#F2A81D" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Checker pattern on tail */}
      <mesh position={[-1.25, 0.65, 0.025]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshStandardMaterial color="#141414" />
      </mesh>
      <mesh position={[-1.1, 0.55, 0.025]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshStandardMaterial color="#141414" />
      </mesh>
      <mesh position={[-1.3, 0.45, 0.025]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshStandardMaterial color="#141414" />
      </mesh>

      {/* Horizontal stabilizers */}
      <mesh position={[-1.2, 0.1, 0.4]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.02, 0.5]} />
        <meshStandardMaterial color="#D0CDC8" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[-1.2, 0.1, -0.4]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.02, 0.5]} />
        <meshStandardMaterial color="#D0CDC8" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Main wings */}
      <mesh position={[0.1, -0.05, 0.7]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[1.2, 0.04, 0.45]} />
        <meshStandardMaterial color="#D0CDC8" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0.1, -0.05, -0.7]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[1.2, 0.04, 0.45]} />
        <meshStandardMaterial color="#D0CDC8" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Engines under wings */}
      <mesh position={[0.2, -0.15, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.4, 12]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.2, -0.15, -0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.4, 12]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Gold stripe along fuselage */}
      <mesh position={[0, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.36, 0.36, 0.04, 16, 1, true]} />
        <meshStandardMaterial color="#F2A81D" metalness={0.4} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Windows */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[0.9 - i * 0.16, 0.05, 0.36]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.025, 8]} />
          <meshStandardMaterial color="#141414" />
        </mesh>
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`w2-${i}`} position={[0.9 - i * 0.16, 0.05, -0.36]} rotation={[0, -Math.PI / 2, 0]}>
          <circleGeometry args={[0.025, 8]} />
          <meshStandardMaterial color="#141414" />
        </mesh>
      ))}
    </group>
  );
}

export default function ThreeAirplane({ onLoad }: AirplaneProps) {
  const controls = useRef(null);

  useMemo(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <Canvas
      camera={{ position: [3.5, 1.5, 3.5], fov: 35 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} />

      <AirplaneModel />

      <ContactShadows
        position={[0, -0.8, 0]}
        opacity={0.3}
        scale={6}
        blur={2.5}
        far={2}
      />

      <Environment preset="studio" />

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
