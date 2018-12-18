import React, { Component } from 'react'
import PropTypes from 'prop-types'
// import { Router, createMemoryHistory, browserHistory } from 'react-router'
import { Provider } from 'react-redux'
// import { syncHistoryWithStore } from 'react-router-redux'

import createMemoryHistory from 'history/createMemoryHistory'
import createBrowserHistory from 'history/createBrowserHistory'

import configureStore from '../redux/store/configureStore'


export default class Isomorph extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    // history: PropTypes.object.isRequired
  }

  static createStore = (entryPoint, initialState) => configureStore(entryPoint, initialState)

  static createHistory = (store, path) => {
    // if (process.env.__CLIENT__)
    //   return syncHistoryWithStore(browserHistory, store)
    // return createMemoryHistory(path)
    if (process.env.__CLIENT__)
      return createBrowserHistory();
    return createMemoryHistory({ initialEntries: [path] });
  }

  render() {
    const { store, history, routes, children } = this.props
    return (
      <Provider store={store}>
        {/* <Router history={history} routes={routes} /> */}
        {children}
      </Provider>
    )
  }
}
