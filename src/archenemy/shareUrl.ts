import type { ArchenemyGameState, SchemeInstance } from './gameState'
import type { SchemePrint } from '../data/schemeCatalog'

const HASH_KEY = 's'
const ENCODING_VERSION = 1
const NO_CURRENT_SCHEME = 255

function encodeBase64Url(bytes: Uint8Array) {
  let binary = ''

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function decodeBase64Url(value: string) {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function instanceToPrintIndex(
  instance: SchemeInstance,
  printIndexById: Map<string, number>,
) {
  return printIndexById.get(instance.printId)
}

function printIndexToInstance(
  printIndex: number,
  prints: SchemePrint[],
  zone: string,
  position: number,
): SchemeInstance | null {
  const print = prints[printIndex]

  if (!print) {
    return null
  }

  return {
    instanceId: `shared-${zone}-${position}-${printIndex}`,
    printId: print.id,
  }
}

export function encodeGameToHash(
  game: ArchenemyGameState,
  printIndexById: Map<string, number>,
) {
  const deckIndexes = game.schemeDeck.map((instance) =>
    instanceToPrintIndex(instance, printIndexById),
  )
  const currentIndex = game.currentScheme
    ? instanceToPrintIndex(game.currentScheme, printIndexById)
    : NO_CURRENT_SCHEME
  const ongoingIndexes = game.ongoingSchemes.map((instance) =>
    instanceToPrintIndex(instance, printIndexById),
  )

  if (
    deckIndexes.some((index) => index === undefined) ||
    currentIndex === undefined ||
    ongoingIndexes.some((index) => index === undefined)
  ) {
    return ''
  }

  const bytes = Uint8Array.from([
    ENCODING_VERSION,
    currentIndex,
    ongoingIndexes.length,
    ...(ongoingIndexes as number[]),
    ...(deckIndexes as number[]),
  ])

  return `${HASH_KEY}=${encodeBase64Url(bytes)}`
}

export function decodeGameFromHash(
  hash: string,
  prints: SchemePrint[],
): ArchenemyGameState | null {
  try {
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const encodedState = params.get(HASH_KEY)

    if (!encodedState) {
      return null
    }

    const bytes = decodeBase64Url(encodedState)
    const version = bytes[0]
    const currentIndex = bytes[1]
    const ongoingCount = bytes[2]

    if (
      version !== ENCODING_VERSION ||
      bytes.length < 3 ||
      ongoingCount > bytes.length - 3
    ) {
      return null
    }

    const ongoingIndexes = [...bytes.slice(3, 3 + ongoingCount)]
    const deckIndexes = [...bytes.slice(3 + ongoingCount)]

    if (
      (currentIndex !== NO_CURRENT_SCHEME && !prints[currentIndex]) ||
      !ongoingIndexes.every((printIndex) => prints[printIndex]) ||
      !deckIndexes.every((printIndex) => prints[printIndex])
    ) {
      return null
    }

    const timestamp = new Date().toISOString()
    const schemeDeck = deckIndexes
      .map((printIndex, position) =>
        printIndexToInstance(printIndex, prints, 'deck', position),
      )
      .filter((instance): instance is SchemeInstance => Boolean(instance))
    const currentScheme =
      currentIndex === NO_CURRENT_SCHEME
        ? null
        : printIndexToInstance(currentIndex, prints, 'current', 0)
    const ongoingSchemes = ongoingIndexes
      .map((printIndex, position) =>
        printIndexToInstance(printIndex, prints, 'ongoing', position),
      )
      .filter((instance): instance is SchemeInstance => Boolean(instance))

    return {
      id: `shared-${timestamp}`,
      startedAt: timestamp,
      updatedAt: timestamp,
      isSharedFromUrl: true,
      deckSelection: {
        includedSetCodes: [],
        includeDuplicatePrintings: true,
      },
      schemeDeck,
      currentScheme,
      ongoingSchemes,
      history: [
        {
          id: `shared-event-${timestamp}`,
          timestamp,
          type: 'game-started',
          message: 'Loaded a shared game state from the URL.',
        },
      ],
      undoStack: [],
    }
  } catch {
    return null
  }
}

export function replaceSharedGameHash(sharedHash: string | null) {
  const nextUrl = new URL(window.location.href)

  if (sharedHash) {
    nextUrl.hash = sharedHash
  } else {
    nextUrl.hash = ''
  }

  window.history.replaceState(null, '', nextUrl)
}
