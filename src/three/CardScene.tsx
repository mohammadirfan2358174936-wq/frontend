import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import { useQualityTier } from "./hooks/useQualityTier";
import { usePointerParallax } from "./hooks/usePointerParallax";
import { useReducedMotion } from "./hooks/useReducedMotion";
import {
  CARD_GRADIENTS,
  CANVAS_LAYER_STYLE,
  PALETTE,
  PARALLAX_LAMBDA,
  SCENE_WRAPPER_STYLE,
  dampVec2,
  makeGradientPlane,
} from "./theme";

export interface CardSceneProps {
  /** Optional card image URLs. When omitted, gradient-only cards are used. */
  images?: string[];
  /** Radius of the horizontal arc the cards sit on. */
  radius?: number;
  /** Drift speed of the whole ring (0 = perfectly still). */
  autoRotateSpeed?: number;
}

const CARD_W = 2.0;
const CARD_H = 2.8;

interface CardSlot {
  position: [number, number, number];
  rotation: [number, number, number];
  phase: number;
}

/**
 * Reusable floating-card gallery. Cards are laid out along a shallow horizontal
 * arc, drift gently side-to-side and lean toward the pointer. By default they
 * use vertex-coloured gradient planes (no network fetch); pass `images` to load
 * real textures instead (loaded via `useTexture` and disposed on unmount).
 */
export default function CardScene({
  images,
  radius = 3.2,
  autoRotateSpeed = 1,
}: CardSceneProps): JSX.Element {
  const tier = useQualityTier();
  const reduced = useReducedMotion();
  const { pointerRef, handlers } = usePointerParallax(1);

  return (
    <div style={SCENE_WRAPPER_STYLE} aria-hidden="true" {...handlers}>
      <Canvas
        frameloop={reduced ? "demand" : "always"}
        dpr={tier.dpr}
        gl={{ antialias: tier.antialias, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 7], fov: 42 }}
        shadows={tier.shadows}
        style={CANVAS_LAYER_STYLE}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 3, 5]} intensity={20} color={PALETTE.indigo} castShadow={tier.shadows} />
        <pointLight position={[-4, -2, 4]} intensity={20} color={PALETTE.fuchsia} castShadow={tier.shadows} />

        {images && images.length > 0 ? (
            // Local Suspense keeps a texture fetch from tearing down the canvas
            // (which would otherwise be caught by the route-level boundary).
            <Suspense fallback={null}>
              <TexturedCardRing
                urls={images}
                radius={radius}
                autoRotateSpeed={autoRotateSpeed}
                reduced={reduced}
                parallaxRef={pointerRef}
              />
            </Suspense>
          ) : (
            <GradientCardRing
              radius={radius}
              autoRotateSpeed={autoRotateSpeed}
              reduced={reduced}
              parallaxRef={pointerRef}
            />
          )}
      </Canvas>
    </div>
  );
}

/** Positions a card along a gentle front-facing arc and tilts it to camera. */
function cardLayout(index: number, total: number, radius: number): CardSlot {
  const arc = Math.PI * 0.7;
  const t = total <= 1 ? 0.5 : index / (total - 1);
  const a = (t - 0.5) * arc;
  return {
    position: [Math.sin(a) * radius, Math.cos(a) * 0.9 - 0.15, Math.cos(a) * radius],
    rotation: [-0.06, -a, 0],
    phase: index * 1.3,
  };
}

interface RingProps {
  radius: number;
  autoRotateSpeed: number;
  reduced: boolean;
  parallaxRef: MutableRefObject<THREE.Vector2>;
}

function GradientCardRing({ radius, autoRotateSpeed, reduced, parallaxRef }: RingProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group || reduced) return;
    group.rotation.y = Math.sin(state.clock.elapsedTime * autoRotateSpeed * 0.2) * 0.45;
  });

  return (
    <group ref={groupRef}>
      {CARD_GRADIENTS.map(([colorA, colorB], i) => (
        <SceneCard
          key={`${colorA}-${colorB}`}
          colorA={colorA}
          colorB={colorB}
          edgeColor={colorB}
          slot={cardLayout(i, CARD_GRADIENTS.length, radius)}
          reduced={reduced}
          parallaxRef={parallaxRef}
        />
      ))}
    </group>
  );
}

interface TexturedRingProps extends RingProps {
  urls: string[];
}

function TexturedCardRing({ urls, radius, autoRotateSpeed, reduced, parallaxRef }: TexturedRingProps) {
  const textures = useTexture(urls);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    return () => {
      textures.forEach((texture) => texture.dispose());
    };
  }, [textures]);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group || reduced) return;
    group.rotation.y = Math.sin(state.clock.elapsedTime * autoRotateSpeed * 0.2) * 0.45;
  });

  return (
    <group ref={groupRef}>
      {textures.map((texture, i) => (
        <SceneCard
          key={`${urls[i]}-${i}`}
          texture={texture}
          colorA="#000000"
          colorB="#000000"
          edgeColor={PALETTE.cyan}
          slot={cardLayout(i, textures.length, radius)}
          reduced={reduced}
          parallaxRef={parallaxRef}
        />
      ))}
    </group>
  );
}

interface SceneCardProps {
  texture?: THREE.Texture;
  colorA: string;
  colorB: string;
  edgeColor: string;
  slot: CardSlot;
  reduced: boolean;
  parallaxRef?: MutableRefObject<THREE.Vector2>;
}

function SceneCard({
  texture,
  colorA,
  colorB,
  edgeColor,
  slot,
  reduced,
  parallaxRef,
}: SceneCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const smoothed = useRef(new THREE.Vector2());

  // Gradient (vertex-coloured) or plain (textured) plane — decided once.
  const geometry = useMemo(
    () =>
      texture
        ? new THREE.PlaneGeometry(CARD_W, CARD_H)
        : makeGradientPlane(CARD_W, CARD_H, colorA, colorB),
    [texture, colorA, colorB],
  );

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  const { position, rotation, phase } = slot;

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    if (parallaxRef) dampVec2(smoothed.current, parallaxRef.current, PARALLAX_LAMBDA, delta);

    // Reduced motion: hold the static arc pose.
    if (reduced) return;

    const t = state.clock.elapsedTime;
    const px = parallaxRef ? smoothed.current.x : 0;
    const py = parallaxRef ? smoothed.current.y : 0;

    group.position.set(
      position[0] + Math.sin(t * 0.5 + phase) * 0.06,
      position[1] + Math.sin(t * 0.7 + phase) * 0.1,
      position[2],
    );
    group.rotation.set(
      rotation[0] + Math.sin(t * 0.4 + phase) * 0.03 + py * 0.1,
      rotation[1] + px * 0.12,
      rotation[2] + Math.sin(t * 0.6 + phase) * 0.02,
    );
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          map={texture ?? null}
          vertexColors={!texture}
          transparent
          opacity={texture ? 1 : 0.92}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
        <Edges>
          <lineBasicMaterial color={edgeColor} transparent opacity={0.8} />
        </Edges>
      </mesh>
    </group>
  );
}
