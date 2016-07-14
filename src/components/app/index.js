import React, { Component, PropTypes } from 'react'
import style from './style.css'
import Colors from '../colors'

class App extends Component {
  render() {
    return (
        <div className={style.root}>
            {this.props.children}
            <Colors />
        </div>
    )
  }
}

App.propTypes = {
  children: PropTypes.node
}

export default App
