// 🐨 you don't need to do anything for the exercise, but there's an extra credit!
import * as React from 'react'
import {createRoot} from 'react-dom/client'
import {ReactQueryConfigProvider} from 'react-query'

import {App} from './app'
import './bootstrap'

import {AuthProvider} from 'context/auth-context'
import {loadDevTools} from 'dev-tools/load'

const queryConfig = {
  retry(failureCount, error) {
    return error.status !== 404 && failureCount <= 2
  },
  useErrorBoundary: true,
  refetchAllOnWindowFocus: false,
}

// ignore the rootRef in this file. I'm just doing it here to make
// the tests I write to check your work easier.
export const rootRef = {}
loadDevTools(() => {
  const root = createRoot(document.getElementById('root'))
  root.render(
    <ReactQueryConfigProvider config={queryConfig}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ReactQueryConfigProvider>,
  )
  rootRef.current = root
})
