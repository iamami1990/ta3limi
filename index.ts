import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { authRoutes } from './routes/auth'
import { courseRoutes } from './routes/courses'
import { quizRoutes } from './routes/quizzes'
import { userRoutes } from './routes/users'
import { subscriptionRoutes } from './routes/subscriptions'
import { progressRoutes } from './routes/progress'
import { liveRoutes } from './routes/live'
import { adminRoutes } from './routes/admin'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
  R2: R2Bucket
  JWT_SECRET: string
  LIVEKIT_API_KEY: string
  LIVEKIT_API_SECRET: string
  LIVEKIT_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// Serve static files
app.use('/assets/*', serveStatic({ root: './dist' }))

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/courses', courseRoutes)
app.route('/api/quizzes', quizRoutes)
app.route('/api/users', userRoutes)
app.route('/api/subscriptions', subscriptionRoutes)
app.route('/api/progress', progressRoutes)
app.route('/api/live', liveRoutes)
app.route('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve index.html for all other routes (SPA support)
app.get('*', serveStatic({ path: './dist/index.html' }))

export default app
