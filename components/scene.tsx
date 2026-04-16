'use client';

import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

type ShapeType =
  | 'torusKnot'
  | 'icosahedron'
  | 'octahedron'
  | 'dodecahedron'
  | 'torus'
  | 'tetrahedron';

interface ShapeProps {
  type: ShapeType;
  color: string;
  wireframe?: boolean;
  scale?: number;
  position: [number, number, number];
  velocity: [number, number, number];
  rotSpeed: [number, number, number];
}

function Shape({
  type,
  color,
  wireframe = false,
  scale = 1,
  position,
  velocity,
  rotSpeed,
}: ShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const vel = useRef(new THREE.Vector3(...velocity));
  const { size, camera } = useThree();

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const cam = camera as THREE.PerspectiveCamera;

    // Compute visible world-space bounds from the camera
    const fovRad = (cam.fov * Math.PI) / 180;
    const dist = cam.position.z;
    const h = 2 * Math.tan(fovRad / 2) * dist;
    const w = h * (size.width / size.height);
    const pad = scale * 0.85;
    const bx = w / 2 - pad;
    const by = h / 2 - pad;
    const bz = 2;

    mesh.position.x += vel.current.x * delta;
    mesh.position.y += vel.current.y * delta;
    mesh.position.z += vel.current.z * delta;

    if (Math.abs(mesh.position.x) > bx) {
      vel.current.x = -vel.current.x;
      mesh.position.x = Math.sign(mesh.position.x) * bx;
    }
    if (Math.abs(mesh.position.y) > by) {
      vel.current.y = -vel.current.y;
      mesh.position.y = Math.sign(mesh.position.y) * by;
    }
    if (Math.abs(mesh.position.z) > bz) {
      vel.current.z = -vel.current.z;
      mesh.position.z = Math.sign(mesh.position.z) * bz;
    }

    mesh.rotation.x += rotSpeed[0] * delta;
    mesh.rotation.y += rotSpeed[1] * delta;
    mesh.rotation.z += rotSpeed[2] * delta;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {type === 'torusKnot' && (
        <torusKnotGeometry args={[0.6, 0.2, 100, 16]} />
      )}
      {type === 'icosahedron' && <icosahedronGeometry args={[0.8, 1]} />}
      {type === 'octahedron' && <octahedronGeometry args={[0.9, 0]} />}
      {type === 'dodecahedron' && <dodecahedronGeometry args={[0.7, 0]} />}
      {type === 'torus' && <torusGeometry args={[0.7, 0.25, 16, 50]} />}
      {type === 'tetrahedron' && <tetrahedronGeometry args={[0.9, 0]} />}
      <meshStandardMaterial
        color={color}
        wireframe={wireframe}
        roughness={0.75}
        metalness={0.05}
      />
    </mesh>
  );
}

export default function Scene() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';

  const accent = dark ? '#8b3527' : '#C2503A';
  const neutral1 = dark ? '#3d3835' : '#d4cdc7';
  const neutral2 = dark ? '#2e2c2a' : '#c8c0b9';
  const wire = dark ? '#4a4540' : '#b0a8a2';

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={0.9} />
      <directionalLight position={[-4, -3, -4]} intensity={0.3} />

      {/* Torus knot — accent, solid */}
      <Shape
        type="torusKnot"
        color={accent}
        wireframe={false}
        scale={0.55}
        position={[-3, 1.5, -1]}
        velocity={[1.4, 1.1, 0.7]}
        rotSpeed={[0.4, 0.6, 0.2]}
      />

      {/* Icosahedron — wireframe */}
      <Shape
        type="icosahedron"
        color={wire}
        wireframe={true}
        scale={0.8}
        position={[3, -1, 0.5]}
        velocity={[-1.8, 1.3, -0.9]}
        rotSpeed={[0.3, 0.5, 0.1]}
      />

      {/* Octahedron — neutral solid */}
      <Shape
        type="octahedron"
        color={neutral1}
        wireframe={false}
        scale={0.7}
        position={[1.5, 2, -0.5]}
        velocity={[1.2, -1.6, 0.5]}
        rotSpeed={[0.5, 0.3, 0.4]}
      />

      {/* Dodecahedron — wireframe */}
      <Shape
        type="dodecahedron"
        color={wire}
        wireframe={true}
        scale={0.75}
        position={[-2, -2, 1]}
        velocity={[-1.3, -1.5, 1.0]}
        rotSpeed={[0.2, 0.4, 0.3]}
      />

      {/* Torus — neutral solid */}
      <Shape
        type="torus"
        color={neutral2}
        wireframe={false}
        scale={0.65}
        position={[0, -1.5, -1]}
        velocity={[-1.6, 0.9, -0.7]}
        rotSpeed={[0.6, 0.2, 0.5]}
      />

      {/* Tetrahedron — wireframe */}
      <Shape
        type="tetrahedron"
        color={wire}
        wireframe={true}
        scale={0.65}
        position={[2.5, 1.5, 0.3]}
        velocity={[2.0, -1.1, 1.2]}
        rotSpeed={[0.3, 0.6, 0.2]}
      />
    </Canvas>
  );
}
