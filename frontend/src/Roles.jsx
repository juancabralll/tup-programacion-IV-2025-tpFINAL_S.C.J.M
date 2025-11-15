import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { CrearRol } from "./CrearRol";
import { ModificarRol } from "./ModificarRol";

export const Roles = () => {
  const { fetchAuth } = useAuth();

  const [roles, setRoles] = useState([]);

  const fetchRoles = useCallback(async () => {
    const response = await fetchAuth("http://localhost:3000/roles");
    const data = await response.json();

    if (!response.ok) {
      console.log("Error:", data.error);
      return;
    }

    setRoles(data.roles);
  }, [fetchAuth]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return (
    <article>
      <CrearRol onRolCreado={fetchRoles} />
      <h2>Roles</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.nombre}</td>
              <td>
                <ModificarRol
                  id={r.id}
                  nombre={r.nombre}
                  onRolModificado={fetchRoles}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
};
