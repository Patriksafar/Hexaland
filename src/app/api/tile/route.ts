import db from "@/db"
import { villageTileTable } from "@/db/schema"
import { eq } from "drizzle-orm"

type UpdateVillageTilePayload = {
  id: string
} & Partial<typeof villageTileTable>

export async function POST(request: Request) {
  const payload = await request.json() as UpdateVillageTilePayload
  
  if(!payload.id) {
    return new Response("No id provided", {
      status: 400,
    })
  }

  const tile = await db.query.villageTileTable.findFirst({
    where: (tiles, { eq }) => eq(tiles.id, decodeURIComponent(payload.id)),
  })

  if(!tile) {
    return new Response("No tiles found", {
      status: 404,
    })
  }
  
  const [response] = await db
    .update(villageTileTable)
    .set({
      ...payload,
    })
    .where(eq(villageTileTable.id, payload.id))
    .returning();

  return new Response(JSON.stringify(response), {
    status: 200,
  })
}