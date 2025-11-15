import { useState } from "react";
import { AuthRol, useAuth } from "./Auth";

export const ModificarRol = ({
  id,
  nombre: nombreInicial,
  onRolModificado,
}) => {
  const { fetchAuth } = useAuth();

  const [open, setOpen] = useState(false);

  const [nombre, setNombre] = useState(nombreInicial);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Pedir a la api que modifique el rol
    const response = await fetchAuth(`http://localhost:3000/roles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      return window.alert("Error al modificar rol");
    }

    onRolModificado();
    setOpen(false);
  };

  return (
    <AuthRol rol="admin">
      <button onClick={() => setOpen(true)}>Modificar</button>
      <dialog open={open}>
        <article>
          <h2>Crear rol</h2>
          <form onSubmit={handleSubmit}>
            <fieldset>
              <label htmlFor="nombre">Nombre:</label>
              <input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </fieldset>
            <footer>
              <div className="grid">
                <input
                  type="button"
                  className="secondary"
                  value="Cancelar"
                  onClick={() => {
                    setNombre("");
                    setOpen(false);
                  }}
                />
                <input type="submit" value="Modificar" />
              </div>
            </footer>
          </form>
        </article>
      </dialog>
    </AuthRol>
  );
};
