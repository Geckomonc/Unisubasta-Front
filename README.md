# Unisubasta UdeA — Frontend Web

Migración del proyecto móvil Flutter `Unisubasta-flutter` a un frontend web con **React 19 + Vite + TypeScript + Tailwind CSS v4**.

> Esta es la primera iteración: incluye toda la estructura base, configuración de Firebase, login con Google restringido al dominio institucional `@udea.edu.co`, layout principal y placeholders de las demás pantallas listos para ir migrando.

---

## Stack

| Capa            | Herramienta                          |
| --------------- | ------------------------------------ |
| Framework UI    | React 19                             |
| Bundler         | Vite 8                               |
| Lenguaje        | TypeScript 6                         |
| Estilos         | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing         | React Router DOM 7                   |
| Estado global   | Zustand + Context API                |
| Auth            | Firebase Auth (Google provider)      |
| HTTP            | Axios (con interceptor de ID token)  |
| Realtime        | `@stomp/stompjs` (para chat/pujas)   |

---

## Estructura de carpetas

```
src/
├── app/                   # Composición raíz (App + Providers)
├── assets/images/         # Imágenes (logo, martillo, Google favicon)
├── components/
│   ├── layout/            # AppHeader, BottomNav, MainLayout, FullScreenLoader
│   ├── ui/                # Button, Alert (componentes reutilizables)
│   └── ProtectedRoute.tsx
├── config/
│   ├── env.ts             # Lectura tipada de variables de entorno
│   └── firebase.ts        # Inicialización de Firebase + GoogleProvider
├── features/              # Una carpeta por dominio
│   ├── auth/
│   │   ├── context/       # AuthContext / AuthProvider
│   │   ├── hooks/         # useAuth
│   │   ├── pages/         # LoginPage
│   │   ├── services/      # authService (signIn/signOut)
│   │   └── utils/         # validateEmail (@udea.edu.co)
│   ├── home/pages/        # HomePage (placeholder)
│   ├── bid/pages/         # BidPage (placeholder)
│   ├── auctions/pages/    # MyAuctionsPage (placeholder)
│   └── profile/pages/     # ProfilePage (placeholder)
├── routes/
│   ├── AppRouter.tsx      # Definición de rutas
│   └── paths.ts           # Constantes de rutas
├── services/              # API + servicios por dominio
│   ├── api.ts             # Cliente Axios (inyecta token Firebase)
│   ├── userService.ts
│   ├── productService.ts
│   ├── bidService.ts
│   └── chatService.ts
├── store/
│   └── authStore.ts       # Zustand: firebaseUser, appUser, status, error
├── types/                 # Tipos TS (User, Product, Bid, Chat, Message)
├── utils/
│   └── formatters.ts      # COP, fechas
├── index.css              # Tailwind + tema UdeA
└── main.tsx               # Entry point
```

### Mapeo desde Flutter

| Flutter (`lib/...`)                                  | React (`src/...`)                                          |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `constants/app_colors.dart`                          | `index.css` (`@theme` → `--color-udea-*`)                  |
| `data/models/*.dart`                                 | `types/*.ts`                                               |
| `data/services/user_service.dart`                    | `services/userService.ts`                                  |
| `data/services/products_service.dart`                | `services/productService.ts`                               |
| `data/services/bid_service.dart`                     | `services/bidService.ts`                                   |
| `data/services/chat_service.dart` + `message_service`| `services/chatService.ts`                                  |
| `presentation/screens/hello_screen.dart`             | `features/auth/pages/LoginPage.tsx`                        |
| `presentation/screens/main_screen.dart`              | `components/layout/MainLayout.tsx` + `BottomNav`           |
| `presentation/screens/main/inicio_screen.dart`       | `features/home/pages/HomePage.tsx` (placeholder)           |
| `presentation/screens/main/pujar_screen.dart`        | `features/bid/pages/BidPage.tsx` (placeholder)             |
| `presentation/screens/main/mis_subastas_screen.dart` | `features/auctions/pages/MyAuctionsPage.tsx` (placeholder) |
| `presentation/screens/main/perfil_screen.dart`       | `features/profile/pages/ProfilePage.tsx` (placeholder)     |

---

## Configuración

### 1. Variables de entorno

Copia `.env.example` a `.env` y rellena los valores reales:

```bash
cp .env.example .env
```

Las claves que **debes** definir:

- `VITE_FIREBASE_*` — credenciales web del proyecto Firebase (Console → Configuración → Tus apps → Web)
- `VITE_API_URL` — backend (por defecto `https://codefact.udea.edu.co/unisubastas`)
- `VITE_ALLOWED_EMAIL_DOMAIN` — dominio institucional (por defecto `udea.edu.co`)

