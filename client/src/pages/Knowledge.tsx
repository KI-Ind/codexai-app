import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import ContextualSearch, { SearchSuggestion } from "@/components/ContextualSearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, AlertCircle, Lightbulb } from "lucide-react";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";

export default function Knowledge() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceType, setSourceType] = useState<"all" | "legifrance" | "judilibre">("all");
  const [shouldSearch, setShouldSearch] = useState(false);

  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([
    {
      id: "s1",
      label: "Code civil article 1134",
      description: "Légifrance",
      category: "Récent",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "s2",
      label: "Jurisprudence licenciement abusif",
      description: "Judilibre",
      category: "Récent",
      icon: <BookOpen className="w-4 h-4" />,
    },
  ]);

  const trendingSearches: SearchSuggestion[] = useMemo(
    () => [
      {
        id: "t1",
        label: "Droit du travail - Contrat de travail",
        description: "Légifrance",
        category: "Tendance",
        icon: <Lightbulb className="w-4 h-4" />,
      },
      {
        id: "t2",
        label: "Responsabilité civile",
        description: "Jurisprudence",
        category: "Tendance",
        icon: <Lightbulb className="w-4 h-4" />,
      },
    ],
    []
  );

  const { data: searchResults, isLoading } = trpc.knowledge.search.useQuery(
    {
      query: searchQuery,
      sourceType,
      limit: 10,
    },
    { enabled: shouldSearch && searchQuery.trim().length > 0 }
  );

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setShouldSearch(true);
  };

  const handleContextualSearch = async (query: string): Promise<SearchSuggestion[]> => {
    if (!query.trim()) return [];

    const allSearches = [...recentSearches, ...trendingSearches];
    return allSearches.filter(
      (s) =>
        s.label.toLowerCase().includes(query.toLowerCase()) ||
        s.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.label);
    // Ajouter à la liste des recherches récentes
    if (!recentSearches.some((s) => s.id === suggestion.id)) {
      setRecentSearches([
        { ...suggestion, category: "Récent" },
        ...recentSearches.slice(0, 4),
      ]);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">C-Knowledge</h1>
          <p className="text-gray-600 mt-2">
            Recherche RAG sur Légifrance et Judilibre avec citations automatiques
          </p>
        </div>

        {/* Recherche */}
        <Card>
          <CardHeader>
            <CardTitle>Recherche juridique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <ContextualSearch
                placeholder="Recherchez dans le droit français..."
                onSearch={handleContextualSearch}
                onSelect={handleSelectSuggestion}
                recentSearches={recentSearches}
                trendingSuggestions={trendingSearches}
                minCharsToSearch={1}
                debounceMs={200}
                maxSuggestions={8}
              />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Recherchez dans le droit français (articles, jurisprudence, etc.)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
                {isLoading ? <Search className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={sourceType === "all"}
                  onChange={() => setSourceType("all")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Toutes les sources</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={sourceType === "legifrance"}
                  onChange={() => setSourceType("legifrance")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Légifrance</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={sourceType === "judilibre"}
                  onChange={() => setSourceType("judilibre")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Judilibre</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Résultats */}
        {searchResults && searchResults.results && searchResults.results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">{searchResults.results.length} résultats trouvés</h2>
            {searchResults.results.map((result: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{result.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-gray-600">{result.content}</p>
                  <div className="flex gap-2 flex-wrap">
                    {result.sources?.map((source: string, i: number) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {source}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* État vide */}
        {!searchResults && !isLoading && (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Effectuez une recherche pour voir les résultats</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
