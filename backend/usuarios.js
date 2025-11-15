import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body, param } from "express-validator";
import bcrypt from "bcrypt";
import { verificarAutenticacion, verificarAutorizacion } from "./auth.js";

const router = express.Router();

router.get("/", verificarAutenticacion, async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM usuarios");
  // RECORDAR Quitar la contraseña en la api
  res.json({
    success: true,
    usuarios: rows.map((u) => ({ ...u, password_hash: undefined })),
  });
});

router.get(
  "/:id",
  //Aqui si se autentica
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  //Aqui no se autentica
  //verificarAutenticacion,
  async (req, res) => {
    const id = Number(req.params.id);
    const [rows] = await db.execute(
      "SELECT id, username, nombre, apellido FROM usuarios WHERE id=?",
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, usuario: rows[0] });
  }
);

router.post(
  "/",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  body("username", "Nombre de usuario inválido")
    .isAlphanumeric("es-ES")
    .isLength({ max: 20 }),
  body("apellido", "Apellido inválido").isAlpha("es-ES").isLength({ max: 50 }),
  body("nombre", "Nombre inválido").isAlpha("es-ES").isLength({ max: 50 }),
  body("password", "Contraseña inválida").isStrongPassword({
    minLength: 8, // Minimo de 8 caracteres
    minLowercase: 1, // Al menos una letra en minusculas
    minUppercase: 0, // Letras mayusculas opcionales
    minNumbers: 1, // Al menos un número
    minSymbols: 0, // Símbolos opcionales
  }),
  verificarValidaciones,
  async (req, res) => {
    const { username, apellido, nombre, password } = req.body;

    // Creamos Hash de la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      "INSERT INTO usuarios (username, apellido, nombre, password_hash) VALUES (?,?,?,?)",
      [username, apellido, nombre, hashedPassword]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, username, apellido, nombre },
    });
  }
);

router.put("/:id", (req, res) => {});

router.delete(
  "/:id",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    await db.execute("DELETE FROM usuarios WHERE id=?", [id]);
    res.json({ success: true, data: id });
  }
);

// Consultar por roles de usuario
router.get(
  "/:id/roles",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    let sql =
      "SELECT r.id, r.nombre \
       FROM roles r \
       JOIN usuarios_roles ur ON r.id = ur.rol_id \
       WHERE ur.usuario_id = ? \
       ORDER BY r.nombre";

    const [rows] = await db.execute(sql, [id]);
    res.json({ success: true, roles: rows });
  }
);

// Asignar un rol a un usuario
router.post(
  "/:id/roles",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  validarId,
  body("rolId").isInt({ min: 1 }),
  verificarValidaciones,
  async (req, res) => {
    const usuarioId = Number(req.params.id);
    const rolId = req.body.rolId;

    let sql = "INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (?,?)";

    await db.execute(sql, [usuarioId, rolId]);

    res.json({ success: true });
  }
);

// Quitar un rol a un usuario
router.delete(
  "/:id/roles/:rolId",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  validarId,
  param("rolId").isInt({ min: 1 }),
  verificarValidaciones,
  async (req, res) => {
    const usuarioId = Number(req.params.id);
    const rolId = Number(req.params.rolId);

    let sql = "DELETE FROM usuarios_roles WHERE usuario_id=? AND rol_id=?";

    await db.execute(sql, [usuarioId, rolId]);

    res.json({ success: true });
  }
);

export default router;
