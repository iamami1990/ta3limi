import { Hono } from 'hono'
import { authMiddleware, requireRole } from '../middleware/auth'
import bcrypt from 'bcryptjs'

type Bindings = {
  DB: D1Database
}

export const adminRoutes = new Hono<{ Bindings: Bindings }>()

// Apply admin middleware to all routes
adminRoutes.use('/*', authMiddleware, requireRole('admin'))

// Dashboard stats
adminRoutes.get('/stats', async (c) => {
  try {
    // Total users
    const usersResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM users'
    ).first() as any

    // Total courses
    const coursesResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM courses'
    ).first() as any

    // Total enrollments (progress entries)
    const enrollmentsResult = await c.env.DB.prepare(
      'SELECT COUNT(DISTINCT user_id, course_id) as count FROM progress'
    ).first() as any

    // Users by role
    const roleResult = await c.env.DB.prepare(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    ).all()

    // Recent activity
    const activityResult = await c.env.DB.prepare(
      `SELECT p.*, u.nom, c.titre 
       FROM progress p 
       LEFT JOIN users u ON p.user_id = u.id 
       LEFT JOIN courses c ON p.course_id = c.id 
       ORDER BY p.completed_at DESC 
       LIMIT 10`
    ).all()

    return c.json({
      success: true,
      stats: {
        totalUsers: usersResult?.count || 0,
        totalCourses: coursesResult?.count || 0,
        totalEnrollments: enrollmentsResult?.count || 0,
        usersByRole: roleResult.results,
        recentActivity: activityResult.results
      }
    })
  } catch (error) {
    console.error('Get admin stats error:', error)
    return c.json({ error: 'Erreur lors de la récupération des statistiques' }, 500)
  }
})

// Get all users with filters
adminRoutes.get('/users', async (c) => {
  try {
    const role = c.req.query('role')
    const search = c.req.query('search')

    let query = 'SELECT id, email, role, nom, classe, parent_id, created_at FROM users WHERE 1=1'
    const params: any[] = []

    if (role) {
      query += ' AND role = ?'
      params.push(role)
    }

    if (search) {
      query += ' AND (nom LIKE ? OR email LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY created_at DESC'

    const stmt = c.env.DB.prepare(query)
    const result = await stmt.bind(...params).all()

    return c.json({ success: true, users: result.results })
  } catch (error) {
    console.error('Get users error:', error)
    return c.json({ error: 'Erreur lors de la récupération des utilisateurs' }, 500)
  }
})

// Create user
adminRoutes.post('/users', async (c) => {
  try {
    const { email, password, role, nom, classe, parent_id } = await c.req.json()

    if (!email || !password || !role) {
      return c.json({ error: 'Champs requis manquants' }, 400)
    }

    // Check if email exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existing) {
      return c.json({ error: 'Email déjà utilisé' }, 409)
    }

    const password_hash = await bcrypt.hash(password, 10)

    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password_hash, role, nom, classe, parent_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(email, password_hash, role, nom || null, classe || null, parent_id || null).run()

    return c.json({
      success: true,
      user: {
        id: result.meta.last_row_id,
        email,
        role,
        nom,
        classe
      }
    }, 201)
  } catch (error) {
    console.error('Create user error:', error)
    return c.json({ error: 'Erreur lors de la création de l\'utilisateur' }, 500)
  }
})

// Update user
adminRoutes.put('/users/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { email, role, nom, classe, parent_id } = await c.req.json()

    await c.env.DB.prepare(
      'UPDATE users SET email = ?, role = ?, nom = ?, classe = ?, parent_id = ? WHERE id = ?'
    ).bind(email, role, nom, classe, parent_id, id).run()

    return c.json({ success: true, message: 'Utilisateur mis à jour' })
  } catch (error) {
    console.error('Update user error:', error)
    return c.json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' }, 500)
  }
})

// Delete user
adminRoutes.delete('/users/:id', async (c) => {
  try {
    const id = c.req.param('id')

    await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run()

    return c.json({ success: true, message: 'Utilisateur supprimé' })
  } catch (error) {
    console.error('Delete user error:', error)
    return c.json({ error: 'Erreur lors de la suppression de l\'utilisateur' }, 500)
  }
})

// Get all courses
adminRoutes.get('/courses', async (c) => {
  try {
    const courses = await c.env.DB.prepare(
      `SELECT c.*, u.nom as enseignant_nom 
       FROM courses c 
       LEFT JOIN users u ON c.enseignant_id = u.id 
       ORDER BY c.created_at DESC`
    ).all()

    return c.json({ success: true, courses: courses.results })
  } catch (error) {
    console.error('Get courses error:', error)
    return c.json({ error: 'Erreur lors de la récupération des cours' }, 500)
  }
})

// Get all quizzes
adminRoutes.get('/quizzes', async (c) => {
  try {
    const quizzes = await c.env.DB.prepare(
      `SELECT q.*, c.titre as course_titre 
       FROM quizzes q 
       LEFT JOIN courses c ON q.course_id = c.id 
       ORDER BY q.created_at DESC`
    ).all()

    return c.json({ success: true, quizzes: quizzes.results })
  } catch (error) {
    console.error('Get quizzes error:', error)
    return c.json({ error: 'Erreur lors de la récupération des quizzes' }, 500)
  }
})
