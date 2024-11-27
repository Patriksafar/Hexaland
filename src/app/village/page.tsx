'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { MathUtils } from 'three'
import VillageSimulator from '@/components/village/village-simulator'
import ResourceCounter from '@/components/resource-counter'

export default function VillagePage() {
  return (
    <div className="w-full h-screen bg-[#3965ce]">
      <ResourceCounter />
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        gl={{ 
          antialias: false,
          powerPreference: "high-performance"
        }}
      > 
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[2.5, 8, 5]}
          intensity={1.5}
          shadow-mapSize={1024}
        />
        <PerspectiveCamera makeDefault position={[0, 20, 25]} />
        <OrbitControls 
          enableZoom={true}
          minPolarAngle={MathUtils.degToRad(20)}
          maxPolarAngle={MathUtils.degToRad(80)}
        />
        <VillageSimulator />
      </Canvas>
    </div>
  )
} 