import express from "express";
import { db } from "./db.js";
import { body, param } from "express-validator";
import { validarId, verificarValidaciones } from "./validaciones.js";
import {
  alumnoVinculado,
  verificarAutenticacion,
  verificarAutorizacion,
} from "./auth.js";

const router = express.Router();

// Obtener todas las notas
router.get("/", verificarAutenticacion, async (req, res) => {
  const [rows] = await db.execute(`
    SELECT
    n.id,
    a.nombre AS alumno_nombre,
    a.apellido AS alumno_apellido,
    m.nombre AS materia_nombre,
    m.codigo AS materia_codigo,
    n.nota1,
    n.nota2,
    n.nota3
    FROM notas n
    JOIN alumnos a ON n.alumno_id = a.id
    JOIN materias m ON n.materia_id = m.id
    ORDER BY a.apellido, m.nombre;
  `);

  res.json({ success: true, notas: rows });
});

// Obtener notas de un alumno específico
router.get(
  "/alumno/:id",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const alumnoId = Number(req.params.id);

    const [rows] = await db.execute(
      `
      SELECT
        n.id,
        a.nombre AS alumno_nombre,
        a.apellido AS alumno_apellido,
        m.nombre AS materia_nombre,
        m.codigo AS materia_codigo,
        n.nota1,
        n.nota2,
        n.nota3
      FROM notas n
      JOIN alumnos a ON n.alumno_id = a.id
      JOIN materias m ON n.materia_id = m.id
      WHERE n.alumno_id = ?
      ORDER BY m.nombre
      `,
      [alumnoId]
    );

    res.json({ success: true, notas: rows });
  }
);

// Poner notas a un alumno y materia
router.post(
  "/",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  body("alumno_id").isInt({ gt: 0 }),
  body("materia_id").isInt({ gt: 0 }),
  body("nota1").optional().isInt({ min: 1, max: 10 }),
  body("nota2").optional().isInt({ min: 1, max: 10 }),
  body("nota3").optional().isInt({ min: 1, max: 10 }),
  verificarValidaciones,
  async (req, res, next) => {
    const { alumno_id, materia_id, nota1, nota2, nota3 } = req.body;
    const [result] = await db.execute(
      "INSERT INTO notas (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
      [alumno_id, materia_id, nota1, nota2, nota3]
    );
    res.status(201).json({
      success: true,
      message: "Se cargo una nota",
      id: result.insertId,
    });
  }
);

//Actualizar una nota
router.put(
  "/:id",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  validarId,
  body("alumno_id").optional().isInt({ gt: 0 }),
  body("materia_id").optional().isInt({ gt: 0 }),
  body("nota1").optional().isInt({ min: 1, max: 10 }),
  body("nota2").optional().isInt({ min: 1, max: 10 }),
  body("nota3").optional().isInt({ min: 1, max: 10 }),
  verificarValidaciones,
  async (req, res, next) => {
    const { id } = req.params;
    const { alumno_id, materia_id, nota1, nota2, nota3 } = req.body;
    try {
      const [result] = await db.execute(
        `UPDATE notas SET
                 alumno_id = COALESCE(?, alumno_id),
                 materia_id = COALESCE(?, materia_id),
                 nota1 = COALESCE(?, nota1),
                 nota2 = COALESCE(?, nota2),
                 nota3 = COALESCE(?, nota3)
                 WHERE id = ?`,
        [alumno_id, materia_id, nota1, nota2, nota3, id]
      );
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Nota no encontrada." });
      }
      res.json({ success: true, message: "Nota actualizada correctamente." });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/consultaAlumno",
  //verificarAutenticacion,
  // alumnoVinculado,
  async (req, res, next) => {
    const alumnoId = req.user.alumno_id;

    try {
      const [rows] = await db.execute(
        `SELECT
                    n.id,
                    m.nombre AS materia_nombre,
                    m.codigo AS materia_codigo,
                    n.nota1, n.nota2, n.nota3,
                    ROUND((COALESCE(n.nota1,0) + COALESCE(n.nota2,0) + COALESCE(n.nota3,0)) /
                          NULLIF((n.nota1 IS NOT NULL) + (n.nota2 IS NOT NULL) + (n.nota3 IS NOT NULL), 0), 2)
                    AS promedio
                FROM notas n
                JOIN materias m ON n.materia_id = m.id
                WHERE n.alumno_id = ?
                ORDER BY m.nombre`,
        [alumnoId]
      );
      res.json({ success: true, notas: rows });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

export default router;
