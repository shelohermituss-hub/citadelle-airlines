export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isSlowConnection(): boolean {
  const nav = navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } };
  if (nav.connection?.saveData) return true;
  const et = nav.connection?.effectiveType;
  if (et === '2g' || et === 'slow-2g') return true;
  return false;
}

/** True when it's safe to mount a heavier WebGL scene (capable device, no reduced-motion preference, fast enough connection). */
export function canRender3D(): boolean {
  return supportsWebGL() && !prefersReducedMotion() && !isSlowConnection();
}
