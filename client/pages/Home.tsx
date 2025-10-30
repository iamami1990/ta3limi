import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import Layout from '../components/Layout'

export default function Home() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const getDashboardLink = () => {
    if (!user) return '/register'
    switch (user.role) {
      case 'eleve': return '/dashboard/eleve'
      case 'parent': return '/dashboard/parent'
      case 'enseignant': return '/dashboard/enseignant'
      case 'admin': return '/dashboard/admin'
      default: return '/register'
    }
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl text-white p-12 mb-12 animate-fadeIn">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">
            Bienvenue sur Ta3limi
          </h1>
          <p className="text-xl mb-8">
            La plateforme éducative tunisienne complète pour les élèves du primaire, collège et lycée
          </p>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <Link to={getDashboardLink()} className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200">
                <i className="fas fa-home mr-2"></i>
                Mon Tableau de bord
              </Link>
            ) : (
              <>
                <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200">
                  <i className="fas fa-user-plus mr-2"></i>
                  Inscription gratuite
                </Link>
                <Link to="/login" className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200">
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Connexion
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Matières couvertes */}
      <section className="mb-12 animate-fadeIn">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Matières couvertes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="text-5xl text-primary-600 mb-4">
              <i className="fas fa-calculator"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Mathématiques</h3>
            <p className="text-gray-600">
              Cours et exercices adaptés à tous les niveaux
            </p>
          </div>
          <div className="card text-center">
            <div className="text-5xl text-primary-600 mb-4">
              <i className="fas fa-flask"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Sciences</h3>
            <p className="text-gray-600">
              Physique, chimie et biologie avec des expériences
            </p>
          </div>
          <div className="card text-center">
            <div className="text-5xl text-primary-600 mb-4">
              <i className="fas fa-language"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Langues</h3>
            <p className="text-gray-600">
              Arabe, français et anglais
            </p>
          </div>
          <div className="card text-center">
            <div className="text-5xl text-primary-600 mb-4">
              <i className="fas fa-landmark"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Histoire & Géographie</h3>
            <p className="text-gray-600">
              Découverte du monde et de l'histoire
            </p>
          </div>
          <div className="card text-center">
            <div className="text-5xl text-primary-600 mb-4">
              <i className="fas fa-laptop-code"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Informatique</h3>
            <p className="text-gray-600">
              Programmation et nouvelles technologies
            </p>
          </div>
          <div className="card text-center">
            <div className="text-5xl text-primary-600 mb-4">
              <i className="fas fa-palette"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Arts & Culture</h3>
            <p className="text-gray-600">
              Développement artistique et créatif
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mb-12 bg-primary-50 rounded-2xl p-8 animate-fadeIn">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Nos fonctionnalités</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl text-primary-600 mb-3">
              <i className="fas fa-video"></i>
            </div>
            <h3 className="font-semibold mb-2">Cours vidéo</h3>
            <p className="text-sm text-gray-600">HD avec PDF téléchargeables</p>
          </div>
          <div className="text-center">
            <div className="text-4xl text-primary-600 mb-3">
              <i className="fas fa-clipboard-check"></i>
            </div>
            <h3 className="font-semibold mb-2">Quizz interactifs</h3>
            <p className="text-sm text-gray-600">Évaluation automatique</p>
          </div>
          <div className="text-center">
            <div className="text-4xl text-primary-600 mb-3">
              <i className="fas fa-users"></i>
            </div>
            <h3 className="font-semibold mb-2">Sessions live</h3>
            <p className="text-sm text-gray-600">Visioconférence interactive</p>
          </div>
          <div className="text-center">
            <div className="text-4xl text-primary-600 mb-3">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3 className="font-semibold mb-2">Suivi des progrès</h3>
            <p className="text-sm text-gray-600">Statistiques détaillées</p>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="animate-fadeIn">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Témoignages</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                AS
              </div>
              <div className="ml-3">
                <h4 className="font-semibold">Ahmed Sassi</h4>
                <p className="text-sm text-gray-500">Élève, 4ème primaire</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "Ta3limi m'a aidé à améliorer mes notes en mathématiques. Les cours sont clairs et faciles à comprendre!"
            </p>
            <div className="mt-3 text-yellow-500">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                FT
              </div>
              <div className="ml-3">
                <h4 className="font-semibold">Fatma Trabelsi</h4>
                <p className="text-sm text-gray-500">Parent</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "Je peux suivre les progrès de mes enfants facilement. Une excellente plateforme pour l'éducation à distance!"
            </p>
            <div className="mt-3 text-yellow-500">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                MB
              </div>
              <div className="ml-3">
                <h4 className="font-semibold">Mohamed Ben Ali</h4>
                <p className="text-sm text-gray-500">Enseignant</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "Un outil parfait pour créer et partager mes cours. Les sessions live sont très appréciées par mes élèves!"
            </p>
            <div className="mt-3 text-yellow-500">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
