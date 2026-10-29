import { useAuth } from 'react-oidc-context'
import { decodeJwt } from '../utils/jwt'

export type Role = 'Docente' | 'Voluntario' | 'Beneficiario' | 'Administrador' | 'Desconocido'

const ROLE_MAP: Record<string, Role> = {
  administrador: 'Administrador',
  admin: 'Administrador',
  colaborador: 'Voluntario',
  voluntario: 'Voluntario',
  cliente: 'Beneficiario',
  beneficiario: 'Beneficiario',
  docente: 'Docente',
}

export function useRole(): Role {
  const auth = useAuth()
  const access = decodeJwt(auth.user?.access_token)
  const id = decodeJwt(auth.user?.id_token)
  const groups = (access?.['cognito:groups'] || id?.['cognito:groups'] || []) as string[]
  const first = Array.isArray(groups) && groups.length ? groups[0].toLowerCase() : ''
  return ROLE_MAP[first] ?? 'Desconocido'
}