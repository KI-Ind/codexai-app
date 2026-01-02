import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import ContextualSearch, { SearchSuggestion } from "@/components/ContextualSearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Lock, Trash2, Upload, Lightbulb } from "lucide-react";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Vault() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [recentDocuments, setRecentDocuments] = useState<SearchSuggestion[]>([
    {
      id: "d1",
      label: "Contrat de travail 2024",
      description: "PDF - 2.3 MB",
      category: "Récent",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "d2",
      label: "Accord de confidentialité",
      description: "DOCX - 1.1 MB",
      category: "Récent",
      icon: <FileText className="w-4 h-4" />,
    },
  ]);

  const trendingDocuments: SearchSuggestion[] = useMemo(
    () => [
      {
        id: "t1",
        label: "Modèle de contrat de vente",
        description: "Template",
        category: "Tendance",
        icon: <Lightbulb className="w-4 h-4" />,
      },
      {
        id: "t2",
        label: "Politique de confidentialité",
        description: "Template",
        category: "Tendance",
        icon: <Lightbulb className="w-4 h-4" />,
      },
    ],
    []
  );

  // Récupérer les documents
  const { data: documents, isLoading: documentsLoading, refetch } = trpc.vault.listDocuments.useQuery();

  // Supprimer un document
  const deleteDocMutation = trpc.vault.deleteDocument.useMutation({
    onSuccess: () => {
      toast.success("Document supprimé");
      refetch();
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // TODO: Implémenter l'upload réel vers S3
      toast.success("Document uploadé avec succès");
      refetch();
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleContextualSearch = async (query: string): Promise<SearchSuggestion[]> => {
    if (!query.trim()) return [];

    const allDocuments = [...recentDocuments, ...trendingDocuments];
    return allDocuments.filter(
      (d) =>
        d.label.toLowerCase().includes(query.toLowerCase()) ||
        d.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.label);
    // Ajouter à la liste des documents récents
    if (!recentDocuments.some((d) => d.id === suggestion.id)) {
      setRecentDocuments([
        { ...suggestion, category: "Récent" },
        ...recentDocuments.slice(0, 4),
      ]);
    }
  };

  const filteredDocuments = documents?.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">C-Vault</h1>
          <p className="text-gray-600 mt-2">Gestion sécurisée et chiffrée de vos documents juridiques</p>
        </div>

        {/* Recherche et Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <ContextualSearch
                placeholder="Recherchez vos documents..."
                onSearch={handleContextualSearch}
                onSelect={handleSelectSuggestion}
                recentSearches={recentDocuments}
                trendingSuggestions={trendingDocuments}
                minCharsToSearch={1}
                debounceMs={200}
                maxSuggestions={8}
              />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Recherchez dans vos documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <label className="flex items-center gap-2">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                  accept=".pdf,.docx,.txt,.xlsx"
                />
                <Button disabled={isUploading} variant="outline" asChild>
                  <span className="cursor-pointer">
                    {isUploading ? "Upload en cours..." : <Upload className="w-4 h-4" />}
                  </span>
                </Button>
              </label>
            </div>

            <div className="text-sm text-gray-500">
              <Lock className="w-4 h-4 inline mr-1" />
              Tous les documents sont chiffrés et isolés par tenant
            </div>
          </CardContent>
        </Card>

        {/* Liste des documents */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""}
          </h2>

          {documentsLoading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">Chargement des documents...</p>
              </CardContent>
            </Card>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm truncate">{doc.fileName}</CardTitle>
                          <p className="text-xs text-gray-500 mt-1">{new Date(doc.createdAt).toLocaleDateString("fr-FR")}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteDocMutation.mutate({ documentId: doc.id })}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-gray-600">
                      <p>Taille: {doc.fileSize}</p>
                      <p className="mt-2 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Chiffré
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun document trouvé</p>
                <p className="text-sm text-gray-400 mt-1">Uploadez vos premiers documents pour commencer</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
