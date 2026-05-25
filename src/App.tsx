import { useEffect, useMemo, useReducer, useState } from 'react'
import './App.css'
import {
  STORAGE_KEYS,
  archenemyReducer,
  createGame,
  isRestorableGame,
  validateRegularDeck,
  type ArchenemyGameState,
  type DeckSelection,
} from './archenemy/gameState'
import {
  decodeGameFromHash,
  encodeGameToHash,
  replaceSharedGameHash,
} from './archenemy/shareUrl'
import { DeckSetup } from './components/DeckSetup'
import { GameBoard } from './components/GameBoard'
import { getSchemeDeck, schemePrints, schemeSets } from './data/schemeCatalog'

const cardById = new Map(schemePrints.map((card) => [card.id, card]))
const cardIds = new Set(cardById.keys())
const printIndexById = new Map(
  schemePrints.map((card, index) => [card.id, index]),
)
const defaultSelection: DeckSelection = {
  includedSetCodes: schemeSets.map((set) => set.code),
  includeDuplicatePrintings: true,
}

function loadDeckSelection() {
  try {
    const savedSelection = localStorage.getItem(STORAGE_KEYS.deckSelection)

    if (!savedSelection) {
      return defaultSelection
    }

    const parsedSelection = JSON.parse(savedSelection) as Partial<DeckSelection>
    const knownSetCodes = new Set(schemeSets.map((set) => set.code))

    if (
      !Array.isArray(parsedSelection.includedSetCodes) ||
      typeof parsedSelection.includeDuplicatePrintings !== 'boolean' ||
      !parsedSelection.includedSetCodes.every((code) => knownSetCodes.has(code))
    ) {
      return defaultSelection
    }

    return parsedSelection as DeckSelection
  } catch {
    return defaultSelection
  }
}

function loadActiveGame() {
  try {
    const sharedGame = decodeGameFromHash(window.location.hash, schemePrints)

    if (sharedGame) {
      return { game: sharedGame, recoveryMessage: null }
    }

    const savedGame = localStorage.getItem(STORAGE_KEYS.activeGame)

    if (!savedGame) {
      return { game: null, recoveryMessage: null }
    }

    const parsedGame: unknown = JSON.parse(savedGame)

    if (isRestorableGame(parsedGame, cardIds)) {
      return { game: parsedGame, recoveryMessage: null }
    }

    return {
      game: null,
      recoveryMessage:
        'A saved game could not be restored because its card data no longer matches this catalog.',
    }
  } catch {
    return {
      game: null,
      recoveryMessage: 'A saved game could not be read from this browser.',
    }
  }
}

function App() {
  const [loadedGame] = useState(loadActiveGame)
  const [selection, setSelection] = useState(
    () => loadedGame.game?.deckSelection ?? loadDeckSelection(),
  )
  const [recoveryMessage, setRecoveryMessage] = useState(
    loadedGame.recoveryMessage,
  )
  const [game, dispatch] = useReducer(
    archenemyReducer,
    loadedGame.game as ArchenemyGameState | null,
  )

  const deckCards = useMemo(
    () =>
      getSchemeDeck(
        new Set(selection.includedSetCodes),
        selection.includeDuplicatePrintings,
      ),
    [selection],
  )
  const validationErrors = useMemo(
    () => validateRegularDeck(deckCards),
    [deckCards],
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.deckSelection, JSON.stringify(selection))
  }, [selection])

  useEffect(() => {
    if (game) {
      localStorage.setItem(STORAGE_KEYS.activeGame, JSON.stringify(game))
      replaceSharedGameHash(encodeGameToHash(game, printIndexById))
      return
    }

    if (!recoveryMessage) {
      localStorage.removeItem(STORAGE_KEYS.activeGame)
      replaceSharedGameHash(null)
    }
  }, [game, recoveryMessage])

  function startGame(cards: typeof schemePrints) {
    setRecoveryMessage(null)
    dispatch({ type: 'START_GAME', game: createGame(cards, selection) })
  }

  function returnToSetup() {
    const confirmMessage = game?.isSharedFromUrl
      ? 'This shared game was loaded from the URL and has no deck setup or undo history to return to. Clear this shared game and start setup from scratch?'
      : 'End this active game and return to deck setup? The current game state will be cleared.'

    if (
      window.confirm(confirmMessage)
    ) {
      setRecoveryMessage(null)
      dispatch({ type: 'END_GAME' })
    }
  }

  function discardSavedGame() {
    localStorage.removeItem(STORAGE_KEYS.activeGame)
    setRecoveryMessage(null)
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Table Display Prototype</p>
        <h1>GAKoBoard</h1>
        <p className="subtitle">Tabletop helpers for strange game states</p>
      </header>

      <section className="scheme-board" aria-labelledby="scheme-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{game ? 'In Progress' : 'Game Setup'}</p>
            <h2 id="scheme-heading">Archenemy Schemes</h2>
          </div>
          <span className="sample-badge">
            {game?.isSharedFromUrl
              ? 'Shared URL Game'
              : game
                ? 'Active Game Saved'
                : 'Print Catalog'}
          </span>
        </div>

        {!game && recoveryMessage && (
          <div className="recovery-message" role="alert">
            <p>{recoveryMessage}</p>
            <button
              className="action-button subtle-action"
              onClick={discardSavedGame}
              type="button"
            >
              Discard Saved Game
            </button>
          </div>
        )}

        {game ? (
          <GameBoard
            cardById={cardById}
            game={game}
            onAction={dispatch}
            onReturnToSetup={returnToSetup}
          />
        ) : (
          <DeckSetup
            onSelectionChange={setSelection}
            onStartGame={startGame}
            selection={selection}
            validationErrors={validationErrors}
          />
        )}
      </section>

      <aside className="rules-panel" aria-labelledby="rules-heading">
        <div>
          <p className="eyebrow">Turn Aid</p>
          <h2 id="rules-heading">Rules Reminder</h2>
          <p className="rules-copy">
            At the start of each archenemy turn, set the top scheme in motion.
            Non-ongoing schemes go to the bottom after resolving. Ongoing
            schemes stay face up until abandoned.
          </p>
        </div>
        <details className="detail-toggle">
          <summary>Detailed Rules</summary>
          <p>
            The player controls resolution explicitly: reveal a scheme, finish
            resolving its abilities at the table, then bottom it or keep it
            face up if it is ongoing.
          </p>
        </details>
      </aside>

      <footer className="dev-check">
        <div>
          <p className="card-label">Dev loop check</p>
          <p className="status">
            {game
              ? 'Active game state is saved locally and encoded in the URL after each action.'
              : 'Build a regular scheme deck from the shipped print catalog.'}
          </p>
        </div>
        <span className="version">v0.3.0-poc</span>
      </footer>
    </main>
  )
}

export default App
