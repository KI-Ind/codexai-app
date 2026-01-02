import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Command, MessageSquare, BookOpen, Lock, FileText, Settings, LogOut, Home } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: "module" | "action" | "document";
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { data: documents } = trpc.vault.listDocuments.useQuery();

  // Éléments de recherche disponibles
  const searchItems: SearchItem[] = [
    // Modules
    {
      id: "assistant",
      title: "C-Assistant",
      description: "Assistant juridique conversationnel",
      category: "module",
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => {
        setLocation("/assistant");
        setIsOpen(false);
      },
      shortcut: "⌘A",
    },
    {
      id: "knowledge",
      title: "C-Knowledge",
      description: "Recherche juridique avancée (Légifrance, Judilibre)",
      category: "module",
      icon: <BookOpen className="w-4 h-4" />,
      action: () => {
        setLocation("/knowledge");
        setIsOpen(false);
      },
      shortcut: "⌘K",
    },
    {
      id: "vault",
      title: "C-Vault",
      description: "Gestion sécurisée de vos documents privés",
      category: "module",
      icon: <Lock className="w-4 h-4" />,
      action: () => {
        setLocation("/vault");
        setIsOpen(false);
      },
      shortcut: "⌘V",
    },
    {
      id: "dashboard",
      title: "Dashboard",
      description: "Accueil et statistiques",
      category: "module",
      icon: <Home className="w-4 h-4" />,
      action: () => {
        setLocation("/dashboard");
        setIsOpen(false);
      },
    },
    // Actions
    {
      id: "settings",
      title: "Paramètres",
      description: "Gérer vos préférences et votre profil",
      category: "action",
      icon: <Settings className="w-4 h-4" />,
      action: () => {
        toast.info("Paramètres - Fonctionnalité à venir");
        setIsOpen(false);
      },
    },
    {
      id: "logout",
      title: "Déconnexion",
      description: "Se déconnecter de CodexAI",
      category: "action",
      icon: <LogOut className="w-4 h-4" />,
      action: () => {
        logout();
        setIsOpen(false);
      },
    },
  ];

  // Ajouter les documents du Vault à la recherche
  const allItems: SearchItem[] = [
    ...searchItems,
    ...(documents?.map((doc) => ({
      id: `doc-${doc.id}`,
      title: doc.fileName,
      description: `${(doc.fileSize / 1024).toFixed(2)} KB • ${new Date(doc.createdAt).toLocaleDateString("fr-FR")}`,
      category: "document" as const,
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        setLocation("/vault");
        toast.info(`Document: ${doc.fileName}`);
        setIsOpen(false);
      },
    })) || []),
  ];

  // Filtrer les éléments en fonction de la recherche
  const filteredItems = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K pour ouvrir la recherche
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
        setSearchQuery("");
        setSelectedIndex(0);
      }

      // Fermer avec Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }

      // Navigation avec les flèches
      if (isOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
        }
        if (e.key === "Enter" && filteredItems.length > 0) {
          e.preventDefault();
          filteredItems[selectedIndex]?.action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems]);

  // Réinitialiser l'index sélectionné quand la recherche change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  return (
    <>
      {/* Bouton de recherche dans la barre de navigation */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 text-sm transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Rechercher...</span>
        <kbd className="ml-auto text-xs bg-white px-2 py-1 rounded border border-gray-300">
          ⌘K
        </kbd>
      </button>

      {/* Modal de recherche */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Contenu de la recherche */}
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Barre de recherche */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Rechercher modules, documents, actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-lg"
              />
              <kbd className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                ESC
              </kbd>
            </div>

            {/* Résultats */}
            {filteredItems.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {/* Grouper par catégorie */}
                {["module", "document", "action"].map((category) => {
                  const itemsInCategory = filteredItems.filter(
                    (item) => item.category === category
                  );
                  if (itemsInCategory.length === 0) return null;

                  return (
                    <div key={category}>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                        {category === "module" && "Modules"}
                        {category === "document" && "Documents"}
                        {category === "action" && "Actions"}
                      </div>
                      {itemsInCategory.map((item, idx) => {
                        const globalIndex = filteredItems.indexOf(item);
                        return (
                          <button
                            key={item.id}
                            onClick={() => item.action()}
                            className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                              globalIndex === selectedIndex
                                ? "bg-blue-50 border-l-4 border-blue-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="text-gray-400">{item.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900">
                                {item.title}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                {item.description}
                              </p>
                            </div>
                            {item.shortcut && (
                              <kbd className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 whitespace-nowrap">
                                {item.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-12 text-center">
                <p className="text-gray-500">Aucun résultat trouvé</p>
                <p className="text-sm text-gray-400 mt-1">
                  Essayez une autre recherche
                </p>
              </div>
            )}

            {/* Footer avec raccourcis */}
            {filteredItems.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <kbd className="bg-white px-2 py-1 rounded border border-gray-300">
                      ↑↓
                    </kbd>
                    <span>Naviguer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-white px-2 py-1 rounded border border-gray-300">
                      ⏎
                    </kbd>
                    <span>Sélectionner</span>
                  </div>
                </div>
                <span>
                  {selectedIndex + 1} / {filteredItems.length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
