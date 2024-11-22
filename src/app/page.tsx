'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, SoftShadows } from '@react-three/drei'

import MedievalLand from '@/components/models/medieval-land'
import { MathUtils } from 'three'

export default function Component() {
  return (
    <div className="w-full h-screen bg-[#bfc2c1] ">
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ 
          antialias: false,
          powerPreference: "high-performance"
        }}
      > 
        <SoftShadows 
          size={10}
          samples={8}
          focus={0.5}
        />
        <PerspectiveCamera makeDefault position={[0, 20, 25]} />
        <OrbitControls 
          enableZoom={true}
          minPolarAngle={MathUtils.degToRad(20)} // Restrict to 0 degrees (top view)
          maxPolarAngle={MathUtils.degToRad(80)} // Restrict to 80 degrees (slightly above horizon)
        />
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[-10, 15, -10]} 
          intensity={1} 
          castShadow
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-radius={8}
          shadow-blurSamples={16}
        />
        <hemisphereLight args={["#b1e1ff", "#000000", 0.8]} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <MedievalLand />
      </Canvas>
    </div>
  )
}