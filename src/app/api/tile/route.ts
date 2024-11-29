import {tiles} from "../tiles/route"

export async function POST(request: Request) {
  const data = await request.json()
  console.log(tiles)

  if(!tiles || tiles.length === 0) {
    return new Response("No tiles found", {
      status: 404,
    })
  }

  const tile = tiles.find(tile => tile.id === data.id)
  
  if(!tile) {
    return new Response("Tile not found", {
      status: 404,
    })
  }

  tiles[tiles.indexOf(tile)] = {
    ...tile,
    ...data,
  }

  const updatedTile = tiles.find(tile => tile.id === data.id)

  return new Response(JSON.stringify(updatedTile), {
    status: 200,
  })
}