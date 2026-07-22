const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin };
}

// Lee la lista de correos administradores desde la variable de entorno ADMIN_EMAILS
// (separados por comas) y determina si un correo dado debe ser admin.
function shouldBeAdmin(email) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase().trim());
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nombre, correo y contraseña son obligatorios." });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 4 caracteres." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese correo." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: (phone || "").trim(),
      passwordHash,
      isAdmin: shouldBeAdmin(cleanEmail),
    });

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al crear la cuenta." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Correo y contraseña son obligatorios." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    // Mantiene sincronizado el rol de admin con la lista ADMIN_EMAILS en cada login.
    const shouldAdmin = shouldBeAdmin(user.email);
    if (user.isAdmin !== shouldAdmin) {
      user.isAdmin = shouldAdmin;
      await user.save();
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al iniciar sesion." });
  }
});

// GET /api/auth/me  (requiere token)
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado." });
  res.json({ user: publicUser(user) });
});

module.exports = router;
