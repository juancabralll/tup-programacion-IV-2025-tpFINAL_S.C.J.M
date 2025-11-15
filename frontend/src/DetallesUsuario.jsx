import { useCallback, useEffect, useState } from "react";
import { AuthRol, useAuth } from "./Auth";
import { useParams } from "react-router";
import { AsignarRol } from "./AsignarRol";

export const DetallesUsuario = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [roles, setRoles] = useState(null);

  // Consultar a la API detalles del usuario
  const fetchUsuario = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/usuarios/${id}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error al consultar por usuario:", data.error);
      return;
    }
    setUsuario(data.usuario);
  }, [fetchAuth, id]);

  // Consultar a la API roles del usuario
  const fetchRoles = useCallback(async () => {
    const response = await fetchAuth(
      `http://localhost:3000/usuarios/${id}/roles`
    );
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error error al consultar por roles:", data.error);
      return;
    }
    setRoles(data.roles);
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchUsuario();
    fetchRoles();
  }, [fetchUsuario, fetchRoles]);

  // Quitar un rol a usuario
  const handleQuitar = async (rolId) => {
    if (window.confirm("¿Desea quitar el rol?")) {
      const response = await fetchAuth(
        `http://localhost:3000/usuarios/${id}/roles/${rolId}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        return window.alert("Error al quitar rol");
      }

      await fetchRoles();
    }
  };

  if (!usuario || !roles) {
    return null;
  }

  return (
    <article>
      <h2>Detalles de usuario</h2>
      <p>
        Username: <b>{usuario.username}</b>
      </p>
      <p>
        Apellido: <b>{usuario.apellido}</b>
      </p>
      <p>
        Nombre: <b>{usuario.nombre}</b>
      </p>
      <p>
        Activo: <b>{usuario.activo ? "Si" : "No"}</b>
      </p>
      <p>Roles:</p>
      <ul>
        {roles.map((r) => (
          <li key={r.id}>
            {r.nombre}
            <AuthRol rol="admin">
              <button onClick={() => handleQuitar(r.id)}>x</button>
            </AuthRol>
          </li>
        ))}
      </ul>
      <AsignarRol usuarioId={id} onRolAsignado={fetchRoles} />
    </article>
  );
};
