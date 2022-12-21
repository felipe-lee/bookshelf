import faker from 'faker'
import * as React from 'react'

import {App} from 'app'
import {
  loginAsUser,
  render,
  screen,
  userEvent,
  waitForLoadingToFinish,
} from 'test/app-test-utils'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
import {buildBook, buildListItem} from 'test/generate'
import {formatDate} from 'utils/misc'

const renderBookScreen = async ({user, book, listItem} = {}) => {
  if (user === undefined) {
    user = await loginAsUser()
  }

  if (book === undefined) {
    book = buildBook()

    await booksDB.create(book)
  }

  if (listItem === undefined) {
    listItem = await listItemsDB.create(buildListItem({owner: user, book}))
  }

  const renderReturn = await render(<App />, {
    route: `/book/${book.id}`,
    user,
  })

  return {...renderReturn, book, user, listItem}
}

const assertBookNotInList = () => {
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
}

const assertBookInList = () => {
  expect(
    screen.getByRole('button', {name: /remove from list/i}),
  ).toBeInTheDocument()

  expect(screen.getByRole('textbox', {name: /notes/i})).toBeInTheDocument()

  expect(
    screen.queryByRole('button', {name: /add to list/i}),
  ).not.toBeInTheDocument()
}

test('renders all the book information', async () => {
  const {book} = await renderBookScreen({listItem: null})

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

  assertBookNotInList()
})

test('can create a list item for the book', async () => {
  await renderBookScreen({listItem: null})

  const addToListButton = screen.getByRole('button', {name: /add to list/i})

  expect(addToListButton).toBeInTheDocument()

  await userEvent.click(addToListButton)
  expect(addToListButton).toBeDisabled()

  await waitForLoadingToFinish()

  assertBookInList()
  expect(
    screen.getByRole('button', {name: /mark as read/i}),
  ).toBeInTheDocument()

  const startDateNode = screen.getByLabelText(/start date/i)
  expect(startDateNode).toHaveTextContent(formatDate(new Date()))

  expect(
    screen.queryByRole('button', {name: /mark as unread/i}),
  ).not.toBeInTheDocument()
  expect(screen.queryByRole('radio', {name: /star/i})).not.toBeInTheDocument()
})

test('can remove a list item for the book', async () => {
  await renderBookScreen()

  const removeListItemButton = await screen.findByRole('button', {
    name: /remove from list/i,
  })

  await userEvent.click(removeListItemButton)
  expect(removeListItemButton).toBeDisabled()

  await waitForLoadingToFinish()

  assertBookNotInList()
})

test('can mark a list item as read', async () => {
  const {listItem} = await renderBookScreen()
  await listItemsDB.update(listItem.id, {finishDate: null})

  const markBookAsReadButton = await screen.findByRole('button', {
    name: /mark as read/i,
  })

  await userEvent.click(markBookAsReadButton)
  expect(markBookAsReadButton).toBeDisabled()

  await waitForLoadingToFinish()

  assertBookInList()

  expect(
    screen.getByRole('button', {name: /mark as unread/i}),
  ).toBeInTheDocument()

  expect(screen.getAllByRole('radio', {name: /star/i}).length).toEqual(5)

  const startAndFinishDatesNode = screen.getByLabelText(
    /start and finish date/i,
  )
  expect(startAndFinishDatesNode).toHaveTextContent(
    `${formatDate(listItem.startDate)} — ${formatDate(new Date())}`,
  )

  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
})

test('can edit a note', async () => {
  jest.useFakeTimers()

  const {listItem} = await renderBookScreen()

  const notesTextBox = screen.getByRole('textbox', {name: /notes/i})

  const fakeTimerUserEvent = userEvent.setup({
    advanceTimers: () => jest.runOnlyPendingTimers(),
  })

  const notes = faker.lorem.words()

  await fakeTimerUserEvent.clear(notesTextBox)
  await fakeTimerUserEvent.type(notesTextBox, notes)

  await screen.findByLabelText(/loading/i)

  await waitForLoadingToFinish()

  expect(notesTextBox).toHaveValue(notes)

  expect(await listItemsDB.read(listItem.id)).toMatchObject({notes})
})
