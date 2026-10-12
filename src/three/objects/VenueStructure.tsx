import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { PALETTE, PARALLAX_LAMBDA, dampVec2 } from "../theme";

export interface VenueStructureProps {
  /** Smoothed pointer ref for a touch of reactive sway. */
  parallaxRef?: MutableRefObject<THREE.Vector2>;
}

interface Slab {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  /** 0 = no arch, otherwise the arch radius. */
  archRadius: number;
}

/**
 * Abstract floating venue architecture: stacked translucent slabs with arches
 * arranged radially to suggest a faint amphitheatre silhouette behind the
 * focal orb. Uses a cheap glassy standard material (no transmission) and drifts
 * in a slow orbit. Geometry/material are declared via JSX and auto-disposed.
 */
export function VenueStructure({ parallaxRef }: VenueStructureProps) {
  const reduced = useReducedMotion();
  const groupRef = useRef<THREE.Group>(null);
  const smoothed = useRef(new THREE.Vector2());

  const slabs = useMemo<Slab[]>(() => {
    const out: Slab[] = [];
    const tiers = 3;
    for (let tier = 0; tier < tiers; tier++) {
      const radius = 3.4 + tier * 0.95;
      const y = -0.6 + tier * 0.6;
      const count = 7 + tier * 2;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + tier * 0.4;
        out.push({
          position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
          rotation: [0, -angle, 0],
          size: [0.16, 0.5 + tier * 0.12, 1.3],
          archRadius: tier === 0 ? 0 : 0.45 + tier * 0.05,
        });
      }
    }
    return out;
  }, []);

  useFrame((_root, delta) => {
    if (parallaxRef) dampVec2(smoothed.current, parallaxRef.current, PARALLAX_LAMBDA, delta);

    // Reduced motion: freeze the drift.
    if (reduced) return;

    const group = groupRef.current;
    if (!group) return;
    group.rotation.y += delta * 0.03;
    group.rotation.z = smoothed.current.x * 0.05;
  });

  return (
    <group ref={groupRef}>
      {slabs.map((slab, i) => (
        <group key={i} position={slab.position} rotation={slab.rotation}>
          <mesh receiveShadow>
            <boxGeometry args={slab.size} />
            <meshStandardMaterial
              color={PALETTE.indigo}
              transparent
              opacity={0.08}
              metalness={0.9}
              roughness={0.1}
              depthWrite={false}
            />
          </mesh>
          {slab.archRadius > 0 && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[slab.archRadius, 0.03, 8, 24, Math.PI]} />
              <meshStandardMaterial
                color={PALETTE.violet}
                transparent
                opacity={0.12}
                metalness={0.9}
                roughness={0.1}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
