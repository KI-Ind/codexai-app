import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Shield, BookOpen, Lock } from "lucide-react";
// import { getLoginUrl } from "@/const";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Rediriger vers le dashboard si authentifié
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  // Afficher le spinner pendant le chargement de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Page de landing pour les utilisateurs non authentifiés
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-lg text-gray-900">CodexAI</span>
          </div>
          <button
            onClick={() => setLocation("/login")}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Se connecter
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Assistant Juridique Intelligent
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              pour le Droit Français
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            CodexAI combine l'intelligence artificielle et le droit français pour vous fournir des réponses
            précises, citées et conformes au RGPD.
          </p>
          <button
            onClick={() => setLocation("/login")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-shadow"
          >
            Commencer gratuitement
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {/* C-Assistant */}
          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">C-Assistant</h3>
            <p className="text-gray-600 mb-4">
              Assistant conversationnel pour poser vos questions juridiques en français et obtenir des réponses
              contextualisées.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Questions illimitées</li>
              <li>✓ Historique des conversations</li>
              <li>✓ Support du droit civil, pénal, administratif</li>
            </ul>
          </div>

          {/* C-Knowledge */}
          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">C-Knowledge</h3>
            <p className="text-gray-600 mb-4">
              Recherche RAG sur Légifrance et Judilibre avec citations automatiques et traçabilité des sources.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Accès à Légifrance</li>
              <li>✓ Jurisprudence Judilibre</li>
              <li>✓ Citations précises</li>
            </ul>
          </div>

          {/* C-Vault */}
          <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">C-Vault</h3>
            <p className="text-gray-600 mb-4">
              Espace sécurisé et chiffré pour gérer vos documents juridiques confidentiels avec recherche sémantique.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Chiffrement au repos</li>
              <li>✓ Isolation multi-tenant</li>
              <li>✓ Recherche sémantique</li>
            </ul>
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-20 bg-white rounded-lg p-12 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Sécurité & Conformité</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Conformité RGPD</h3>
              <p className="text-gray-600 mb-4">
                Hébergement en Union Européenne, chiffrement au repos et en transit, politique zero-training sur
                données privées.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Isolation des Données</h3>
              <p className="text-gray-600 mb-4">
                Isolation multi-tenant stricte, contrôle d'accès basé sur les rôles (RBAC), audit logs complète.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Prêt à commencer ?</h2>
          <button
            onClick={() => setLocation("/login")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-shadow"
          >
            Se connecter
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2024 CodexAI. Tous droits réservés.</p>
            <p className="mt-2">
              Plateforme d'assistance juridique intelligente pour le droit français • Conforme RGPD
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
