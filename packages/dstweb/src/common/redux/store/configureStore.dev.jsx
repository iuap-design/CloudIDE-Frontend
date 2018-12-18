import { compose, createStore, applyMiddleware } from 'redux'
import { isPlainObject, isFunction } from 'lodash'
import thunk from 'redux-thunk'
import { createLogger } from 'redux-logger'
import Immutable from 'immutable'

import rootReducer from '../reducers'

const reducerMap = {
  index: rootReducer
};

export default function configureStore(entryPoint, initialState) {
  const middlewares = [thunk]

  if (process.env.__CLIENT__) {
    const stateTransformer = states => {
      let finalStates = {}
      for (let key in states) {
        if (!states.hasOwnProperty(key))
          continue

        const state = states[key]

        if (Immutable.Iterable.prototype.isPrototypeOf(state) && isFunction(state.toObject)) {
          finalStates[key] = state.toObject()
        } else if (isPlainObject(state)) {
          finalStates[key] = key === 'routing' ? states : stateTransformer(state)
        }
      }
      return finalStates
    }
    const args = {
      stateTransformer,
      collapsed: true,
      colors: {
        title: () => `red`,
        prevState: () => `blue`,
        action: () => `orange`,
        nextState: () => `green`,
        error: () => `#F20404`,
      },
    }

    middlewares.push(createLogger(args))
  }

  const store = createStore(reducerMap[entryPoint], initialState, compose(
    applyMiddleware(...middlewares),
    process.env.__CLIENT__ && window.devToolsExtension ? window.devToolsExtension() : f => f
  ))

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default
      store.replaceReducer(nextRootReducer)
    })
  }

  return store
}
