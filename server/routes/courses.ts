import { Hono } from 'hono'
import { authMiddleware, requireRole } from '../middleware/auth'

type Bindings = {
  DB: D1Database
  R2: R2Bucket
}

export const courseRoutes = new Hono<{ Bindings: Bindings }>()

// Get all courses with filters
courseRoutes.get('/', async (c) => {
  try {
    const niveau = c.req.query('niveau')
    const matiere = c.req.query('matiere')
    const search = c.req.query('search')

    let query = 'SELECT c.*, u.nom as enseignant_nom FROM courses c LEFT JOIN users u ON c.enseignant_id = u.id WHERE 1=1'
    const params: any[] = []

    if (niveau) {
      query += ' AND c.niveau = ?'
      params.push(niveau)
    }

    if (matiere) {
      query += ' AND c.matiere = ?'
      params.push(matiere)
    }

    if (search) {
      query += ' AND (c.titre LIKE ? OR c.description LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY c.created_at DESC'

    const stmt = c.env.DB.prepare(query)
    const result = await stmt.bind(...params).all()

    return c.json({ success: true, courses: result.results })
  } catch (error) {
    console.error('Get courses error:', error)
    return c.json({ error: 'Erreur lors de la récupération des cours' }, 500)
  }
})

// Get course by ID
courseRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const course = await c.env.DB.prepare(
      'SELECT c.*, u.nom as enseignant_nom FROM courses c LEFT JOIN users u ON c.enseignant_id = u.id WHERE c.id = ?'
    ).bind(id).first()

    if (!course) {
      return c.json({ error: 'Cours non trouvé' }, 404)
    }

    return c.json({ success: true, course })
  } catch (error) {
    console.error('Get course error:', error)
    return c.json({ error: 'Erreur lors de la récupération du cours' }, 500)
  }
})

// Create course (enseignant only)
courseRoutes.post('/', authMiddleware, requireRole('enseignant', 'admin'), async (c) => {
  try {
    const user = c.get('user')
    const { titre, niveau, matiere, description, video_url, pdf_url } = await c.req.json()

    if (!titre || !niveau || !matiere) {
      return c.json({ error: 'Champs requis manquants' }, 400)
    }

    const validNiveaux = ['primaire', 'college', 'lycee']
    if (!validNiveaux.includes(niveau)) {
      return c.json({ error: 'Niveau invalide' }, 400)
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO courses (titre, niveau, matiere, description, enseignant_id, video_url, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(titre, niveau, matiere, description || null, user.userId, video_url || null, pdf_url || null).run()

    return c.json({
      success: true,
      course: {
        id: result.meta.last_row_id,
        titre,
        niveau,
        matiere,
        description,
        video_url,
        pdf_url
      }
    }, 201)
  } catch (error) {
    console.error('Create course error:', error)
    return c.json({ error: 'Erreur lors de la création du cours' }, 500)
  }
})

// Update course
courseRoutes.put('/:id', authMiddleware, requireRole('enseignant', 'admin'), async (c) => {
  try {
    const id = c.req.param('id')
    const user = c.get('user')
    const { titre, niveau, matiere, description, video_url, pdf_url } = await c.req.json()

    // Check if course exists and belongs to teacher (unless admin)
    const course = await c.env.DB.prepare(
      'SELECT * FROM courses WHERE id = ?'
    ).bind(id).first() as any

    if (!course) {
      return c.json({ error: 'Cours non trouvé' }, 404)
    }

    if (user.role !== 'admin' && course.enseignant_id !== user.userId) {
      return c.json({ error: 'Non autorisé à modifier ce cours' }, 403)
    }

    await c.env.DB.prepare(
      'UPDATE courses SET titre = ?, niveau = ?, matiere = ?, description = ?, video_url = ?, pdf_url = ? WHERE id = ?'
    ).bind(titre, niveau, matiere, description, video_url, pdf_url, id).run()

    return c.json({ success: true, message: 'Cours mis à jour' })
  } catch (error) {
    console.error('Update course error:', error)
    return c.json({ error: 'Erreur lors de la mise à jour du cours' }, 500)
  }
})

// Delete course
courseRoutes.delete('/:id', authMiddleware, requireRole('enseignant', 'admin'), async (c) => {
  try {
    const id = c.req.param('id')
    const user = c.get('user')

    // Check if course exists and belongs to teacher (unless admin)
    const course = await c.env.DB.prepare(
      'SELECT * FROM courses WHERE id = ?'
    ).bind(id).first() as any

    if (!course) {
      return c.json({ error: 'Cours non trouvé' }, 404)
    }

    if (user.role !== 'admin' && course.enseignant_id !== user.userId) {
      return c.json({ error: 'Non autorisé à supprimer ce cours' }, 403)
    }

    await c.env.DB.prepare('DELETE FROM courses WHERE id = ?').bind(id).run()

    return c.json({ success: true, message: 'Cours supprimé' })
  } catch (error) {
    console.error('Delete course error:', error)
    return c.json({ error: 'Erreur lors de la suppression du cours' }, 500)
  }
})

// Upload PDF to R2
courseRoutes.post('/upload-pdf', authMiddleware, requireRole('enseignant', 'admin'), async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return c.json({ error: 'Fichier manquant' }, 400)
    }

    const key = `pdfs/${Date.now()}-${file.name}`
    const buffer = await file.arrayBuffer()

    await c.env.R2.put(key, buffer, {
      httpMetadata: {
        contentType: file.type
      }
    })

    const url = `/api/courses/pdf/${key}`

    return c.json({ success: true, url })
  } catch (error) {
    console.error('Upload PDF error:', error)
    return c.json({ error: 'Erreur lors de l\'upload du PDF' }, 500)
  }
})

// Get PDF from R2
courseRoutes.get('/pdf/:key', async (c) => {
  try {
    const key = c.req.param('key')
    const object = await c.env.R2.get(`pdfs/${key}`)

    if (!object) {
      return c.json({ error: 'PDF non trouvé' }, 404)
    }

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/pdf',
        'Content-Disposition': 'inline'
      }
    })
  } catch (error) {
    console.error('Get PDF error:', error)
    return c.json({ error: 'Erreur lors de la récupération du PDF' }, 500)
  }
})
