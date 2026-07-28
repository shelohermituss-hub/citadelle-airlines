import { Vector3 } from "three";

/** Convertit lat/lon (degrés) en position sur une sphère de rayon donné. */
export function latLonToVector3(lat: number, lon: number, radius: number): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Points [départ, contrôle, arrivée] d'un arc grand-cercle légèrement
 * bombé entre deux points de la sphère — utilisés par QuadraticBezierLine
 * et pour l'avion qui suit l'arc.
 */
export function createArcPoints(
  start: Vector3,
  end: Vector3,
  radius: number
): [Vector3, Vector3, Vector3] {
  const angle = start.angleTo(end);
  const bulge = radius * (0.15 + angle * 0.18);
  const control = start
    .clone()
    .add(end)
    .normalize()
    .multiplyScalar(radius + bulge);
  return [start, control, end];
}
