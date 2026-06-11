"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, DepthOfField, Noise } from "@react-three/postprocessing";
import Stamp from "./Stamp";
import InkPaper from "./InkPaper";
import { cameraPose, impact, lightState, stampPose } from "./choreography";

export type ScrollState = { p: number; press: number };

const look = new THREE.Vector3();

export default function Scene({
  scroll,
  isMobile,
}: {
  scroll: ScrollState;
  isMobile: boolean;
}) {
  const stampRef = useRef<THREE.Group>(null);
  const keyRef = useRef<THREE.SpotLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const p = scroll.p;
    const t = clock.getElapsedTime();

    // hero blocking
    const stamp = stampRef.current;
    if (stamp) {
      const pose = stampPose(p, t, scroll.press);
      stamp.visible = pose.visible;
      stamp.position.set(...pose.pos);
      stamp.rotation.set(...pose.rot);
      stamp.scale.setScalar(pose.scale);
    }

    // camera, with a hard little kick at the moment of impact
    const cam = cameraPose(p, isMobile);
    const kick = impact(p) * 0.045;
    camera.position.set(
      cam.pos[0] + (Math.random() - 0.5) * kick,
      cam.pos[1] + (Math.random() - 0.5) * kick,
      cam.pos[2],
    );
    camera.lookAt(look.set(...cam.look));

    // lighting follows the colour grade
    const lights = lightState(p);
    if (ambientRef.current) ambientRef.current.intensity = lights.ambient;
    if (keyRef.current) keyRef.current.intensity = lights.key;
    if (rimRef.current) rimRef.current.intensity = lights.rim;
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.14} color="#fff2e2" />
      {/* key — the theatrical product-film spot */}
      <spotLight
        ref={keyRef}
        position={[-2.6, 4.2, 3.4]}
        angle={0.5}
        penumbra={0.85}
        intensity={26}
        color="#ffefdd"
        castShadow={false}
      />
      {/* rim — separates the dark wood from the dark void */}
      <directionalLight ref={rimRef} position={[3.5, 1.6, -3.2]} intensity={2.2} color="#e8e2d6" />

      {/* procedural studio reflections — no HDRI download */}
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" position={[0, 4, 2]} scale={[5, 2, 1]} intensity={2.2} color="#fff3e0" />
        <Lightformer form="rect" position={[-4, 1, -1]} rotation-y={Math.PI / 2} scale={[3, 1.5, 1]} intensity={0.9} color="#e6e0d2" />
        <Lightformer form="rect" position={[4, 0.5, -2]} rotation-y={-Math.PI / 2} scale={[2, 1, 1]} intensity={0.6} color="#d8d2c4" />
      </Environment>

      <Stamp ref={stampRef} />
      <InkPaper scroll={scroll} />

      {/* product-film DOF + a breath of grain; desktop only */}
      {!isMobile ? (
        <EffectComposer multisampling={0}>
          <DepthOfField focusDistance={0.025} focalLength={0.09} bokehScale={2.2} />
          <Noise opacity={0.04} />
        </EffectComposer>
      ) : null}
    </>
  );
}
