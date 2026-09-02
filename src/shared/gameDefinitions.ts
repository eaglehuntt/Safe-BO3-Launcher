export interface SafetyToolDefinition {
  id: string
  label: string
  repoUrl: string
  instructions: string[]
}

export interface GameDefinition {
  id: string
  name: string
  shortLabel: string
  steamAppId: number
  exeFileName: string
  /** Present when this game needs an external tool running before launch to be safe online. */
  safetyTool?: SafetyToolDefinition
}

// One game for now. Add more entries here as they're wired up, each with its
// own (optional) safety tool, and the rest of the app adapts automatically.
export const GAME_CATALOG: GameDefinition[] = [
  {
    id: 'bo3',
    name: 'Black Ops III',
    shortLabel: 'BO3',
    steamAppId: 311210,
    exeFileName: 'BlackOps3.exe',
    safetyTool: {
      id: 't7patch',
      label: 'T7 Patch',
      repoUrl: 'https://github.com/Scroptss/T7Patch',
      instructions: [
        'Grab the latest release from the community T7 Patch repo.',
        'Extract it anywhere you like, the folder location doesn’t matter to us.',
        'Come back here and browse to the patch’s .exe.'
      ]
    }
  }
]

export function getGameDefinition(gameId: string): GameDefinition | undefined {
  return GAME_CATALOG.find((game) => game.id === gameId)
}
