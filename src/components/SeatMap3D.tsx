import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, RoundedBox, ContactShadows, Html } from '@react-three/drei';
import type { Seat, SeatTier } from '@/data/seatMap';
import type { BodyType } from '@/data/fleet';

const GOLD = '#F2A81D';
const GOLD_LIGHT = '#F6D998';
const BLACK = '#141414';
const CREAM = '#F7F6F3';
const TAKEN = '#B5B2AD';

const SEAT_W = 0.26;
const SEAT_GAP = 0.06;
const GROUP_GAP = 0.22;
const ROW_DEPTH = 0.32;

function tierColor(tier: SeatTier): string {
  if (tier === 'extraLegroom') return GOLD;
  if (tier === 'preferred') return GOLD_LIGHT;
  return CREAM;
}

/** x-position (centered on 0) for every column, given the aircraft's seat-group layout. */
function useColumnPositions(layout: string[][]) {
  return useMemo(() => {
    const positions = new Map<string, number>();
    let x = 0;
    layout.forEach((group, gi) => {
      group.forEach((col) => {
        positions.set(col, x);
        x += SEAT_W + SEAT_GAP;
      });
      if (gi < layout.length - 1) x += GROUP_GAP;
    });
    const total = x - SEAT_GAP;
    for (const [col, val] of positions) positions.set(col, val - total / 2);
    return positions;
  }, [layout]);
}

interface SeatMeshProps {
  seat: Seat;
  x: number;
  z: number;
  status: 'available' | 'unavailable' | 'assignedOther' | 'active';
  assigneeLabel?: string;
  onSelect: (id: string) => void;
}

function SeatMesh({ seat, x, z, status, assigneeLabel, onSelect }: SeatMeshProps) {
  const [hovered, setHovered] = useState(false);
  const selectable = status === 'available' || status === 'active';

  let color = tierColor(seat.tier);
  if (status === 'unavailable') color = TAKEN;
  if (status === 'assignedOther') color = BLACK;
  if (status === 'active') color = GOLD;

  const lift = status === 'active' ? 0.08 : 0;

  return (
    <group
      position={[x, 0.16 + lift, z]}
      onClick={(e) => {
        if (!selectable) return;
        e.stopPropagation();
        onSelect(seat.id);
      }}
      onPointerOver={(e) => {
        if (!selectable) return;
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Cushion */}
      <RoundedBox args={[SEAT_W, 0.06, ROW_DEPTH * 0.78]} radius={0.02} smoothness={2}>
        <meshStandardMaterial
          color={color}
          metalness={0.15}
          roughness={0.55}
          emissive={status === 'active' ? GOLD : '#000000'}
          emissiveIntensity={status === 'active' ? 0.15 : 0}
        />
      </RoundedBox>
      {/* Backrest */}
      <RoundedBox
        args={[SEAT_W, 0.2, 0.045]}
        radius={0.02}
        smoothness={2}
        position={[0, 0.11, -ROW_DEPTH * 0.34]}
      >
        <meshStandardMaterial color={color} metalness={0.15} roughness={0.55} />
      </RoundedBox>
      {(hovered || status === 'active' || status === 'assignedOther') && (
        <Html center distanceFactor={6} position={[0, 0.32, 0]} occlude={false}>
          <div className="pointer-events-none select-none whitespace-nowrap rounded-md bg-citadelle-black px-2 py-1 text-[10px] font-semibold text-white shadow-lg">
            {seat.id}
            {status === 'assignedOther' && assigneeLabel ? ` · ${assigneeLabel}` : ''}
            {status === 'active' ? ' · Sélectionné' : ''}
            {seat.priceUsd > 0 && status !== 'assignedOther' ? ` · +$${seat.priceUsd}` : ''}
          </div>
        </Html>
      )}
    </group>
  );
}

interface SeatMap3DProps {
  seats: Seat[];
  layout: string[][];
  unavailableIds: Set<string>;
  assignedSeats: Map<string, string>;
  activeSeatId?: string;
  onSelectSeat: (id: string) => void;
  bodyType: BodyType;
}

function Scene({ seats, layout, unavailableIds, assignedSeats, activeSeatId, onSelectSeat }: SeatMap3DProps) {
  const columnX = useColumnPositions(layout);
  const rows = useMemo(() => Array.from(new Set(seats.map((s) => s.row))).sort((a, b) => a - b), [seats]);
  const rowZ = useMemo(() => {
    const map = new Map<number, number>();
    rows.forEach((row, i) => map.set(row, i * ROW_DEPTH - ((rows.length - 1) * ROW_DEPTH) / 2));
    return map;
  }, [rows]);

  const totalWidth = layout.reduce((n, g) => n + g.length, 0) * (SEAT_W + SEAT_GAP) + (layout.length - 1) * GROUP_GAP;
  const aisleXs: number[] = [];
  let cursor = -totalWidth / 2 + SEAT_W / 2;
  layout.forEach((group, gi) => {
    cursor += group.length * (SEAT_W + SEAT_GAP);
    if (gi < layout.length - 1) aisleXs.push(cursor - SEAT_GAP / 2 + GROUP_GAP / 2);
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 6, 4]} intensity={1} />
      <directionalLight position={[-4, 3, -3]} intensity={0.35} />
      <directionalLight position={[0, -2, 3]} intensity={0.2} color={GOLD} />

      {/* Cabin floor */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[totalWidth + 0.4, rows.length * ROW_DEPTH + 0.6]} />
        <meshStandardMaterial color="#DEDAD2" metalness={0.1} roughness={0.8} />
      </mesh>
      {/* Aisle strips */}
      {aisleXs.map((ax, i) => (
        <mesh key={i} position={[ax, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[GROUP_GAP + SEAT_GAP, rows.length * ROW_DEPTH + 0.6]} />
          <meshStandardMaterial color={BLACK} opacity={0.08} transparent metalness={0} roughness={1} />
        </mesh>
      ))}

      {seats.map((seat) => {
        const x = columnX.get(seat.column) ?? 0;
        const z = rowZ.get(seat.row) ?? 0;
        let status: SeatMeshProps['status'] = 'available';
        if (seat.id === activeSeatId) status = 'active';
        else if (unavailableIds.has(seat.id)) status = 'unavailable';
        else if (assignedSeats.has(seat.id)) status = 'assignedOther';
        return (
          <SeatMesh
            key={seat.id}
            seat={seat}
            x={x}
            z={z}
            status={status}
            assigneeLabel={assignedSeats.get(seat.id)}
            onSelect={onSelectSeat}
          />
        );
      })}

      <ContactShadows position={[0, -0.03, 0]} opacity={0.25} scale={totalWidth + 2} blur={2} far={1.5} />
    </>
  );
}

export function SeatMap3D(props: SeatMap3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 2.6, 2.3], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <Scene {...props} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 3.2}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
      />
    </Canvas>
  );
}
