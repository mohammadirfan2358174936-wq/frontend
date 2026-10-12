import { Component, useEffect, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import { useQualityTier, type QualityTier } from "./hooks/useQualityTier";
import { usePointerParallax } from "./hooks/usePointerParallax";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { EventOrb } from "./objects/EventOrb";
import { FloatingTickets } from "./objects/FloatingTickets";
import { HolographicPanel } from "./objects/HolographicPanel";
import { ParticleField } from "./objects/ParticleField";
import { VenueStructure } from "./objects/VenueStructure";
import {
  CANVAS_LAYER_STYLE,
  PALETTE,
  PARALLAX_LAMBDA,
  SCENE_WRAPPER_STYLE,
  dampVec2,
} from "./theme";

export interface HeroSceneProps {
  variant?: "default" | "compact";
}

/**
 * Landing-page hero scene. Composed back → front: a particle nebula, the faint
 * venue architecture, the focal orb, floating tickets and foreground
 * holographic accents. The whole rig lerps toward the pointer and the camera
 * dollies gently with scroll.
 */
export default function HeroScene({ variant = "default" }: HeroSceneProps): JSX.Element {
  const tier = useQualityTier();
  const reduced = useReducedMotion();
  const { pointerRef, handlers } = usePointerParallax(1);

  return (
    <div style={SCENE_WRAPPER_STYLE} aria-hidden="true" {...handlers}>
      <Canvas
        frameloop={reduced ? "demand" : "always"}
        dpr={tier.dpr}
        gl={{ antialias: tier.antialias, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, variant === "compact" ? 9 : 7.5], fov: 45 }}
        shadows={tier.shadows}
        style={CANVAS_LAYER_STYLE}
      >
        <HeroContents pointerRef={pointerRef} reduced={reduced} tier={tier} variant={variant} />
      </Canvas>
    </div>
  );
}

interface HeroContentsProps {
  pointerRef: MutableRefObject<THREE.Vector2>;
  reduced: boolean;
  tier: QualityTier;
  variant: "default" | "compact";
}

function HeroContents({ pointerRef, reduced, tier, variant }: HeroContentsProps) {
  const rootRef = useRef<THREE.Group>(null);
  const camera = useThree((state) => state.camera);
  const smoothed = useRef(new THREE.Vector2());
  const scrollY = useRef(0);

  // Track page scroll (passively) so we can dolly the camera. Skipped under
  // reduced motion, where nothing animates.
  useEffect(() => {
    if (reduced) return;
    const onScroll = () => {
      scrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  useFrame((_state, delta) => {
    // Smooth the raw pointer once for the whole rig.
    dampVec2(smoothed.current, pointerRef.current, PARALLAX_LAMBDA, delta);
    if (reduced) return;

    if (rootRef.current) {
      rootRef.current.rotation.y = smoothed.current.x * 0.18;
      rootRef.current.rotation.x = -smoothed.current.y * 0.12;
    }

    const baseZ = variant === "compact" ? 9 : 7.5;
    const targetZ = baseZ + Math.min(scrollY.current, 1200) * 0.0018;
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, -smoothed.current.y * 0.3, 3, delta);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={rootRef}>
      {/* 1. Particle nebula (behind everything). */}
      <ParticleField
        count={tier.particleCount}
        parallaxRef={pointerRef}
        radius={6}
        speed={0.02}
      />

      {/* 2. Faint venue architecture. */}
      <VenueStructure parallaxRef={pointerRef} />

      {/* 3. Focal orb. */}
      <EventOrb parallaxRef={pointerRef} />

      {/* 4. Floating tickets. */}
      <FloatingTickets count={variant === "compact" ? 3 : 4} parallaxRef={pointerRef} />

      {/* Lighting. */}
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 3, 4]} intensity={20} color={PALETTE.indigo} castShadow={tier.shadows} />
      <pointLight position={[-4, -2, 3]} intensity={20} color={PALETTE.fuchsia} castShadow={tier.shadows} />

      {/* 5. Foreground holographic accents (full variant only). */}
      {variant === "default" && (
        <>
          <HolographicPanel
            position={[-3.4, 1.4, 1.2]}
            rotation={[0, 0.5, -0.12]}
            color={PALETTE.cyan}
            parallaxRef={pointerRef}
          />
          <HolographicPanel
            position={[3.4, -1.2, 1.0]}
            rotation={[0, -0.5, 0.14]}
            color={PALETTE.fuchsia}
            parallaxRef={pointerRef}
          />
        </>
      )}

      {/* HDRI reflections — high tier only, error-guarded. */}
      {tier.tier === "high" && (
        <SafeEnvironment>
          <Environment preset="city" />
        </SafeEnvironment>
      )}
    </group>
  );
}

/** Catches async HDRI load failures from drei's `<Environment>`. */
class SafeEnvironment extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}
