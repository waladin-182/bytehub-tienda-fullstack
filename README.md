# ByteHub Tecnología — Tienda con backend real

Tienda de tecnología (computadores, portátiles, monitores, componentes,
periféricos, impresoras y accesorios) con:

- Catálogo de productos guardado en MongoDB
- Registro e inicio de sesión de usuarios (con contraseñas cifradas)
- Carrito de compras
- Registro de pedidos en base de datos (sin pasarela de pagos: la
  coordinación del pago se hace por WhatsApp, igual que antes)

## Estructura del proyecto

```
tienda-fullstack/
├── backend/          -> API en Node.js + Express + MongoDB
│   ├── models/        (User, Product, Order)
│   ├── routes/         (auth, products, orders)
│   ├── middleware/      (auth.js: JWT)
│   ├── server.js
│   ├── seed.js         (carga el catálogo inicial)
│   └── .env.example
└── frontend/
    └── index.html      (la tienda, ya conectada a la API)
```

## 1. Requisitos

- Node.js 18 o superior
- Una base de datos MongoDB (puedes crear una gratis en
  [MongoDB Atlas](https://www.mongodb.com/atlas), igual que hiciste con `rifa-app`)

## 2. Configurar y correr el backend en tu computador

```bash
cd backend
npm install
cp .env.example .env
```

Abre el archivo `.env` y coloca:

- `MONGODB_URI`: la cadena de conexión de tu clúster de MongoDB Atlas
- `JWT_SECRET`: cualquier texto largo y aleatorio (sirve para firmar las sesiones)
- `FRONTEND_ORIGIN`: mientras pruebas en tu computador puedes dejar
  `http://localhost:5500` o `*`

Luego, carga el catálogo inicial de productos:

```bash
npm run seed
```

Y arranca el servidor:

```bash
npm start
```

Deberías ver en la consola:

```
Conectado a MongoDB
Servidor corriendo en el puerto 4000
```

Puedes probar que funciona abriendo en el navegador:
`http://localhost:4000/api/health`

## 3. Correr el frontend

El archivo `frontend/index.html` ya está conectado a
`http://localhost:4000/api` (línea `const API_BASE` al inicio del
`<script>`). Solo ábrelo directamente en el navegador (doble clic) o
sírvelo con cualquier servidor estático (por ejemplo, la extensión
"Live Server" de VS Code).

Si el backend no está corriendo, la tienda **no se rompe**: muestra un
catálogo de demostración y avisa arriba que no hay conexión con el
servidor, y los pedidos quedan en modo simulado (no se guardan). En
cuanto el backend esté disponible, todo se guarda de verdad.

## 4. Desplegar en producción (mismo flujo que `rifa-app`)

1. **Base de datos**: crea (o reutiliza) tu clúster en MongoDB Atlas y
   copia la cadena de conexión.
2. **Backend en Render**:
   - Sube la carpeta `backend/` a un repositorio de GitHub.
   - En Render, crea un "Web Service" apuntando a ese repositorio.
   - Comando de build: `npm install`
   - Comando de arranque: `npm start`
   - Agrega las variables de entorno `MONGODB_URI`, `JWT_SECRET` y
     `FRONTEND_ORIGIN` (esta última con la URL donde publiques el
     frontend) en la sección "Environment" de Render.
   - Una vez desplegado, entra por única vez a la consola/Shell de
     Render y ejecuta `npm run seed` para cargar el catálogo (o
     ejecútalo localmente apuntando al mismo `MONGODB_URI`).
3. **Frontend**: publícalo donde prefieras (Render como sitio estático,
   Netlify, GitHub Pages, o el mismo hosting que ya usas). Antes de
   subirlo, cambia en `index.html` la línea:
   ```js
   const API_BASE = "http://localhost:4000/api";
   ```
   por la URL real de tu backend en Render, por ejemplo:
   ```js
   const API_BASE = "https://bytehub-backend.onrender.com/api";
   ```

## 5. Endpoints de la API

| Método | Ruta                  | Descripción                                    | Requiere sesión |
|--------|-----------------------|-------------------------------------------------|:---:|
| POST   | `/api/auth/register`  | Crear cuenta                                    | No |
| POST   | `/api/auth/login`     | Iniciar sesión                                  | No |
| GET    | `/api/auth/me`        | Datos del usuario autenticado                   | Sí |
| GET    | `/api/products`       | Listar productos (`?cat=` y `?search=` opcionales) | No |
| GET    | `/api/products/:id`   | Detalle de un producto                          | No |
| POST   | `/api/orders`         | Registrar un pedido (compra como invitado o logueado) | Opcional |
| GET    | `/api/orders/mine`    | Historial de pedidos del usuario                | Sí |

## 6. Panel de administración (`frontend/admin.html`)

Ya puedes agregar, editar, desactivar y eliminar productos sin tocar código, desde
`admin.html` (hay un enlace discreto "Panel admin" en el pie de página de la tienda).

### Cómo convertirte en administrador

1. En el backend (local o en Render → pestaña **Environment**), agrega la variable:
   ```
   ADMIN_EMAILS=tu_correo@ejemplo.com
   ```
   Puedes poner varios separados por coma: `ADMIN_EMAILS=correo1@x.com,correo2@x.com`
2. Si es en Render, guarda el cambio (el backend se reinicia solo).
3. Regístrate o inicia sesión en la tienda (`index.html`) con ese correo — automáticamente
   tu cuenta queda marcada como administrador (esto se revisa en cada login, así que si
   quitas tu correo de la lista más adelante, perderás el acceso de admin la próxima vez
   que inicies sesión).
4. Entra a `admin.html` e inicia sesión con la misma cuenta.

### Antes de usar `admin.html` en producción

Al igual que en `index.html`, cambia dentro de `admin.html` la línea:
```js
const API_BASE = "http://localhost:4000/api";
```
por la URL real de tu backend en Render, la misma que usaste en `index.html`.

### Qué puedes hacer desde el panel

- Ver todos los productos (incluidos los que están desactivados/ocultos).
- Crear un producto nuevo (nombre, categoría, ícono, precio, precio anterior, etiqueta
  "oferta"/"nuevo", stock, especificaciones y si está activo).
- Editar cualquier producto existente.
- Desactivar un producto (checkbox "Producto activo") para ocultarlo de la tienda sin
  borrarlo, útil cuando se agota el stock temporalmente.
- Eliminarlo definitivamente.

Los pedidos ya hechos no se ven afectados al editar o eliminar un producto, porque cada
pedido guarda una copia del nombre y precio al momento de la compra.

## 7. Notas importantes

- **No hay pasarela de pagos**: el pedido se registra en la base de
  datos con estado `recibido`, y el pago se coordina por fuera (WhatsApp,
  Nequi, efectivo, etc.), tal como lo pediste.
- Las contraseñas se guardan cifradas con `bcryptjs`, nunca en texto plano.
- Los precios del pedido se recalculan siempre en el servidor a partir
  de la base de datos, para que nadie pueda alterar el precio desde el
  navegador.
- Puedes agregar más productos directamente editando `backend/seed.js`
  y volviendo a correr `npm run seed`, o creando una ruta de administración
  más adelante si quieres gestionarlos desde un panel.
