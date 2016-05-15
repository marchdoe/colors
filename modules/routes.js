import '../modules/styles.css'
import React from 'react'
import { Route, IndexRoute, Redirect } from 'react-router'
import { ServerRoute } from 'react-project'
import hello from './api/hello'
import App from './components/App'
import NoMatch from './components/NoMatch'
import Color from './components/Color'

export default (
  <Route>
    <Route path="/" component={App}>
      <IndexRoute component={Color}/>
    </Route>
    <ServerRoute path="/api">
      <ServerRoute path=":hello" get={hello}/>
    </ServerRoute>
    <Redirect from="/not-dragon" to="/color"/>
    <Route path="*" status={404} component={NoMatch}/>
  </Route>
)
