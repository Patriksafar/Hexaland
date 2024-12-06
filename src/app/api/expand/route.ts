import db from "@/db"
import { VillageTileInsertSchema, VillageTileSchema, villageTileTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { HEX_HEIGHT, HEX_WIDTH } from "../tiles/route"

type AddTilePayload = {
  id: string
}

export async function POST(request: Request) {
  const payload = await request.json() as AddTilePayload

  const { id } = payload

  // Validate required fields
  if (!id) {
    return new Response("id is missing", {
      status: 400,
    })
  }

  // Find the tile to update
  const tile = await db.query.villageTileTable.findFirst({ 
    where: (tile, { eq }) => eq(tile.id, id),
   })


  if (!tile) {
    return new Response("Tile not found", {
      status: 404,
    })
  }

  // update clicked tile 
  const expandedTile = await db.update(villageTileTable).set({
    type: "grass",
    y: 0,
    color: "#73c251",
    height: 0.5,
    isBuilding: false,
    resources: 0,
  }).where(eq(villageTileTable.id, id)).returning().execute()


  // return updated tiles
  const updatedTiles = await db.query.villageTileTable.findMany()

  // generate new border tiles for the updated tile
  const newBorderTiles: VillageTileInsertSchema[] = []
  const { q, r, s } = expandedTile[0]

  const neighbors = [
    [q+1, r-1, s], [q+1, r, s-1], [q, r+1, s-1],
    [q-1, r+1, s], [q-1, r, s+1], [q, r-1, s+1]
  ]

  neighbors.forEach(([nq, nr, ns]) => {
    const neighborIndex = updatedTiles.findIndex(tile => 
      tile.q === nq && tile.r === nr && tile.s === ns
    )
      

    if (neighborIndex === -1) {
      const x = HEX_WIDTH * (0.9 * nq)
      const z = HEX_HEIGHT * (Math.sqrt(1.4) * nr + Math.sqrt(1.4) / 2 * nq)
      const newBorderTile = {
        color: '#ffffff',
        height: 0.2,
        type: 'border',
        x: x,
        y: -0.1,
        z: z,
        q: nq,
        r: nr,
        s: ns,
        isBuilding: false,
        buildProgress: 0,
        resources: 0,
        lastHarvested: 0,
        buildingRotation: null,
      }
      
      newBorderTiles.push(newBorderTile)
    }
  })

  const insertedBorderTiles = newBorderTiles.length ? await db.insert(villageTileTable).values(newBorderTiles).returning().execute() : []

  // return updated tiles
  const tilesForResponse = [...updatedTiles, ...insertedBorderTiles].map((newTile) => {
    return {
      ...newTile,
      pos: [newTile.x, newTile.y, newTile.z],
    }
  })

  return new Response(JSON.stringify(tilesForResponse), {
    status: 201,
  })
}

