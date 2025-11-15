import express from "express";
import { db } from "./db.js";
import { verificarAutenticacion, verificarAutorizacion } from "./auth.js";
import { body } from "express-validator";
import { validarId, verificarValidaciones } from "./validaciones.js";

const router = express.Router();

router.get("/", verificarAutenticacion, async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM roles");
  res.json({ success: true, roles: rows });
});

router.get("/:id", (req, res) => {});

router.post(
  "/",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  body("nombre", "Nombre inválido")
    .isAlpha("es-ES", { ignore: " " })
    .isLength({ max: 50 }),
  verificarValidaciones,
  async (req, res) => {
    const { nombre } = req.body;

    const [result] = await db.execute("INSERT INTO roles (nombre) VALUES (?)", [
      nombre,
    ]);

    res
      .status(201)
      .json({ success: true, rol: { id: result.insertId, nombre } });
  }
);

router.put(
  "/:id",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  validarId,
  body("nombre", "Nombre inválido")
    .isAlpha("es-ES", { ignore: " " })
    .isLength({ max: 50 }),
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    const { nombre } = req.body;

    await db.execute("UPDATE roles SET nombre=? WHERE id=?", [nombre, id]);

    res.json({ success: true, rol: { id, nombre } });
  }
);

router.delete("/:id", (req, res) => {});

router.get("/:id/usuarios", (req, res) => {});
router.post("/:id/usuarios", (req, res) => {});
router.delete("/:id/usuarios/:usuarioId", (req, res) => {});

export default router;
