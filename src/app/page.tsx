'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const HexagonTile = ({ position, color, height, type }) => {
  const hexagonShape = useMemo(() => {
    const shape = new THREE.Shape()
    const size = 1 / Math.sqrt(3)
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i
      const x = size * Math.cos(angle)
      const y = size * Math.sin(angle)
      if (i === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    }
    shape.closePath()
    return shape
  }, [])

  const treeGeometry = useMemo(() => {
    if (type !== 'forest') return null
    const geometry = new THREE.ConeGeometry(0.2, 0.4, 4)
    return geometry
  }, [type])

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <extrudeGeometry 
          args={[
            hexagonShape, 
            { 
              depth: height, 
              bevelEnabled: false
            }
          ]} 
        />
        <meshStandardMaterial color={color} />
      </mesh>
      {type === 'forest' && (
        <group position={[0, height + 0.2, 0]}>
          <mesh geometry={treeGeometry}>
            <meshStandardMaterial color="#2D7D6F" />
          </mesh>
        </group>
      )}
      {type === 'castle' && (
        <group position={[0, height + 0.1, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#6B7280" />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.2, 6]} />
            <meshStandardMaterial color="#4B5563" />
          </mesh>
        </group>
      )}
    </group>
  )
}

const MedievalLand = () => {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001
    }
  })

  const tiles = useMemo(() => {
    const tileData = []
    const mapSize = 20
    const tileTypes = ['grass', 'forest', 'castle']
    const hexWidth = 1
    const hexHeight = Math.sqrt(3) / 2

    for (let q = -Math.floor(mapSize/2); q < Math.ceil(mapSize/2); q++) {
      for (let r = -Math.floor(mapSize/2); r < Math.ceil(mapSize/2); r++) {
        const s = -q - r * 1
        if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) < Math.floor(mapSize/2)) {
          const x = hexWidth * (0.9 * q )
          const z = hexHeight * (Math.sqrt(1.4) * r + Math.sqrt(1.4)/2 * q)
          tileData.push({
            pos: [x, 0, z],
            color: '#6EE7B7',
            height: 0.1,
            type: tileTypes[Math.floor(Math.random() * tileTypes.length)]
          })
        }
      }
    }

    return tileData.map((tile, index) => (
      <HexagonTile
        key={index}
        position={tile.pos}
        color={tile.color}
        height={tile.height}
        type={tile.type}
      />
    ))
  }, [])

  return <group ref={groupRef}>{tiles}</group>
}

export default function Component() {
  return (
    <div className="w-full h-screen bg-[#bfc2c1]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 20, 25]} />
        <OrbitControls enableZoom={true} />
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 8, -5]} intensity={0.8} castShadow />
        <MedievalLand />
      </Canvas>
    </div>
  )
}