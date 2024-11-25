'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, SoftShadows } from '@react-three/drei'
import { MathUtils, DoubleSide } from 'three'

import MedievalLand from '@/components/models/medieval-land'

export default function Component() {
  return (
    <div className="w-full h-screen bg-[#3965ce] ">
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
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
          <pointLight position={[-10, 4, -20]} color="white" intensity={1} />
          <pointLight position={[0, -10, 0]} intensity={1} />
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
        <hemisphereLight 
          args={["#ffffff", "#b1e1ff", 0.2]}
        />
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.1, 0]} 
          receiveShadow
        >
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial 
            color="#4477ff" 
            side={DoubleSide} 
          />
        </mesh>
        <MedievalLand />
      </Canvas>
    </div>
  )
}