/** @jsx jsx */
import {jsx} from '@emotion/core'
import {FullPageSpinner} from 'components/lib'

import * as React from 'react'

import * as auth from 'auth-provider'
import {AuthenticatedApp} from 'authenticated-app'
import * as colors from 'styles/colors'
import {UnauthenticatedApp} from 'unauthenticated-app'
import {client} from 'utils/api-client'
import {useAsync} from 'utils/hooks'

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
  const {
    data: user,
    error,
    isIdle,
    isLoading,
    isSuccess,
    isError,
    run,
    setData: setUser,
  } = useAsync()

  React.useEffect(() => {
    run(checkForLoggedInUser())
  }, [run])

  const login = form => auth.login(form).then(u => setUser(u))

  const register = form => auth.register(form).then(u => setUser(u))

  const logout = () => {
    auth.logout()
    setUser(UNAUTHENTICATED_USER)
  }

  if (isIdle || isLoading) {
    return <FullPageSpinner />
  } else if (isError) {
    return (
      <div
        css={{
          color: colors.danger,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p>Uh oh... There's a problem. Try refreshing the app.</p>
        <pre>{error.message}</pre>
      </div>
    )
  } else if (isSuccess) {
    return user ? (
      <AuthenticatedApp user={user} logout={logout} />
    ) : (
      <UnauthenticatedApp login={login} register={register} />
    )
  }
}

export {App}
