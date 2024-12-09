'use client'

import { useEditMode } from '@/hooks/useEditMode'
import { is } from 'drizzle-orm'
import { memo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import BuildingModel from './building-model'
import { useFrame } from '@react-three/fiber'

interface HexagonTileProps {
  id: string
  position: [number, number, number]
  color: string
  height: number
  type: string
  isAnimating?: boolean
  isBuilding?: boolean
  buildProgress?: number
  onHover?: () => void
  onUnhover?: () => void
  onClick?: (id: string) => void
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

const HexagonTile: React.FC<HexagonTileProps> = ({ 
  id,
  position, 
  color, 
  height, 
  type, 
  onHover, 
  onUnhover, 
  onClick,
  children,
}) => {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)
  const [sound, setSound] = useState<THREE.Audio | null>(null)
  const currentPosition = position
  const { isBuildMode } = useEditMode()

  const hoveredBuildingRef = useRef<THREE.Group>(null)
  let levitateDirection = 1;
  const levitateSpeed = 0.001;
  const maxHeight = 0.3;
  const minHeight = 0.15;

  useFrame(() => {
    if (hoveredBuildingRef.current) {
      hoveredBuildingRef.current.position.y += levitateSpeed * levitateDirection;

      if (hoveredBuildingRef.current.position.y >= maxHeight || hoveredBuildingRef.current.position.y <= minHeight) {
        levitateDirection *= -1;
      }
    }
  })

  useEffect(() => {
    // Create audio listener and sound
    const listener = new THREE.AudioListener()
    const sound = new THREE.Audio(listener)
    const audioLoader = new THREE.AudioLoader()

    audioLoader.load('./tile-pop.mp3', (buffer) => {
      sound.setBuffer(buffer)
      sound.setVolume(0.5)
      // speed up the sound
      // start the sound from 0.5 seconds
      sound.playbackRate = 1.5
      sound.offset = 0.15
      setSound(sound)
    })

    return () => {
      sound.disconnect()
    }
  }, [])

  const handlePointerOver = () => {
    setHovered(true)
    if (onHover) onHover()
  }

  const handlePointerOut = () => {
    setHovered(false)
    if (onUnhover) onUnhover()
  }

  const handleClick = () => {
    if (sound && !sound.isPlaying) {
      sound.play()
    }
    if (onClick) onClick(id)
  }

  const hasBuildings = type !== "empty"

  const getTileColor = () => {
    if (hovered && isBuildMode) {
      if((type === "empty" || type === "border")) {
        return '#05aa5a'
      }
      
      return '#b64a55'
    }

    // disable hover effect on buildings
    if (isBuildMode && hasBuildings) {

      return '#898d89'
    }

    if(hovered && (type === "border" || type !== "empty") ) {
      
      return '#05aa5a'
    }

    return color
  }

  const finalColor = getTileColor()

  return (
    <group position={new THREE.Vector3(...currentPosition)}>
      <mesh 
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          handlePointerOver();
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          handlePointerOut();
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        castShadow={!(isBuildMode && hasBuildings)}
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
              bevelSegments: 5,
            }
          ]} 
        />
      
        <meshStandardMaterial 
          color={finalColor}
          transparent={false}
          depthWrite={true}
          depthTest={true}
          side={THREE.FrontSide}
          key={"opaque"}
        />
        
      </mesh>
      {(type !== 'grass' && type !== 'border') && (
        <group position={[0, height, 0]} rotation={[0, Math.PI / 6.1, 0]}>

          {isBuildMode && hovered && (
            <group position={[0, 0.2, 0]} ref={hoveredBuildingRef}>
              <BuildingModel type="blacksmith" />
            </group>
          )}

          {children}
        </group>
      )}
    </group>
  )
}

export default memo(HexagonTile)