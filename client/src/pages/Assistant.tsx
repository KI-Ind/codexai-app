import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import ContextualSearch, { SearchSuggestion } from "@/components/ContextualSearch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Lightbulb } from "lucide-react";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

export default function Assistant() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<SearchSuggestion[]>([
    {
      id: "q1",
      label: "Quels sont mes droits en cas de licenciement?",
      description: "Droit du travail",
      category: "Récent",
      icon: <Lightbulb className="w-4 h-4" />,
    },
    {
      id: "q2",
      label: "Comment rédiger un contrat de location?",
      description: "Droit immobilier",
      category: "Récent",
      icon: <Lightbulb className="w-4 h-4" />,
    },
  ]);

  const trendingQuestions: SearchSuggestion[] = useMemo(
    () => [
      {
        id: "trend1",
        label: "Procédure de divorce en France",
        description: "Droit de la famille",
        category: "Tendance",
        icon: <Lightbulb className="w-4 h-4" />,
      },
      {
        id: "trend2",
        label: "Obligations du bailleur",
        description: "Droit immobilier",
        category: "Tendance",
        icon: <Lightbulb className="w-4 h-4" />,
      },
    ],
    []
  );

  // Récupérer les conversations
  const { data: conversations, isLoading: conversationsLoading } = trpc.assistant.listConversations.useQuery();

  // Récupérer les messages
  const { data: messages } = trpc.assistant.getMessages.useQuery(
    { conversationId: selectedConversationId || 0 },
    { enabled: !!selectedConversationId }
  );

  // Créer une nouvelle conversation
  const createConvMutation = trpc.assistant.createConversation.useMutation({
    onSuccess: (conv) => {
      setSelectedConversationId(conv.id);
    },
  });

  // Envoyer un message
  const sendMessageMutation = trpc.assistant.sendMessage.useMutation({
    onSuccess: () => {
      setMessageInput("");
    },
  });

  const handleSendMessage = async () => {
    if (!selectedConversationId || !messageInput.trim()) return;

    setIsLoading(true);
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        message: messageInput,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    await createConvMutation.mutateAsync({
      title: `Conversation du ${new Date().toLocaleDateString("fr-FR")}`,
    });
  };

  // Fonction de recherche pour les suggestions
  const handleSearch = async (query: string): Promise<SearchSuggestion[]> => {
    if (!query.trim()) return [];

    // Simuler une recherche - en production, cela appellerait une API
    const allQuestions = [...recentQuestions, ...trendingQuestions];
    return allQuestions.filter(
      (q) =>
        q.label.toLowerCase().includes(query.toLowerCase()) ||
        q.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setMessageInput(suggestion.label);
    // Ajouter à la liste des questions récentes
    if (!recentQuestions.some((q) => q.id === suggestion.id)) {
      setRecentQuestions([
        { ...suggestion, category: "Récent" },
        ...recentQuestions.slice(0, 4),
      ]);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">C-Assistant</h1>
          <p className="text-gray-600 mt-2">Assistant juridique conversationnel pour le droit français</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Recherche et Conversations */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recherche rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ContextualSearch
                  placeholder="Posez une question..."
                  onSearch={handleSearch}
                  onSelect={handleSelectSuggestion}
                  recentSearches={recentQuestions}
                  trendingSuggestions={trendingQuestions}
                  minCharsToSearch={1}
                  debounceMs={200}
                  maxSuggestions={6}
                />
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Conversations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={handleCreateConversation} className="w-full" variant="default">
                  Nouvelle conversation
                </Button>

                {conversationsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations?.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversationId(conv.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedConversationId === conv.id
                            ? "bg-blue-100 text-blue-900"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {conv.title}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main - Chat */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>
                  {selectedConversationId
                    ? conversations?.find((c) => c.id === selectedConversationId)?.title
                    : "Sélectionnez une conversation"}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages?.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Streamdown>{msg.content}</Streamdown>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Input */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Continuez votre conversation..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={!selectedConversationId || isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!selectedConversationId || isLoading || !messageInput.trim()}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
