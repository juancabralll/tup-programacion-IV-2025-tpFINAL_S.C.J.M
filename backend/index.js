import express from "express";
import cors from "cors";
import { conectarDB } from "./db.js";
import usuariosRouter from "./usuarios.js";
import rolesRouter from "./roles.js";
import usuariosRolesRouter from "./usuarios-roles.js";
import authRouter, { authConfig } from "./auth.js";
import alumnosRouter from "./alumnos.js";
import notasRouter from "./notas.js";
import materiasRouter from "./materias.js";

conectarDB();

const app = express();
const port = 3000;

// Para interpretar body como JSON
app.use(express.json());

// Habilito CORS
app.use(cors());

authConfig();

app.get("/", (req, res) => {
  // Responder con string
  res.send("Hola mundo!");
});

app.use("/usuarios", usuariosRouter);
app.use("/roles", rolesRouter);
app.use("/usuarios-roles", usuariosRolesRouter);
app.use("/auth", authRouter);
app.use("/alumnos", alumnosRouter);
app.use("/materias", materiasRouter);
app.use("/notas", notasRouter);

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en el puerto ${port}`);
});
