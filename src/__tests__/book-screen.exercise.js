import * as React from 'react'
import {queryCache} from 'react-query'
import {
  render as baseRender,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {App} from 'app'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
import * as usersDB from 'test/data/users'
import {buildUser, buildBook} from 'test/generate'
import {formatDate} from 'utils/misc'

afterEach(async () => {
  queryCache.clear()

  await Promise.all([
    auth.logout(),
    usersDB.reset(),
    booksDB.reset(),
    listItemsDB.reset(),
  ])
})
const loginAsUser = async userProperties => {
  const user = buildUser(userProperties)

  await usersDB.create(user)

  const authUser = await usersDB.authenticate(user)

  window.localStorage.setItem(auth.localStorageKey, authUser.token)

  return user
}

const render = async (ui, {route = '/list', user, ...renderOptions} = {}) => {
  user = typeof user === 'undefined' ? await loginAsUser() : user

  window.history.pushState({}, '', route)

  const rtlHelpers = baseRender(ui, {wrapper: AppProviders, ...renderOptions})

  await waitForLoadingToFinish()

  return {
    ...rtlHelpers,
    user,
  }
}

const renderBookPage = async (ui, options) => {
  const book = buildBook()
  await booksDB.create(book)

  const renderReturn = await render(ui, {route: `/book/${book.id}`, ...options})

  return {...renderReturn, book}
}

const waitForLoadingToFinish = () =>
  waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ])

test('renders all the book information', async () => {
  const {book} = await renderBookPage(<App />)

  expect(
    await screen.findByRole('heading', {level: 1, name: book.title}),
  ).toBeInTheDocument()

  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()

  expect(screen.getByRole('img', {name: /book cover/i})).toHaveAttribute(
    'src',
    book.coverImageUrl,
  )

  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('textbox', {name: /notes/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument()
})

test('can create a list item for the book', async () => {
  await renderBookPage(<App />)

  const addToListButton = screen.getByRole('button', {name: /add to list/i})

  expect(addToListButton).toBeInTheDocument()

  await userEvent.click(addToListButton)
  expect(addToListButton).toBeDisabled()

  await waitForLoadingToFinish()

  expect(
    screen.getByRole('button', {name: /remove from list/i}),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', {name: /mark as read/i}),
  ).toBeInTheDocument()
  expect(screen.getByRole('textbox', {name: /notes/i})).toBeInTheDocument()

  const startDateNode = screen.getByLabelText(/start date/i)
  expect(startDateNode).toHaveTextContent(formatDate(new Date()))

  expect(
    screen.queryByRole('button', {name: /add to list/i}),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
})
