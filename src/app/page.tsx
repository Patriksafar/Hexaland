'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

interface TileData {
  pos: [number, number, number]
  color: string
  height: number
  type: 'grass' | 'forest' | 'castle' | 'border' | 'hayle' | 'house'
  q: number
  r: number
  s: number
  isAnimating?: boolean
  isBuilding?: boolean
  buildProgress?: number
}

interface HexagonTileProps {
  position: [number, number, number]
  color: string
  height: number
  type: 'grass' | 'forest' | 'castle' | 'border' | 'hayle' | 'house'
  isAnimating?: boolean
  isBuilding?: boolean
  buildProgress?: number
  onHover?: () => void
  onUnhover?: () => void
  onClick?: (position: [number, number, number]) => void
}

const HexagonTile: React.FC<HexagonTileProps> = ({ 
  position, 
  color, 
  height, 
  type, 
  isAnimating, 
  isBuilding, 
  buildProgress = 0, 
  onHover, 
  onUnhover, 
  onClick 
}) => {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)
  const [animationProgress, setAnimationProgress] = useState(0)

  useFrame((state, delta) => {
    if (isAnimating) {
      setAnimationProgress((prev) => Math.min(prev + delta * 2, 1))
    } else {
      setAnimationProgress(0)
    }
  })

  const currentPosition = useMemo(() => {
    if (isAnimating) {
      const jumpHeight = Math.sin(animationProgress * Math.PI) * 0.2
      return [position[0], position[1] + jumpHeight, position[2]]
    }
    return position
  }, [position, isAnimating, animationProgress])

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

  const smallHexagonShape = useMemo(() => {
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
  }, [])

  const treeGeometry = useMemo(() => {
    if (type !== 'forest') return null
    const geometry = new THREE.ConeGeometry(0.2, 0.4, 8)
    return geometry
  }, [type])

  const handlePointerOver = () => {
    setHovered(true)
    if (onHover) onHover()
  }

  const handlePointerOut = () => {
    setHovered(false)
    if (onUnhover) onUnhover()
  }

  const handleClick = () => {
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
        <meshStandardMaterial color={hovered && (type === 'grass' || type === 'border') ? '#b2d6f8' : color} />
      </mesh>
      {type === 'forest' && treeGeometry && (
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
      {type === 'hayle' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, height + 0.02, 0]}>
          <extrudeGeometry 
            args={[
              smallHexagonShape, 
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
      {(type === 'house' || isBuilding) && (
        <group position={[0, height + 0.1, 0]}>
          <mesh position={[0, 0, 0]} scale={[1, buildProgress, 1]}>
            <boxGeometry args={[0.4, 0.3, 0.4]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 0.15 * buildProgress, 0]} scale={[1, buildProgress, 1]}>
            <coneGeometry args={[0.3, 0.2, 4]} />
            <meshStandardMaterial color="#A52A2A" />
          </mesh>
        </group>
      )}
    </group>
  )
}

const MedievalLand: React.FC = () => {
  const [tiles, setTiles] = useState<TileData[]>([])

  const generateTiles = (mapSize: number, borderSize: number): TileData[] => {
    const tileData: TileData[] = []
    const tileTypes: ('grass' | 'forest' | 'castle' | 'hayle')[] = ['grass', 'forest', 'castle', 'hayle']
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
            pos: [x, isBorderTile ? -0.1 : 0, z],
            color: isBorderTile ? '#ededed' : '#6EE7B7',
            height: 0.1,
            type: isBorderTile ? 'border' : tileTypes[Math.floor(Math.random() * tileTypes.length)],
            q,
            r,
            s,
            isAnimating: false,
            isBuilding: false,
            buildProgress: 0
          })
        }
      }
    }
    return tileData
  }

  useEffect(() => {
    setTiles(generateTiles(10, 1))
  }, [])

  const handleTileClick = (position: [number, number, number]) => {
    setTiles(prevTiles => {
      const newTiles = [...prevTiles]
      const index = newTiles.findIndex(tile => 
        tile.pos[0] === position[0] && 
        tile.pos[1] === position[1] && 
        tile.pos[2] === position[2]
      )
      if (index !== -1) {
        if (newTiles[index].type === 'border') {
          // Extend island
          const tileTypes: ('grass' | 'forest' | 'castle' | 'hayle')[] = ['grass', 'forest', 'castle', 'hayle']
          newTiles[index] = {
            ...newTiles[index],
            type: tileTypes[Math.floor(Math.random() * tileTypes.length)],
            color: "#6EE7B7",
            height: 0.2,
            isAnimating: true
          }

          // Add new border tiles
          const { q, r, s } = newTiles[index]
          const neighbors: [number, number, number][] = [
            [q+1, r-1, s], [q+1, r, s-1], [q, r+1, s-1],
            [q-1, r+1, s], [q-1, r, s+1], [q, r-1, s+1]
          ]

          neighbors.forEach(([nq, nr, ns]) => {
            const neighborIndex = newTiles.findIndex(tile => tile.q === nq && tile.r === nr && tile.s === ns)
            if (neighborIndex === -1) {
              const hexWidth = 1
              const hexHeight = Math.sqrt(3) / 2
              const x = hexWidth * (0.9 * nq)
              const z = hexHeight * (Math.sqrt(1.4) * nr + Math.sqrt(1.4) / 2 * nq)
              newTiles.push({
                pos: [x, -0.1, z],
                color: '#ededed',
                height: 0.1,
                type: 'border',
                q: nq,
                r: nr,
                s: ns,
                isAnimating: false,
                isBuilding: false,
                buildProgress: 0
              })
            }
          })
        } else if (newTiles[index].type === 'grass') {
          // Start building a house
          newTiles[index] = {
            ...newTiles[index],
            isBuilding: true,
            buildProgress: 0
          }

          // Start building process
          const buildInterval = setInterval(() => {
            setTiles(currentTiles => {
              const updatedTiles = [...currentTiles]
              const buildingTile = updatedTiles[index]
              if (buildingTile.buildProgress! < 1) {
                buildingTile.buildProgress! += 0.1
              } else {
                buildingTile.isBuilding = false
                buildingTile.type = 'house'
                clearInterval(buildInterval)
              }
              return updatedTiles
            })
          }, 1000) // Update every second for 10 seconds

          // Animate neighboring tiles
          const { q, r, s } = newTiles[index]
          const neighbors: [number, number, number][] = [
            [q+1, r-1, s], [q+1, r, s-1], [q, r+1, s-1],
            [q-1, r+1, s], [q-1, r, s+1], [q, r-1, s+1]
          ]

          neighbors.forEach(([nq, nr, ns]) => {
            const neighborIndex = newTiles.findIndex(tile => tile.q === nq && tile.r === nr && tile.s === ns)
            if (neighborIndex !== -1 && newTiles[neighborIndex].type !== 'border') {
              newTiles[neighborIndex] = {
                ...newTiles[neighborIndex],
                isAnimating: true
              }
            }
          })
        }
      }
      return newTiles
    })

    setTimeout(() => {
      setTiles(prevTiles => prevTiles.map(tile => ({ ...tile, isAnimating: false })))
    }, 500)
  }

  return (
    <group>
      {tiles.map((tile, index) => (
        <HexagonTile
          key={`${tile.q},${tile.r},${tile.s}`}
          position={tile.pos}
          color={tile.color}
          height={tile.height}
          type={tile.type}
          isAnimating={tile.isAnimating}
          isBuilding={tile.isBuilding}
          buildProgress={tile.buildProgress}
          onClick={handleTileClick}
        />
      ))}
    </group>
  )
}

export default function Component() {
  return (
    <div className="w-full h-screen bg-[#bfc2c1]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 20, 25]} />
        <OrbitControls enableZoom={true} />
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <directionalLight position={[-5, 8, -5]} intensity={1} castShadow />
        <hemisphereLight args={["#b1e1ff", "#000000", 0.6]} />
        <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={1.5} castShadow />
        <MedievalLand />
      </Canvas>
    </div>
  )
}