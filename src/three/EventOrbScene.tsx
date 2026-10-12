import { Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import { useQualityTier, type QualityTier } from "./hooks/useQualityTier";
import { usePointerParallax } from "./hooks/usePointerParallax";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { EventOrb } from "./objects/EventOrb";
import { HolographicPanel } from "./objects/HolographicPanel";
import { ParticleField } from "./objects/ParticleField";
import { CANVAS_LAYER_STYLE, PALETTE, SCENE_WRAPPER_STYLE } from "./theme";

export default function EventOrbScene({
  reducedMotion,
}: {
  reducedMotion?: boolean;
}): JSX.Element {
  const tier = useQualityTier();
  const systemReduced = useReducedMotion();
  // Callers can force the reduced/static pose regardless of the OS setting.
  const reduced = reducedMotion ?? systemReduced;

  const { pointerRef, handlers } = usePointerParallax(1);

  return (
    <div style={SCENE_WRAPPER_STYLE} aria-hidden="true" {...handlers}>
      <Canvas
        frameloop={reduced ? "demand" : "always"}
        dpr={tier.dpr}
        gl={{ antialias: tier.antialias, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 6], fov: 45 }}
        shadows={tier.shadows}
        style={CANVAS_LAYER_STYLE}
      >
        <EventOrbContents parallaxRef={pointerRef} tier={tier} />
      </Canvas>
    </div>
  );
}

interface ContentsProps {
  parallaxRef: MutableRefObject<THREE.Vector2>;
  tier: QualityTier;
}

function EventOrbContents({ parallaxRef, tier }: ContentsProps) {
  return (
    <>
      {/* Cinematic key + fill. */}
      <ambientLight intensity={0.45} color={PALETTE.indigo} />
      <pointLight position={[3, 2, 4]} intensity={24} color={PALETTE.indigo} castShadow={tier.shadows} />
      <pointLight position={[-3, -2, 2]} intensity={24} color={PALETTE.fuchsia} castShadow={tier.shadows} />

      <ParticleField
        count={Math.round(tier.particleCount * 0.7)}
        parallaxRef={parallaxRef}
        color={PALETTE.fuchsia}
        radius={5}
        speed={0.015}
      />
      <EventOrb parallaxRef={parallaxRef} />
      <HolographicPanel
        position={[-2.9, 1.2, 0.6]}
        rotation={[0, 0.55, -0.14]}
        scale={0.8}
        color={PALETTE.cyan}
        parallaxRef={parallaxRef}
      />
      <HolographicPanel
        position={[2.9, -1.1, 0.5]}
        rotation={[0, -0.55, 0.16]}
        scale={0.7}
        color={PALETTE.violet}
        parallaxRef={parallaxRef}
      />

      {/* HDRI reflections are gorgeous but expensive + a network fetch, so they
          are gated to the high tier and isolated behind an error boundary so a
          failed fetch never blanks the scene. */}
      {tier.tier === "high" && (
        <SafeEnvironment>
          <Environment preset="city" />
        </SafeEnvironment>
      )}
    </>
  );
}

/**
 * Catches async HDRI load failures from drei's `<Environment>` and degrades
 * silently (the emissive materials already carry the look).
 */
class SafeEnvironment extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
