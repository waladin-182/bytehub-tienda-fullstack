require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");

const app = express();

app.use(express.json());
// Lista de orígenes permitidos, separados por comas en FRONTEND_ORIGIN
// (ej: "https://bytehub-tienda.onrender.com,http://127.0.0.1:5500").
// Si no hay ninguno configurado, se permite cualquiera con "*".
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // "origin" viene vacío/indefinido cuando la petición se hace desde un archivo
      // abierto localmente (file://), o con herramientas como Postman/curl.
      // Lo permitimos para poder probar el sitio en tu computador sin fricción.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origen no permitido por CORS: " + origin));
    },
  })
);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "bytehub-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Conectado a MongoDB");
    app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
  })
  .catch((err) => {
    console.error("Error al conectar a MongoDB:", err.message);
    process.exit(1);
  });
