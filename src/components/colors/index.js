import React from 'react'
import styles from './colors.css'
import shuffle from 'lodash.shuffle'
const colorList = require('./colors')

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

  onClick() {
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
      <div className={styles.wrapper} onClick={this.onClick}>
          <h1 className={styles.h1}>
              {name}
              <span className={styles.hex}>{details.Hexadecimal}</span>
          </h1>
          <p className={styles.p}>{details.Notes}</p>
          <span className={styles.rgb}>{rgb}</span> | <span className={styles.hsv}>{hsv}</span>

          <div className={styles.background} style={style.background}>

          </div>
      </div>
    )
  }
})
