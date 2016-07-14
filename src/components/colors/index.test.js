/*eslint-env mocha*/
import expect from 'expect'
import Color from './index'
import React from 'react'
import { render } from 'react-dom'

describe('Color', () => {
  it('says "Color Name"', () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    render(<Color/>, div)
    expect(div.innerHTML).toMatch(/Color Name/)
  })
})
