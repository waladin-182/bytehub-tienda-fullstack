const express = require("express");
const Product = require("../models/Product");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

const VALID_CATEGORIES = [
  "pc-gamer",
  "portatiles",
  "monitores",
  "componentes",
  "perifericos",
  "impresoras",
  "accesorios",
];
const VALID_ICONS = [
  "tower", "laptop", "monitor", "cpu", "keyboard", "mouse",
  "headset", "printer", "ram", "cam", "ups", "disk",
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

async function uniqueSlug(base) {
  let slug = base || "producto";
  let n = 1;
  while (await Product.findOne({ slug })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function validatePayload(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!partial || body.name !== undefined) {
    if (!body.name || !body.name.trim()) errors.push("El nombre es obligatorio.");
    else data.name = body.name.trim();
  }
  if (!partial || body.category !== undefined) {
    if (!VALID_CATEGORIES.includes(body.category)) errors.push("La categoría no es válida.");
    else data.category = body.category;
  }
  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (isNaN(price) || price <= 0) errors.push("El precio debe ser un número mayor a 0.");
    else data.price = price;
  }
  if (body.oldPrice !== undefined) {
    if (body.oldPrice === null || body.oldPrice === "") {
      data.oldPrice = undefined;
    } else {
      const oldPrice = Number(body.oldPrice);
      if (isNaN(oldPrice) || oldPrice <= 0) errors.push("El precio anterior no es válido.");
      else data.oldPrice = oldPrice;
    }
  }
  if (!partial || body.icon !== undefined) {
    if (!VALID_ICONS.includes(body.icon)) errors.push("El ícono no es válido.");
    else data.icon = body.icon;
  }
  if (body.specs !== undefined) {
    if (Array.isArray(body.specs)) data.specs = body.specs.map((s) => String(s).trim()).filter(Boolean);
    else if (typeof body.specs === "string") data.specs = body.specs.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (body.badge !== undefined) {
    data.badge = ["oferta", "nuevo"].includes(body.badge) ? body.badge : null;
  }
  if (body.stock !== undefined) {
    const stock = Number(body.stock);
    data.stock = isNaN(stock) ? 0 : Math.max(0, Math.round(stock));
  }
  if (body.active !== undefined) {
    data.active = Boolean(body.active);
  }

  return { data, errors };
}

// GET /api/products?cat=monitores&search=asus  (publica, solo activos)
router.get("/", async (req, res) => {
  try {
    const { cat, search } = req.query;
    const filter = { active: true };
    if (cat && cat !== "todos") filter.category = cat;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al listar productos." });
  }
});

// GET /api/products/admin/all  (requiere admin, incluye inactivos)
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al listar productos." });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado." });
    res.json({ product });
  } catch (err) {
    res.status(400).json({ error: "Id de producto invalido." });
  }
});

// POST /api/products  (requiere admin) - crear producto nuevo
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { data, errors } = validatePayload(req.body, { partial: false });
    if (errors.length) return res.status(400).json({ error: errors.join(" ") });

    const slug = await uniqueSlug(slugify(data.name));
    const product = await Product.create({
      ...data,
      slug,
      active: req.body.active !== undefined ? Boolean(req.body.active) : true,
    });
    res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al crear el producto." });
  }
});

// PUT /api/products/:id  (requiere admin) - editar producto existente
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { data, errors } = validatePayload(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ error: errors.join(" ") });

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!product) return res.status(404).json({ error: "Producto no encontrado." });
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "No se pudo actualizar el producto." });
  }
});

// DELETE /api/products/:id  (requiere admin) - elimina el producto definitivamente
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado." });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "No se pudo eliminar el producto." });
  }
});

module.exports = router;
