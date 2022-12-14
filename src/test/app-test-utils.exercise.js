import {render, screen, waitForElementToBeRemoved} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import * as auth from 'auth-provider'
import {AppProviders} from 'context'
import * as usersDB from 'test/data/users'
import {buildUser} from 'test/generate'

const loginAsUser = async userProperties => {
  const user = buildUser(userProperties)

  await usersDB.create(user)

  const authUser = await usersDB.authenticate(user)

  window.localStorage.setItem(auth.localStorageKey, authUser.token)

  return user
}

const waitForLoadingToFinish = () =>
  waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ])

const customRender = async (
  ui,
  {route = '/list', user, ...renderOptions} = {},
) => {
  user = typeof user === 'undefined' ? await loginAsUser() : user

  window.history.pushState({}, '', route)

  const rtlHelpers = render(ui, {wrapper: AppProviders, ...renderOptions})

  await waitForLoadingToFinish()

  return {
    ...rtlHelpers,
    user,
  }
}

// re-export everything from react testing library
export * from '@testing-library/react'

// override RTL render method
export {customRender as render, loginAsUser, waitForLoadingToFinish, userEvent}
