import {ReactQueryConfigProvider} from 'react-query'
import {loadDevTools} from './dev-tools/load'
import './bootstrap'
import * as React from 'react'
import ReactDOM from 'react-dom'
import {App} from './app'

const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    retry(failureCount, error) {
      return error.status !== 404 && failureCount <= 2
    },
    useErrorBoundary: true,
  },
}

loadDevTools(() => {
  ReactDOM.render(
    <ReactQueryConfigProvider config={queryConfig}>
      <App />
    </ReactQueryConfigProvider>,
    document.getElementById('root'),
  )
})
