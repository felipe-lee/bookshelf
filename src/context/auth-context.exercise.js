import * as React from 'react'

export const AuthContext = React.createContext({
  user: null,
  login: () => {},
  register: () => {},
  logout: () => {},
})

export const useAuth = () => {
  const context = React.useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthContext.Provider')
  }

  return context
}
