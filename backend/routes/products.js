const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// GET /api/products?cat=monitores&search=asus
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

module.exports = router;
