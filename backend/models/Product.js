const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // ej: "p1"
    name: { type: String, required: true },
    category: { type: String, required: true }, // pc-gamer, portatiles, monitores, componentes, perifericos, impresoras, accesorios
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    icon: { type: String, default: "tower" }, // referencia al icono usado en el frontend
    specs: { type: [String], default: [] },
    badge: { type: String, enum: ["oferta", "nuevo", null], default: null },
    stock: { type: Number, default: 50 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
