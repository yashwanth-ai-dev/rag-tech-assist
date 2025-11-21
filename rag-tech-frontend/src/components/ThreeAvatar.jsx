import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";

export default function ThreeAvatar() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3] }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Smooth Loading */}
      <Suspense fallback={null} />

      {/* Ambient neon glow */}
      <ambientLight intensity={0.6} color="#00ffff" />

      {/* Directional soft light */}
      <directionalLight position={[5, 5, 5]} intensity={1.4} color="#66ccff" />

      {/* Main Object */}
      <Sphere args={[1, 100, 200]} scale={1.1}>
        <MeshDistortMaterial
          color="#00eaff"
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>

      {/* Smooth Auto Orbit */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.5}
      />
    </Canvas>
  );
}
