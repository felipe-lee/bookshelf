import React from 'react'
import ReactDOM from 'react-dom'
import { Dialog } from "@reach/dialog"
import "@reach/dialog/styles.css";

import {Logo} from 'components/logo'
import {LoginForm} from 'components/LoginForm'

const LOG_IN = "log in"
const REGISTER = "register"
const NONE = "none"

const App = () => {
  const [openModal, setOpenModal] = React.useState(NONE)

  const close = () => {setOpenModal(NONE)}

  const handleLogIn = ({username, password}) => {
    console.log(`Log In - username: ${username} | password: ${password}`)
  }

  const handleRegister = ({username, password}) => {
    console.log(`Register - username: ${username} | password: ${password}`)
  }

  return (
      <>
        <Logo height={80} width={80}/>

        <h1>Bookshelf</h1>

        <div>
          <button onClick={() => setOpenModal(LOG_IN)}>Log In</button>

          <Dialog isOpen={openModal === LOG_IN} onDismiss={close}>
            <button className="close-button" onClick={close}>Close</button>
            <h3>Log In</h3>
            <LoginForm onSubmit={handleLogIn} buttonText={"Log In"}/>
          </Dialog>
        </div>

        <div>
          <button onClick={() => setOpenModal(REGISTER)}>Register</button>

          <Dialog aria-label="Log In Form" isOpen={openModal === REGISTER} onDismiss={close}>
            <button className="close-button" onClick={close}>Close</button>
            <h3>Register</h3>
            <LoginForm onSubmit={handleRegister} buttonText={"Register"}/>
          </Dialog>
        </div>
      </>
  )
}

ReactDOM.render(<App/>, document.getElementById('root'))