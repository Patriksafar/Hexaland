'use client'

import { useState, useEffect, useCallback } from 'react'
import { Html } from '@react-three/drei'
import HexagonTile from '@/components/models/hexagon-tile'
import BuildingModel, { BuildingType, buildingUrls } from '@/components/models/building-model'
import GrainModel from '@/components/models/grain-model/grain-model'

import { TileData } from '@/types/game'
import BuildingSelectionDialog from '../dialogs/building-selection-dialog'
import { useResources } from '@/hooks/useResources'
import ForestModel from '../models/forest/forest-model'

interface VillageTile extends TileData {
  lastHarvested?: number
  resources?: number
}

const VILLAGE_SIZE = 10
const HEX_WIDTH = 1
const HEX_HEIGHT = Math.sqrt(3) / 2
const HARVEST_COOLDOWN = 10000 // 10 seconds
const FOREST_CUT = 60000
const RESOURCE_YIELD = 10

const generateVillageTiles = (size: number): VillageTile[] => {
  const tiles: VillageTile[] = []
  let forestCount = 0
  
  for (let q = -Math.floor(size/2); q <= Math.floor(size/2); q++) {
    for (let r = -Math.floor(size/2); r <= Math.floor(size/2); r++) {
      const s = -q - r
      if (Math.abs(s) <= Math.floor(size/2)) {
        const x = HEX_WIDTH * (0.9 * q)
        const z = HEX_HEIGHT * (Math.sqrt(1.4) * r + Math.sqrt(1.4) / 2 * q)
        
        const isCenter = q === 0 && r === 0
        let tileHeight = 0.5  // Default height
        
        const isBorder = Math.abs(q) === Math.floor(size/2) || 
                        Math.abs(r) === Math.floor(size/2) || 
                        Math.abs(s) === Math.floor(size/2)

        // For tiles behind the center (r < 0)
        if (r < 0) {
          // Increase height by 0.25 every 2 rows behind center
          tileHeight = 0.5 + Math.floor(Math.abs(r) / 2) * 0.25
          
          // Add random height variation to border tiles behind center
          if (isBorder) {
            // Either keep same height or add 0.25
            tileHeight += Math.random() > 0.5 ? 0 : 0.25
          }
        }
        // Randomly place forest tiles
        const isForest = forestCount < 8 && Math.random() < 0.2; // 20% chance to place a forest tile
        if (isForest) {
          forestCount++;
        }
        
        tiles.push({
          pos: [x, 0, z],
          color: '#73c251',
          height: isCenter ? 0.5 : tileHeight,  // Center tile stays at 0.5
          type: isCenter ? 'house' : (isForest ? 'forest' : 'empty'),
          q,
          r,
          s,
          resources: isForest ? 5 : 0, // Forest tiles have resources
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
          // Harvest grain logic
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
        } else if (tile.type === 'forest' && 
                   tile.resources! > 0 && 
                   (!tile.lastHarvested || now - tile.lastHarvested > FOREST_CUT)) {
          // Harvest forest logic
          updateResources({
            wood: resources.wood + tile.resources!
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
                resources: 5 // Reset resources for the forest tile
              }
              return updated
            })
          }, FOREST_CUT)
        }
      }
      return newTiles
    })
  }, [resources.grain, resources.wood, updateResources])

  return (
    <>
      <group 
        rotation={[0, Math.PI / 6.5, 0]}
        >
        {tiles.map((tile) => (
          <HexagonTile
            key={`${tile.q},${tile.r},${tile.s}`}
            position={tile.pos}
            color={tile.color}
            height={tile.height}
            type={tile.type}
            onClick={handleTileClick}
          > 
            {tile.type === "forest" && (
              <ForestModel type={tile.resources! > 0 ? "full-grown" : "cut"} /> 
            )}
            {tile.type === 'grain' ? (
              <GrainModel type={tile.resources! > 0 ? "full-grown" : "dirt"} />
             ): (
              (Object.keys(buildingUrls) ?? []).includes(tile.type)) && (
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

export default VillageSimulator 