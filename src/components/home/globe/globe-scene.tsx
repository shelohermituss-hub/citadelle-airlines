"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, OrbitControls, QuadraticBezierLine } from "@react-three/drei";
import {
  BackSide,
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

function GlobeSphere() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <meshStandardMaterial color="#0b0e14" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* fine halo autour du globe, purement décoratif */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.015, 24, 24]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.04} side={BackSide} />
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
}: {
  position: Vector3;
  isHub: boolean;
}) {
  const haloRef = useRef<Mesh>(null);
  const phase = useMemo(() => position.x + position.z, [position]);

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
        <sphereGeometry args={[isHub ? 0.022 : 0.013, 10, 10]} />
        <meshBasicMaterial color={isHub ? "#ffffff" : GOLD} />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[(isHub ? 0.022 : 0.013) * 1.8, 10, 10]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.3} depthWrite={false} />
      </mesh>
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
        <coneGeometry args={[0.01, 0.032, 6]} />
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
          lineWidth={1.3}
          transparent
          opacity={0.65}
        />
      ))}

      {destinationPoints.map(({ code, position }) => (
        <DestinationPoint key={code} position={position} isHub={code === HUB_AIRPORT} />
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
