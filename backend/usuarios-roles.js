import express from "express";
import { verificarValidaciones } from "./validaciones.js";
import { param } from "express-validator";
import { db } from "./db.js";

const router = express.Router();

// Validaciones
const validarUsuarioId = param("usuarioId").isInt({ min: 1 });
const validarRolId = param("rolId").isInt({ min: 1 });

// Metodos
router.get("/", (req, res) => {});

router.get("/usuarios/:usuarioId", (req, res) => {});
router.get("/roles/:rolId", (req, res) => {});

// GET /usuarios-roles/usuarios/1/roles/2
router.get(
  "/usuarios/:usuarioId/roles/:rolId",
  validarUsuarioId,
  validarRolId,
  verificarValidaciones,
  getUsuariosRoles
);

// GET /usuarios-roles/roles/2/usuarios/1
router.get(
  "/roles/:rolId/usuarios/:usuarioId",
  validarRolId,
  validarUsuarioId,
  verificarValidaciones,
  getUsuariosRoles
);

async function getUsuariosRoles(req, res) {
  const usuarioId = Number(req.params.usuarioId);
  const rolId = Number(req.params.rolId);

  let sql =
    "SELECT ur.usuario_id, ur.rol_id, u.username, r.nombre AS rolNombre  \
     FROM usuarios_roles ur \
     JOIN usuarios u ON ur.usuario_id=u.id \
     JOIN roles r ON ur.rol_id=r.id \
     WHERE ur.usuario_id=? AND ur.rol_id=?";

  const [rows] = await db.execute(sql, [usuarioId, rolId]);

  if (rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Usuario/rol no encontrado" });
  }

  res.json({ success: true, data: rows[0] });
}

router.post("/", (req, res) => {});

router.put("/usuarios/:usuarioId/roles/:rolId", (req, res) => {});
router.put("/roles/:rolId/usuarios/:usuarioId", (req, res) => {});

router.delete("/usuarios/:usuarioId", (req, res) => {});
router.delete("/roles/:rolId", (req, res) => {});

router.delete("/usuarios/:ususarioId/roles/:rolId", (req, res) => {});
router.delete("/roles/:rolId/usuarios/:usuarioId", (req, res) => {});

export default router;
