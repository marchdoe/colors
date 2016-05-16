import React from 'react'
import { header } from './styles.css'
import shuffle from 'lodash.shuffle'
const colorList = require('./colors')

export default React.createClass({
  componentWillMount() {
    const randomColor = shuffle(Object.keys(colorList))[0]
    this.setState({
      name: randomColor,
      details: colorList[randomColor]
    })
  },

  render() {
    const { name, details} = this.state

    const rgb = `RGB = ${details.R}, ${details.G}, ${details.B}`
    const hsv = `RGB = ${details.H}, ${details.S}, ${details.V}`

    return (
      <div>
        <h1 className={header}>{name}</h1>
        <h2 className={header}>{details.Hexadecimal}</h2>
        <h3 className={header}>{rgb}</h3>
        <h3 className={header}>{hsv}</h3>
        <p>{details.Notes}</p>
      </div>
    )
  }
})
