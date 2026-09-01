export interface GameEntry {
  id: string
  shortLabel: string
  fullName: string
  status: 'available' | 'coming-soon'
}

// BO2 will come back once it's actually wired up. Leaving the carousel
// infrastructure (GameSelector, arrows) in place for when it does.
export const GAMES: GameEntry[] = [
  { id: 'bo3', shortLabel: 'BO3', fullName: 'Black Ops III', status: 'available' }
]
