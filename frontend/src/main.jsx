import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@picocss/pico";
import "./index.css";
import { Layout } from "./Layout.jsx";
import { Home } from "./Home.jsx";
import { AuthPage, AuthProvider, AuthRol } from "./Auth.jsx";
import { BrowserRouter, Route, Routes } from "react-router";
import { Usuarios } from "./Usuarios.jsx";
import { Roles } from "./Roles.jsx";
import { DetallesUsuario } from "./DetallesUsuario.jsx";
import { CrearUsuario } from "./CrearUsuario.jsx";
import { ModificarUsuario } from "./ModificarUsuario.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="usuarios"
              element={
                <AuthPage>
                  <Usuarios />
                </AuthPage>
              }
            />
            <Route
              path="usuarios/:id"
              element={
                <AuthPage>
                  <DetallesUsuario />
                </AuthPage>
              }
            />
            <Route
              path="usuarios/:id/modificar"
              element={
                <AuthPage>
                  <AuthRol rol="admin">
                    <ModificarUsuario />
                  </AuthRol>
                </AuthPage>
              }
            />
            <Route
              path="usuarios/crear"
              element={
                <AuthPage>
                  <AuthRol rol="admin">
                    <CrearUsuario />
                  </AuthRol>
                </AuthPage>
              }
            />
            <Route
              path="roles"
              element={
                <AuthPage>
                  <Roles />
                </AuthPage>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
