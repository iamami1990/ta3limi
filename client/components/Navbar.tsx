import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { logout } from '../store/authSlice'

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    switch (user.role) {
      case 'eleve':
        return '/dashboard/eleve'
      case 'parent':
        return '/dashboard/parent'
      case 'enseignant':
        return '/dashboard/enseignant'
      case 'admin':
        return '/dashboard/admin'
      default:
        return '/'
    }
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <i className="fas fa-graduation-cap text-primary-600 text-3xl mr-2"></i>
              <span className="text-2xl font-bold text-primary-600">Ta3limi</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium">
                  <i className="fas fa-home mr-1"></i> Tableau de bord
                </Link>
                <Link to="/courses" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium">
                  <i className="fas fa-book mr-1"></i> Cours
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium">
                  <i className="fas fa-user mr-1"></i> Profil
                </Link>
                {user?.role === 'eleve' && (
                  <Link to="/subscriptions" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium">
                    <i className="fas fa-crown mr-1"></i> Abonnement
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-outline">
                  <i className="fas fa-sign-out-alt mr-1"></i> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md font-medium">
                  Connexion
                </Link>
                <Link to="/register" className="btn-primary">
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
