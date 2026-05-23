import './App.css'
import { placeholderSchemes } from './data/sampleSchemes'

const currentScheme = placeholderSchemes[0]
const ongoingSchemes = placeholderSchemes.filter(
  (scheme) => scheme.kind === 'Ongoing',
)

function App() {
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
          <span className="sample-badge">Placeholder Data</span>
        </div>

        <div className="board-grid">
          <article className="current-card">
            <p className="card-label">Current Scheme</p>
            <h3>{currentScheme.name}</h3>
            <p className="kind">{currentScheme.kind}</p>
            <p className="card-copy">{currentScheme.reminder}</p>
          </article>

          <section className="ongoing-area" aria-label="Ongoing schemes">
            <p className="card-label">Ongoing Schemes</p>
            <div className="ongoing-list">
              {ongoingSchemes.map((scheme) => (
                <article className="ongoing-card" key={scheme.id}>
                  <h3>{scheme.name}</h3>
                  <p>{scheme.reminder}</p>
                </article>
              ))}
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
          <p className="status">Placeholder app is rendering from local data.</p>
        </div>
        <span className="version">v0.1.0-poc</span>
      </footer>
    </main>
  )
}

export default App
