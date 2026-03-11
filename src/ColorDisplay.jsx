export default function ColorDisplay({ name, hex, R, G, B, H, S, V, notes, mode, onToggleMode }) {
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

        <hr className="divider" />
        <p className="color-notes">{notes}</p>
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
