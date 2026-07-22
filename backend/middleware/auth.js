const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Exige un token valido. Si no hay token o es invalido, responde 401.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No autenticado. Inicia sesion para continuar." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sesion invalida o expirada. Inicia sesion nuevamente." });
  }
}

// No exige token, pero si viene uno valido, adjunta el userId (para compras como invitado o logueado).
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = payload.sub;
    } catch (err) {
      // token invalido: seguimos como invitado, sin lanzar error
      req.userId = null;
    }
  }
  next();
}

// Exige un token valido Y que el usuario tenga isAdmin = true.
async function requireAdmin(req, res, next) {
  requireAuth(req, res, async () => {
    try {
      const user = await User.findById(req.userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ error: "No tienes permisos de administrador." });
      }
      next();
    } catch (err) {
      return res.status(500).json({ error: "Error del servidor al verificar permisos." });
    }
  });
}

module.exports = { requireAuth, optionalAuth, requireAdmin };
