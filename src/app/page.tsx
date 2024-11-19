'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const HexagonTile = ({ position, color, height, type, onHover, onUnhover }) => {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef()

  const hexagonShape = useMemo(() => {
    const shape = new THREE.Shape()
    const size = 1 / Math.sqrt(3)
    const cornerRadius = 0.05
    
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i
      const nextAngle = (Math.PI / 3) * ((i + 1) % 6)
      
      const x1 = size * Math.cos(angle)
      const y1 = size * Math.sin(angle)
      const x2 = size * Math.cos(nextAngle)
      const y2 = size * Math.sin(nextAngle)
      
      if (i === 0) {
        shape.moveTo(x1, y1)
      }
      
      const midX = (x1 + x2) / 2
      const midY = (y1 + y2) / 2
      const controlX = midX + cornerRadius * (midY - y1)
      const controlY = midY - cornerRadius * (midX - x1)
      
      shape.quadraticCurveTo(controlX, controlY, x2, y2)
    }
    
    shape.closePath()
    return shape
  }, [])

  const treeGeometry = useMemo(() => {
    if (type !== 'forest') return null
    const geometry = new THREE.ConeGeometry(0.2, 0.4, 8)
    return geometry
  }, [type])

  const handlePointerOver = (event) => {
    event.stopPropagation()
    setHovered(true)
    if (onHover) onHover()
  }

  const handlePointerOut = (event) => {
    event.stopPropagation()
    setHovered(false)
    if (onUnhover) onUnhover()
  }

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <extrudeGeometry 
          args={[
            hexagonShape, 
            { 
              depth: height, 
              bevelEnabled: true,
              bevelThickness: 0.02,
              bevelSize: 0.02,
              bevelSegments: 5
            }
          ]} 
        />
        <meshStandardMaterial color={hovered && type === 'border' ? '#ff0000' : color} />
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
            <cylinderGeometry args={[0.15, 0.15, 0.2, 8]} />
            <meshStandardMaterial color="#4B5563" />
          </mesh>
        </group>
      )}
    </group>
  )
}

const MedievalLand = () => {
  const groupRef = useRef()
  const [hoveredTile, setHoveredTile] = useState(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001
    }
  })

  const tiles = useMemo(() => {
    const tileData = []
    const mapSize = 20
    const borderSize = 1 // Size of the undefined tiles border
    const tileTypes = ['grass', 'forest', 'castle']
    const hexWidth = 1
    const hexHeight = Math.sqrt(3) / 2

    for (let q = -Math.floor((mapSize + borderSize * 2) / 2); q < Math.ceil((mapSize + borderSize * 2) / 2); q++) {
      for (let r = -Math.floor((mapSize + borderSize * 2) / 2); r < Math.ceil((mapSize + borderSize * 2) / 2); r++) {
        const s = -q - r
        const maxCoord = Math.max(Math.abs(q), Math.abs(r), Math.abs(s))
        if (maxCoord < Math.floor((mapSize + borderSize * 2) / 2)) {
          const x = hexWidth * (0.9 * q)
          const z = hexHeight * (Math.sqrt(1.4) * r + Math.sqrt(1.4) / 2 * q)
          const isBorderTile = maxCoord >= Math.floor(mapSize / 2) && maxCoord < Math.floor((mapSize + borderSize * 2) / 2)
          tileData.push({
            pos: isBorderTile ? [x, -0.1, z] : [x, 0, z],
            color: isBorderTile ? '#ededed' : '#6EE7B7',
            height: 0.1,
            type: isBorderTile ? 'border' : tileTypes[Math.floor(Math.random() * tileTypes.length)]
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
        onHover={() => setHoveredTile(index)}
        onUnhover={() => setHoveredTile(null)}
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