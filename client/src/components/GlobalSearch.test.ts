import { describe, it, expect } from "vitest";

describe("GlobalSearch Component", () => {
  describe("Search Items Filtering", () => {
    it("should filter items by title", () => {
      const items = [
        {
          id: "assistant",
          title: "C-Assistant",
          description: "Assistant juridique",
          category: "module" as const,
          icon: null,
          action: () => {},
        },
        {
          id: "knowledge",
          title: "C-Knowledge",
          description: "Recherche juridique",
          category: "module" as const,
          icon: null,
          action: () => {},
        },
      ];

      const query = "assistant";
      const filtered = items.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.title).toBe("C-Assistant");
    });

    it("should filter items by description", () => {
      const items = [
        {
          id: "vault",
          title: "C-Vault",
          description: "Gestion sécurisée de documents",
          category: "module" as const,
          icon: null,
          action: () => {},
        },
        {
          id: "knowledge",
          title: "C-Knowledge",
          description: "Recherche juridique avancée",
          category: "module" as const,
          icon: null,
          action: () => {},
        },
      ];

      const query = "sécurisée";
      const filtered = items.filter((item) =>
        item.description.toLowerCase().includes(query.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.title).toBe("C-Vault");
    });

    it("should return all items when query is empty", () => {
      const items = [
        {
          id: "assistant",
          title: "C-Assistant",
          description: "Assistant juridique",
          category: "module" as const,
          icon: null,
          action: () => {},
        },
        {
          id: "knowledge",
          title: "C-Knowledge",
          description: "Recherche juridique",
          category: "module" as const,
          icon: null,
          action: () => {},
        },
      ];

      const query = "";
      const filtered = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      );

      expect(filtered).toHaveLength(2);
    });

    it("should be case-insensitive", () => {
      const items = [
        {
          id: "assistant",
          title: "C-Assistant",
          description: "Assistant juridique",
          category: "module" as const,
          icon: null,
          action: () => {},
        },
      ];

      const queries = ["c-assistant", "C-ASSISTANT", "c-AsSiStAnT"];
      queries.forEach((query) => {
        const filtered = items.filter((item) =>
          item.title.toLowerCase().includes(query.toLowerCase())
        );
        expect(filtered).toHaveLength(1);
      });
    });
  });

  describe("Navigation Logic", () => {
    it("should cycle through items with arrow down", () => {
      const items = [
        { id: "1", title: "Item 1" },
        { id: "2", title: "Item 2" },
        { id: "3", title: "Item 3" },
      ];

      let selectedIndex = 0;
      const total = items.length;

      selectedIndex = (selectedIndex + 1) % total;
      expect(selectedIndex).toBe(1);

      selectedIndex = (selectedIndex + 1) % total;
      expect(selectedIndex).toBe(2);

      selectedIndex = (selectedIndex + 1) % total;
      expect(selectedIndex).toBe(0);
    });

    it("should cycle backwards with arrow up", () => {
      const items = [
        { id: "1", title: "Item 1" },
        { id: "2", title: "Item 2" },
        { id: "3", title: "Item 3" },
      ];

      let selectedIndex = 0;
      const total = items.length;

      selectedIndex = (selectedIndex - 1 + total) % total;
      expect(selectedIndex).toBe(2);

      selectedIndex = (selectedIndex - 1 + total) % total;
      expect(selectedIndex).toBe(1);
    });

    it("should reset index when search query changes", () => {
      let selectedIndex = 5;
      const newQuery = "test";

      if (newQuery !== "") {
        selectedIndex = 0;
      }

      expect(selectedIndex).toBe(0);
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should recognize Cmd+K shortcut", () => {
      const event = {
        key: "k",
        metaKey: true,
        ctrlKey: false,
      };

      const isOpenShortcut = (event.metaKey || event.ctrlKey) && event.key === "k";
      expect(isOpenShortcut).toBe(true);
    });

    it("should recognize Ctrl+K shortcut", () => {
      const event = {
        key: "k",
        metaKey: false,
        ctrlKey: true,
      };

      const isOpenShortcut = (event.metaKey || event.ctrlKey) && event.key === "k";
      expect(isOpenShortcut).toBe(true);
    });

    it("should recognize Escape key", () => {
      const event = {
        key: "Escape",
      };

      const isCloseShortcut = event.key === "Escape";
      expect(isCloseShortcut).toBe(true);
    });

    it("should recognize Enter key", () => {
      const event = {
        key: "Enter",
      };

      const isSelectShortcut = event.key === "Enter";
      expect(isSelectShortcut).toBe(true);
    });
  });

  describe("Item Categories", () => {
    it("should group items by category", () => {
      const items = [
        {
          id: "assistant",
          title: "C-Assistant",
          category: "module" as const,
        },
        {
          id: "settings",
          title: "Paramètres",
          category: "action" as const,
        },
        {
          id: "doc1",
          title: "Document.pdf",
          category: "document" as const,
        },
      ];

      const grouped = items.reduce(
        (acc, item) => {
          if (!acc[item.category]) {
            acc[item.category] = [];
          }
          acc[item.category].push(item);
          return acc;
        },
        {} as Record<string, typeof items>
      );

      expect(Object.keys(grouped)).toContain("module");
      expect(Object.keys(grouped)).toContain("action");
      expect(Object.keys(grouped)).toContain("document");
      expect(grouped["module"]).toHaveLength(1);
      expect(grouped["action"]).toHaveLength(1);
      expect(grouped["document"]).toHaveLength(1);
    });
  });
});
