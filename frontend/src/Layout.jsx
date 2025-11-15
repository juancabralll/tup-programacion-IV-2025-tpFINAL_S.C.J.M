import { Outlet, Link } from "react-router";
import { useAuth } from "./Auth";
import { Ingresar } from "./Ingresar";

export const Layout = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <main className="container">
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/usuarios">Usuarios</Link>
          </li>
          <li>
            <Link to="/roles">Roles</Link>
          </li>
        </ul>
        <li>
          {isAuthenticated ? (
            <button onClick={() => logout()}>Salir</button>
          ) : (
            <Ingresar />
          )}
        </li>
      </nav>
      <Outlet />
    </main>
  );
};
