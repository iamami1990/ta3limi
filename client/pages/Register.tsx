import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../store/authSlice'
import api from '../api/axios'
import Layout from '../components/Layout'

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'eleve',
    nom: '',
    classe: '',
    parent_id: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        nom: formData.nom,
        classe: formData.classe,
        parent_id: formData.parent_id || null
      })
      
      if (response.data.success) {
        dispatch(setCredentials({
          user: response.data.user,
          token: response.data.token
        }))
        
        switch (formData.role) {
          case 'eleve':
            navigate('/dashboard/eleve')
            break
          case 'parent':
            navigate('/dashboard/parent')
            break
          case 'enseignant':
            navigate('/dashboard/enseignant')
            break
          default:
            navigate('/')
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="card animate-fadeIn">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            <i className="fas fa-user-plus mr-2 text-primary-600"></i>
            Inscription
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <i className="fas fa-envelope mr-2"></i>
                  Email *
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <i className="fas fa-user mr-2"></i>
                  Nom complet *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <i className="fas fa-lock mr-2"></i>
                  Mot de passe *
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <i className="fas fa-lock mr-2"></i>
                  Confirmer mot de passe *
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <i className="fas fa-user-tag mr-2"></i>
                  Rôle *
                </label>
                <select
                  className="input-field"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="eleve">Élève</option>
                  <option value="parent">Parent</option>
                  <option value="enseignant">Enseignant</option>
                </select>
              </div>

              {(formData.role === 'eleve') && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    <i className="fas fa-school mr-2"></i>
                    Classe *
                  </label>
                  <select
                    className="input-field"
                    value={formData.classe}
                    onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="4ème primaire">4ème primaire</option>
                    <option value="5ème primaire">5ème primaire</option>
                    <option value="6ème primaire">6ème primaire</option>
                    <option value="7ème année">7ème année</option>
                    <option value="8ème année">8ème année</option>
                    <option value="9ème année">9ème année</option>
                    <option value="1ère année secondaire">1ère année secondaire</option>
                    <option value="2ème année secondaire">2ème année secondaire</option>
                    <option value="3ème année secondaire">3ème année secondaire</option>
                    <option value="4ème année secondaire">4ème année secondaire</option>
                  </select>
                </div>
              )}

              {formData.role === 'eleve' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    <i className="fas fa-users mr-2"></i>
                    ID Parent (optionnel)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    placeholder="Lier à un compte parent"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full btn-primary mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Inscription...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus mr-2"></i>
                  S'inscrire
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-600">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Connectez-vous
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