### 2. Firebase

En la consola de Firebase del proyecto Unisubasta:

1. Habilita **Authentication → Google** como proveedor.
2. En *Authorized domains* agrega `localhost` y el dominio donde se despliegue (Netlify/Vercel/Codefact).
3. Copia las credenciales web al `.env`.

### 3. Instalación

```bash
npm install
npm run dev      # arranca en http://localhost:5173
npm run build    # compila a /dist
npm run preview  # sirve /dist localmente
npm run lint     # ESLint
npm run typecheck
```

---

## Flujo de autenticación

1. El usuario entra a cualquier ruta protegida → `ProtectedRoute` lo redirige a `/login`.
2. En `/login` pulsa **Continúa con Google** → `signInWithPopup` con `hd: udea.edu.co` (sugerencia de cuenta institucional).
3. `onAuthStateChanged` se dispara:
   - Si el email **no** termina en `@udea.edu.co` → `signOut()` + mensaje de error.
   - Si sí → `GET /users/me`. Si responde 404, se hace `PATCH /users/me` con descripción y foto por defecto (replica de `enviarUsuarioAlBackend` del Flutter).
4. El perfil se guarda en el store Zustand y el usuario es redirigido a `/`.

---

## Estado de la migración

- [x] `HomePage` — listado de subastas activas con `productService.getAll()` (paginado Spring).
- [x] `BidPage` — mis pujas + suscripción a WebSocket `/api/bid/create` para actualizaciones en vivo.
- [x] `MyAuctionsPage` — productos del vendedor autenticado con `productService.getBySeller(myId)`.
- [x] `NewProductPage` (`registro_producto_screen.dart`) — formulario con categorías, duración (24/48/72 h), creación de timer y subida de hasta 3 imágenes multipart.
- [x] `EditAuctionPage` (`editar_miSubasta_screen.dart`) — bloquea cambio de precio si ya hay pujas, permite añadir imágenes y eliminar la subasta con confirmación.
- [x] `ProductDetailPage` (`detalle_producto_screen.dart`) — carrusel de imágenes con vista completa, historial de pujas, formulario de puja con validación.
- [x] `ProfilePage` completa — foto, contadores (subastas creadas / pujas realizadas / ganadas), calificación con estrellas, descripción editable.
- [x] `ChatsPage` (`chats_screen.dart`) — lista de chats enriquecida con datos del otro usuario.
- [x] `ChatRoomPage` (`chat_screen.dart`) — STOMP sobre WebSocket (`/ws-chat`) con fallback REST a `POST /messages/text`.
- [x] Subida de imágenes — `ImagePickerSlot` reutilizable + `productService.uploadImage(file, productId)` (multipart).

## Endpoints del backend usados

| Recurso       | Método | URL                                       |
| ------------- | ------ | ----------------------------------------- |
| Usuario       | GET    | `/users/me`, `/users/:id`                 |
| Usuario       | PATCH  | `/users/me`                               |
| Productos     | GET    | `/products?page&size`, `/products/:id`, `/products/by-seller/:id` |
| Productos     | POST   | `/products`                               |
| Productos     | PATCH  | `/products/:id`                           |
| Productos     | DELETE | `/products/:id`                           |
| Timers        | PUT    | `/products/timers`                        |
| Imágenes      | GET    | `/products/images/by-product/:id`         |
| Imágenes      | GET    | `/products/images/:id` (binario)          |
| Imágenes      | POST   | `/products/images` (multipart)            |
| Imágenes      | DELETE | `/products/images/:id`                    |
| Pujas         | GET    | `/bids/product/:id`, `/bids/user/me`      |
| Pujas         | POST   | `/bids`                                   |
| Chats         | GET    | `/chats/user/:userId`                     |
| Mensajes      | GET    | `/messages/:chatId`                       |
| Mensajes      | POST   | `/messages/text`                          |
| WebSocket     | WSS    | `/ws-chat` (STOMP, topic `/topic/chat/:id`) |
| WebSocket     | WSS    | `/api/bid/create` (raw, pujas en vivo)    |

---

## Convenciones

- **Imports**: usar el alias `@/` en lugar de rutas relativas profundas (`@/features/auth/...`).
- **Tipos**: archivos en `types/`, importarse con `import type {...}` (verbatimModuleSyntax activo).
- **Llamadas HTTP**: siempre vía `services/*Service.ts`. Nunca importar `axios` directamente desde un componente.
- **Estilos**: Tailwind primero. Para tokens compartidos, definir variables CSS en `index.css` (`@theme`).
- **Pantallas**: una pantalla = una página dentro de `features/<dominio>/pages/`.
