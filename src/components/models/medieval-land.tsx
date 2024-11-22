'use client'

import { useState, useEffect, useCallback } from 'react'

import BuildingModel, {BuildingType, buildingUrls}  from '@/components/models/building-model'
import HexagonTile from '@/components/models/hexagon-tile'
import { Html } from '@react-three/drei'
import BuildingSelectionDialog from '../dialogs/building-selection-dialog'

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

const MAP_SIZE = 10

const generateTiles = (mapSize: number, borderSize: number): TileData[] => {
  const tileData: TileData[] = []
  const tileTypes: ('grass' | 'forest')[] = ['grass', 'forest']
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
          color: isBorderTile ? '#ffffff' : '#67e8b1',
          height: 0.1,
          type: isBorderTile ? 'border' : tileTypes[Math.floor(Math.random() * tileTypes.length)],
          q,
          r,
          s,
          isBuilding: false,
          buildProgress: 0
        })
      }
    }
  }
  
  return tileData
}

const MedievalLand: React.FC = () => {
  const [tiles, setTiles] = useState<TileData[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTilePosition, setSelectedTilePosition] = useState<[number, number, number] | null>(null)

  useEffect(() => {
    setTiles(generateTiles(MAP_SIZE, 1))
  }, [])

  const handleBuildingSelect = useCallback((buildingType: string) => {
    if (!selectedTilePosition) return

    setTiles(prevTiles => {
      const newTiles = [...prevTiles]
      const index = newTiles.findIndex(tile => 
        tile.pos[0] === selectedTilePosition[0] && 
        tile.pos[1] === selectedTilePosition[1] && 
        tile.pos[2] === selectedTilePosition[2]
      )

      if (index !== -1) {
        newTiles[index] = {
          ...newTiles[index],
          isBuilding: true,
          buildProgress: 0,
          type: buildingType
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
        }, 100)
      }
      return newTiles
    })
  }, [selectedTilePosition])

  const handleTileClick = useCallback((position: [number, number, number]) => {
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
          const tileTypes: ('grass' | 'forest')[] = ['grass', 'forest']
          newTiles[index] = {
            ...newTiles[index],
            type: tileTypes[Math.floor(Math.random() * tileTypes.length)],
            color: "#6EE7B7",
            height: 0.2,
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
                color: '#ffffff',
                height: 0.1,
                type: 'border',
                q: nq,
                r: nr,
                s: ns,
                isBuilding: false,
                buildProgress: 0
              })
            } else if (newTiles[neighborIndex].type !== 'border') {
              newTiles[neighborIndex] = {
                ...newTiles[neighborIndex],
              }
            }
          })
        } else if (newTiles[index].type === 'grass') {
          setSelectedTilePosition(position)
          setDialogOpen(true)
        }
      }
      return newTiles
    })
  }, [])

  return (
    <>
      <group>
        {tiles.map((tile) => (
          <HexagonTile
            key={`${tile.q},${tile.r},${tile.s}`}
            position={tile.pos}
            color={tile.color}
            height={tile.height}
            type={tile.type}
            isBuilding={tile.isBuilding}
            buildProgress={tile.buildProgress}
            onClick={handleTileClick}
          >
            {((Object.keys(buildingUrls) ?? []).includes(tile.type)) && (
              <BuildingModel type={tile.type as BuildingType} />
            )}
          </HexagonTile>
        ))}
      </group>
      <Html>
        <BuildingSelectionDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSelect={handleBuildingSelect}
        />
      </Html>
    </>
  )
}

export default MedievalLand