import React from 'react'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {Modal, ModalContents, ModalOpenButton} from '../modal'

test('can be opened and closed', async () => {
  const label = 'Greeting for user'
  const title = 'Greeting'
  const content = 'Hi, how are you?'

  render(
    <Modal>
      <ModalOpenButton>
        <button>Greet</button>
      </ModalOpenButton>
      <ModalContents aria-label={label} title={title}>
        <div>{content}</div>
      </ModalContents>
    </Modal>,
  )

  await userEvent.click(await screen.findByRole('button', {name: /greet/i}))

  const modal = screen.getByRole('dialog')

  expect(modal).toHaveAttribute('aria-label', label)

  const inModal = within(modal)

  expect(await inModal.findByRole('heading', {name: title})).toBeInTheDocument()

  expect(inModal.getByText(content)).toBeInTheDocument()

  await userEvent.click(await screen.findByRole('button', {name: /close/i}))

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
