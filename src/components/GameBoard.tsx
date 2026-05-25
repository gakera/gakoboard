import { useEffect, useState } from 'react'
import type {
  ArchenemyAction,
  ArchenemyGameState,
} from '../archenemy/gameState'
import type { SchemePrint } from '../data/schemeCatalog'
import { OracleText } from './OracleText'

type GameBoardProps = {
  game: ArchenemyGameState
  cardById: Map<string, SchemePrint>
  onAction: (action: ArchenemyAction) => void
  onReturnToSetup: () => void
}

function SchemeImage({
  card,
  onZoom,
  priority = false,
  size,
}: {
  card: SchemePrint
  onZoom: (card: SchemePrint) => void
  priority?: boolean
  size: 'current' | 'ongoing'
}) {
  return (
    <button
      aria-label={`Show ${card.name} full screen`}
      className="scheme-image-button"
      onClick={() => onZoom(card)}
      type="button"
    >
      <img
        alt={`${card.name} scheme card`}
        className={`scheme-image scheme-image-${size}`}
        loading={priority ? 'eager' : 'lazy'}
        src={size === 'current' ? card.imageUris.large : card.imageUris.normal}
      />
    </button>
  )
}

function SchemeMetadata({ card }: { card: SchemePrint }) {
  return (
    <div className="scheme-metadata">
      <p className="card-label">{card.typeLine}</p>
      <h3>{card.name}</h3>
      <p>
        {card.setName} · {card.releasedAt.slice(0, 4)} · #{card.collectorNumber}
      </p>
    </div>
  )
}

