import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, Search } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Non authentifié</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* En-tête */}
        <div className="border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenue sur CodexAI</h1>
          <p className="text-gray-600 mt-2">Plateforme d'assistance juridique intelligente pour les professionnels du droit</p>
        </div>

        {/* Modules Principaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* C-Assistant */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/assistant")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <CardTitle>C-Assistant</CardTitle>
              </div>
              <CardDescription>Conversations juridiques</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Posez des questions complexes sur le droit français et obtenez des réponses précises et citées.
              </p>
              <Button className="mt-4 w-full" variant="outline">
                Ouvrir
              </Button>
            </CardContent>
          </Card>

          {/* C-Knowledge */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/knowledge")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6 text-green-600" />
                <CardTitle>C-Knowledge</CardTitle>
              </div>
              <CardDescription>Recherche juridique</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Recherchez dans Légifrance et Judilibre avec citations automatiques et traçabilité des sources.
              </p>
              <Button className="mt-4 w-full" variant="outline">
                Ouvrir
              </Button>
            </CardContent>
          </Card>

          {/* C-Vault */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/vault")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-600" />
                <CardTitle>C-Vault</CardTitle>
              </div>
              <CardDescription>Documents sécurisés</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Uploadez et analysez vos documents privés avec chiffrement et isolation multi-tenant.
              </p>
              <Button className="mt-4 w-full" variant="outline">
                Ouvrir
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-600">Conversations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-sm text-gray-600">Recherches</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-sm text-gray-600">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations Utilisateur */}
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Nom :</strong> {user.name || "Non défini"}</p>
              <p><strong>Email :</strong> {user.email || "Non défini"}</p>
              <p><strong>Rôle :</strong> {user.role || "user"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
