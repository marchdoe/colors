import React from 'react';
import './Color.css'
import shuffle from 'lodash.shuffle'
const colorList = require('./Color.json')

export default React.createClass({
  componentWillMount() {
    const colorNames = Object.keys(colorList)
    const randomColor = this.getRandomColor(colorNames)
    const unusedColors = this.removeColor(randomColor, colorNames)

    this.setState({
      name: randomColor,
      details: colorList[randomColor],
      unusedColors
    })
  },

  getRandomColor(colorNames) {
    return shuffle(colorNames)[0]
  },

  removeColor(color, colorNames = this.state.unusedColors) {
    const selectedColorIndex = colorNames.indexOf(color)
    colorNames.splice(selectedColorIndex, 1)
    return colorNames
  },

  handleClick() {
    const newColor = this.getRandomColor(this.state.unusedColors)
    const unusedColors = this.removeColor(newColor)

    this.setState({
      name: newColor,
      details: colorList[newColor],
      unusedColors
    })
  },

  render() {
    const { name, details} = this.state
    const rgb = `rgb: ${details.R}, ${details.G}, ${details.B}`
    const hsv = `hsv: ${details.H}, ${details.S}, ${details.V}`

    const style = {
      background: {
        backgroundColor: `${details.Hexadecimal}`,
        padding: '30px',
        margin: '0'
      }
    }

    return (
      <div className="mt3 px2 wrapper" onClick={this.handleClick}>
        <h1 className="h1 my1 px1 py2 border-bottom">
          {name}
          <span className="h2 pb0 px1 regular hex">{details.Hexadecimal}</span>
        </h1>
        <p className="h2 m0 mb2 p0 px1 py2 border-bottom">{details.Notes}</p>
        <span className="h4 p1 pb2 inline-block rgb">{rgb}</span>
        <span className="h4 p1 pb2 inline-block hsv">{hsv}</span>

        <div className="background" style={style.background}></div>
      </div>
    )
  }
})
