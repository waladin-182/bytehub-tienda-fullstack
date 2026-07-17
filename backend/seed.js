// Carga el catalogo inicial de productos en MongoDB.
// Uso: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const PRODUCTS = [
  { slug: "p1", cat: "pc-gamer", name: "PC Gamer Ryzen 5 5600G / 16GB / 512GB SSD", price: 2690000, oldPrice: 3150000, icon: "tower", specs: ["Ryzen 5 5600G", "16GB DDR4", "512GB NVMe"], badge: "oferta" },
  { slug: "p2", cat: "pc-gamer", name: "PC Gamer Ryzen 7 8700F + RTX 4060", price: 5990000, oldPrice: 6750000, icon: "tower", specs: ["Ryzen 7 8700F", "RTX 4060 8GB", "16GB DDR5 / 1TB"], badge: "oferta" },
  { slug: "p3", cat: "pc-gamer", name: "PC Gamer Ryzen 5 8500G Integrada", price: 2199000, icon: "tower", specs: ["Ryzen 5 8500G", "Grafica integrada", "16GB / 500GB"], badge: "nuevo" },
  { slug: "p4", cat: "pc-gamer", name: "PC Oficina Intel i5 / 8GB / 480GB SSD", price: 1450000, icon: "tower", specs: ["Intel Core i5", "8GB RAM", "480GB SSD"], badge: null },
  { slug: "p5", cat: "portatiles", name: "Portatil ASUS Vivobook 15 Ryzen 5 / 16GB", price: 2199000, oldPrice: 2750000, icon: "laptop", specs: ["Ryzen 5 5500U", "16GB RAM", "512GB SSD"], badge: "oferta" },
  { slug: "p6", cat: "portatiles", name: "Portatil Gamer Acer Nitro V15 i5 / RTX 4050", price: 4120000, oldPrice: 5350000, icon: "laptop", specs: ["Core i5 13420H", "RTX 4050", "165Hz"], badge: "oferta" },
  { slug: "p7", cat: "portatiles", name: "Portatil HP 15 Intel i7 / 16GB / 1TB SSD", price: 2699000, oldPrice: 3400000, icon: "laptop", specs: ["Core i7-1355U", "16GB RAM", "1TB SSD"], badge: "oferta" },
  { slug: "p8", cat: "portatiles", name: "Portatil Lenovo IdeaPad Slim 3 Ryzen 5", price: 1890000, icon: "laptop", specs: ["Ryzen 5 7520U", "8GB RAM", "256GB SSD"], badge: "nuevo" },
  { slug: "p9", cat: "monitores", name: "Monitor Gamer ASUS TUF 24\" 144Hz IPS", price: 439000, oldPrice: 750000, icon: "monitor", specs: ["24\" Full HD", "144Hz", "1ms"], badge: "oferta" },
  { slug: "p10", cat: "monitores", name: "Monitor Acer Nitro 27\" 200Hz IPS", price: 850000, oldPrice: 1350000, icon: "monitor", specs: ["27\" WQHD", "200Hz", "0.5ms"], badge: "oferta" },
  { slug: "p11", cat: "monitores", name: "Monitor AOC 23.8\" FHD 100Hz", price: 399000, icon: "monitor", specs: ["23.8\" Full HD", "100Hz", "IPS"], badge: null },
  { slug: "p12", cat: "monitores", name: "Monitor Gigabyte 27\" QHD 180Hz", price: 780000, oldPrice: 980000, icon: "monitor", specs: ["27\" QHD", "180Hz", "1ms"], badge: "oferta" },
  { slug: "p13", cat: "componentes", name: "Tarjeta de Video RTX 4060 8GB", price: 1790000, icon: "cpu", specs: ["8GB GDDR6", "1x HDMI / 3x DP", "PCIe 4.0"], badge: "nuevo" },
  { slug: "p14", cat: "componentes", name: "Procesador AMD Ryzen 5 8500G", price: 699000, icon: "cpu", specs: ["6 nucleos", "Grafica integrada", "AM5"], badge: null },
  { slug: "p15", cat: "componentes", name: "Memoria RAM DDR5 16GB 5200MHz", price: 289000, icon: "ram", specs: ["16GB", "5200MHz", "CL40"], badge: null },
  { slug: "p16", cat: "componentes", name: "SSD NVMe 1TB Gen4", price: 349000, oldPrice: 420000, icon: "disk", specs: ["1TB", "PCIe Gen4", "Lectura 5000MB/s"], badge: "oferta" },
  { slug: "p17", cat: "componentes", name: "Fuente de Poder 650W 80 Plus Bronce", price: 210000, oldPrice: 350000, icon: "cpu", specs: ["650W", "80 Plus Bronce", "ATX"], badge: "oferta" },
  { slug: "p18", cat: "perifericos", name: "Teclado Mecanico RGB 60%", price: 149900, icon: "keyboard", specs: ["Switches red", "RGB", "Compacto 60%"], badge: null },
  { slug: "p19", cat: "perifericos", name: "Mouse Gamer Inalambrico 16000DPI", price: 149900, oldPrice: 175000, icon: "mouse", specs: ["16000 DPI", "Inalambrico", "RGB"], badge: "oferta" },
  { slug: "p20", cat: "perifericos", name: "Diadema Gamer con Microfono", price: 99900, oldPrice: 109900, icon: "headset", specs: ["Sonido 7.1", "Microfono abatible", "Multiplataforma"], badge: "oferta" },
  { slug: "p21", cat: "impresoras", name: "Impresora EcoTank Multifuncional WiFi", price: 789900, oldPrice: 1116000, icon: "printer", specs: ["Tinta continua", "WiFi", "Escaner"], badge: "oferta" },
  { slug: "p22", cat: "impresoras", name: "Impresora HP Smart Tank 210", price: 450000, oldPrice: 690000, icon: "printer", specs: ["Tinta continua", "App Smart", "USB"], badge: "oferta" },
  { slug: "p23", cat: "accesorios", name: "Camara Web 1080P Full HD", price: 129900, oldPrice: 185990, icon: "cam", specs: ["1080P", "Microfono integrado", "USB Plug&Play"], badge: "oferta" },
  { slug: "p24", cat: "accesorios", name: "UPS Regulada 750VA", price: 199900, oldPrice: 250000, icon: "ups", specs: ["750VA", "Regulador", "2 tomas de respaldo"], badge: "oferta" },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Conectado a MongoDB. Sembrando catalogo...");

  for (const p of PRODUCTS) {
    await Product.findOneAndUpdate(
      { slug: p.slug },
      {
        slug: p.slug,
        name: p.name,
        category: p.cat,
        price: p.price,
        oldPrice: p.oldPrice || undefined,
        icon: p.icon,
        specs: p.specs,
        badge: p.badge,
        active: true,
      },
      { upsert: true, new: true }
    );
  }

  console.log(`Listo. ${PRODUCTS.length} productos insertados/actualizados.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Error sembrando la base de datos:", err);
  process.exit(1);
});
