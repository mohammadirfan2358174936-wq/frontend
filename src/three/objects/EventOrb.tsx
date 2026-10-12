import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { PALETTE, PARALLAX_LAMBDA, dampVec2 } from "../theme";

export interface EventOrbProps {
  /** Smoothed pointer ref so the whole orb rotates/offsets with the cursor. */
  parallaxRef?: MutableRefObject<THREE.Vector2>;
}

/**
 * The hero centrepiece: a glowing core sphere inside a slowly spinning
 * wireframe icosahedron shell, ringed by two orbital tori. All animation is
 * transform / material-property based — the geometry is never mutated. The
 * glow "breathes" by pulsing `emissiveIntensity` (cheap, no re-upload).
 */
export function EventOrb({ parallaxRef }: EventOrbProps) {
  const reduced = useReducedMotion();
  const groupRef = useRef<THREE.Group>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ringBRef = useRef<THREE.Mesh>(null);
  const glowMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const smoothed = useRef(new THREE.Vector2());

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (parallaxRef) dampVec2(smoothed.current, parallaxRef.current, PARALLAX_LAMBDA, delta);

    // Reduced motion: leave the declarative static pose untouched.
    if (reduced) return;

    if (wireRef.current) {
      wireRef.current.rotation.y += delta * 0.12;
      wireRef.current.rotation.x += delta * 0.04;
    }
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.08;
    if (ringBRef.current) ringBRef.current.rotation.x += delta * 0.05;
    if (glowMatRef.current) glowMatRef.current.emissiveIntensity = 0.75 + Math.sin(t * 1.1) * 0.25;

    if (groupRef.current) {
      groupRef.current.rotation.y = smoothed.current.x * 0.35;
      groupRef.current.rotation.x = -smoothed.current.y * 0.25;
      groupRef.current.position.x = smoothed.current.x * 0.18;
      groupRef.current.position.y = smoothed.current.y * 0.18;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Inner glowing core. */}
      <mesh castShadow>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshStandardMaterial
          ref={glowMatRef}
          color="#0a0f26"
          emissive={PALETTE.indigo}
          emissiveIntensity={0.75}
          metalness={0.5}
          roughness={0.25}
        />
      </mesh>

      {/* Wireframe shell. */}
      <mesh ref={wireRef} rotation={[0.3, 0, 0]}>
        <icosahedronGeometry args={[1.35, 2]} />
        <meshStandardMaterial
          color={PALETTE.violet}
          wireframe
          emissive={PALETTE.violet}
          emissiveIntensity={0.6}
          transparent
          opacity={0.4}
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>

      {/* Orbit ring (equatorial). */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.0, 0.012, 8, 160]} />
        <meshBasicMaterial color={PALETTE.cyan} transparent opacity={0.55} />
      </mesh>

      {/* Tilted outer arc. */}
      <mesh ref={ringBRef} rotation={[0.5, 0.3, 0]}>
        <torusGeometry args={[2.4, 0.008, 8, 160]} />
        <meshBasicMaterial color={PALETTE.fuchsia} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
