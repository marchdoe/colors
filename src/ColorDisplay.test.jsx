import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ColorDisplay from './ColorDisplay.jsx'

const PROPS = {
  name: 'Bluetiful',
  hex: '#6CA0DC',
  R: '108', G: '160', B: '220',
  H: '211', S: '51', V: '86',
  introduced: 2017,
  retired: null,
  status: 'current',
  collection: 'standard',
  nameHistory: [],
  variants: [],
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

  it('renders the year range for a current color', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByText('2017 – present')).toBeInTheDocument()
  })

  it('renders the year range for a retired color', () => {
    render(<ColorDisplay {...PROPS} introduced={1990} retired={2017} status="retired" />)
    expect(screen.getByText('1990 – 2017')).toBeInTheDocument()
  })

  it('renders the status badge', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('renders the collection badge', () => {
    render(<ColorDisplay {...PROPS} />)
    expect(screen.getByText('Standard')).toBeInTheDocument()
  })

  it('does not render the name history section when nameHistory is empty', () => {
    render(<ColorDisplay {...PROPS} nameHistory={[]} />)
    expect(screen.queryByText(/also known as/i)).not.toBeInTheDocument()
  })

  it('renders the name history section when nameHistory has entries', () => {
    const nameHistory = [
      { name: 'Flesh Tint', from: 1903, to: 1949 },
      { name: 'Flesh', from: 1949, to: 1962 },
    ]
    render(<ColorDisplay {...PROPS} nameHistory={nameHistory} />)
    expect(screen.getByText(/also known as/i)).toBeInTheDocument()
    expect(screen.getByText('Flesh Tint')).toBeInTheDocument()
    expect(screen.getByText('Flesh')).toBeInTheDocument()
    expect(screen.getByText('1903 – 1949')).toBeInTheDocument()
    expect(screen.getByText('1949 – 1962')).toBeInTheDocument()
  })

  it('does not render the variants section when variants is empty', () => {
    render(<ColorDisplay {...PROPS} variants={[]} />)
    expect(screen.queryByText(/variants/i)).not.toBeInTheDocument()
  })

  it('renders the variants section when variants has entries', () => {
    const variants = [
      { name: 'Banana', year: 1994, type: 'scented', collection: 'Magic Scents' },
    ]
    render(<ColorDisplay {...PROPS} variants={variants} />)
    expect(screen.getByText(/variants/i)).toBeInTheDocument()
    expect(screen.getByText(/Banana/)).toBeInTheDocument()
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
