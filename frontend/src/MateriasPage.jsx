import { useEffect, useState } from "react";
import { useAuth, AuthRol } from "./Auth";

export const MateriasPage = () => {
  const { fetchAuth } = useAuth();
  const [materias, setMaterias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMateria, setEditMateria] = useState(null);
  const [error, setError] = useState(null);

  const fetchMaterias = async () => {
    const response = await fetchAuth("http://localhost:3000/materias");
    const data = await response.json();
    if (response.ok && data.success) {
      setMaterias(data.materias);
    } else {
      setError("Error al cargar materias");
    }
  }

  useEffect(() => {
    fetchMaterias();
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta materia?")) return;
    const response = await fetchAuth(`http://localhost:3000/materias/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (response.ok && data.success) {
      setMaterias((prev) => prev.filter((m) => m.id !== id));
    } else {
      window.alert("Error al eliminar materia");
    }
  }

  const handleSave = () => {
    setShowForm(false);
    setEditMateria(null);
    fetchMaterias();
  }

  return (
    <article>
      <header className="flex justify-between items-center mb-4">
        <h2>Gestión de Materias</h2>
        <AuthRol rol="admin">
          <button
            onClick={() => {
              setEditMateria(null);
              setShowForm(true);
            }}>
            Nueva Materia
          </button>
        </AuthRol>
      </header>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {materias.length === 0 ? (
        <p>No hay materias registradas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Código</th>
              <th>Año</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.nombre}</td>
                <td>{m.codigo}</td>
                <td>{m.anio}</td>
                <td>
                  <AuthRol rol="admin">
                    <button
                      onClick={() => {
                        setEditMateria(m);
                        setShowForm(true);
                      }}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(m.id)}>Eliminar</button>
                  </AuthRol>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <MateriaForm
          materia={editMateria}
          onCancel={() => {
            setShowForm(false);
            setEditMateria(null);
          }}
          onSave={handleSave}
        />
      )}
    </article>
  )
}

const MateriaForm = ({ materia, onCancel, onSave }) => {
  const { fetchAuth } = useAuth();
  const [nombre, setNombre] = useState(materia?.nombre || "");
  const [codigo, setCodigo] = useState(materia?.codigo || "");
  const [anio, setAnio] = useState(materia?.anio || "");
  const [error, setError] = useState(null);
  const isEdit = !!materia;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const url = isEdit
      ? `http://localhost:3000/materias/${materia.id}`
      : "http://localhost:3000/materias";
    const method = isEdit ? "PUT" : "POST";
    const response = await fetchAuth(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, codigo, anio }),
    })
    const data = await response.json()
    if (response.ok && data.success) {
      onSave();
    } else {
      setError(data.message || "Error al guardar materia");
    }
  }

  return (
    <dialog open>
      <article>
        <h3>{isEdit ? "Editar Materia" : "Nueva Materia"}</h3>
        <form onSubmit={handleSubmit}>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            minLength={3}
            maxLength={100}
          />
          <label>Código:</label>
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
            minLength={1}
            maxLength={10}
          />
          <label>Año:</label>
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            required
            min={1900}
            max={2099}
          />
          <footer>
            <div className="grid">
              <input type="button" value="Cancelar" onClick={onCancel} />
              <input type="submit" value="Guardar" />
            </div>
          </footer>
        </form>
      </article>
    </dialog>
  )
}
