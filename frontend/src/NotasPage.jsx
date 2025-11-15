import { useEffect, useState } from "react";
import { useAuth, AuthRol } from "./Auth";

export const NotasPage = () => {
  const { fetchAuth } = useAuth();
  const [notas, setNotas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editNota, setEditNota] = useState(null);
  const [error, setError] = useState(null);

  const fetchNotas = async () => {
    const response = await fetchAuth("http://localhost:3000/notas");
    const data = await response.json();
    if (response.ok && data.success) {
      setNotas(data.notas);
    } else {
      setError("Error al cargar notas");
    }
  }

  useEffect(() => {
    fetchNotas();
  }, [])

  const handleSave = () => {
    setShowForm(false);
    setEditNota(null);
    fetchNotas();
  }

  return (
    <article>
      <header className="flex justify-between items-center mb-4">
        <h2>Gestión de Notas</h2>
        <AuthRol rol="admin">
          <button
            onClick={() => {
              setEditNota(null)
              setShowForm(true)
            }}>
            Cargar Nota
          </button>
        </AuthRol>
      </header>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {notas.length === 0 ? (
        <p>No hay notas registradas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Alumno</th>
              <th>Materia</th>
              <th>Nota 1</th>
              <th>Nota 2</th>
              <th>Nota 3</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {notas.map((n) => (
              <tr key={n.id}>
                <td>{n.id}</td>
                <td>
                  {n.alumno_nombre} {n.alumno_apellido}
                </td>
                <td>
                  {n.materia_nombre} ({n.materia_codigo})
                </td>
                <td>{n.nota1}</td>
                <td>{n.nota2}</td>
                <td>{n.nota3}</td>
                <td>
                  <AuthRol rol="admin">
                    <button
                      onClick={() => {
                        setEditNota(n)
                        setShowForm(true)
                      }}>
                      Editar
                    </button>
                  </AuthRol>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <NotaForm
          nota={editNota}
          onCancel={() => {
            setShowForm(false)
            setEditNota(null)
          }}
          onSave={handleSave}
        />
      )}
    </article>
  )
}

const NotaForm = ({ nota, onCancel, onSave }) => {
  const { fetchAuth } = useAuth();
  const isEdit = !!nota;
  const [alumno_id, setAlumnoId] = useState(nota?.alumno_id || "");
  const [materia_id, setMateriaId] = useState(nota?.materia_id || "");
  const [nota1, setNota1] = useState(nota?.nota1 || "");
  const [nota2, setNota2] = useState(nota?.nota2 || "");
  const [nota3, setNota3] = useState(nota?.nota3 || "");
  const [error, setError] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [materias, setMaterias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      
        const [alumnosRes, materiasRes] = await Promise.all([
          fetchAuth("http://localhost:3000/alumnos"),
          fetchAuth("http://localhost:3000/materias"),
        ]);
        const alumnosData = await alumnosRes.json();
        const materiasData = await materiasRes.json();
        if (alumnosRes.ok && alumnosData.success)
          setAlumnos(alumnosData.alumnos);
        if (materiasRes.ok && materiasData.success)
          setMaterias(materiasData.materias);
    }
    fetchData();
  }, [fetchAuth])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const url = isEdit
      ? `http://localhost:3000/notas/${nota.id}`
      : "http://localhost:3000/notas";
    const method = isEdit ? "PUT" : "POST";
    const response = await fetchAuth(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumno_id, materia_id, nota1, nota2, nota3 }),
    });
    const data = await response.json();
    if (response.ok && data.success) {
      onSave();
    } else {
      setError(data.message || "Error al guardar nota");
    }
  }

  return (
    <dialog open>
      <article>
        <h3>{isEdit ? "Editar Nota" : "Cargar Nota"}</h3>
        <form onSubmit={handleSubmit}>
          {(
            <>
              <label>Alumno:</label>
              <select
                value={alumno_id}
                onChange={(e) => setAlumnoId(e.target.value)}
                required>
                <option value="">Seleccione un alumno</option>
                {alumnos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} {a.apellido} (DNI: {a.dni})
                  </option>
                ))}
              </select>
              <label>Materia:</label>
              <select
                value={materia_id}
                onChange={(e) => setMateriaId(e.target.value)}
                required>
                <option value="">Seleccione una materia</option>
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre} ({m.codigo})
                  </option>
                ))}
              </select>
            </>
          )}
          <label>Nota 1:</label>
          <input
            value={nota1}
            onChange={(e) => setNota1(e.target.value)}
            type="number"
            min={1}
            max={10}
          />
          <label>Nota 2:</label>
          <input
            value={nota2}
            onChange={(e) => setNota2(e.target.value)}
            type="number"
            min={1}
            max={10}
          />
          <label>Nota 3:</label>
          <input
            value={nota3}
            onChange={(e) => setNota3(e.target.value)}
            type="number"
            min={1}
            max={10}
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
