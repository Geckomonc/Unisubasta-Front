/**
 * Rutas centralizadas. Cambiar aquí y se actualizan en toda la app.
 */
export const ROUTES = {
  login: '/login',
  home: '/',
  bid: '/pujar',
  myAuctions: '/mis-subastas',
  newProduct: '/mis-subastas/nuevo',
  editAuction: (id: string | number = ':id') => `/mis-subastas/${id}/editar`,
  productDetail: (id: string | number = ':id') => `/producto/${id}`,
  profile: '/perfil',
  chats: '/chats',
  chat: (id: string | number = ':id') => `/chats/${id}`,
} as const
