'use client'

import { memo, useRef, useState } from 'react'
import * as THREE from 'three'

import ForestModel from '@/components/models/forest-model'

interface HexagonTileProps {
  position: [number, number, number]
  color: string
  height: number
  type: string
  isAnimating?: boolean
  isBuilding?: boolean
  buildProgress?: number
  onHover?: () => void
  onUnhover?: () => void
  onClick?: (position: [number, number, number]) => void
  children?: React.ReactNode
}

const hexagonShape = () => {
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
}

const hayleHexagonShape = () => {
  const shape = new THREE.Shape()
  const size = (1 / Math.sqrt(3)) * 0.8
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
}

const HexagonTile: React.FC<HexagonTileProps> = ({ 
  position, 
  color, 
  height, 
  type, 
  onHover, 
  onUnhover, 
  onClick,
  children
}) => {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)
  const currentPosition = position

  // sound effect
  const listener = new THREE.AudioListener()
  const audioLoader = new THREE.AudioLoader()
  const clickSound = new THREE.Audio(listener)
  audioLoader.load('tile-pop.mp3', (buffer) => {
    console.log('loaded')

    clickSound.setBuffer(buffer)
    clickSound.setVolume(1)
  })

  const handlePointerOver = () => {
    setHovered(true)
    if (onHover) onHover()
  }

  const handlePointerOut = () => {
    setHovered(false)
    if (onUnhover) onUnhover()
  }

  const handleClick = () => {
    clickSound.play()

    if (onClick) onClick(position)
  }

  return (
    <group position={new THREE.Vector3(...currentPosition)}>
      <mesh 
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <extrudeGeometry 
          args={[
            hexagonShape(), 
            { 
              depth: height, 
              bevelEnabled: true,
              bevelThickness: 0.02,
              bevelSize: 0.02,
              bevelSegments: 5
            }
          ]} 
        />
        <meshStandardMaterial color={hovered && (type === 'grass' || type === 'border') ? '#6e88e7' : color} />
      </mesh>
      {type === 'forest' && (
        <group position={[0, height, 0]}>
          <group rotation={[0, Math.PI / 6.5, 0]}>
            <ForestModel />
          </group>
        </group>
      )}
      {type === 'hayle' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, height + 0.02, 0]} castShadow receiveShadow>
          <extrudeGeometry 
            args={[
              hayleHexagonShape(), 
              { 
                depth: 0.05, 
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.01,
                bevelSegments: 3
              }
            ]} 
          />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      )}
      {/* Building slot */}
      {(type !== 'grass' && type !== 'forest' && type !== 'border' && type !== 'hayle') && (
        <group position={[0, height, 0]}>
          <group rotation={[0, Math.PI / 6.5, 0]}>
            {children}
          </group>
        </group>
      )}
    </group>
  )
}

export default memo(HexagonTile)