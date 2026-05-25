import type { SchemePrint } from '../data/schemeCatalog'

export const STORAGE_KEYS = {
  activeGame: 'gakoboard.archenemy.activeGame',
  deckSelection: 'gakoboard.archenemy.deckSelection',
} as const

export type DeckSelection = {
  includedSetCodes: string[]
  includeDuplicatePrintings: boolean
}

export type SchemeInstance = {
  instanceId: string
  printId: string
}

export type GameEventType =
  | 'game-started'
  | 'scheme-set-in-motion'
  | 'scheme-resolved-to-bottom'
  | 'scheme-kept-ongoing'
  | 'scheme-abandoned'
  | 'undo'

export type GameEvent = {
  id: string
  timestamp: string
  type: GameEventType
  cardName?: string
  message: string
}

export type GameSnapshot = {
  schemeDeck: SchemeInstance[]
  currentScheme: SchemeInstance | null
  ongoingSchemes: SchemeInstance[]
  history: GameEvent[]
}

export type ArchenemyGameState = GameSnapshot & {
  id: string
  startedAt: string
  updatedAt: string
  deckSelection: DeckSelection
  undoStack: GameSnapshot[]
}

export type ArchenemyAction =
  | { type: 'START_GAME'; game: ArchenemyGameState }
  | { type: 'SET_SCHEME_IN_MOTION'; print: SchemePrint }
  | { type: 'RESOLVE_CURRENT_TO_BOTTOM'; print: SchemePrint }
  | { type: 'KEEP_CURRENT_AS_ONGOING'; print: SchemePrint }
  | { type: 'ABANDON_ONGOING'; instanceId: string; print: SchemePrint }
  | { type: 'UNDO' }
  | { type: 'END_GAME' }

const UNDO_LIMIT = 20

function makeId() {
  return crypto.randomUUID()
}

function now() {
  return new Date().toISOString()
}

function createEvent(
  type: GameEventType,
  message: string,
  cardName?: string,
): GameEvent {
  return {
    id: makeId(),
    timestamp: now(),
    type,
    cardName,
    message,
  }
}

function snapshotGame(game: ArchenemyGameState): GameSnapshot {
  return {
    schemeDeck: game.schemeDeck,
    currentScheme: game.currentScheme,
    ongoingSchemes: game.ongoingSchemes,
    history: game.history,
  }
}

function withUndo(game: ArchenemyGameState) {
  return [...game.undoStack, snapshotGame(game)].slice(-UNDO_LIMIT)
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ]
  }

  return shuffled
}

export function validateRegularDeck(cards: SchemePrint[]) {
  const errors: string[] = []
  const copiesByName = new Map<string, number>()

  cards.forEach((card) => {
    copiesByName.set(card.name, (copiesByName.get(card.name) ?? 0) + 1)
  })

  const excessCopies = [...copiesByName.entries()].filter(
    ([, quantity]) => quantity > 2,
  )

  if (cards.length < 20) {
    errors.push('A regular Archenemy scheme deck needs at least 20 cards.')
  }

  if (excessCopies.length > 0) {
    errors.push(
      'A regular Archenemy scheme deck cannot contain more than two copies of the same scheme name.',
    )
  }

  return errors
}

export function createGame(
  cards: SchemePrint[],
  deckSelection: DeckSelection,
): ArchenemyGameState {
  const timestamp = now()
  const schemeDeck = shuffle(
    cards.map((card) => ({
      instanceId: makeId(),
      printId: card.id,
    })),
  )

  return {
    id: makeId(),
    startedAt: timestamp,
    updatedAt: timestamp,
    deckSelection,
    schemeDeck,
    currentScheme: null,
    ongoingSchemes: [],
    history: [
      createEvent(
        'game-started',
        `Started a shuffled scheme deck with ${cards.length} cards.`,
      ),
    ],
    undoStack: [],
  }
}

