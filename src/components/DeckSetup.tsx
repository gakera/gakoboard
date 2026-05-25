import {
  countDuplicatePrintings,
  getSchemeDeck,
  schemeSets,
  type SchemePrint,
} from '../data/schemeCatalog'
import type { DeckSelection } from '../archenemy/gameState'

type DeckSetupProps = {
  selection: DeckSelection
  validationErrors: string[]
  onSelectionChange: (selection: DeckSelection) => void
  onStartGame: (cards: SchemePrint[]) => void
}

export function DeckSetup({
  selection,
  validationErrors,
  onSelectionChange,
  onStartGame,
}: DeckSetupProps) {
  const selectedSetCodes = new Set(selection.includedSetCodes)
  const selectedPrints = getSchemeDeck(selectedSetCodes, true)
  const schemeDeck = getSchemeDeck(
    selectedSetCodes,
    selection.includeDuplicatePrintings,
  )
  const ongoingCount = schemeDeck.filter(
    (scheme) => scheme.typeLine === 'Ongoing Scheme',
  ).length
  const duplicatePrintings = countDuplicatePrintings(selectedPrints)

  function toggleSet(setCode: string) {
    const includedSetCodes = selectedSetCodes.has(setCode)
      ? selection.includedSetCodes.filter((code) => code !== setCode)
      : [...selection.includedSetCodes, setCode]

    onSelectionChange({ ...selection, includedSetCodes })
  }

  return (
    <section className="deck-builder" aria-labelledby="deck-builder-heading">
      <div className="builder-intro">
        <p className="card-label">Deck Setup</p>
        <h3 id="deck-builder-heading">Build the scheme deck</h3>
        <p>
          Select products as if they were added from a box. Set reprints stay
          in the pool as separate cards unless duplicates are removed.
        </p>
      </div>

      <fieldset className="set-options">
        <legend className="sr-only">Choose included scheme sets</legend>
        {schemeSets.map((set) => (
          <label className="set-option" key={set.code}>
            <input
              checked={selectedSetCodes.has(set.code)}
              onChange={() => toggleSet(set.code)}
              type="checkbox"
            />
            <span className="set-label">
              <strong>{set.name}</strong>
              <span>
                {set.year} · {set.printCount} cards
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <label className="duplicate-toggle">
        <input
          checked={selection.includeDuplicatePrintings}
          onChange={(event) =>
            onSelectionChange({
              ...selection,
              includeDuplicatePrintings: event.target.checked,
            })
          }
          type="checkbox"
        />
        <span>
          <strong>Include duplicate printings</strong>
          <small>
            Keep matching schemes when they appear in more than one selected
            set.
          </small>
        </span>
      </label>

      <div className="deck-stats" aria-live="polite">
        <p>
          <strong>{schemeDeck.length}</strong>
          <span>cards selected</span>
        </p>
        <p>
          <strong>{ongoingCount}</strong>
          <span>ongoing schemes</span>
        </p>
        <p>
          <strong>{duplicatePrintings}</strong>
          <span>
            {selection.includeDuplicatePrintings ? 'duplicate cards' : 'removed'}
          </span>
        </p>
      </div>

      {validationErrors.length > 0 && (
        <div className="validation-message" role="alert">
          {validationErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      <button
        className="action-button primary-action start-button"
        disabled={validationErrors.length > 0}
        onClick={() => onStartGame(schemeDeck)}
        type="button"
      >
        Shuffle &amp; Start Game
      </button>
    </section>
  )
}
