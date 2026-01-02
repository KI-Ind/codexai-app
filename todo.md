# CodexAI - MVP Todo List

## Phase 1 : Initialisation et Structure
- [x] Initialiser le projet avec scaffold web-db-user
- [x] Configurer les variables d'environnement (LLM, S3, RGPD)
- [x] Créer la documentation d'architecture du projet

## Phase 2 : Base de Données et Schéma
- [x] Créer le schéma Drizzle pour les utilisateurs (avec rôles RBAC)
- [x] Créer le schéma pour les documents du C-Vault
- [x] Créer le schéma pour les embeddings et métadonnées RAG
- [x] Créer le schéma pour les conversations C-Assistant
- [x] Créer le schéma pour les sources publiques (Légifrance, Judilibre)
- [x] Mettre en place les migrations Drizzle

## Phase 3 : Pipeline RAG
- [x] Implémenter le module d'embedding (utiliser LLM API ou modèle local)
- [x] Configurer PgVector pour le stockage des embeddings
- [ ] Développer le pipeline d'ingestion des données publiques (Légifrance PISTE API)
- [ ] Développer le pipeline d'ingestion des données publiques (Judilibre API)
- [x] Implémenter la récupération (retrieval) avec filtrage par tenant
- [x] Implémenter le re-ranking des résultats
- [ ] Tester la qualité des embeddings et la pertinence du RAG

## Phase 4 : Module C-Assistant
- [x] Créer la procédure tRPC pour les requêtes conversationnelles
- [x] Implémenter l'intégration LLM (Mistral AI ou équivalent)
- [x] Ajouter le contexte système pour le droit français
- [x] Implémenter la gestion des conversations (historique)
- [x] Créer l'interface UI pour le chat conversationnel
- [ ] Ajouter le streaming des réponses LLM
- [ ] Tester la qualité des réponses juridiques

## Phase 5 : Module C-Knowledge
- [x] Créer la procédure tRPC pour la recherche RAG publique
- [ ] Implémenter le système de citation automatique
- [ ] Ajouter les filtres de recherche (juridiction, date, matière)
- [ ] Implémenter la veille législative (alertes sur modifications)
- [x] Créer l'interface UI pour la recherche et les résultats
- [ ] Tester les citations et la traçabilité des sources
- [ ] Valider la conformité avec les API Légifrance/Judilibre

## Phase 6 : Module C-Vault
- [x] Créer la procédure tRPC pour l'upload de documents
- [ ] Implémenter le chiffrement des documents (au repos)
- [ ] Configurer S3 pour le stockage sécurisé
- [ ] Implémenter l'isolation multi-tenant stricte
- [ ] Créer la procédure tRPC pour la recherche sémantique privée
- [ ] Implémenter l'extraction de clauses (NER/extraction)
- [x] Créer l'interface UI pour l'upload et la gestion des documents
- [ ] Créer l'interface UI pour la recherche sémantique
- [ ] Tester l'isolation multi-tenant et la sécurité

## Phase 7 : Dashboard et Navigation
- [x] Créer le layout du Dashboard avec sidebar
- [x] Implémenter la navigation entre les modules (Assistant, Knowledge, Vault)
- [x] Ajouter le profil utilisateur et la gestion des rôles
- [x] Créer les pages de chaque module
- [ ] Implémenter la barre de recherche globale
- [x] Ajouter les états de chargement et d'erreur

## Phase 8 : Authentification et RBAC
- [ ] Configurer l'authentification OAuth Manus
- [ ] BUG : Message "Non authentifié" au lieu du Dashboard (cookie de session non envoyé avec les requêtes tRPC)
- [ ] Implémenter le système de rôles (user, admin, lawyer)
- [ ] Créer les procédures protectedProcedure pour chaque module
- [ ] Implémenter le contrôle d'accès aux documents du Vault (RBAC)
- [ ] Tester les permissions et l'accès aux ressources

## Phase 9 : Conformité RGPD et Sécurité
- [ ] Implémenter le chiffrement TLS 1.3 pour les communications
- [ ] Mettre en place la politique zero-training (LLM API)
- [ ] Créer le processus d'anonymisation des données (NER)
- [ ] Implémenter le droit à l'oubli (suppression des données)
- [ ] Créer la documentation RGPD et AIVP
- [ ] Configurer les alertes propriétaire (notifyOwner)
- [ ] Tester la conformité RGPD

## Phase 10 : Tests et Validation
- [ ] Écrire les tests unitaires pour le RAG (vitest)
- [ ] Écrire les tests unitaires pour les procédures tRPC
- [ ] Écrire les tests d'intégration pour le pipeline RAG
- [ ] Tester la performance et la latence
- [ ] Valider la qualité des réponses juridiques
- [ ] Tester les scénarios de sécurité (injection, fuite de données)
- [ ] Créer le premier checkpoint stable

## Phase 11 : Déploiement et Documentation
- [ ] Configurer le CI/CD (si applicable)
- [ ] Créer la documentation utilisateur
- [ ] Créer la documentation développeur
- [ ] Préparer le déploiement en production
- [ ] Configurer les alertes et le monitoring

## Fonctionnalités Futures (Post-MVP)
- [ ] Module C-Draft (rédaction assistée de documents)
- [ ] Intégration Microsoft Word (plugin)
- [ ] Support multilingue (anglais, autres langues UE)
- [ ] Workflows avancés (agents multi-étapes)
- [ ] Analytics et tableau de bord utilisateur
- [ ] API publique pour les intégrateurs tiers
