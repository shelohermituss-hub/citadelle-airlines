"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls, QuadraticBezierLine } from "@react-three/drei";
import { useTranslations } from "next-intl";
import {
  AdditiveBlending,
  BackSide,
  Color,
  QuadraticBezierCurve3,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type Vector3,
} from "three";
import { AIRPORT_COORDINATES, HUB_AIRPORT, ROUTE_PAIRS } from "@/services/amadeus";
import type { AirportCode } from "@/services/amadeus";
import { CONTINENT_OUTLINES } from "./continent-outlines";
import { createArcPoints, latLonToVector3 } from "./geo";

const GLOBE_RADIUS = 1.6;
const GOLD = "#F2A81D";
const ATMOSPHERE_COLOR = new Color(GOLD);

/** Halo atmosphérique en Fresnel — plus lumineux en bord de silhouette,
 * transparent au centre. Peu coûteux : c'est le shader qui fait le
 * dégradé, pas la géométrie (sphère basse résolution). */
const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const ATMOSPHERE_FRAGMENT = /* glsl */ `
  varying vec3 vNormal;
  uniform vec3 color;
  void main() {
    float rim = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
    gl_FragColor = vec4(color, clamp(rim, 0.0, 1.0) * 0.55);
  }
`;

function GlobeSphere() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 24, 24]} />
        <meshStandardMaterial color="#0b0e14" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* halo atmosphérique or, discret */}
      <mesh scale={1.06}>
        <sphereGeometry args={[GLOBE_RADIUS, 20, 20]} />
        <shaderMaterial
          vertexShader={ATMOSPHERE_VERTEX}
          fragmentShader={ATMOSPHERE_FRAGMENT}
          uniforms={{ color: { value: ATMOSPHERE_COLOR } }}
          transparent
          depthWrite={false}
          side={BackSide}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function ContinentOutlines() {
  const loops = useMemo(
    () =>
      CONTINENT_OUTLINES.map((loop) =>
        loop.map(([lat, lon]) => latLonToVector3(lat, lon, GLOBE_RADIUS * 1.002))
      ),
    []
  );

  return (
    <group>
      {loops.map((points, index) => (
        <Line
          key={index}
          points={points}
          color="#4a5468"
          lineWidth={1}
          transparent
          opacity={0.6}
        />
      ))}
    </group>
  );
}

function DestinationPoint({
  position,
  isHub,
  code,
}: {
  position: Vector3;
  isHub: boolean;
  code: AirportCode;
}) {
  const haloRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const tAirports = useTranslations("Airports");
  const phase = useMemo(() => position.x + position.z, [position]);
  const dotSize = isHub ? 0.022 : 0.013;

  useFrame(({ clock }) => {
    const halo = haloRef.current;
    if (!halo) return;
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 1.6 + phase) * 0.5;
    halo.scale.setScalar(pulse);
    (halo.material as MeshBasicMaterial).opacity = 0.32 - Math.sin(t * 1.6 + phase) * 0.15;
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[dotSize, 8, 8]} />
        <meshBasicMaterial color={isHub ? "#ffffff" : GOLD} />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[dotSize * 1.8, 8, 8]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      {/* zone de survol plus généreuse que le point visible, pour rester facile à cibler */}
      <mesh
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[dotSize * 3.5, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {hovered && (
        <Html center style={{ pointerEvents: "none" }}>
          <span className="-translate-y-5 whitespace-nowrap rounded-md bg-citadelle-noir/90 px-2 py-1 text-xs font-medium text-white shadow-lg">
            {tAirports(code)}
          </span>
        </Html>
      )}
    </group>
  );
}

function FlightMarker({ curve }: { curve: QuadraticBezierCurve3 }) {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    const group = ref.current;
    if (!group) return;
    const t = (clock.getElapsedTime() * 0.05) % 1;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    group.position.copy(point);
    group.lookAt(point.clone().add(tangent));
  });

  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.01, 0.032, 5]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export function GlobeScene() {
  const spokeRoutes = useMemo(
    () =>
      ROUTE_PAIRS.filter(
        ([origin, destination]) => origin === HUB_AIRPORT || destination === HUB_AIRPORT
      ),
    []
  );

  const arcs = useMemo(
    () =>
      spokeRoutes.map(([origin, destination]) => {
        const start = latLonToVector3(
          AIRPORT_COORDINATES[origin as AirportCode].lat,
          AIRPORT_COORDINATES[origin as AirportCode].lon,
          GLOBE_RADIUS
        );
        const end = latLonToVector3(
          AIRPORT_COORDINATES[destination as AirportCode].lat,
          AIRPORT_COORDINATES[destination as AirportCode].lon,
          GLOBE_RADIUS
        );
        return createArcPoints(start, end, GLOBE_RADIUS);
      }),
    [spokeRoutes]
  );

  const destinationPoints = useMemo(() => {
    const codes = new Set<AirportCode>([HUB_AIRPORT]);
    for (const [origin, destination] of spokeRoutes) {
      codes.add(origin as AirportCode);
      codes.add(destination as AirportCode);
    }
    return Array.from(codes).map((code) => ({
      code,
      position: latLonToVector3(
        AIRPORT_COORDINATES[code].lat,
        AIRPORT_COORDINATES[code].lon,
        GLOBE_RADIUS
      ),
    }));
  }, [spokeRoutes]);

  const flightCurve = useMemo(() => {
    const jfkIndex = spokeRoutes.findIndex(
      ([origin, destination]) => origin === "JFK" || destination === "JFK"
    );
    const [start, control, end] = arcs[jfkIndex] ?? arcs[0];
    return new QuadraticBezierCurve3(start, control, end);
  }, [arcs, spokeRoutes]);

  return (
    <>
      <color attach="background" args={["#0a0c11"]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 3, 5]} intensity={1.1} />

      <GlobeSphere />
      <ContinentOutlines />

      {arcs.map((points, index) => (
        <QuadraticBezierLine
          key={index}
          start={points[0]}
          mid={points[1]}
          end={points[2]}
          color={GOLD}
          lineWidth={0.9}
          transparent
          opacity={0.55}
        />
      ))}

      {destinationPoints.map(({ code, position }) => (
        <DestinationPoint
          key={code}
          position={position}
          isHub={code === HUB_AIRPORT}
          code={code}
        />
      ))}

      {flightCurve && <FlightMarker curve={flightCurve} />}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.6}
        rotateSpeed={0.5}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.72}
      />
    </>
  );
}
