'use client'

import { useState, useEffect, useCallback } from 'react'
import { Html } from '@react-three/drei'
import HexagonTile from '@/components/models/hexagon-tile'
import BuildingModel from '@/components/models/building-model'
import { TileData } from '@/types/game'
import BuildingSelectionDialog from '../dialogs/building-selection-dialog'
import { useResources } from '@/hooks/useResources'

interface VillageTile extends TileData {
  lastHarvested?: number
  resources?: number
}

const VILLAGE_SIZE = 10
const HEX_WIDTH = 1
const HEX_HEIGHT = Math.sqrt(3) / 2
const HARVEST_COOLDOWN = 10000 // 10 seconds
const RESOURCE_YIELD = 10

const generateVillageTiles = (size: number): VillageTile[] => {
  const tiles: VillageTile[] = []
  
  for (let q = -Math.floor(size/2); q <= Math.floor(size/2); q++) {
    for (let r = -Math.floor(size/2); r <= Math.floor(size/2); r++) {
      const s = -q - r
      if (Math.abs(s) <= Math.floor(size/2)) {
        const x = HEX_WIDTH * (0.9 * q)
        const z = HEX_HEIGHT * (Math.sqrt(1.4) * r + Math.sqrt(1.4) / 2 * q)
        
        // Center tile is the house
        const isCenter = q === 0 && r === 0
        
        // Calculate height based on position
        let tileHeight = 0.5  // Default height
        
        if (r < 0) {  // Tiles behind the center
          // Increase height by 0.5 every 2 rows going backwards
          tileHeight = 0.5 + Math.abs(Math.floor(r / 2)) * 0.25
        }
        // Front tiles (r > 0) will keep the default height of 0.5
        
        tiles.push({
          pos: [x, 0, z],
          color: '#67e8b1',
          height: isCenter ? 0.5 : tileHeight,  // Center tile stays at 0.5
          type: isCenter ? 'house' : 'empty',
          q,
          r,
          s,
          resources: 0,
          lastHarvested: 0
        })
      }
    }
  }
  
  return tiles
}

const VillageSimulator = () => {
  const [tiles, setTiles] = useState<VillageTile[]>([])
  const { resources, updateResources } = useResources()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTilePosition, setSelectedTilePosition] = useState<[number, number, number] | null>(null)

  useEffect(() => {
    setTiles(generateVillageTiles(VILLAGE_SIZE))
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
          type: buildingType,
          resources: RESOURCE_YIELD
        }
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
        const tile = newTiles[index]
        const now = Date.now()

        if (tile.type === 'empty') {
          setSelectedTilePosition(position)
          setDialogOpen(true)
        } else if (tile.type === 'grain' && 
                  tile.resources! > 0 && 
                  (!tile.lastHarvested || now - tile.lastHarvested > HARVEST_COOLDOWN)) {
          updateResources({
            grain: resources.grain + tile.resources!
          })
          newTiles[index] = {
            ...tile,
            resources: 0,
            lastHarvested: now
          }
          
          setTimeout(() => {
            setTiles(current => {
              const updated = [...current]
              updated[index] = {
                ...updated[index],
                resources: RESOURCE_YIELD
              }
              return updated
            })
          }, HARVEST_COOLDOWN)
        }
      }
      return newTiles
    })
  }, [resources.grain, updateResources])

  return (
    <>
      <group>
        {tiles.map((tile) => (
          <HexagonTile
            key={`${tile.q},${tile.r},${tile.s}`}
            position={tile.pos}
            color={tile.type === 'grain' && tile.resources === 0 ? '#8B4513' : tile.color}
            height={tile.height}
            type={tile.type}
            onClick={handleTileClick}
          >
            {tile.type === 'house' && (
              <BuildingModel type="house" />
            )}
            {tile.type === 'grain' && tile.resources! > 0 && (
              <BuildingModel type="grain" />
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

export default VillageSimulator 