import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../store/authSlice'
import api from '../api/axios'
import Layout from '../components/Layout'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', formData)
      
      if (response.data.success) {
        dispatch(setCredentials({
          user: response.data.user,
          token: response.data.token
        }))
        
        // Redirect based on role
        switch (response.data.user.role) {
          case 'eleve':
            navigate('/dashboard/eleve')
            break
          case 'parent':
            navigate('/dashboard/parent')
            break
          case 'enseignant':
            navigate('/dashboard/enseignant')
            break
          case 'admin':
            navigate('/dashboard/admin')
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
      <div className="max-w-md mx-auto">
        <div className="card animate-fadeIn">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            <i className="fas fa-sign-in-alt mr-2 text-primary-600"></i>
            Connexion
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                <i className="fas fa-envelope mr-2"></i>
                Email
              </label>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="votre@email.com"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                <i className="fas fa-lock mr-2"></i>
                Mot de passe
              </label>
              <input
                type="password"
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.remember}
                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
              />
              <label htmlFor="remember" className="ml-2 text-gray-700">
                Se souvenir de moi
              </label>
            </div>

            <button
              type="submit"
              className="w-full btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Connexion...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-600">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Inscrivez-vous
            </Link>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700 font-medium mb-2">Comptes de test :</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Admin: admin@ta3limi.tn / admin123</li>
              <li>• Prof: prof@ta3limi.tn / prof123</li>
              <li>• Parent: parent@ta3limi.tn / parent123</li>
              <li>• Élève: eleve@ta3limi.tn / eleve123</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}
