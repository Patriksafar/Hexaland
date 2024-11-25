'use client'

import { useState, useEffect, useCallback } from 'react'

import BuildingModel, {BuildingType, buildingUrls}  from '@/components/models/building-model'
import HexagonTile from '@/components/models/hexagon-tile'
import { Html } from '@react-three/drei'
import BuildingSelectionDialog from '../dialogs/building-selection-dialog'
import { TileData, GameState } from '@/types/game'
import { saveGameState, loadGameState } from '@/utils/storage'
import { useSocket } from '@/hooks/useSocket'

const MAP_SIZE = 10
const TILE_TYPES = ['grass', 'forest'] as const
const HEX_WIDTH = 1
const HEX_HEIGHT = Math.sqrt(3) / 2

const generateTiles = (mapSize: number, borderSize: number): TileData[] => {
  const tileData: TileData[] = []

  for (let q = -Math.floor((mapSize + borderSize * 2) / 2); q < Math.ceil((mapSize + borderSize * 2) / 2); q++) {
    for (let r = -Math.floor((mapSize + borderSize * 2) / 2); r < Math.ceil((mapSize + borderSize * 2) / 2); r++) {
      const s = -q - r
      const x = HEX_WIDTH * (0.9 * q)
      const z = HEX_HEIGHT * (Math.sqrt(1.4) * r + Math.sqrt(1.4) / 2 * q)
      const maxCoord = Math.max(Math.abs(q), Math.abs(r), Math.abs(s))
      if (maxCoord < Math.floor((mapSize + borderSize * 2) / 2)) {
        const isBorderTile = maxCoord >= Math.floor(mapSize / 2) && maxCoord < Math.floor((mapSize + borderSize * 2) / 2)
        tileData.push({
          pos: [x, isBorderTile ? -0.1 : 0, z],
          color: isBorderTile ? '#ffffff' : '#67e8b1',
          height: 0.1,
          type: isBorderTile ? 'border' : TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)],
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
  const socket = useSocket()

  useEffect(() => {
    const savedState = loadGameState()
    if (savedState) {
      setTiles(savedState.tiles)
    } else {
      setTiles(generateTiles(MAP_SIZE, 1))
    }
  }, [])

  useEffect(() => {
    if (tiles.length > 0) {
      const gameState: GameState = {
        tiles,
        lastSaved: new Date().toISOString()
      }
      saveGameState(gameState)
    }
  }, [tiles])

  useEffect(() => {
    socket.on('tileUpdate', (updatedTile: TileData) => {
      setTiles(prevTiles => {
        const newTiles = [...prevTiles]
        const index = newTiles.findIndex(tile => 
          tile.q === updatedTile.q && 
          tile.r === updatedTile.r && 
          tile.s === updatedTile.s
        )
        
        if (index !== -1) {
          newTiles[index] = updatedTile
        } else {
          newTiles.push(updatedTile)
        }
        
        return newTiles
      })
    })

    return () => {
      socket.off('tileUpdate')
    }
  }, [socket])

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
        const updatedTile = {
          ...newTiles[index],
          isBuilding: true,
          buildProgress: 0,
          type: buildingType
        }
        newTiles[index] = updatedTile
        socket.emit('tileUpdated', updatedTile)

        // Start building process
        const buildInterval = setInterval(() => {
          setTiles(currentTiles => {
            const updatedTiles = [...currentTiles]
            const buildingTile = updatedTiles[index]
            if (buildingTile.buildProgress! < 1) {
              buildingTile.buildProgress! += 0.1
              // Emit progress update
              socket.emit('tileUpdated', buildingTile)
            } else {
              buildingTile.isBuilding = false
              // Emit final state
              socket.emit('tileUpdated', buildingTile)
              clearInterval(buildInterval)
            }
            return updatedTiles
          })
        }, 100)
      }
      return newTiles
    })
  }, [selectedTilePosition, socket])

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
          const updatedTile = {
            ...newTiles[index],
            type: TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)],
            color: "#6EE7B7",
            height: 0.2,
          }
          newTiles[index] = updatedTile
          socket.emit('tileUpdated', updatedTile)

          // Add new border tiles
          const { q, r, s } = newTiles[index]
          const neighbors = [
            [q+1, r-1, s], [q+1, r, s-1], [q, r+1, s-1],
            [q-1, r+1, s], [q-1, r, s+1], [q, r-1, s+1]
          ]

          neighbors.forEach(([nq, nr, ns]) => {
            const neighborIndex = newTiles.findIndex(tile => 
              tile.q === nq && tile.r === nr && tile.s === ns
            )
            if (neighborIndex === -1) {
              const x = HEX_WIDTH * (0.9 * nq)
              const z = HEX_HEIGHT * (Math.sqrt(1.4) * nr + Math.sqrt(1.4) / 2 * nq)
              const newBorderTile = {
                pos: [x, -0.1, z] as [number, number, number],
                color: '#ffffff',
                height: 0.1,
                type: 'border',
                q: nq,
                r: nr,
                s: ns,
                isBuilding: false,
                buildProgress: 0
              }
              newTiles.push(newBorderTile)
              // Emit socket event for the new border tile
              socket.emit('tileUpdated', newBorderTile)
            }
          })
        } else if (newTiles[index].type === 'grass') {
          setSelectedTilePosition(position)
          setDialogOpen(true)
        }
      }
      return newTiles
    })
  }, [socket, setDialogOpen, setSelectedTilePosition])

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