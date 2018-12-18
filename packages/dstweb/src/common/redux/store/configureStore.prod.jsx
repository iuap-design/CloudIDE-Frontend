import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import rootReducer from '../reducers'

const reducerMap = {
  index: rootReducer
};

export default function configureStore(entryPoint, initialState) {
  return createStore(reducerMap[entryPoint], initialState, applyMiddleware(thunk))
}
