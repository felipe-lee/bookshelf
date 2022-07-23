import * as React from 'react'
import {ReactQueryConfigProvider} from 'react-query'
import {BrowserRouter as Router} from 'react-router-dom'

import {AuthProvider} from 'context/auth-context'

const queryConfig = {
  retry(failureCount, error) {
    return error.status !== 404 && failureCount <= 2
  },
  useErrorBoundary: true,
  refetchAllOnWindowFocus: false,
}

export const AppProviders = ({children}) => {
  return (
    <ReactQueryConfigProvider config={queryConfig}>
      <Router>
        <AuthProvider>{children}</AuthProvider>
      </Router>
    </ReactQueryConfigProvider>
  )
}
