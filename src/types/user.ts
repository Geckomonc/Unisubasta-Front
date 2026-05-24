/**
 * Usuario del backend Unisubasta. La clave del id es `idUsuario` (no `id`).
 */
export interface AppUser {
  idUsuario: number
  nombre: string
  email?: string
  descripcionPersonal: string | null
  urlFotoPerfil: string | null
  reputacionPromedio?: number | null
}

export interface UpdateProfilePayload {
  descripcionPersonal?: string
  urlFotoPerfil?: string
}
