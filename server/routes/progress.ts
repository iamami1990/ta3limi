import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'

type Bindings = {
  DB: D1Database
}

export const progressRoutes = new Hono<{ Bindings: Bindings }>()

// Get user progress
progressRoutes.get('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user')

    const progress = await c.env.DB.prepare(
      `SELECT p.*, c.titre as course_titre, c.niveau, c.matiere 
       FROM progress p 
       LEFT JOIN courses c ON p.course_id = c.id 
       WHERE p.user_id = ? 
       ORDER BY p.completed_at DESC`
    ).bind(user.userId).all()

    return c.json({ success: true, progress: progress.results })
  } catch (error) {
    console.error('Get progress error:', error)
    return c.json({ error: 'Erreur lors de la récupération de la progression' }, 500)
  }
})

// Get progress for specific course
progressRoutes.get('/course/:courseId', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const courseId = c.req.param('courseId')

    const progress = await c.env.DB.prepare(
      'SELECT * FROM progress WHERE user_id = ? AND course_id = ? ORDER BY completed_at DESC'
    ).bind(user.userId, courseId).all()

    return c.json({ success: true, progress: progress.results })
  } catch (error) {
    console.error('Get course progress error:', error)
    return c.json({ error: 'Erreur lors de la récupération de la progression' }, 500)
  }
})

// Get child progress (for parents)
progressRoutes.get('/child/:childId', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const childId = c.req.param('childId')

    if (user.role !== 'parent') {
      return c.json({ error: 'Accès réservé aux parents' }, 403)
    }

    // Verify child belongs to parent
    const child = await c.env.DB.prepare(
      'SELECT id FROM users WHERE id = ? AND parent_id = ?'
    ).bind(childId, user.userId).first()

    if (!child) {
      return c.json({ error: 'Enfant non trouvé' }, 404)
    }

    // Get progress
    const progress = await c.env.DB.prepare(
      `SELECT p.*, c.titre as course_titre, c.niveau, c.matiere 
       FROM progress p 
       LEFT JOIN courses c ON p.course_id = c.id 
       WHERE p.user_id = ? 
       ORDER BY p.completed_at DESC`
    ).bind(childId).all()

    return c.json({ success: true, progress: progress.results })
  } catch (error) {
    console.error('Get child progress error:', error)
    return c.json({ error: 'Erreur lors de la récupération de la progression' }, 500)
  }
})

// Get stats
progressRoutes.get('/stats', authMiddleware, async (c) => {
  try {
    const user = c.get('user')

    // Total courses
    const coursesResult = await c.env.DB.prepare(
      'SELECT COUNT(DISTINCT course_id) as count FROM progress WHERE user_id = ?'
    ).bind(user.userId).first() as any

    // Average score
    const scoreResult = await c.env.DB.prepare(
      'SELECT AVG(score) as avg FROM progress WHERE user_id = ? AND score IS NOT NULL'
    ).bind(user.userId).first() as any

    // Progress by matiere
    const matiereResult = await c.env.DB.prepare(
      `SELECT c.matiere, COUNT(*) as count, AVG(p.score) as avg_score
       FROM progress p
       LEFT JOIN courses c ON p.course_id = c.id
       WHERE p.user_id = ?
       GROUP BY c.matiere`
    ).bind(user.userId).all()

    return c.json({
      success: true,
      stats: {
        totalCourses: coursesResult?.count || 0,
        averageScore: Math.round(scoreResult?.avg || 0),
        byMatiere: matiereResult.results
      }
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return c.json({ error: 'Erreur lors de la récupération des statistiques' }, 500)
  }
})

// Get child stats (for parents)
progressRoutes.get('/stats/child/:childId', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const childId = c.req.param('childId')

    if (user.role !== 'parent') {
      return c.json({ error: 'Accès réservé aux parents' }, 403)
    }

    // Verify child belongs to parent
    const child = await c.env.DB.prepare(
      'SELECT id FROM users WHERE id = ? AND parent_id = ?'
    ).bind(childId, user.userId).first()

    if (!child) {
      return c.json({ error: 'Enfant non trouvé' }, 404)
    }

    // Total courses
    const coursesResult = await c.env.DB.prepare(
      'SELECT COUNT(DISTINCT course_id) as count FROM progress WHERE user_id = ?'
    ).bind(childId).first() as any

    // Average score
    const scoreResult = await c.env.DB.prepare(
      'SELECT AVG(score) as avg FROM progress WHERE user_id = ? AND score IS NOT NULL'
    ).bind(childId).first() as any

    // Progress by matiere
    const matiereResult = await c.env.DB.prepare(
      `SELECT c.matiere, COUNT(*) as count, AVG(p.score) as avg_score
       FROM progress p
       LEFT JOIN courses c ON p.course_id = c.id
       WHERE p.user_id = ?
       GROUP BY c.matiere`
    ).bind(childId).all()

    return c.json({
      success: true,
      stats: {
        totalCourses: coursesResult?.count || 0,
        averageScore: Math.round(scoreResult?.avg || 0),
        byMatiere: matiereResult.results
      }
    })
  } catch (error) {
    console.error('Get child stats error:', error)
    return c.json({ error: 'Erreur lors de la récupération des statistiques' }, 500)
  }
})
