const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { requireAuth, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/orders  (compra como invitado o logueado - sin pasarela de pagos, solo registra el pedido)
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { items, customer } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "El carrito esta vacio." });
    }
    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ error: "Nombre, telefono y direccion son obligatorios." });
    }

    // Recalculamos el total en el servidor con los precios reales de la base de datos,
    // nunca confiamos en los precios que manda el navegador.
    const orderItems = [];
    let total = 0;

    for (const it of items) {
      const product = await Product.findById(it.productId);
      if (!product || !product.active) {
        return res.status(400).json({ error: `Producto no disponible: ${it.productId}` });
      }
      const qty = Math.max(1, parseInt(it.qty, 10) || 1);
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        qty,
      });
      total += product.price * qty;
    }

    const order = await Order.create({
      user: req.userId || null,
      items: orderItems,
      total,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        notes: (customer.notes || "").trim(),
      },
    });

    res.status(201).json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al crear el pedido." });
  }
});

// GET /api/orders/mine  (requiere sesion iniciada)
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor al obtener tus pedidos." });
  }
});

module.exports = router;
