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

function SchemeDetails({ card }: { card: SchemePrint }) {
  return (
    <>
      <h3>{card.name}</h3>
      <p className="print-meta">
        {card.setName} · {card.releasedAt.slice(0, 4)}
      </p>
      <p className="kind">{card.typeLine}</p>
      <OracleText className="card-copy" text={card.oracleText} />
    </>
  )
}

export function GameBoard({
  game,
  cardById,
  onAction,
  onReturnToSetup,
}: GameBoardProps) {
  const currentCard = game.currentScheme
    ? cardById.get(game.currentScheme.printId)
    : undefined

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

      <div className="board-grid gameplay-grid">
        <article className="current-card gameplay-card">
          <p className="card-label">Current Scheme</p>
          {currentCard ? (
            <>
              <SchemeDetails card={currentCard} />
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
            </>
          ) : (
            <div className="awaiting-scheme">
              <h3>Ready for the next scheme</h3>
              <p className="card-copy">
                At the start of the archenemy turn, reveal the top card.
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
        </article>

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
                  <h3>{card.name}</h3>
                  <p className="ongoing-meta">
                    {card.setName} · {card.releasedAt.slice(0, 4)}
                  </p>
                  <OracleText text={card.oracleText} />
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
      </div>

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
    </>
  )
}
