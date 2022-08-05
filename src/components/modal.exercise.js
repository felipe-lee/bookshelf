/** @jsx jsx */
import {jsx} from '@emotion/core'
import VisuallyHidden from '@reach/visually-hidden'
import * as React from 'react'

import {CircleButton, Dialog} from 'components/lib'

// Sample usage:
/*
<Modal>
  <ModalOpenButton>
    <button>Open Modal</button>
  </ModalOpenButton>
  <ModalContents aria-label="Modal label (for screen readers)">
    <ModalDismissButton>
      <button>Close Modal</button>
    </ModalDismissButton>
    <h3>Modal title</h3>
    <div>Some great contents of the modal</div>
  </ModalContents>
</Modal>
*/

const ModalContext = React.createContext()
ModalContext.displayName = 'ModalContext'

const useModal = () => {
  const context = React.useContext(ModalContext)

  if (context === undefined) {
    throw new Error('useModal must be used within a ModalContext.Provider')
  }

  return context
}

const Modal = props => {
  const [isOpen, setIsOpen] = React.useState(false)

  return <ModalContext.Provider value={{isOpen, setIsOpen}} {...props} />
}

const callAll =
  (...fns) =>
  (...args) => {
    for (const fn of fns) {
      fn(args)
    }
  }

const ModalDismissButton = ({children: child}) => {
  const {setIsOpen} = useModal()

  return React.cloneElement(child, {
    onClick: callAll(() => setIsOpen(false), child.props.onClick),
  })
}

const ModalOpenButton = ({children: child}) => {
  const {setIsOpen} = useModal()

  return React.cloneElement(child, {
    onClick: callAll(() => setIsOpen(true), child.props.onClick),
  })
}

const ModalContentsBase = props => {
  const {isOpen, setIsOpen} = useModal()

  return (
    <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props} />
  )
}

const CircleDismissButton = () => {
  return (
    <div css={{display: 'flex', justifyContent: 'flex-end'}}>
      <ModalDismissButton>
        <CircleButton>
          <VisuallyHidden>Close</VisuallyHidden>
          <span aria-hidden>×</span>
        </CircleButton>
      </ModalDismissButton>
    </div>
  )
}

const ModalContents = ({title, children, ...props}) => {
  return (
    <ModalContentsBase {...props}>
      <CircleDismissButton />

      <h3 css={{textAlign: 'center', fontSize: '2em'}}>{title}</h3>

      {children}
    </ModalContentsBase>
  )
}

export {
  Modal,
  ModalContents,
  ModalContentsBase,
  ModalDismissButton,
  ModalOpenButton,
}
