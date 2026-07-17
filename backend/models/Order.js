const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true }, // copia del nombre al momento de la compra
    price: { type: Number, required: true }, // copia del precio al momento de la compra
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null = compra como invitado
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      notes: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["recibido", "en_proceso", "enviado", "entregado", "cancelado"],
      default: "recibido",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
