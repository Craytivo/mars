"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function Planet() {
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (planetRef.current) planetRef.current.rotation.y += delta * 0.045;
    if (atmosphereRef.current) atmosphereRef.current.rotation.y -= delta * 0.012;
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.006;
    state.camera.position.x = THREE.MathUtils.damp(
      state.camera.position.x,
      state.pointer.x * 0.16,
      1.2,
      delta,
    );
    state.camera.position.y = THREE.MathUtils.damp(
      state.camera.position.y,
      state.pointer.y * 0.1,
      1.2,
      delta,
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group position={[3.35, -0.35, -2.1]}>
      <Float speed={0.5} rotationIntensity={0.035} floatIntensity={0.1}>
        <mesh ref={planetRef}>
          <sphereGeometry args={[1.72, 96, 96]} />
          <meshStandardMaterial
            color="#a85c41"
            roughness={0.96}
            metalness={0.015}
          />
        </mesh>
        <mesh ref={atmosphereRef} scale={1.055}>
          <sphereGeometry args={[1.72, 72, 72]} />
          <meshBasicMaterial
            color="#ee9974"
            transparent
            opacity={0.09}
            side={THREE.BackSide}
          />
        </mesh>
        <group ref={ringRef} rotation={[1.18, 0.18, -0.42]}>
          <mesh>
            <ringGeometry args={[2.05, 2.48, 128]} />
            <meshBasicMaterial
              color="#c88d74"
              transparent
              opacity={0.17}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

function Asteroids() {
  const group = useRef<THREE.Group>(null);
  const asteroids = useMemo(
    () =>
      Array.from({ length: 32 }, (_, index) => ({
        position: [
          (Math.random() - 0.5) * 19,
          (Math.random() - 0.5) * 10,
          -Math.random() * 12 - 1,
        ] as [number, number, number],
        scale: 0.025 + Math.random() * (index % 5 === 0 ? 0.18 : 0.055),
        rotation: Math.random() * Math.PI,
      })),
    [],
  );

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.004;
  });

  return (
    <group ref={group}>
      {asteroids.map((asteroid, index) => (
        <mesh
          key={index}
          position={asteroid.position}
          scale={asteroid.scale}
          rotation={[asteroid.rotation, asteroid.rotation * 0.6, 0]}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#62616a" roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function NebulaGlow() {
  return (
    <group position={[-2.9, 1.6, -8]}>
      <mesh scale={[4.2, 2.6, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#263b70" transparent opacity={0.12} />
      </mesh>
      <pointLight color="#4865af" intensity={1.2} distance={15} />
    </group>
  );
}

function SpaceScene() {
  const dust = useMemo(() => {
    const positions = new Float32Array(950 * 3);
    for (let i = 0; i < 950; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 27;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = -Math.random() * 20;
    }
    return positions;
  }, []);
  const dustRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (dustRef.current) {
      dustRef.current.rotation.y += delta * 0.002;
      dustRef.current.rotation.x += delta * 0.0005;
    }
  });

  return (
    <>
      <color attach="background" args={["#03050b"]} />
      <fog attach="fog" args={["#03050b", 10, 28]} />
      <ambientLight intensity={0.26} />
      <directionalLight
        position={[-5, 4, 5]}
        intensity={2.5}
        color="#f5c7b2"
      />
      <pointLight position={[4, 0, 2]} intensity={1.8} color="#c76d52" />
      <pointLight position={[-4, 2, -4]} intensity={0.9} color="#3855a1" />
      <Stars
        radius={100}
        depth={65}
        count={3200}
        factor={3.2}
        saturation={0.2}
        fade
        speed={0.22}
      />
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#c8d6ff"
          size={0.021}
          transparent
          opacity={0.68}
          sizeAttenuation
        />
      </points>
      <NebulaGlow />
      <Asteroids />
      <Planet />
    </>
  );
}

function useCountdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Midnight at the beginning of December 3 in the visitor's local timezone.
  const target = new Date(2026, 11, 3, 0, 0, 0, 0).getTime();
  const remaining = Math.max(0, target - (now ?? target));

  return {
    ready: now !== null,
    arrived: now !== null && now >= target,
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining % 86_400_000) / 3_600_000),
    minutes: Math.floor((remaining % 3_600_000) / 60_000),
    seconds: Math.floor((remaining % 60_000) / 1000),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function Home() {
  const time = useCountdown();
  const units = [
    { label: "DAYS", value: time.days },
    { label: "HOURS", value: time.hours },
    { label: "MINUTES", value: time.minutes },
    { label: "SECONDS", value: time.seconds },
  ];

  return (
    <main className="experience">
      <div className="scene" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 43 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            <SpaceScene />
          </Suspense>
        </Canvas>
      </div>
      <div className="vignette" aria-hidden="true" />

      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="December 3 countdown home">
          <span className="wordmark-mark">M</span>
          <span>
            DEEP SPACE <span className="wordmark-muted">/ 003</span>
          </span>
        </a>
        <span className="topbar-status">
          <span className="status-dot" /> LIVE COUNTDOWN
        </span>
      </header>

      <section className="hero" id="home" aria-labelledby="headline">
        <p className="eyebrow">
          <span /> A DATE WITH THE UNKNOWN
        </p>
        <h1 id="headline">
          The universe
          <br />
          <em>is in motion.</em>
        </h1>
        <p className="intro">
          One moment. One destination. The countdown to December 3 has begun.
        </p>

        <div
          className="countdown"
          aria-label="Countdown to December 3, 2026"
          aria-live="off"
        >
          {time.arrived ? (
            <div className="arrived">
              THE DAY HAS ARRIVED
              <span>Welcome to December 3.</span>
            </div>
          ) : (
            units.map((unit, index) => (
              <div className="time-unit" key={unit.label}>
                <span className="time-value">
                  {time.ready ? pad(unit.value) : "--"}
                </span>
                <span className="time-label">{unit.label}</span>
                {index < units.length - 1 && (
                  <span className="time-separator" aria-hidden="true">
                    :
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <div className="destination">
          <span className="destination-line" />
          <div>
            <span className="destination-label">DESTINATION DATE</span>
            <span className="destination-date">
              DECEMBER 03 <span>·</span> 2026
            </span>
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>EXPLORING WHAT COMES NEXT</span>
        <span className="coordinates">DEEP SPACE · SOL SYSTEM</span>
        <span className="footer-index">
          NO. 003 <span>—</span> 2026
        </span>
      </footer>
    </main>
  );
}
