/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'

import * as auth from 'auth-provider'
import {AuthenticatedApp} from 'authenticated-app'
import {UnauthenticatedApp} from 'unauthenticated-app'
import {client} from 'utils/api-client'

const UNAUTHENTICATED_USER = null

const checkForLoggedInUser = async () => {
  let user = UNAUTHENTICATED_USER

  const token = await auth.getToken()

  if (token) {
    await client('me', {token}).then(data => {
      user = data.user
    })
  }

  return user
}

function App() {
  const [user, setUser] = React.useState(UNAUTHENTICATED_USER)

  React.useEffect(() => {
    checkForLoggedInUser().then(u => setUser(u))
  }, [])

  const login = form => auth.login(form).then(u => setUser(u))

  const register = form => auth.register(form).then(u => setUser(u))

  const logout = () => {
    auth.logout()
    setUser(UNAUTHENTICATED_USER)
  }

  return user ? (
    <AuthenticatedApp user={user} logout={logout} />
  ) : (
    <UnauthenticatedApp login={login} register={register} />
  )
}

export {App}
