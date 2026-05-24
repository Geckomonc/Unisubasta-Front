# Unisubasta UdeA — Frontend Web

Subastas entre la comunidad UdeA, directo en tu navegador.

Plataforma web donde la comunidad de la Universidad de Antioquia
(estudiantes, docentes y administrativos con correo `@udea.edu.co`)
puede vender, comprar y pujar por productos en tiempo real.

**Características principales:**

- Inicio de sesión solo con Google institucional UdeA.
- Listado de subastas activas con sus imágenes y precios actualizados.
- Sistema de pujas en vivo con estado claro de quién va ganando.
- Publicación, edición y eliminación de tus propias subastas.
- Chat 1:1 entre comprador y vendedor.
- Tema claro / oscuro / automático con preferencia guardada.
- Diseño responsive con soporte táctil (pull-to-refresh, swipe en imágenes).

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

---

