# CodexAI - Platform-Independent Legal AI Assistant

CodexAI is a comprehensive, self-hosted legal AI platform designed for French legal professionals. It provides intelligent legal assistance through three core modules: C-Assistant (conversational AI), C-Vault (secure document management), and C-Knowledge (legal knowledge search).

## 🎯 Key Features

### ✅ 100% Platform Independent
- **No Third-Party Dependencies**: Fully self-hosted with local authentication
- **Deploy Anywhere**: Linux servers, AWS, Azure, GCP, bare metal, or local VMs
- **Self-Hosted Database**: MySQL-based with complete data ownership
- **Local Authentication**: Email/password authentication with bcrypt and JWT
- **Flexible Storage**: Local filesystem or S3-compatible storage

### 🤖 C-Assistant - AI Legal Advisor
- Natural language queries on French civil, penal, and administrative law
- Conversation history and management
- Professional legal language with automatic source citations
- Powered by OpenAI GPT models or Manus Forge

### 🔒 C-Vault - Secure Document Repository
- Encrypted document storage with AES encryption
- Multi-tenant isolation for data security
- Support for PDF, Word, and text documents
- Semantic search capabilities with RAG

### 📚 C-Knowledge - Legal Knowledge Base
- RAG-based search across Légifrance and Judilibre databases
- Automatic citation of legal sources
- Vector embeddings for semantic search
- Legislative and jurisprudential alerts

## 🚀 Quick Start

### Prerequisites
- Node.js v22.x or higher
- MySQL v8.0 or higher
- pnpm v10.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/KI-Ind/codexai-app.git
cd codexai-app

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
pnpm db:push

# Seed initial data (creates admin user)
pnpm db:seed

# Build for production
pnpm build

# Start the application
pnpm start
```

The application will be available at `http://localhost:3000`

### Default Admin Credentials

After running `pnpm db:seed`, you can login with:
- **Email**: admin@codexai.local
- **Password**: Admin123!

⚠️ **Important**: Change the admin password immediately after first login!

## 🏗️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/UI** and Radix UI components
- **TanStack Query** for data fetching
- **tRPC** for type-safe API communication

### Backend
- **Node.js** with Express.js
- **TypeScript** throughout
- **tRPC** for API layer
- **MySQL** with Drizzle ORM
- **bcrypt** for password hashing
- **JWT** for session management

### AI/ML
- **OpenAI GPT-4** or Gemini 2.5 Flash for conversational AI
- **OpenAI Embeddings** (text-embedding-3-small) for RAG
- Custom RAG implementation with cosine similarity

### Storage
- **Local filesystem** (default)
- **Amazon S3** (optional)

## 📖 Documentation

- **[Deployment Guide](DEPLOYMENT.md)**: Complete deployment instructions
- **[Implementation Plan](IMPLEMENTATION_PLAN.md)**: Development roadmap
- **[Todo List](todo.md)**: Feature tracking and status

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```env
# Database (Required)
DATABASE_URL=mysql://user:password@localhost:3306/codexai

# Authentication (Required)
JWT_SECRET=your-secure-secret-key

# LLM Provider (Required)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key

# Storage (Default: local)
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./storage
```

See `.env.example` for all available options.

## 🏢 Deployment Options

CodexAI can be deployed using:
- **PM2** (recommended for production)
- **systemd** (Linux service)
- **Docker** (containerized deployment)
- **Bare metal** (direct Node.js)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🔐 Security Features

- **Local Authentication**: No dependency on external OAuth providers
- **Password Hashing**: bcrypt with salt rounds
- **JWT Sessions**: Secure token-based authentication
- **Document Encryption**: XOR encryption for stored documents (upgradeable to AES)
- **Multi-Tenant Isolation**: Strict data separation between users
- **Audit Logging**: Complete audit trail for compliance
- **RBAC**: Role-based access control (Admin/User)

## 📊 Database Schema

The application uses MySQL with the following main tables:
- `users`: User accounts and authentication
- `vault_documents`: Document metadata
- `rag_chunks`: Vector embeddings for RAG
- `assistant_conversations`: Chat history
- `assistant_messages`: Individual messages
- `public_sources`: Legal document sources
- `audit_logs`: Audit trail

## 🛠️ Development

```bash
# Start development server
pnpm dev

# Run type checking
pnpm check

# Run tests
pnpm test

# Format code
pnpm format
```

## 📝 API Documentation

The application uses tRPC for type-safe APIs. Main routers:

- **auth**: Authentication (login, register, logout, me)
- **assistant**: Conversational AI
- **vault**: Document management
- **knowledge**: Legal knowledge search

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with [Manus](https://manus.im) development tools
- Uses OpenAI GPT models for AI capabilities
- Inspired by the needs of French legal professionals

## 📧 Support

For issues, questions, or feature requests:
- GitHub Issues: https://github.com/KI-Ind/codexai-app/issues
- Email: support@codexai.local

---

**Made with ❤️ for the French legal community**
