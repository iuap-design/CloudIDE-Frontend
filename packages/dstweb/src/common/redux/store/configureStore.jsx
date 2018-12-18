import devStore from './configureStore.dev'
import prodStore from './configureStore.prod'

const store = process.env.NODE_ENV === 'production' ? prodStore : devStore;
export default store
