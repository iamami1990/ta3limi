import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

export const subscriptionRoutes = new Hono<{ Bindings: Bindings }>()

// Get user subscription
subscriptionRoutes.get('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user')

    const subscription = await c.env.DB.prepare(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(user.userId).first()

    if (!subscription) {
      return c.json({
        success: true,
        subscription: {
          plan: 'gratuit',
          status: 'active',
          coursesAccessed: 0,
          limit: 3
        }
      })
    }

    // Get premium status from KV
    const isPremium = await c.env.KV.get(`premium:${user.userId}`)

    // Count courses accessed
    const coursesResult = await c.env.DB.prepare(
      'SELECT COUNT(DISTINCT course_id) as count FROM progress WHERE user_id = ?'
    ).bind(user.userId).first() as any

    const coursesAccessed = coursesResult?.count || 0
    const limit = isPremium === 'true' ? null : 3

    return c.json({
      success: true,
      subscription: {
        ...subscription,
        isPremium: isPremium === 'true',
        coursesAccessed,
        limit
      }
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    return c.json({ error: 'Erreur lors de la récupération de l\'abonnement' }, 500)
  }
})

// Upgrade to premium
subscriptionRoutes.post('/upgrade', authMiddleware, async (c) => {
  try {
    const user = c.get('user')

    // Check if user already has a subscription
    const existing = await c.env.DB.prepare(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(user.userId).first() as any

    const startDate = new Date().toISOString()
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 1)

    if (existing) {
      // Update existing subscription
      await c.env.DB.prepare(
        'UPDATE subscriptions SET plan = ?, status = ?, start_date = ?, end_date = ? WHERE id = ?'
      ).bind('premium', 'active', startDate, endDate.toISOString(), existing.id).run()
    } else {
      // Create new subscription
      await c.env.DB.prepare(
        'INSERT INTO subscriptions (user_id, plan, status, start_date, end_date) VALUES (?, ?, ?, ?, ?)'
      ).bind(user.userId, 'premium', 'active', startDate, endDate.toISOString()).run()
    }

    // Set premium flag in KV
    await c.env.KV.put(`premium:${user.userId}`, 'true', {
      expirationTtl: 60 * 60 * 24 * 365 // 1 year
    })

    return c.json({
      success: true,
      message: 'Abonnement premium activé',
      subscription: {
        plan: 'premium',
        status: 'active',
        start_date: startDate,
        end_date: endDate.toISOString()
      }
    })
  } catch (error) {
    console.error('Upgrade subscription error:', error)
    return c.json({ error: 'Erreur lors de la mise à niveau' }, 500)
  }
})

// Check course access
subscriptionRoutes.get('/check-access/:courseId', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const courseId = c.req.param('courseId')

    // Check if premium
    const isPremium = await c.env.KV.get(`premium:${user.userId}`)

    if (isPremium === 'true') {
      return c.json({ success: true, hasAccess: true, reason: 'premium' })
    }

    // Count courses accessed
    const coursesResult = await c.env.DB.prepare(
      'SELECT COUNT(DISTINCT course_id) as count FROM progress WHERE user_id = ?'
    ).bind(user.userId).first() as any

    const coursesAccessed = coursesResult?.count || 0

    // Check if this course was already accessed
    const alreadyAccessed = await c.env.DB.prepare(
      'SELECT id FROM progress WHERE user_id = ? AND course_id = ? LIMIT 1'
    ).bind(user.userId, courseId).first()

    if (alreadyAccessed) {
      return c.json({ success: true, hasAccess: true, reason: 'already_accessed' })
    }

    // Check if under limit
    if (coursesAccessed < 3) {
      return c.json({ success: true, hasAccess: true, reason: 'under_limit', coursesAccessed, limit: 3 })
    }

    return c.json({
      success: true,
      hasAccess: false,
      reason: 'limit_reached',
      coursesAccessed,
      limit: 3,
      message: 'Limite de cours gratuits atteinte. Passez à Premium pour un accès illimité.'
    })
  } catch (error) {
    console.error('Check access error:', error)
    return c.json({ error: 'Erreur lors de la vérification de l\'accès' }, 500)
  }
})
