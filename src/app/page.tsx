'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, useGLTF, SoftShadows } from '@react-three/drei'
import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'

import BuildingModel  from '@/components/models/building-model'
import ForestModel from '@/components/models/forest-model'

interface TileData {
  pos: [number, number, number]
  color: string
  height: number
  type: string
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
  type: string
  isAnimating?: boolean
  isBuilding?: boolean
  buildProgress?: number
  onHover?: () => void
  onUnhover?: () => void
  onClick?: (position: [number, number, number]) => void
  children?: React.ReactNode
}
const buildingTypes = [
  'house',
  'mill',
  'well',
  'barracks',
  'market',
  'watchtower',
  'mine',
  'lumbermill',
  'castle'
]

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
  onClick,
  children
}) => {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)
  const [animationProgress, setAnimationProgress] = useState(0)

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
        castShadow
        receiveShadow
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

const MedievalLand: React.FC = () => {
  const [tiles, setTiles] = useState<TileData[]>([])

  const generateTiles = (mapSize: number, borderSize: number): TileData[] => {
    const tileData: TileData[] = []
    const tileTypes: ('grass' | 'forest' | 'hayle')[] = ['grass', 'forest', 'hayle']
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
            color: isBorderTile ? '#ededed' : '#67e8b1',
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

  const getRandomBuilding = () => {
    return buildingTypes[Math.floor(Math.random() * buildingTypes.length)]
  }

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
          const tileTypes: ('grass' | 'forest' | 'hayle')[] = ['grass', 'forest', 'hayle']
          newTiles[index] = {
            ...newTiles[index],
            type: tileTypes[Math.floor(Math.random() * tileTypes.length)],
            color: "#6EE7B7",
            height: 0.2,
            isAnimating: true
          }

          // Add new border tiles and animate neighboring tiles
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
            } else if (newTiles[neighborIndex].type !== 'border') {
              newTiles[neighborIndex] = {
                ...newTiles[neighborIndex],
                isAnimating: true
              }
            }
          })
        } else if (newTiles[index].type === 'grass') {
          // Start building a random building
          const randomBuilding = getRandomBuilding()
          newTiles[index] = {
            ...newTiles[index],
            isBuilding: true,
            buildProgress: 0,
            type: randomBuilding
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
                clearInterval(buildInterval)
              }
              return updatedTiles
            })
          }, 100) // Update every 100ms for a total of 1 second

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
      {tiles.map((tile) => (
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
        >
          {(tile.type !== 'grass' && tile.type !== 'forest' && tile.type !== 'border' && tile.type !== 'hayle') && (
            <BuildingModel type={tile.type} />
          )}
        </HexagonTile>
      ))}
    </group>
  )
}

export default function Component() {
  return (
    <div className="w-full h-screen bg-[#bfc2c1]">
      <Canvas shadows>
        <SoftShadows size={25} samples={16} focus={0.5} />
        <PerspectiveCamera makeDefault position={[0, 20, 25]} />
        <OrbitControls enableZoom={true} />
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