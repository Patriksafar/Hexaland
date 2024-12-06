import { VillageTile } from '@/types/game';
import db from '@/db';
import { villageTileTable } from '@/db/schema';

export const HEX_WIDTH = 1
export const HEX_HEIGHT = Math.sqrt(3) / 2
const DEFAULT_VILLAGE_SIZE = 6

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
          color: isBorder ? "#ffffff" : "#73c251",
          height: isBorder ? 0.1 : isCenter ? 0.5 : tileHeight,  // Center tile stays at 0.5
          type: isBorder ? 'border' : isCenter ? 'house' : (isForest ? 'forest' : 'empty'),
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

export async function GET() {
    const data = await db.query.villageTileTable.findMany()

    if(!data.length) {
      const generatedTiles = generateVillageTiles(DEFAULT_VILLAGE_SIZE).map((newTile) => {
        return {
          ...newTile,
          id: undefined,
          isBuilding: newTile.isBuilding ?? false,
          x: newTile.pos[0],
          y: newTile.pos[1],
          z: newTile.pos[2],
          resources: newTile.resources ?? 0,
          lastHarvested: newTile.lastHarvested ?? 0,
          buildingRotation: newTile.buildingRotation ?? 0,
        }
      })
      const newTiles = await db.insert(villageTileTable).values(generatedTiles).returning().execute()

      const transformedTiles = newTiles.map((newTile) => {
        return {
          ...newTile,
          pos: [newTile.x, newTile.y, newTile.z],
        }
      })

      return new Response(JSON.stringify(transformedTiles), {
        status: 200,
      })
    }

    const transformedTiles = data.map((newTile) => {
      return {
        ...newTile,
        pos: [newTile.x, newTile.y, newTile.z],
      }
    })

    return new Response(JSON.stringify(transformedTiles), {
      status: 200,
    })
}

export async function DELETE() {
  const data = await db.delete(villageTileTable).execute()

  return new Response(JSON.stringify(data), {
    status: 200,
  })
}