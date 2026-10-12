import { useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { PARALLAX_LAMBDA, TICKET_COLORS, dampVec2 } from "../theme";

export interface FloatingTicketsProps {
  /** Number of floating tickets, clamped to 3–6. */
  count?: number;
  /** Smoothed pointer ref so tickets lean toward the cursor. */
  parallaxRef?: MutableRefObject<THREE.Vector2>;
}

interface TicketLayout {
  index: number;
  color: string;
  radius: number;
  angle: number;
}

interface TicketProps extends TicketLayout {
  reduced: boolean;
  parallaxRef?: MutableRefObject<THREE.Vector2>;
}

/**
 * A small ring of floating "ticket" cards that bob, counter-rotate and lean
 * toward the pointer. Each ticket is a glassy `RoundedBox` tinted from the
 * palette. Geometry/material are declared through JSX, so they are disposed
 * automatically by React Three Fiber's reconciler on unmount.
 */
export function FloatingTickets({ count = 4, parallaxRef }: FloatingTicketsProps) {
  const reduced = useReducedMotion();
  const total = Math.min(6, Math.max(3, Math.round(count)));

  const tickets = useMemo<TicketLayout[]>(
    () =>
      Array.from({ length: total }, (_, i) => ({
        index: i,
        color: TICKET_COLORS[i % TICKET_COLORS.length],
        radius: 2.5 + (i % 2) * 0.4,
        angle: (i / total) * Math.PI * 2,
      })),
    [total],
  );

  return (
    <group>
      {tickets.map((ticket) => (
        <Ticket key={ticket.index} reduced={reduced} parallaxRef={parallaxRef} {...ticket} />
      ))}
    </group>
  );
}

function Ticket({ index, color, radius, angle, reduced, parallaxRef }: TicketProps) {
  const groupRef = useRef<THREE.Group>(null);
  const smoothed = useRef(new THREE.Vector2());

  // Vertical stagger + per-ticket phase so the bob is desynchronised.
  const baseY = ((index % 3) - 1) * 0.85;
  const phase = index * 1.7;
  const spinDir = index % 2 === 0 ? 1 : -1;

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    if (parallaxRef) dampVec2(smoothed.current, parallaxRef.current, PARALLAX_LAMBDA, delta);

    const t = state.clock.elapsedTime;
    const orbitAngle = angle + (reduced ? 0 : t * 0.05);
    group.position.set(
      Math.cos(orbitAngle) * radius,
      baseY + (reduced ? 0 : Math.sin(t * 0.7 + phase) * 0.15),
      Math.sin(orbitAngle) * radius,
    );

    // Reduced motion: freeze at a calm static pose (no spin / drift / lean).
    if (reduced) {
      group.rotation.set(0, 0, 0);
      return;
    }

    // Face outward along the ring (radiates from the centre), then wobble.
    group.rotation.y = Math.PI / 2 - orbitAngle;
    group.rotation.z = Math.sin(t * 0.6 + phase) * 0.16 * spinDir;
    group.rotation.x = Math.sin(t * 0.45 + phase) * 0.05;

    if (parallaxRef) {
      group.rotation.x += smoothed.current.y * 0.25;
      group.rotation.z += smoothed.current.x * 0.2;
      group.position.y += smoothed.current.y * 0.12;
    }
  });

  return (
    <group
      ref={groupRef}
      // Declarative static pose (also the reduced-motion pose, honoured even
      // when `frameloop="demand"` means useFrame never runs).
      position={[Math.cos(angle) * radius, baseY, Math.sin(angle) * radius]}
      rotation={[0, 0, 0]}
    >
      <RoundedBox args={[1, 0.6, 0.06]} radius={0.06} smoothness={4} castShadow>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.18}
          metalness={0.6}
          roughness={0.15}
          transparent
          opacity={0.9}
        />
      </RoundedBox>
    </group>
  );
}
