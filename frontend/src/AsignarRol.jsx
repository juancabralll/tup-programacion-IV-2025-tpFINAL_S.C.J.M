import { useCallback, useEffect, useState } from "react";
import { AuthRol, useAuth } from "./Auth";

export const AsignarRol = ({ usuarioId, onRolAsignado }) => {
  const [open, setOpen] = useState(false);

  return (
    <AuthRol rol="admin">
      <button onClick={() => setOpen(true)}>Asignar rol</button>
      {open && (
        <Componente
          usuarioId={usuarioId}
          onRolAsignado={onRolAsignado}
          setOpen={setOpen}
        />
      )}
    </AuthRol>
  );
};

const Componente = ({ usuarioId, setOpen, onRolAsignado }) => {
  const { fetchAuth } = useAuth();

  const [roles, setRoles] = useState([]);
  const [rolId, setRolId] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Pedir a la api que asigne el rol al usuario
    const response = await fetchAuth(
      `http://localhost:3000/usuarios/${usuarioId}/roles`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rolId }),
      }
    );
    const data = await response.json();

    if (!response.ok || !data.success) {
      return window.alert("Error al asignar rol al usuario");
    }

    onRolAsignado();
    setOpen(false);
  };

  return (
    <dialog open>
      <article>
        <h2>Asignar rol</h2>
        <form onSubmit={handleSubmit}>
          <fieldset>
            <label htmlFor="rol">Rol:</label>
            <select name="rol" onChange={(e) => setRolId(e.target.value)}>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </fieldset>
          <footer>
            <div className="grid">
              <input
                type="button"
                className="secondary"
                value="Cancelar"
                onClick={() => setOpen(false)}
              />
              <input type="submit" value="Asignar" />
            </div>
          </footer>
        </form>
      </article>
    </dialog>
  );
};
