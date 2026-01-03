# CodexAI Platform Independence Implementation Plan

## Phase 1: Authentication System Replacement

### Current State
- Relies on Manus OAuth for authentication
- Session management via JWT cookies from external provider
- No local user credential storage

### Target State
- Local email/password authentication
- Bcrypt password hashing
- JWT-based session management
- Role-based access control (admin, user)

### Changes Required
1. Add password field to users table
2. Create registration and login endpoints
3. Implement JWT signing and verification
4. Remove Manus OAuth dependencies
5. Update client login/registration UI

## Phase 2: Database Independence

### Current State
- MySQL with Drizzle ORM (good foundation)
- Environment-based DATABASE_URL
- Missing seed scripts

### Target State
- Self-hosted MySQL
- Complete migration scripts
- Seed script with initial admin user
- All data stored locally

### Changes Required
1. Verify database schema completeness
2. Create seed script for initial admin
3. Document database setup process

## Phase 3: External Service Dependencies

### Current Dependencies to Address
1. **Manus OAuth** - Replace with local auth ✓
2. **Manus Forge API (LLM)** - Make configurable, support OpenAI API
3. **Storage Proxy** - Replace with direct S3 SDK or local filesystem

### Changes Required
1. Add OpenAI API support as alternative to Forge
2. Implement direct S3 operations
3. Add local filesystem storage option
4. Make all external services configurable

## Phase 4: Pending Features to Complete

### C-Assistant
- [x] Basic conversation flow
- [ ] Streaming responses
- [ ] Better error handling

### C-Vault
- [x] Document upload flow
- [ ] Document encryption at rest
- [ ] Semantic search implementation
- [ ] Document deletion

### C-Knowledge
- [x] Basic search structure
- [ ] Légifrance API integration
- [ ] Judilibre API integration
- [ ] Citation extraction

### RAG Pipeline
- [x] Basic embedding simulation
- [ ] Real embedding service integration
- [ ] Vector similarity search optimization
- [ ] Document ingestion pipeline

## Phase 5: Deployment Preparation

### Requirements
1. Environment variable documentation
2. Docker configuration (optional)
3. Build scripts
4. Health check endpoints
5. Logging configuration

### Deliverables
1. Deployed application URL
2. Admin credentials
3. Setup documentation
4. API documentation
