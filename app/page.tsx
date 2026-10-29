"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function Mars() {
  const planet = useRef<THREE.Mesh>(null);
  const atmosphere = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (planet.current) planet.current.rotation.y += delta * 0.055;
    if (atmosphere.current) atmosphere.current.rotation.y -= delta * 0.018;
  });

  return (
    <group position={[1.9, -0.15, -1.4]}>
      <Float speed={0.65} rotationIntensity={0.08} floatIntensity={0.16}>
        <mesh ref={planet}>
          <sphereGeometry args={[1.52, 96, 96]} />
          <meshStandardMaterial
            color="#a84b32"
            roughness={0.92}
            metalness={0.04}
          />
        </mesh>
        <mesh ref={atmosphere} scale={1.045}>
          <sphereGeometry args={[1.52, 64, 64]} />
          <meshBasicMaterial
            color="#f18b63"
            transparent
            opacity={0.075}
            side={THREE.BackSide}
          />
        </mesh>
      </Float>
    </group>
  );
}

function SpaceScene() {
  const dust = useMemo(() => {
    const positions = new Float32Array(420 * 3);
    for (let i = 0; i < 420; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = -Math.random() * 15;
    }
    return positions;
  }, []);
  const dustRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (dustRef.current) {
      dustRef.current.rotation.y += delta * 0.004;
      dustRef.current.position.z = (dustRef.current.position.z + delta * 0.12) % 3;
    }
  });

  return (
    <>
      <color attach="background" args={["#05070d"]} />
      <fog attach="fog" args={["#05070d", 8, 24]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[-4, 3, 5]} intensity={3.1} color="#ffd0a8" />
      <pointLight position={[3, -1, 2]} intensity={1.2} color="#e75d37" />
      <Stars radius={90} depth={55} count={2400} factor={3} saturation={0.15} fade speed={0.25} />
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#d7d9e8" size={0.018} transparent opacity={0.62} sizeAttenuation />
      </points>
      <Mars />
    </>
  );
}

function useCountdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const target = new Date(2026, 11, 3, 0, 0, 0).getTime();
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
        <Canvas camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.6]}>
          <Suspense fallback={null}>
            <SpaceScene />
          </Suspense>
        </Canvas>
      </div>
      <div className="vignette" aria-hidden="true" />
      <header className="topbar">
        <a className="wordmark" href="#" aria-label="December 03 home">
          <span className="wordmark-mark">M</span>
          <span>DEEP SPACE <span className="wordmark-muted">/ 001</span></span>
        </a>
        <span className="topbar-status"><span className="status-dot" /> MISSION COUNTDOWN</span>
      </header>

      <section className="hero" aria-labelledby="headline">
        <p className="eyebrow"><span /> A DATE WITH THE UNKNOWN</p>
        <h1 id="headline">Something<br /><em>is coming.</em></h1>
        <p className="intro">The universe is in motion. We’re counting down to the next chapter.</p>

        <div className="countdown" aria-label="Countdown to December 3, 2026">
          {time.arrived ? (
            <div className="arrived">THE DAY HAS ARRIVED<span>Welcome to December 03.</span></div>
          ) : (
            units.map((unit, index) => (
              <div className="time-unit" key={unit.label}>
                <span className="time-value">{time.ready ? pad(unit.value) : "--"}</span>
                <span className="time-label">{unit.label}</span>
                {index < units.length - 1 && <span className="time-separator" aria-hidden="true">:</span>}
              </div>
            ))
          )}
        </div>

        <div className="destination">
          <span className="destination-line" />
          <div>
            <span className="destination-label">DESTINATION DATE</span>
            <span className="destination-date">DECEMBER 03 <span>·</span> 2026</span>
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>EXPLORING WHAT COMES NEXT</span>
        <span className="coordinates">33° 51&apos; 24.0&quot; N &nbsp; 118° 24&apos; 00.0&quot; W</span>
        <span className="footer-index">NO. 003 <span>—</span> 2026</span>
      </footer>
    </main>
  );
}