export function archenemyReducer(
  game: ArchenemyGameState | null,
  action: ArchenemyAction,
): ArchenemyGameState | null {
  if (action.type === 'START_GAME') {
    return action.game
  }

  if (action.type === 'END_GAME') {
    return null
  }

  if (!game) {
    return game
  }

  switch (action.type) {
    case 'SET_SCHEME_IN_MOTION': {
      if (game.currentScheme || game.schemeDeck.length === 0) {
        return game
      }

      const [currentScheme, ...schemeDeck] = game.schemeDeck
      return {
        ...game,
        updatedAt: now(),
        schemeDeck,
        currentScheme,
        history: [
          ...game.history,
          createEvent(
            'scheme-set-in-motion',
            `Set ${action.print.name} in motion.`,
            action.print.name,
          ),
        ],
        undoStack: withUndo(game),
      }
    }

    case 'RESOLVE_CURRENT_TO_BOTTOM': {
      if (!game.currentScheme) {
        return game
      }

      return {
        ...game,
        updatedAt: now(),
        schemeDeck: [...game.schemeDeck, game.currentScheme],
        currentScheme: null,
        history: [
          ...game.history,
          createEvent(
            'scheme-resolved-to-bottom',
            `Resolved ${action.print.name} and put it on the bottom.`,
            action.print.name,
          ),
        ],
        undoStack: withUndo(game),
      }
    }

    case 'KEEP_CURRENT_AS_ONGOING': {
      if (!game.currentScheme || action.print.typeLine !== 'Ongoing Scheme') {
        return game
      }

      return {
        ...game,
        updatedAt: now(),
        currentScheme: null,
        ongoingSchemes: [...game.ongoingSchemes, game.currentScheme],
        history: [
          ...game.history,
          createEvent(
            'scheme-kept-ongoing',
            `Kept ${action.print.name} face up as an ongoing scheme.`,
            action.print.name,
          ),
        ],
        undoStack: withUndo(game),
      }
    }

    case 'ABANDON_ONGOING': {
      const scheme = game.ongoingSchemes.find(
        (instance) => instance.instanceId === action.instanceId,
      )

      if (!scheme) {
        return game
      }

      return {
        ...game,
        updatedAt: now(),
        schemeDeck: [...game.schemeDeck, scheme],
        ongoingSchemes: game.ongoingSchemes.filter(
          (instance) => instance.instanceId !== action.instanceId,
        ),
        history: [
          ...game.history,
          createEvent(
            'scheme-abandoned',
            `Abandoned ${action.print.name} and put it on the bottom.`,
            action.print.name,
          ),
        ],
        undoStack: withUndo(game),
      }
    }

    case 'UNDO': {
      const priorState = game.undoStack.at(-1)

      if (!priorState) {
        return game
      }

      return {
        ...game,
        ...priorState,
        updatedAt: now(),
        history: [
          ...priorState.history,
          createEvent('undo', 'Undid the previous game action.'),
        ],
        undoStack: game.undoStack.slice(0, -1),
      }
    }

    default:
      return game
  }
}

export function isRestorableGame(
  candidate: unknown,
  cardIds: Set<string>,
): candidate is ArchenemyGameState {
  if (!candidate || typeof candidate !== 'object') {
    return false
  }

  const game = candidate as Partial<ArchenemyGameState>
  const snapshots = Array.isArray(game.undoStack) ? game.undoStack : []
  const allInstances = [
    ...(Array.isArray(game.schemeDeck) ? game.schemeDeck : []),
    ...(Array.isArray(game.ongoingSchemes) ? game.ongoingSchemes : []),
    ...(game.currentScheme ? [game.currentScheme] : []),
    ...snapshots.flatMap((snapshot) => [
      ...(Array.isArray(snapshot.schemeDeck) ? snapshot.schemeDeck : []),
      ...(Array.isArray(snapshot.ongoingSchemes)
        ? snapshot.ongoingSchemes
        : []),
      ...(snapshot.currentScheme ? [snapshot.currentScheme] : []),
    ]),
  ]

  return (
    typeof game.id === 'string' &&
    Array.isArray(game.schemeDeck) &&
    Array.isArray(game.ongoingSchemes) &&
    Array.isArray(game.history) &&
    Array.isArray(game.undoStack) &&
    allInstances.every(
      (instance) =>
        typeof instance.instanceId === 'string' &&
        typeof instance.printId === 'string' &&
        cardIds.has(instance.printId),
    )
  )
}
