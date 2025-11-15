import express from "express";
import { db } from "./db.js";
import { verificarValidaciones } from "./validaciones.js";
import { body } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";

const router = express.Router();

export function authConfig() {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  // Creo estrategia jwt
  passport.use(
    new Strategy(jwtOptions, async (payload, next) => {
      next(null, payload);
    })
  );
}

export const verificarAutenticacion = (req, res, next) => {
  passport.authenticate("jwt", { session: false })(req, res, next);
};

//////////////////////////////////////////////////////////////////

export const verificarAutorizacion = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado para autorización",
      });
    }

    const userRoles = req.user.roles;

    const Permitido = Array.isArray(rolesPermitidos)
      ? rolesPermitidos.some((role) => userRoles.includes(role))
      : userRoles.includes(rolesPermitidos);

    if (Permitido) {
      next();
    } else {
      res.status(403).json({ success: false, message: "Acceso denegado" });
    }
  };
};

//////////////////////////////////////////////////////////////////

export const alumnoVinculado = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "No autenticado." });
  }
  if (
    !req.user.roles ||
    !req.user.roles.includes("alumno") ||
    !req.user.alumno_id
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Acceso denegado: Se requiere un perfil de alumno vinculado para esta operación.",
    });
  }

  next();
};

router.post(
  "/login",
  body("username").isAlphanumeric("es-ES").isLength({ max: 20 }),
  body("password").isStrongPassword({
    minLength: 8, // Minimo de 8 caracteres
    minLowercase: 1, // Al menos una letra en minusculas
    minUppercase: 0, // Letras mayusculas opcionales
    minNumbers: 1, // Al menos un número
    minSymbols: 0, // Símbolos opcionales
  }),
  verificarValidaciones,
  async (req, res) => {
    const { username, password } = req.body;

    const [usuarios] = await db.execute(
      "SELECT * FROM usuarios WHERE username=?",
      [username]
    );

    if (usuarios.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Usuario inválido" });
    }

    const hashedPassword = usuarios[0].password_hash;

    const passwordComparada = await bcrypt.compare(password, hashedPassword);

    if (!passwordComparada) {
      return res
        .status(400)
        .json({ success: false, error: "Contraseña inválido" });
    }

    const [roles] = await db.execute(
      "SELECT r.nombre \
       FROM roles r \
       JOIN usuarios_roles ur ON r.id = ur.rol_id \
       WHERE ur.usuario_id=?",
      [usuarios[0].id]
    );

    const rolesUsuario = roles.map((r) => r.nombre);

    ////////////////////////////////

    let alumnoId = null;
    if (rolesUsuario.includes("alumno")) {
      const [alumnoRows] = await db.execute(
        "SELECT id AS alumno_id FROM alumnos WHERE usuario_id = ?",
        [usuarios[0].id]
      );
      if (alumnoRows.length > 0) {
        alumnoId = alumnoRows[0].alumno_id;
      }
    }

    // Generar jwt
    const payload = {
      userId: usuarios[0].id,
      roles: rolesUsuario,
      alumno_id: alumnoId,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });

    res.json({
      success: true,
      token,
      username: usuarios[0].username,
      roles: rolesUsuario,
      alumno_id: alumnoId,
    });
  }
);

export default router;
