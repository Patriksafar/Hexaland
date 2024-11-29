import { VillageTile } from '@/types/game';
import { NextApiRequest, NextApiResponse } from 'next'

const HEX_WIDTH = 1
const HEX_HEIGHT = Math.sqrt(3) / 2
const VILLAGE_SIZE = 10
const generateVillageTiles = (size: number): VillageTile[] => {
  const tiles: VillageTile[] = []
  let idCounter = 0; // Initialize a counter for unique IDs
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
          id: `tile-${idCounter++}`, // Assign a unique ID
          pos: [x, 0, z],
          color: '#73c251',
          height: isCenter ? 0.5 : tileHeight,  // Center tile stays at 0.5
          type: isCenter ? 'house' : (isForest ? 'forest' : 'empty'),
          isBuilding: isCenter,
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

export let tiles: VillageTile[] = []

export async function GET(request: Request) {

    if(tiles.length === 0) {
      tiles = generateVillageTiles(VILLAGE_SIZE) // Generate tiles with a size of 10
    }
    
    return new Response(JSON.stringify(tiles), {
      status: 200,
    })
}
