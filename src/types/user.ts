/**
 * Usuario del backend Unisubasta. Schema confirmado por api-docs.json:
 * `GET /api/users/me` y `PATCH /api/users/me` devuelven este shape.
 */
export interface AppUser {
  idUsuario: number
  nombre: string
  correoInstitucional: string
  descripcionPersonal: string | null
  urlFotoPerfil: string | null
  estaHabilitado: boolean
  reputacionPromedio: number
  totalValoraciones: number
}

/**
 * PATCH /api/users/me solo admite estos dos campos.
 */
export interface UpdateProfilePayload {
  descripcionPersonal?: string
  urlFotoPerfil?: string
}
