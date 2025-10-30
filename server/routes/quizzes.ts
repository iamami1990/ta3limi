import { Hono } from 'hono'
import { authMiddleware, requireRole } from '../middleware/auth'

type Bindings = {
  DB: D1Database
}

export const quizRoutes = new Hono<{ Bindings: Bindings }>()

// Get quiz by course ID
quizRoutes.get('/course/:courseId', async (c) => {
  try {
    const courseId = c.req.param('courseId')

    const quiz = await c.env.DB.prepare(
      'SELECT * FROM quizzes WHERE course_id = ?'
    ).bind(courseId).first()

    if (!quiz) {
      return c.json({ error: 'Quiz non trouvé' }, 404)
    }

    return c.json({ success: true, quiz })
  } catch (error) {
    console.error('Get quiz error:', error)
    return c.json({ error: 'Erreur lors de la récupération du quiz' }, 500)
  }
})

// Get quiz by ID
quizRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const quiz = await c.env.DB.prepare(
      'SELECT * FROM quizzes WHERE id = ?'
    ).bind(id).first()

    if (!quiz) {
      return c.json({ error: 'Quiz non trouvé' }, 404)
    }

    return c.json({ success: true, quiz })
  } catch (error) {
    console.error('Get quiz error:', error)
    return c.json({ error: 'Erreur lors de la récupération du quiz' }, 500)
  }
})

// Create quiz (enseignant only)
quizRoutes.post('/', authMiddleware, requireRole('enseignant', 'admin'), async (c) => {
  try {
    const { titre, questions, course_id } = await c.req.json()

    if (!titre || !questions || !course_id) {
      return c.json({ error: 'Champs requis manquants' }, 400)
    }

    // Validate questions format
    if (!Array.isArray(questions)) {
      return c.json({ error: 'Format de questions invalide' }, 400)
    }

    const questionsJson = JSON.stringify(questions)

    const result = await c.env.DB.prepare(
      'INSERT INTO quizzes (titre, questions, course_id) VALUES (?, ?, ?)'
    ).bind(titre, questionsJson, course_id).run()

    return c.json({
      success: true,
      quiz: {
        id: result.meta.last_row_id,
        titre,
        questions,
        course_id
      }
    }, 201)
  } catch (error) {
    console.error('Create quiz error:', error)
    return c.json({ error: 'Erreur lors de la création du quiz' }, 500)
  }
})

// Submit quiz answers and get score
quizRoutes.post('/:id/submit', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    const user = c.get('user')
    const { answers } = await c.req.json()

    if (!answers || !Array.isArray(answers)) {
      return c.json({ error: 'Réponses invalides' }, 400)
    }

    // Get quiz
    const quiz = await c.env.DB.prepare(
      'SELECT * FROM quizzes WHERE id = ?'
    ).bind(id).first() as any

    if (!quiz) {
      return c.json({ error: 'Quiz non trouvé' }, 404)
    }

    // Parse questions
    const questions = JSON.parse(quiz.questions)

    // Calculate score
    let correct = 0
    questions.forEach((q: any, index: number) => {
      if (answers[index] === q.correct) {
        correct++
      }
    })

    const score = Math.round((correct / questions.length) * 100)

    // Save progress
    await c.env.DB.prepare(
      'INSERT INTO progress (user_id, course_id, quiz_id, score) VALUES (?, ?, ?, ?)'
    ).bind(user.userId, quiz.course_id, id, score).run()

    return c.json({
      success: true,
      score,
      correct,
      total: questions.length,
      percentage: score
    })
  } catch (error) {
    console.error('Submit quiz error:', error)
    return c.json({ error: 'Erreur lors de la soumission du quiz' }, 500)
  }
})

// Update quiz
quizRoutes.put('/:id', authMiddleware, requireRole('enseignant', 'admin'), async (c) => {
  try {
    const id = c.req.param('id')
    const { titre, questions } = await c.req.json()

    const questionsJson = JSON.stringify(questions)

    await c.env.DB.prepare(
      'UPDATE quizzes SET titre = ?, questions = ? WHERE id = ?'
    ).bind(titre, questionsJson, id).run()

    return c.json({ success: true, message: 'Quiz mis à jour' })
  } catch (error) {
    console.error('Update quiz error:', error)
    return c.json({ error: 'Erreur lors de la mise à jour du quiz' }, 500)
  }
})

// Delete quiz
quizRoutes.delete('/:id', authMiddleware, requireRole('enseignant', 'admin'), async (c) => {
  try {
    const id = c.req.param('id')

    await c.env.DB.prepare('DELETE FROM quizzes WHERE id = ?').bind(id).run()

    return c.json({ success: true, message: 'Quiz supprimé' })
  } catch (error) {
    console.error('Delete quiz error:', error)
    return c.json({ error: 'Erreur lors de la suppression du quiz' }, 500)
  }
})
