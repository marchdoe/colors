import React, { Component } from 'react';
import { injectGlobal } from 'styled-components'
import { Provider } from 'rebass'
import Color from '../Color'

injectGlobal`
  * {
    box-sizing: border-box;
  }

  body {
    padding: 0;
    margin: 0;
    cursor: pointer;
  }

  *::selection,
  *::-moz-selection {
    background: transparent;
  }
`

class App extends Component {
  render() {
    return (
      <Provider>
        <Color />
      </Provider>
    );
  }
}

export default App;
