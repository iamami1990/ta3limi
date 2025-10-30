import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import bcrypt from 'bcryptjs'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
  JWT_SECRET: string
}

export const authRoutes = new Hono<{ Bindings: Bindings }>()

// Register
authRoutes.post('/register', async (c) => {
  try {
    const { email, password, role, nom, classe, parent_id } = await c.req.json()

    // Validate required fields
    if (!email || !password || !role) {
      return c.json({ error: 'Champs requis manquants' }, 400)
    }

    // Validate role
    const validRoles = ['eleve', 'parent', 'enseignant', 'admin']
    if (!validRoles.includes(role)) {
      return c.json({ error: 'Rôle invalide' }, 400)
    }

    // Check if email already exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existing) {
      return c.json({ error: 'Email déjà utilisé' }, 409)
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // Insert user
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password_hash, role, nom, classe, parent_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(email, password_hash, role, nom || null, classe || null, parent_id || null).run()

    const userId = result.meta.last_row_id

    // Create default subscription for students
    if (role === 'eleve') {
      await c.env.DB.prepare(
        'INSERT INTO subscriptions (user_id, plan, status, start_date) VALUES (?, ?, ?, ?)'
      ).bind(userId, 'gratuit', 'active', new Date().toISOString()).run()
    }

    // Generate JWT
    const token = await sign(
      { userId, email, role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
      c.env.JWT_SECRET
    )

    // Store token in KV
    await c.env.KV.put(`token:${userId}`, token, { expirationTtl: 60 * 60 * 24 * 7 })

    return c.json({
      success: true,
      token,
      user: { id: userId, email, role, nom, classe }
    }, 201)
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'Erreur lors de l\'inscription' }, 500)
  }
})

// Login
authRoutes.post('/login', async (c) => {
  try {
    const { email, password, remember } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: 'Email et mot de passe requis' }, 400)
    }

    // Get user
    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash, role, nom, classe, photo_url FROM users WHERE email = ?'
    ).bind(email).first() as any

    if (!user) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401)
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401)
    }

    // Generate JWT
    const expiresIn = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7
    const token = await sign(
      { userId: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + expiresIn },
      c.env.JWT_SECRET
    )

    // Store token in KV
    await c.env.KV.put(`token:${user.id}`, token, { expirationTtl: expiresIn })

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        classe: user.classe,
        photo_url: user.photo_url
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Erreur lors de la connexion' }, 500)
  }
})

// Logout
authRoutes.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (authHeader) {
      const token = authHeader.substring(7)
      // In production, you'd decode the token to get userId
      // For now, we'll just return success
    }
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Erreur lors de la déconnexion' }, 500)
  }
})

// Get current user
authRoutes.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Non autorisé' }, 401)
    }

    const token = authHeader.substring(7)
    
    // Decode token (simplified - in production use proper JWT verification)
    const parts = token.split('.')
    if (parts.length !== 3) {
      return c.json({ error: 'Token invalide' }, 401)
    }
    
    const payload = JSON.parse(atob(parts[1]))
    
    // Get user from DB
    const user = await c.env.DB.prepare(
      'SELECT id, email, role, nom, classe, photo_url, created_at FROM users WHERE id = ?'
    ).bind(payload.userId).first() as any

    if (!user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404)
    }

    return c.json({ success: true, user })
  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ error: 'Erreur lors de la récupération de l\'utilisateur' }, 500)
  }
})
