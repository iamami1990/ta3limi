import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { sign } from 'hono/jwt'

type Bindings = {
  DB: D1Database
  LIVEKIT_API_KEY: string
  LIVEKIT_API_SECRET: string
  LIVEKIT_URL: string
}

export const liveRoutes = new Hono<{ Bindings: Bindings }>()

// Generate LiveKit token
liveRoutes.post('/token', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { roomName, participantName } = await c.req.json()

    if (!roomName) {
      return c.json({ error: 'Nom de salle requis' }, 400)
    }

    const apiKey = c.env.LIVEKIT_API_KEY
    const apiSecret = c.env.LIVEKIT_API_SECRET

    // Create LiveKit token
    const at = {
      iss: apiKey,
      sub: user.userId.toString(),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 6, // 6 hours
      nbf: Math.floor(Date.now() / 1000),
      video: {
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true
      },
      name: participantName || user.email,
      metadata: JSON.stringify({
        userId: user.userId,
        role: user.role,
        email: user.email
      })
    }

    const token = await sign(at, apiSecret)

    return c.json({
      success: true,
      token,
      url: c.env.LIVEKIT_URL
    })
  } catch (error) {
    console.error('Generate LiveKit token error:', error)
    return c.json({ error: 'Erreur lors de la génération du token LiveKit' }, 500)
  }
})

// Create live session
liveRoutes.post('/sessions', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const { titre, description, course_id, scheduled_at } = await c.req.json()

    if (!titre || !course_id) {
      return c.json({ error: 'Titre et cours requis' }, 400)
    }

    // Only enseignant can create sessions
    if (user.role !== 'enseignant' && user.role !== 'admin') {
      return c.json({ error: 'Seuls les enseignants peuvent créer des sessions' }, 403)
    }

    const roomName = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // In a real app, you'd store sessions in the database
    // For now, we'll just return the room info

    return c.json({
      success: true,
      session: {
        id: Date.now(),
        titre,
        description,
        course_id,
        room_name: roomName,
        scheduled_at,
        created_by: user.userId,
        status: 'active'
      }
    })
  } catch (error) {
    console.error('Create session error:', error)
    return c.json({ error: 'Erreur lors de la création de la session' }, 500)
  }
})

// Get live sessions
liveRoutes.get('/sessions', authMiddleware, async (c) => {
  try {
    // In a real app, you'd fetch from database
    // For now, return mock data
    return c.json({
      success: true,
      sessions: []
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    return c.json({ error: 'Erreur lors de la récupération des sessions' }, 500)
  }
})