export function GameBoard({
  game,
  cardById,
  onAction,
  onReturnToSetup,
}: GameBoardProps) {
  const [zoomedCard, setZoomedCard] = useState<SchemePrint | null>(null)
  const [zoomTextScale, setZoomTextScale] = useState(1)
  const currentCard = game.currentScheme
    ? cardById.get(game.currentScheme.printId)
    : undefined

  useEffect(() => {
    if (!zoomedCard) {
      return undefined
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setZoomedCard(null)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [zoomedCard])

  function setSchemeInMotion() {
    const nextScheme = game.schemeDeck[0]
    const nextCard = nextScheme && cardById.get(nextScheme.printId)

    if (nextCard) {
      onAction({ type: 'SET_SCHEME_IN_MOTION', print: nextCard })
    }
  }

  return (
    <>
      <div className="game-toolbar">
        <div className="deck-counter">
          <p className="card-label">Face-down Deck</p>
          <strong>{game.schemeDeck.length}</strong>
          <span>schemes remaining</span>
        </div>
        <div className="toolbar-actions">
          <button
            className="action-button subtle-action"
            disabled={game.undoStack.length === 0}
            onClick={() => onAction({ type: 'UNDO' })}
            type="button"
          >
            Undo
          </button>
          <button
            className="action-button subtle-action"
            onClick={onReturnToSetup}
            type="button"
          >
            New Game Setup
          </button>
        </div>
      </div>

      <section className="playmat" aria-label="Current scheme play area">
        {currentCard ? (
          <div className="current-scheme-layout">
            <div className="current-scheme-frame">
              <SchemeImage
                card={currentCard}
                onZoom={setZoomedCard}
                priority
                size="current"
              />
            </div>
            <aside className="scheme-control-panel">
              <SchemeMetadata card={currentCard} />
              <p className="resolution-prompt">
                {currentCard.typeLine === 'Ongoing Scheme'
                  ? 'Resolve its set-in-motion abilities, then keep this ongoing scheme face up.'
                  : 'Resolve this scheme, then put it on the bottom of the scheme deck.'}
              </p>
              <div className="current-actions">
                {currentCard.typeLine === 'Ongoing Scheme' ? (
                  <button
                    className="action-button primary-action ongoing-action"
                    onClick={() =>
                      onAction({
                        type: 'KEEP_CURRENT_AS_ONGOING',
                        print: currentCard,
                      })
                    }
                    type="button"
                  >
                    Keep Ongoing
                  </button>
                ) : (
                  <button
                    className="action-button primary-action"
                    onClick={() =>
                      onAction({
                        type: 'RESOLVE_CURRENT_TO_BOTTOM',
                        print: currentCard,
                      })
                    }
                    type="button"
                  >
                    Resolve &amp; Bottom
                  </button>
                )}
              </div>
            </aside>
          </div>
        ) : (
          <div className="awaiting-scheme">
            <p className="card-label">Current Scheme</p>
            <h3>Ready for the next scheme</h3>
            <p>
              At the start of the archenemy turn, reveal the top card. The next
              image will load when the scheme is set in motion.
            </p>
            <button
              className="action-button primary-action reveal-action"
              disabled={game.schemeDeck.length === 0}
              onClick={setSchemeInMotion}
              type="button"
            >
              Set Scheme in Motion
            </button>
          </div>
        )}
      </section>

      <section className="ongoing-area" aria-label="Active ongoing schemes">
        <div className="ongoing-heading">
          <p className="card-label">Face-up Ongoing Schemes</p>
          <span>{game.ongoingSchemes.length} active</span>
        </div>
        <div className="ongoing-list">
          {game.ongoingSchemes.length === 0 && (
            <p className="empty-ongoing">No ongoing schemes are active.</p>
          )}
          {game.ongoingSchemes.map((instance) => {
            const card = cardById.get(instance.printId)

            if (!card) {
              return null
            }

            return (
              <article className="ongoing-card" key={instance.instanceId}>
                <div className="ongoing-image-frame">
                  <SchemeImage
                    card={card}
                    onZoom={setZoomedCard}
                    size="ongoing"
                  />
                </div>
                <SchemeMetadata card={card} />
                <button
                  className="action-button abandon-action"
                  onClick={() =>
                    onAction({
                      type: 'ABANDON_ONGOING',
                      instanceId: instance.instanceId,
                      print: card,
                    })
                  }
                  type="button"
                >
                  Abandon &amp; Bottom
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <aside className="history-panel" aria-labelledby="history-heading">
        <p className="card-label">Game Log</p>
        <h3 id="history-heading">Recent actions</h3>
        <ol>
          {game.history
            .slice(-6)
            .reverse()
            .map((event) => (
              <li key={event.id}>{event.message}</li>
            ))}
        </ol>
      </aside>

      {zoomedCard && (
        <div
          aria-label={`${zoomedCard.name} large card view`}
          aria-modal="true"
          className="card-zoom-backdrop"
          onClick={() => setZoomedCard(null)}
          role="dialog"
        >
          <div
            className="card-zoom-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Close large card view"
              className="card-zoom-close"
              onClick={() => setZoomedCard(null)}
              type="button"
            >
              ×
            </button>
            <img
              alt={`${zoomedCard.name} large scheme card`}
              className="card-zoom-image"
              src={zoomedCard.imageUris.large}
            />
            <div className="card-zoom-controls">
              <div className="card-zoom-copy">
                <div className="card-zoom-copy-heading">
                  <SchemeMetadata card={zoomedCard} />
                  <div
                    aria-label="Oracle text size controls"
                    className="font-controls"
                  >
                    <button
                      aria-label="Decrease oracle text size"
                      className="font-control-button"
                      disabled={zoomTextScale <= 0.85}
                      onClick={() =>
                        setZoomTextScale((scale) =>
                          Math.max(0.85, Number((scale - 0.15).toFixed(2))),
                        )
                      }
                      type="button"
                    >
                      −
                    </button>
                    <button
                      aria-label="Increase oracle text size"
                      className="font-control-button"
                      disabled={zoomTextScale >= 1.6}
                      onClick={() =>
                        setZoomTextScale((scale) =>
                          Math.min(1.6, Number((scale + 0.15).toFixed(2))),
                        )
                      }
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
                <OracleText
                  className="card-zoom-oracle"
                  text={zoomedCard.oracleText}
                  textScale={zoomTextScale}
                />
              </div>
              <button
                className="action-button subtle-action"
                onClick={() => setZoomedCard(null)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
