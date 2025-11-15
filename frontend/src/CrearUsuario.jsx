import { useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate } from "react-router";

export const CrearUsuario = () => {
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();
  const [errores, setErrores] = useState(null);

  const [values, setValues] = useState({
    username: "",
    nombre: "",
    apellido: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrores(null);

    const response = await fetchAuth("http://localhost:3000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 400) {
        return setErrores(data.errores);
      }
      return window.alert("Error al crear usuario");
    }
    navigate("/usuarios");
  };

  return (
    <article>
      <h2>Crear usuario</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label>
            Nombre de usuario
            <input
              required
              value={values.username}
              onChange={(e) =>
                setValues({ ...values, username: e.target.value })
              }
              aria-invalid={
                errores && errores.some((e) => e.path === "username")
              }
            />
            {errores && (
              <small>
                {errores
                  .filter((e) => e.path === "username")
                  .map((e) => e.msg)
                  .join(", ")}
              </small>
            )}
          </label>
          <label>
            Nombre
            <input
              required
              value={values.nombre}
              onChange={(e) => setValues({ ...values, nombre: e.target.value })}
              aria-invalid={
                errores && errores.some((e) => e.path === "apellido")
              }
            />
            {errores && (
              <small>
                {errores
                  .filter((e) => e.path === "nombre")
                  .map((e) => e.msg)
                  .join(", ")}
              </small>
            )}
          </label>
          <label>
            Apellido
            <input
              required
              value={values.apellido}
              onChange={(e) =>
                setValues({ ...values, apellido: e.target.value })
              }
              aria-invalid={errores && errores.some((e) => e.path === "nombre")}
            />
            {errores && (
              <small>
                {errores
                  .filter((e) => e.path === "apellido")
                  .map((e) => e.msg)
                  .join(", ")}
              </small>
            )}
          </label>
          <label>
            Contraseña
            <input
              required
              type="password"
              value={values.password}
              onChange={(e) =>
                setValues({ ...values, password: e.target.value })
              }
              aria-invalid={
                errores && errores.some((e) => e.path === "password")
              }
            />
            {errores && (
              <small>
                {errores
                  .filter((e) => e.path === "password")
                  .map((e) => e.msg)
                  .join(", ")}
              </small>
            )}
          </label>
        </fieldset>
        <input type="submit" value="Crear usuario" />
      </form>
    </article>
  );
};
