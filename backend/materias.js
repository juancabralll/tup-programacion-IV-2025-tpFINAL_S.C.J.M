import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import {
  verificarAutenticacion,
  verificarAutorizacion,
  alumnoVinculado,
} from "./auth.js";

const router = express.Router();

// ✅ Obtener todas las materias
router.get(
  "/",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  async (req, res) => {
    const [rows] = await db.execute("SELECT * FROM materias");
    res.json({ success: true, materias: rows });
  }
);

// ✅ Obtener materia por ID
router.get(
  "/:id",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const [rows] = await db.execute("SELECT * FROM materias WHERE id=?", [id]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Materia no encontrada" });
    }
    res.json({ success: true, materia: rows[0] });
  }
);

// ✅ Crear materia
router.post(
  "/",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  body("nombre", "Nombre inválido").isLength({ min: 3, max: 100 }),
  body("codigo", "Código inválido")
    .isAlphanumeric("es-ES")
    .isLength({ max: 10 }),
  body("anio", "Año inválido").isInt({ min: 1900, max: 2099 }),
  verificarValidaciones,
  async (req, res) => {
    const { nombre, codigo, anio } = req.body;
    try {
      const [result] = await db.execute(
        "INSERT INTO materias (nombre, codigo, anio) VALUES (?,?,?)",
        [nombre, codigo, anio]
      );
      res.status(201).json({
        success: true,
        data: { id: result.insertId, nombre, codigo, anio },
      });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ success: false, message: "Código de materia ya existe" });
      }
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Error al crear la materia" });
    }
  }
);

// ✅ Actualizar materia
router.put(
  "/:id",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  validarId,
  body("nombre").optional().isLength({ min: 3, max: 100 }),
  body("codigo").optional().isAlphanumeric("es-ES").isLength({ max: 10 }),
  body("anio").optional().isInt({ min: 1900, max: 2099 }),
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, codigo, anio } = req.body;

    const campos = [];
    const valores = [];
    if (nombre) {
      campos.push("nombre=?");
      valores.push(nombre);
    }
    if (codigo) {
      campos.push("codigo=?");
      valores.push(codigo);
    }
    if (anio) {
      campos.push("anio=?");
      valores.push(anio);
    }

    if (campos.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No hay campos para actualizar" });
    }

    valores.push(id);

    try {
      await db.execute(
        `UPDATE materias SET ${campos.join(", ")} WHERE id=?`,
        valores
      );
      res.json({ success: true, message: "Materia actualizada correctamente" });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ success: false, message: "Código de materia duplicado" });
      }
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Error al actualizar la materia" });
    }
  }
);

// ✅ Eliminar materia
router.delete(
  "/:id",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    await db.execute("DELETE FROM materias WHERE id=?", [id]);
    res.json({ success: true, data: id });
  }
);

//////////////////////////////////////////////////////////////////

router.get(
  "/consultaAlunmo",
  verificarAutenticacion,
  alumnoVinculado,
  async (req, res, next) => {
    const alumnoId = req.user.alumno_id;
    try {
      const [rows] = await db.execute(
        `SELECT DISTINCT m.id, m.nombre, m.codigo, m.anio
                 FROM materias m
                 JOIN notas n ON m.id = n.materia_id
                 WHERE n.alumnos_id = ?`,
        [alumnoId]
      );
      res.json({ success: true, materias: rows });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);
export default router;
