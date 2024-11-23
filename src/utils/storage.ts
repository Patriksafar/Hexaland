import { GameState } from '@/types/game'

const STORAGE_KEY = 'medieval-land-state'

export const saveGameState = (state: GameState) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(STORAGE_KEY, serializedState)
  } catch (err) {
    console.error('Could not save game state:', err)
  }
}

export const loadGameState = (): GameState | null => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY)
    if (!serializedState) return null
    return JSON.parse(serializedState)
  } catch (err) {
    console.error('Could not load game state:', err)
    return null
  }
} 