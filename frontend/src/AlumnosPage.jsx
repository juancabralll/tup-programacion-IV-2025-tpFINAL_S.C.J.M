import { useEffect, useState } from "react";
import { useAuth, AuthRol } from "./Auth";

export const AlumnosPage = () => {
  const { fetchAuth } = useAuth();
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAlumno, setEditAlumno] = useState(null);

  const fetchAlumnos = async () => {
    setLoading(true);
    const response = await fetchAuth("http://localhost:3000/alumnos");
    const data = await response.json();
    if (response.ok && data.success) {
      setAlumnos(data.alumnos);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este alumno?")) return;
    const response = await fetchAuth(`http://localhost:3000/alumnos/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (response.ok && data.success) {
      setAlumnos((prev) => prev.filter((a) => a.id !== id));
    } else {
      window.alert("Error al eliminar alumno");
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditAlumno(null);
    fetchAlumnos();
  };

  return (
    <article>
      <header className="flex justify-between items-center mb-4">
        <h2>Gestión de Alumnos</h2>
        <AuthRol rol="admin">
          <button onClick={() => setShowForm(true)}>Nuevo Alumno</button>
        </AuthRol>
      </header>

      {loading ? (
        <p>Cargando...</p>
      ) : alumnos.length === 0 ? (
        <p>No hay alumnos registrados.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DNI</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.nombre}</td>
                <td>{a.apellido}</td>
                <td>{a.dni}</td>
                <td>
                  <AuthRol rol="admin">
                    <button
                      onClick={() => {
                        setEditAlumno(a);
                        setShowForm(true);
                      }}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(a.id)}>Eliminar</button>
                  </AuthRol>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <AlumnoForm
          alumno={editAlumno}
          onCancel={() => {
            setShowForm(false);
            setEditAlumno(null);
          }}
          onSave={handleSave}
        />
      )}
    </article>
  );
};

const AlumnoForm = ({ alumno, onCancel, onSave }) => {
  const { fetchAuth } = useAuth();
  const [nombre, setNombre] = useState(alumno?.nombre || "");
  const [apellido, setApellido] = useState(alumno?.apellido || "");
  const [dni, setDni] = useState(alumno?.dni || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = alumno
      ? `http://localhost:3000/alumnos/${alumno.id}`
      : "http://localhost:3000/alumnos";
    const method = alumno ? "PUT" : "POST";
    const response = await fetchAuth(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, apellido, dni }),
    });
    const data = await response.json();
    if (response.ok && data.success) {
      onSave();
    } else {
      window.alert(data.message || "Error al guardar alumno");
    }
  };

  return (
    <dialog open>
      <article>
        <h3>{alumno ? "Editar Alumno" : "Nuevo Alumno"}</h3>
        <form onSubmit={handleSubmit}>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <label>Apellido:</label>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
          <label>DNI:</label>
          <input
            type="number"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
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
  );
};