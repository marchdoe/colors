const COLLECTION_LABELS = {
  standard:       'Standard',
  Munsell:        'Munsell',
  Fluorescent:    'Fluorescent',
  'Silver Swirls':'Silver Swirls',
  'Gem Tones':    'Gem Tones',
  'Pearl Brite':  'Pearl Brite',
}

function YearRange({ introduced, retired }) {
  if (!introduced) return null
  const end = retired ? retired : 'present'
  return <span className="color-years">{introduced} – {end}</span>
}

function StatusBadge({ status }) {
  const label = status === 'current' ? 'Current' : 'Retired'
  return <span className={`badge badge-status badge-${status}`}>{label}</span>
}

function CollectionBadge({ collection }) {
  const label = COLLECTION_LABELS[collection] ?? collection
  return <span className={`badge badge-collection badge-coll-${collection.toLowerCase().replace(/\s+/g, '-')}`}>{label}</span>
}

function NameHistorySection({ nameHistory }) {
  if (!nameHistory || nameHistory.length === 0) return null
  return (
    <>
      <hr className="divider" />
      <p className="section-label">Also known as</p>
      <ul className="history-list">
        {nameHistory.map((entry, i) => (
          <li key={i}>
            <span className="history-years">
              {entry.from ?? '?'} – {entry.to ?? 'present'}
            </span>
            {entry.name}
          </li>
        ))}
      </ul>
    </>
  )
}

function VariantsSection({ variants }) {
  if (!variants || variants.length === 0) return null
  return (
    <>
      <hr className="divider" />
      <p className="section-label">Variants</p>
      <div className="variants-row">
        {variants.map((v, i) => {
          const icon = v.type === 'scented' ? '🌿' : '✨'
          const label = `${icon} ${v.name} '${String(v.year).slice(2)}`
          return (
            <span key={i} className={`variant-pill variant-${v.type}`}>
              {label}
            </span>
          )
        })}
      </div>
    </>
  )
}

export default function ColorDisplay({
  name, hex, R, G, B, H, S, V,
  introduced, retired, status, collection,
  nameHistory, variants,
  mode, onToggleMode,
}) {
  const isImmersive = mode === 'immersive'
  const pageStyle = isImmersive ? { backgroundColor: hex } : {}
  const toggleLabel = isImmersive ? '▣ classic' : '⬚ immersive'

  return (
    <div
      className={`color-page${isImmersive ? ' immersive' : ''}`}
      style={pageStyle}
    >
      <div className="color-info">
        <button
          className="view-toggle"
          onClick={e => { e.stopPropagation(); onToggleMode() }}
          title={isImmersive ? 'Switch to classic view' : 'Switch to immersive view'}
        >
          {toggleLabel}
        </button>

        <div className="color-header">
          <h1 className="color-name">{name}</h1>
          <span className="color-hex">{hex}</span>
        </div>

        <div className="color-meta">
          <StatusBadge status={status} />
          <CollectionBadge collection={collection} />
          <YearRange introduced={introduced} retired={retired} />
        </div>

        <NameHistorySection nameHistory={nameHistory} />
        <VariantsSection variants={variants} />

        <hr className="divider" />

        <div className="color-values">
          <span>rgb: {R}, {G}, {B}</span>
          <span>hsv: {H}, {S}, {V}</span>
        </div>
      </div>

      {!isImmersive && (
        <div
          className="color-swatch"
          style={{ backgroundColor: hex }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
