import { createContext, useContext, useState } from "react"

// Contexto para compartir el estado de autenticacion/autorizacion
const AuthContext = createContext(null)

// Hook personzalizado para acceder al contexto de auth
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"))
  const [username, setUsername] = useState(() => localStorage.getItem("email"))
  const [roles, setRoles] = useState(() => localStorage.getItem("roles"))
  const [error, setError] = useState(null)

  const login = async (username, password) => {
    setError(null)
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const session = await response.json()

      if (!response.ok && response.status === 400) {
        throw new Error(session.error)
      }

      localStorage.setItem("token", session.token)
      localStorage.setItem("user", JSON.stringify(session.username))
      localStorage.setItem("roles", JSON.stringify(session.roles))
      setToken(session.token)
      setUsername(session.username)
      setRoles(session.roles)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false }
    }
  }

  const logout = () => {
    setToken(null)
    setUsername(null)
    setRoles(null)
    setError(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("roles")
  }

  const fetchAuth = async (url, options = {}) => {
    if (!token) {
      throw new Error("No esta iniciada la session")
    }

    return fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    })
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        roles,
        error,
        isAuthenticated: !!token,
        login,
        logout,
        fetchAuth,
      }}>
      {children}
    </AuthContext.Provider>
  )
}

// Muestra un mensaje si el usuario no esta logeado
export const AuthPage = ({ children }) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <h2>Ingrese para ver esta pagina</h2>
  }

  return children
}

// Oculta el componente hijo si un usuario no tiene el rol
export const AuthRol = ({ rol, children }) => {
  const { roles } = useAuth()

  if (!roles.includes(rol)) {
    return null
  }

  return children
}
