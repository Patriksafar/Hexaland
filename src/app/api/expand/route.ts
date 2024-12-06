import db from "@/db"
import { villageTileTable } from "@/db/schema"
import { eq } from "drizzle-orm"

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

  // update clicked tile 
  await db.update(villageTileTable).set({
    type: "grass",
    color: "#73c251",
    height: 0.5,
    isBuilding: false,
    resources: 0,
  }).where(eq(villageTileTable.id, id)).execute() 


  const updatedTiles = await db.query.villageTileTable.findMany()
  const tilesForResponse = updatedTiles.map((newTile) => {
    return {
      ...newTile,
      pos: [newTile.x, newTile.y, newTile.z],
    }
  })

  return new Response(JSON.stringify(tilesForResponse), {
    status: 201,
  })
}

