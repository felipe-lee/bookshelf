import * as React from 'react'
import {render, screen, waitForElementToBeRemoved} from '@testing-library/react'
import {queryCache} from 'react-query'

import {App} from 'app'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'
import {buildUser, buildBook} from 'test/generate'

afterEach(async () => {
  queryCache.clear()

  await auth.logout()
})

test('renders all the book information', async () => {
  const user = buildUser()
  const fakeToken = 'fake_token'
  window.localStorage.setItem(auth.localStorageKey, fakeToken)

  const book = buildBook()

  window.history.pushState({}, '', `/book/${book.id}`)

  const originalFetch = window.fetch
  window.fetch = async (url, config) => {
    let data
    if (url.endsWith('/bootstrap')) {
      data = {
        user: {...user, token: fakeToken},
        listItems: [],
      }
    } else if (url.endsWith('/list-items')) {
      data = {listItems: []}
    } else if (url.endsWith(`/books/${book.id}`)) {
      data = {book}
    }
    if (data) {
      return Promise.resolve({ok: true, json: async () => data})
    } else {
      return originalFetch(url, config)
    }
  }

  render(<App />, {wrapper: AppProviders})

  await waitForElementToBeRemoved(() => screen.getByLabelText(/loading/i))

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
