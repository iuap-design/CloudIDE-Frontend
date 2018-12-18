import React, { Component } from 'react'
import morror, { connect } from 'mirrorx'
import Sidebar from './components/index.js'

import model from './model'
morror.model(model)

export default connect( state => state.sidebar, null )(Sidebar)