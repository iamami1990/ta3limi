import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import api from '../api/axios'
import Layout from '../components/Layout'

export default function DashboardEleve() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [stats, setStats] = useState<any>(null)
  const [progress, setProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, progressRes] = await Promise.all([
        api.get('/progress/stats'),
        api.get('/progress')
      ])
      setStats(statsRes.data.stats)
      setProgress(progressRes.data.progress)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          <i className="fas fa-tachometer-alt mr-3 text-primary-600"></i>
          Tableau de bord Élève
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 mb-1">Cours suivis</p>
                <p className="text-3xl font-bold">{stats?.totalCourses || 0}</p>
              </div>
              <i className="fas fa-book-open text-4xl text-primary-200"></i>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-100 mb-1">Score moyen</p>
                <p className="text-3xl font-bold">{stats?.averageScore || 0}%</p>
              </div>
              <i className="fas fa-chart-line text-4xl text-secondary-200"></i>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 mb-1">Quizz complétés</p>
                <p className="text-3xl font-bold">{progress.filter(p => p.score !== null).length}</p>
              </div>
              <i className="fas fa-clipboard-check text-4xl text-green-200"></i>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <i className="fas fa-history mr-2 text-primary-600"></i>
              Dernière activité
            </h2>
            {loading ? (
              <p className="text-gray-500">Chargement...</p>
            ) : progress.length > 0 ? (
              <div className="space-y-3">
                {progress.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{item.course_titre}</p>
                      <p className="text-sm text-gray-600">{item.matiere}</p>
                    </div>
                    {item.score && (
                      <div className="text-right">
                        <p className="font-bold text-primary-600">{item.score}%</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucune activité récente</p>
            )}
            <Link to="/courses" className="btn-primary mt-4 inline-block">
              <i className="fas fa-book mr-2"></i>
              Explorer les cours
            </Link>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <i className="fas fa-chart-pie mr-2 text-primary-600"></i>
              Progrès par matière
            </h2>
            {stats?.byMatiere && stats.byMatiere.length > 0 ? (
              <div className="space-y-3">
                {stats.byMatiere.map((item: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{item.matiere}</span>
                      <span className="text-gray-600">{Math.round(item.avg_score || 0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${Math.round(item.avg_score || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Commencez à suivre des cours pour voir vos progrès</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
