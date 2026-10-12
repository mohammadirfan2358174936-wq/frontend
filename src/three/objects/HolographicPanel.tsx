import { useRef } from "react";
import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { PALETTE, PARALLAX_LAMBDA, dampVec2 } from "../theme";

export interface HolographicPanelProps {
  /** World position. */
  position?: [number, number, number];
  /** Base rotation (radians). */
  rotation?: [number, number, number];
  /** Uniform scale. */
  scale?: number;
  /** Neon colour for the panel face and its edge glow. */
  color?: string;
  /** Smoothed pointer ref for a subtle reactive lean. */
  parallaxRef?: MutableRefObject<THREE.Vector2>;
}

/**
 * A semi-transparent angled panel with a bright neon edge — a "holographic
 * UI" accent. A near-invisible `meshBasicMaterial` face + a drei `<Edges>`
 * outline give the glassy, edged-translucency read for a fraction of the cost
 * of real refraction/transmission.
 */
export function HolographicPanel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = PALETTE.cyan,
  parallaxRef,
}: HolographicPanelProps) {
  const reduced = useReducedMotion();
  const meshRef = useRef<THREE.Mesh>(null);
  const smoothed = useRef(new THREE.Vector2());

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (parallaxRef) dampVec2(smoothed.current, parallaxRef.current, PARALLAX_LAMBDA, delta);

    // Reduced motion: keep the static declarative orientation.
    if (reduced) return;

    const t = state.clock.elapsedTime;
    mesh.rotation.z = rotation[2] + Math.sin(t * 0.4) * 0.03 + smoothed.current.x * 0.06;
    mesh.rotation.x = rotation[0] + smoothed.current.y * 0.05;
    mesh.rotation.y = rotation[1] + Math.sin(t * 0.3) * 0.02;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[2.4, 3.2]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.06}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
      <Edges>
        <lineBasicMaterial color={color} transparent opacity={0.9} />
      </Edges>
    </mesh>
  );
}
