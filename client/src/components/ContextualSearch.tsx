import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, X, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export interface SearchSuggestion {
  id: string;
  label: string;
  description?: string;
  category?: string;
  icon?: React.ReactNode;
  metadata?: Record<string, unknown>;
}

export interface ContextualSearchProps {
  placeholder?: string;
  onSearch: (query: string) => Promise<SearchSuggestion[]>;
  onSelect: (suggestion: SearchSuggestion) => void;
  onQueryChange?: (query: string) => void;
  recentSearches?: SearchSuggestion[];
  trendingSuggestions?: SearchSuggestion[];
  minCharsToSearch?: number;
  debounceMs?: number;
  maxSuggestions?: number;
  className?: string;
}

export default function ContextualSearch({
  placeholder = "Rechercher...",
  onSearch,
  onSelect,
  onQueryChange,
  recentSearches = [],
  trendingSuggestions = [],
  minCharsToSearch = 2,
  debounceMs = 300,
  maxSuggestions = 8,
  className = "",
}: ContextualSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fonction de recherche avec debounce
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minCharsToSearch) {
        setSuggestions([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const results = await onSearch(searchQuery);
        setSuggestions(results.slice(0, maxSuggestions));
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        toast.error("Erreur lors de la recherche");
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [onSearch, minCharsToSearch, maxSuggestions, setSelectedIndex]
  );

  // Gestion du changement de requête avec debounce
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setSelectedIndex(-1);
    onQueryChange?.(newQuery);

    // Nettoyer le timer précédent
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Afficher les suggestions récentes si la requête est vide
    if (newQuery.length === 0) {
      setSuggestions([]);
      setHasSearched(false);
      setIsOpen(true);
      return;
    }

    // Lancer la recherche avec debounce
    debounceTimer.current = setTimeout(() => {
      performSearch(newQuery);
    }, debounceMs);

    setIsOpen(true);
  };

  // Gestion de la sélection d'une suggestion
  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.label);
    onSelect(suggestion);
    setIsOpen(false);
    setSuggestions([]);
  };

  // Gestion des raccourcis clavier
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    const allSuggestions = [
      ...suggestions,
      ...(hasSearched ? [] : recentSearches),
      ...(hasSearched ? [] : trendingSuggestions),
    ];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
          handleSelectSuggestion(allSuggestions[selectedIndex]);
        } else if (query.trim()) {
          // Si aucune suggestion n'est sélectionnée, effectuer la recherche
          onSelect({
            id: `search-${query}`,
            label: query,
            category: "search",
          });
          setIsOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Nettoyer le timer au démontage
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const displayedSuggestions =
    query.length === 0 && !hasSearched
      ? [...recentSearches, ...trendingSuggestions].slice(0, maxSuggestions)
      : suggestions;

  const showRecentLabel =
    query.length === 0 && !hasSearched && recentSearches.length > 0;
  const showTrendingLabel =
    query.length === 0 &&
    !hasSearched &&
    recentSearches.length === 0 &&
    trendingSuggestions.length > 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setHasSearched(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Effacer la recherche"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
        )}
      </div>

      {/* Dropdown des suggestions */}
      {isOpen && displayedSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Label des recherches récentes */}
          {showRecentLabel && (
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
              Recherches récentes
            </div>
          )}

          {/* Label des tendances */}
          {showTrendingLabel && (
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              Tendances
            </div>
          )}

          {/* Suggestions */}
          {displayedSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full px-3 py-2 text-left flex items-center gap-3 transition-colors ${
                index === selectedIndex
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : "hover:bg-gray-50"
              }`}
            >
              {suggestion.icon && (
                <span className="text-gray-400 flex-shrink-0">
                  {suggestion.icon}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {suggestion.label}
                </p>
                {suggestion.description && (
                  <p className="text-xs text-gray-500 truncate">
                    {suggestion.description}
                  </p>
                )}
              </div>
              {suggestion.category && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                  {suggestion.category}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* État vide */}
      {isOpen &&
        displayedSuggestions.length === 0 &&
        hasSearched &&
        !isLoading && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-6 text-center">
            <p className="text-gray-500">Aucun résultat trouvé</p>
            <p className="text-xs text-gray-400 mt-1">
              Essayez une autre recherche
            </p>
          </div>
        )}
    </div>
  );
}
