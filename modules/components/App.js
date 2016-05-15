import React from 'react'
import { IndexLink, Link } from 'react-router'
import Title from 'react-title-component'

export default React.createClass({
  render() {
    return (
      <div>
        <Title render="Crayola Colors"/>
        {/*<h1>A Box of Colors</h1>
          <ul className="list-reset">
            <li><IndexLink to="/">Home</IndexLink></li>
            <li><Link to="/color">A Color</Link></li>
            <li><Link to="/not-dragon">An old URL to a DRAGON!</Link></li>
          </ul>*/}
          {this.props.children}
      </div>
    )
  }
})

//
