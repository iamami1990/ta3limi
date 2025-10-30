import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import bcrypt from 'bcryptjs'

type Bindings = {
  DB: D1Database
  R2: R2Bucket
}

export const userRoutes = new Hono<{ Bindings: Bindings }>()

// Get user profile
userRoutes.get('/profile', authMiddleware, async (c) => {
  try {
    const user = c.get('user')

    const profile = await c.env.DB.prepare(
      'SELECT id, email, role, nom, classe, photo_url, created_at FROM users WHERE id = ?'
    ).bind(user.userId).first()

    if (!profile) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404)
    }

    return c.json({ success: true, profile })
  } catch (error) {
    console.error('Get profile error:', error)
    return c.json({ error: 'Erreur lors de la récupération du profil' }, 500)
  }
})

// Update user profile
userRoutes.put('/profile', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { nom, classe, photo_url } = await c.req.json()

    await c.env.DB.prepare(
      'UPDATE users SET nom = ?, classe = ?, photo_url = ? WHERE id = ?'
    ).bind(nom, classe || null, photo_url || null, user.userId).run()

    return c.json({ success: true, message: 'Profil mis à jour' })
  } catch (error) {
    console.error('Update profile error:', error)
    return c.json({ error: 'Erreur lors de la mise à jour du profil' }, 500)
  }
})

// Upload profile photo
userRoutes.post('/upload-photo', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const formData = await c.req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return c.json({ error: 'Fichier manquant' }, 400)
    }

    const key = `photos/${user.userId}-${Date.now()}.${file.name.split('.').pop()}`
    const buffer = await file.arrayBuffer()

    await c.env.R2.put(key, buffer, {
      httpMetadata: {
        contentType: file.type
      }
    })

    const url = `/api/users/photo/${key}`

    // Update user photo_url
    await c.env.DB.prepare(
      'UPDATE users SET photo_url = ? WHERE id = ?'
    ).bind(url, user.userId).run()

    return c.json({ success: true, url })
  } catch (error) {
    console.error('Upload photo error:', error)
    return c.json({ error: 'Erreur lors de l\'upload de la photo' }, 500)
  }
})

// Get photo from R2
userRoutes.get('/photo/:key', async (c) => {
  try {
    const key = c.req.param('key')
    const object = await c.env.R2.get(`photos/${key}`)

    if (!object) {
      return c.json({ error: 'Photo non trouvée' }, 404)
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    console.error('Get photo error:', error)
    return c.json({ error: 'Erreur lors de la récupération de la photo' }, 500)
  }
})

// Get user's children (for parents)
userRoutes.get('/children', authMiddleware, async (c) => {
  try {
    const user = c.get('user')

    if (user.role !== 'parent') {
      return c.json({ error: 'Accès réservé aux parents' }, 403)
    }

    const children = await c.env.DB.prepare(
      'SELECT id, email, nom, classe, photo_url FROM users WHERE parent_id = ?'
    ).bind(user.userId).all()

    return c.json({ success: true, children: children.results })
  } catch (error) {
    console.error('Get children error:', error)
    return c.json({ error: 'Erreur lors de la récupération des enfants' }, 500)
  }
})

// Change password
userRoutes.put('/change-password', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { currentPassword, newPassword } = await c.req.json()

    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Mots de passe requis' }, 400)
    }

    // Get current password hash
    const userData = await c.env.DB.prepare(
      'SELECT password_hash FROM users WHERE id = ?'
    ).bind(user.userId).first() as any

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userData.password_hash)
    if (!isValid) {
      return c.json({ error: 'Mot de passe actuel incorrect' }, 401)
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10)

    // Update password
    await c.env.DB.prepare(
      'UPDATE users SET password_hash = ? WHERE id = ?'
    ).bind(newHash, user.userId).run()

    return c.json({ success: true, message: 'Mot de passe modifié' })
  } catch (error) {
    console.error('Change password error:', error)
    return c.json({ error: 'Erreur lors du changement de mot de passe' }, 500)
  }
})
