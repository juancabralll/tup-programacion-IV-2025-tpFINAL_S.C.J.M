import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, useParams } from "react-router";

export const ModificarUsuario = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState(null);

  const fetchUsuario = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/usuarios/${id}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error al consultar por usuario:", data.error);
      return;
    }
    setValues(data.usuario);
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchUsuario();
  }, [fetchUsuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(values);

    const response = await fetchAuth(`http://localhost:3000/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return window.alert("Error al modificar usuario");
    }

    navigate("/usuarios");
  };

  if (!values) {
    return null;
  }

  return (
    <article>
      <h2>Modificar usuario</h2>
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
            />
          </label>
          <label>
            Nombre
            <input
              required
              value={values.nombre}
              onChange={(e) => setValues({ ...values, nombre: e.target.value })}
            />
          </label>
          <label>
            Apellido
            <input
              required
              value={values.apellido}
              onChange={(e) =>
                setValues({ ...values, apellido: e.target.value })
              }
            />
          </label>
        </fieldset>
        <input type="submit" value="Modificar usuario" />
      </form>
    </article>
  );
};
