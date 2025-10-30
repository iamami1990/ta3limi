import { Context, Next } from 'hono'
import { verify } from 'hono/jwt'

export interface JWTPayload {
  userId: number
  email: string
  role: string
  exp?: number
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Non autorisé - Token manquant' }, 401)
  }

  const token = authHeader.substring(7)
  const jwtSecret = c.env.JWT_SECRET

  try {
    const payload = await verify(token, jwtSecret) as JWTPayload
    c.set('user', payload)
    await next()
  } catch (error) {
    return c.json({ error: 'Non autorisé - Token invalide' }, 401)
  }
}

export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as JWTPayload
    
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: 'Accès interdit - Rôle insuffisant' }, 403)
    }
    
    await next()
  }
}
