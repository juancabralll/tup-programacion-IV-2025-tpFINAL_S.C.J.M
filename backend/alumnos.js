import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body, param } from "express-validator";
import { verificarAutenticacion, verificarAutorizacion } from "./auth.js";

const router = express.Router();

//Obtener todos los alumnos
router.get(
  "/",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  async (req, res) => {
    const [rows] = await db.execute("SELECT * FROM alumnos");
    res.json({ success: true, alumnos: rows.map((u) => ({ ...u })) });
  }
);

// Obtener un alumno por ID

router.get(
  "/:id",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res, next) => {
    const { id } = req.params;
    const requestedAlumnoId = parseInt(id, 10);

    try {
      const [rows] = await db.execute(
        `SELECT a.id, a.nombre, a.apellido, a.usuario_id, u.username
             FROM alumnos a
             JOIN usuarios u ON a.usuario_id = u.id
             WHERE a.id = ?`,
        [requestedAlumnoId]
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Alumno no encontrado." });
      }

      const alumno = rows[0];

      if (
        req.user.roles.includes("admin") ||
        (req.user.roles.includes("alumno") &&
          req.user.alumno_id === requestedAlumnoId)
      ) {
        return res.json({ success: true, alumno: alumno });
      } else {
        return res.status(403).json({
          success: false,
          message:
            "Acceso denegado: No tienes permiso para ver este perfil de alumno.",
        });
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// Crear nuevo alumno

router.post(
  "/",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  body("nombre").isString().trim().notEmpty(),
  body("apellido").isString().trim().notEmpty(),
  body("dni").isInt({ gt: 0 }),
  body("usuario_id").isInt({ gt: 0 }),
  verificarValidaciones,
  async (req, res, next) => {
    const { nombre, apellido, dni, usuario_id } = req.body;
    try {
      const [existingAlumno] = await db.execute(
        "SELECT id FROM alumnos WHERE usuario_id = ?",
        [usuario_id]
      );
      if (existingAlumno.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Este ID de usuario ya está asociado a un alumno.",
        });
      }

      const [result] = await db.execute(
        "INSERT INTO alumnos (nombre, apellido, dni, usuario_id) VALUES (?, ?, ?, ?)",
        [nombre, apellido, dni, usuario_id]
      );
      res.status(201).json({
        success: true,
        message: "Alumno creado correctamente.",
        id: result.insertId,
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

// //Eliminar alumno
// router.delete(
//   "/:id",
//   verificarAutenticacion,
//   verificarAutorizacion("admin"),
//   validarId,
//   verificarValidaciones,
//   async (req, res) => {
//     const id = Number(req.params.id);
//     await db.execute("DELETE FROM alumnos WHERE id = ?", [id]);
//     res.json({ success: true, data: id });
//   }
// );

export default router;
