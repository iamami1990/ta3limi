import Navbar from './Navbar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Ta3limi</h3>
              <p className="text-gray-400">
                Plateforme éducative tunisienne pour le primaire, collège et lycée
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/courses" className="hover:text-white">Cours</a></li>
                <li><a href="/subscriptions" className="hover:text-white">Abonnements</a></li>
                <li><a href="/profile" className="hover:text-white">Profil</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li><i className="fas fa-envelope mr-2"></i> contact@ta3limi.tn</li>
                <li><i className="fas fa-phone mr-2"></i> +216 XX XXX XXX</li>
                <li><i className="fas fa-map-marker-alt mr-2"></i> Tunis, Tunisie</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Ta3limi. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
