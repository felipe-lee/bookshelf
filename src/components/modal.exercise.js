import * as React from 'react'

import {Dialog} from 'components/lib'

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

const ModalContents = props => {
  const {isOpen, setIsOpen} = useModal()

  return (
    <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props} />
  )
}

export {Modal, ModalContents, ModalDismissButton, ModalOpenButton}
