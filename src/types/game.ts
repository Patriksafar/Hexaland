interface TileData {
  pos: [number, number, number]
  color: string
  height: number
  type: 'grass' | 'forest' | 'border' | string
  q: number
  r: number
  s: number
  isAnimating?: boolean
  isBuilding?: boolean
  buildProgress?: number
}

interface GameState {
  tiles: TileData[]
  lastSaved: string
}

export type { TileData, GameState } 