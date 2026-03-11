import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ColorDisplay from './ColorDisplay.jsx'

const PROPS = {
  name: 'Bluetiful',
  hex: '#6CA0DC',
  R: '108', G: '160', B: '220',
  H: '211', S: '51', V: '86',
  notes: 'Produced 2017–present.',
  mode: 'classic',
  onToggleMode: vi.fn(),
}

describe('ColorDisplay', () => {
  it('renders the color name as a heading', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByRole('heading', { name: 'Bluetiful' })).toBeInTheDocument()
  })

  it('renders the hex code', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByText('#6CA0DC')).toBeInTheDocument()
  })

  it('renders the notes', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByText('Produced 2017–present.')).toBeInTheDocument()
  })

  it('renders rgb values', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByText('rgb: 108, 160, 220')).toBeInTheDocument()
  })

  it('renders hsv values', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByText('hsv: 211, 51, 86')).toBeInTheDocument()
  })

  it('calls onToggleMode when the toggle button is clicked', async () => {
    const onToggleMode = vi.fn()
    render(<ColorDisplay {...PROPS} onToggleMode={onToggleMode} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onToggleMode).toHaveBeenCalledOnce()
  })

  it('does not propagate the toggle click to the parent', async () => {
    const onToggleMode = vi.fn()
    const onParentClick = vi.fn()
    render(
      <div onClick={onParentClick}>
        <ColorDisplay {...PROPS} onToggleMode={onToggleMode} />
      </div>
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onParentClick).not.toHaveBeenCalled()
  })

  it('applies the immersive class in immersive mode', () => {
    const { container } = render(<ColorDisplay {...PROPS} mode="immersive" />)
    expect(container.firstChild).toHaveClass('immersive')
  })

  it('sets background color to the hex value in immersive mode', () => {
    const { container } = render(<ColorDisplay {...PROPS} mode="immersive" />)
    expect(container.firstChild).toHaveStyle({ backgroundColor: '#6CA0DC' })
  })

  it('renders the color swatch in classic mode', () => {
    render(<ColorDisplay {...PROPS} mode="classic" />)
    expect(document.querySelector('.color-swatch')).toBeInTheDocument()
  })

  it('does not render the color swatch in immersive mode', () => {
    render(<ColorDisplay {...PROPS} mode="immersive" />)
    expect(document.querySelector('.color-swatch')).not.toBeInTheDocument()
  })
})
