import { useMemo, useState } from 'react'
import './App.css'
import {
  countDuplicatePrintings,
  getSchemeDeck,
  schemeSets,
} from './data/schemeCatalog'

function App() {
  const [includedSetCodes, setIncludedSetCodes] = useState(() =>
    schemeSets.map((set) => set.code),
  )
  const [includeDuplicatePrintings, setIncludeDuplicatePrintings] =
    useState(true)

  const selectedSetCodes = useMemo(
    () => new Set(includedSetCodes),
    [includedSetCodes],
  )
  const selectedPrints = useMemo(
    () => getSchemeDeck(selectedSetCodes, true),
    [selectedSetCodes],
  )
  const schemeDeck = useMemo(
    () => getSchemeDeck(selectedSetCodes, includeDuplicatePrintings),
    [includeDuplicatePrintings, selectedSetCodes],
  )
  const duplicatePrintings = countDuplicatePrintings(selectedPrints)
  const currentScheme = schemeDeck[0]
  const ongoingSchemes = schemeDeck.filter(
    (scheme) => scheme.typeLine === 'Ongoing Scheme',
  )

  function toggleSet(setCode: string) {
    setIncludedSetCodes((setCodes) =>
      setCodes.includes(setCode)
        ? setCodes.filter((code) => code !== setCode)
        : [...setCodes, setCode],
    )
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
            <p className="eyebrow">Proof of Concept</p>
            <h2 id="scheme-heading">Archenemy Schemes</h2>
          </div>
          <span className="sample-badge">Print Catalog</span>
        </div>

        <section className="deck-builder" aria-labelledby="deck-builder-heading">
          <div className="builder-intro">
            <p className="card-label">Deck Setup</p>
            <h3 id="deck-builder-heading">Sets in the deck</h3>
            <p>
              Select products as if they were added from a box. Set reprints
              stay in the pool as separate cards unless duplicates are removed.
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
              checked={includeDuplicatePrintings}
              onChange={(event) =>
                setIncludeDuplicatePrintings(event.target.checked)
              }
              type="checkbox"
            />
            <span>
              <strong>Include duplicate printings</strong>
              <small>
                Keep matching schemes when they appear in more than one
                selected set.
              </small>
            </span>
          </label>

          <div className="deck-stats" aria-live="polite">
            <p>
              <strong>{schemeDeck.length}</strong>
              <span>cards selected</span>
            </p>
            <p>
              <strong>{ongoingSchemes.length}</strong>
              <span>ongoing schemes</span>
            </p>
            <p>
              <strong>{duplicatePrintings}</strong>
              <span>
                {includeDuplicatePrintings ? 'duplicate cards' : 'removed'}
              </span>
            </p>
          </div>
        </section>

        <div className="board-grid">
          <article className="current-card">
            <p className="card-label">Current Scheme</p>
            {currentScheme ? (
              <>
                <h3>{currentScheme.name}</h3>
                <p className="print-meta">
                  {currentScheme.setName} · {currentScheme.releasedAt.slice(0, 4)}
                </p>
                <p className="kind">{currentScheme.typeLine}</p>
                <p className="card-copy">{currentScheme.oracleText}</p>
              </>
            ) : (
              <>
                <h3>No sets selected</h3>
                <p className="card-copy">
                  Select at least one set above to create a scheme deck.
                </p>
              </>
            )}
          </article>

          <section className="ongoing-area" aria-label="Ongoing schemes">
            <p className="card-label">Ongoing Schemes</p>
            <div className="ongoing-list">
              {ongoingSchemes.slice(0, 2).map((scheme) => (
                <article className="ongoing-card" key={scheme.id}>
                  <h3>{scheme.name}</h3>
                  <p className="ongoing-meta">
                    {scheme.setName} · {scheme.releasedAt.slice(0, 4)}
                  </p>
                  <p>{scheme.oracleText}</p>
                </article>
              ))}
              {ongoingSchemes.length > 2 && (
                <p className="more-schemes">
                  + {ongoingSchemes.length - 2} more ongoing schemes in this
                  deck
                </p>
              )}
            </div>
          </section>
        </div>
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
            Full card references and step-by-step rulings will be added in a
            later pass.
          </p>
        </details>
      </aside>

      <footer className="dev-check">
        <div>
          <p className="card-label">Dev loop check</p>
          <p className="status">
            Rendering 110 printed scheme records from the shipped catalog.
          </p>
        </div>
        <span className="version">v0.2.0-poc</span>
      </footer>
    </main>
  )
}

export default App
