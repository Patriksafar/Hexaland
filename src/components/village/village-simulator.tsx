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
import { useEditMode } from '@/hooks/useEditMode'

interface VillageTile extends TileData {
  lastHarvested?: number
  resources?: number
}

const HARVEST_COOLDOWN = 10000 // 10 seconds
const FOREST_CUT = 60000
const RESOURCE_YIELD = 10
  
const VillageSimulator = () => {
  const [tiles, setTiles] = useState<VillageTile[]>([])
  const {resources, updateResources } = useResources()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null)
  const { isEditMode, isBuildMode } = useEditMode()

  // LOAD TILES FROM API
  useEffect(() => {
    const getData = async () => {
      const response = await fetch("/api/tiles")
      const tiles = await response.json()

      setTiles(tiles)
    }

    getData()
  }, [])

  const handleBuildingSelect = useCallback(async (buildingType: string) => {
    if (!selectedTileId) return

    const response = await fetch(`/api/tile/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: selectedTileId,
        type: buildingType,
        resources: RESOURCE_YIELD,
        isBuilding: true,
      })
    })

    const updatedTileData = await response.json()
    
    setTiles(prevTiles => {
      const newTiles = [...prevTiles]
      const index = newTiles.findIndex(tile => 
       tile.id === selectedTileId
      )

      if (index !== -1) {
        newTiles[index] = {
          ...newTiles[index],
          ...updatedTileData
        }
      }

      return newTiles
    })
  }, [selectedTileId])

  const handleBorderTileClick = useCallback(async (id: string) => {
    const response = await fetch(`/api/expand/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: id
      })
    })

    const data = await response.json() as VillageTile[]
    
    setTiles(data)

  }, [])

  const handleClickOnEmptyTile = useCallback(async (id: string) => {
    setSelectedTileId(id)
    setDialogOpen(true)
  }, [])

  const handleTileClick = useCallback(async (id: string) => {
    const tile = tiles.find(tile => 
      tile.id === id
    )

    if(!tile) return

    if (tile.type === 'empty') {
      handleClickOnEmptyTile(id)

      return
    }

    if(tile.type === "border") {
       handleBorderTileClick(id)

       return 
    }

    if(tile.isBuilding && tile.type !== 'forest' && tile.type !== "grain" && isEditMode) {
      const newRotation = (tile.buildingRotation || 0) + Math.PI / 3; // Rotate 60 degrees
      const response = await fetch(`/api/tile/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: id,
          buildingRotation: newRotation
        })
      })

      const updatedTileData = await response.json()

      return setTiles(prevTiles => {
        const newTiles = [...prevTiles]
        const index = newTiles.findIndex(tile => 
          tile.id === id
        )

        if (index !== -1) {
          newTiles[index] = {
            ...newTiles[index],
            ...updatedTileData
          }
        }

        return newTiles
      })
    }
    


    setTiles(prevTiles => {
      const newTiles = [...prevTiles]
      const index = newTiles.findIndex(tile => 
        tile.id === id
      )

      if (index !== -1) {
        const tile = newTiles[index]
        const now = Date.now()

        if (tile.type === 'empty') {
          setSelectedTileId(id)
          setDialogOpen(true)
        } else if (tile.type === 'grain' && (!isBuildMode && !isEditMode) &&
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
        } else if (tile.type === 'forest' && (!isBuildMode && !isEditMode) &&
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
  }, [tiles, isEditMode, handleClickOnEmptyTile, handleBorderTileClick, isBuildMode, updateResources, resources.grain, resources.wood])
  
  const displayedTiles = tiles.filter(tile => {
    if(isEditMode) return true

    return tile.type !== 'border'
  })

  return (
    <>
      <group 
        rotation={[0, Math.PI / 6.5, 0]}
        >
        {displayedTiles.map((tile) => (
          <HexagonTile
            key={`${tile.q},${tile.r},${tile.s}`}
            position={tile.pos}
            color={tile.color}
            height={tile.height}
            type={tile.type}
            id={tile.id}
            onClick={handleTileClick}
          > 
            {tile.type === "forest" && (
              <ForestModel type={tile.resources! > 0 ? "full-grown" : "cut"} /> 
            )}
            {tile.type === 'grain' ? (
              <GrainModel type={tile.resources! > 0 ? "full-grown" : "dirt"} />
             ): (
              (Object.keys(buildingUrls) ?? []).includes(tile.type)) && (
                <BuildingModel type={tile.type as BuildingType} rotation={tile.buildingRotation} />
             )}
          </HexagonTile>
        ))}
      </group>
      <Html>
        <BuildingSelectionDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSelect={handleBuildingSelect}
          resources={resources}
          updateResources={updateResources}
        />
      </Html>
    </>
  )
}

export default VillageSimulator 