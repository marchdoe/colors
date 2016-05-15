import React from 'react'
import { header } from './styles.css'

const colorsList = require('./colors')

// let color = _.random(Object.keys(colorList.colors))
//
// colorList[color].H


export default React.createClass({
  render() {
    return (
      <div>
        {/*<h2 className={header}>{colorsList.colors}</h2>*/}
        <h1 className={header}>Red</h1>
        <h2 className={header}>#ED0A3F</h2>
        <h3 className={header}>RGB = 237, 10, 63</h3>
        <h3 className={header}>HSV = 346, 96, 93</h3>
        <p>Produced 1903–present</p>
      </div>
    )
  }
})
