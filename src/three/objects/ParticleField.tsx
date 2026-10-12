import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { PALETTE, PARALLAX_LAMBDA } from "../theme";

export interface ParticleFieldProps {
  /** Number of points in the shell (defaults come from the quality tier). */
  count?: number;
  /** Base particle colour. */
  color?: string;
  /** Outer radius of the spherical shell. */
  radius?: number;
  /** Rotation speed multiplier. */
  speed?: number;
  /** Smoothed pointer ref (from a consuming scene) for a subtle drift. */
  parallaxRef?: MutableRefObject<THREE.Vector2>;
}

/**
 * An additive-blended particle nebula that sits behind the hero content and
 * adds depth. Points are distributed in a spherical shell; the whole field
 * slowly rotates on Y and "breathes" via gentle size/opacity modulation.
 *
 * Geometry and material are created imperatively and disposed deterministically
 * on unmount (and whenever `count`/`radius`/`color` change).
 */
export function ParticleField({
  count = 300,
  color = PALETTE.violet,
  radius = 6,
  speed = 0.02,
  parallaxRef,
}: ParticleFieldProps) {
  const reduced = useReducedMotion();
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Uniform random point on a sphere, biased toward the outer rim so the
      // centre stays clear for the focal orb.
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = radius * (0.55 + 0.45 * Math.random());
      const sinPhi = Math.sin(phi);
      positions[i * 3 + 0] = r * sinPhi * Math.cos(theta);
      positions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, radius]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color,
        size: 0.035,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [color],
  );

  // Deterministic disposal of the imperatively-created geometry + material.
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    // Reduced motion: keep the static depth, do not animate.
    if (reduced) return;

    points.rotation.y += delta * speed * 6;
    points.rotation.x = THREE.MathUtils.damp(
      points.rotation.x,
      (parallaxRef ? parallaxRef.current.y : 0) * 0.08,
      PARALLAX_LAMBDA,
      delta,
    );

    const t = state.clock.elapsedTime;
    material.size = 0.035 + Math.sin(t * 0.6) * 0.006;
    material.opacity = 0.6 + Math.sin(t * 0.9) * 0.08;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} rotation={[0.15, 0, 0.05]} />;
}
