import React from 'react'
import ReactDOM from 'react-dom'

import {Logo} from 'components/logo'

const App = () => {
  return (
      <>
        <Logo height={80} width={80}/>

        <h1>Bookshelf</h1>

        <div>
          <button onClick={() => alert('Log In button clicked')}>Log In</button>
        </div>

        <div>
          <button onClick={() => alert('Register button clicked')}>Register</button>
        </div>
      </>
  )
}

ReactDOM.render(<App/>, document.getElementById('root'))