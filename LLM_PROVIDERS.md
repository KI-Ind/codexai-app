# LLM Provider Guide for CodexAI

CodexAI now supports **6 different LLM providers**, giving you maximum flexibility to choose the best option for your needs.

---

## Quick Comparison

| Provider | Cost | Quality | Speed | Privacy | Setup Difficulty |
|----------|------|---------|-------|---------|------------------|
| **OpenAI** | $$$ | ⭐⭐⭐⭐⭐ | Fast | Cloud | Easy |
| **Claude** | $$$ | ⭐⭐⭐⭐⭐ | Fast | Cloud | Easy |
| **DeepSeek** | $ | ⭐⭐⭐⭐ | Fast | Cloud | Easy |
| **Ollama** | FREE | ⭐⭐⭐⭐ | Medium | Local | Medium |
| **Forge** | $$ | ⭐⭐⭐⭐ | Fast | Cloud | Easy |
| **Custom** | Varies | Varies | Varies | Varies | Complex |

---

## 1. OpenAI (Recommended for Production)

### Overview
The original and most widely-used LLM provider. GPT-4 offers the best overall quality for most tasks.

### Pros
- ✅ Best overall quality and reliability
- ✅ Excellent documentation and community support
- ✅ Wide range of models (GPT-4, GPT-3.5-turbo, etc.)
- ✅ Strong embedding models
- ✅ Fast response times

### Cons
- ❌ Requires API key (costs per token)
- ❌ Data sent to cloud
- ❌ Higher cost than alternatives

### Configuration
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_BASE_URL=https://api.openai.com/v1
```

### Available Models
- **gpt-4** - Most capable, best for complex tasks
- **gpt-4-turbo** - Faster, more cost-effective
- **gpt-3.5-turbo** - Fast and economical for simpler tasks

### Pricing (as of Jan 2026)
- GPT-4: ~$30/1M input tokens, ~$60/1M output tokens
- GPT-3.5-turbo: ~$0.50/1M input tokens, ~$1.50/1M output tokens

### Get API Key
https://platform.openai.com/api-keys

---

## 2. Claude (Anthropic) - NEW! 🎉

### Overview
Anthropic's Claude models excel at reasoning, analysis, and handling long contexts (200K tokens).

### Pros
- ✅ Excellent reasoning and analytical capabilities
- ✅ Very long context window (200K tokens)
- ✅ Strong at following instructions precisely
- ✅ Good at ethical reasoning and nuanced tasks
- ✅ Native SDK integration

### Cons
- ❌ Requires API key (costs per token)
- ❌ Data sent to cloud
- ❌ Slightly slower than GPT-4 for some tasks

### Configuration
```env
LLM_PROVIDER=claude
CLAUDE_API_KEY=sk-ant-your-claude-api-key-here
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_BASE_URL=https://api.anthropic.com
```

### Available Models
- **claude-3-5-sonnet-20241022** - Best overall (recommended)
- **claude-3-opus-20240229** - Most capable, highest cost
- **claude-3-sonnet-20240229** - Balanced performance/cost
- **claude-3-haiku-20240307** - Fastest, most economical

### Pricing (as of Jan 2026)
- Claude 3.5 Sonnet: ~$3/1M input tokens, ~$15/1M output tokens
- Claude 3 Opus: ~$15/1M input tokens, ~$75/1M output tokens
- Claude 3 Haiku: ~$0.25/1M input tokens, ~$1.25/1M output tokens

### Get API Key
https://console.anthropic.com/

### Best For
- Complex legal analysis
- Long document processing
- Detailed reasoning tasks
- Ethical decision-making

---

## 3. DeepSeek - NEW! 🎉

### Overview
Cost-effective Chinese LLM with strong performance, especially for coding tasks.

### Pros
- ✅ **Very cost-effective** (~$0.14/1M tokens)
- ✅ Good performance for the price
- ✅ OpenAI-compatible API (easy to integrate)
- ✅ Strong coding capabilities (deepseek-coder)
- ✅ Fast response times

### Cons
- ❌ Requires API key
- ❌ Data sent to cloud (Chinese servers)
- ❌ Newer provider, less battle-tested
- ❌ May have language/cultural biases

### Configuration
```env
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

### Available Models
- **deepseek-chat** - General purpose (recommended)
- **deepseek-coder** - Specialized for code generation

### Pricing (as of Jan 2026)
- DeepSeek Chat: ~$0.14/1M input tokens, ~$0.28/1M output tokens
- **Significantly cheaper than OpenAI/Claude!**

### Get API Key
https://platform.deepseek.com/

### Best For
- Cost-conscious deployments
- High-volume applications
- Code generation tasks
- Testing and development

---

## 4. Ollama (Best for Self-Hosted)

### Overview
Run open-source LLMs locally on your own hardware. **Completely free and private.**

### Pros
- ✅ **100% FREE** - no API costs
- ✅ **100% PRIVATE** - data never leaves your server
- ✅ No API key required
- ✅ Wide range of open-source models
- ✅ Full control over deployment
- ✅ No rate limits

### Cons
- ❌ Requires local GPU (or slow CPU inference)
- ❌ Slower than cloud APIs
- ❌ Quality varies by model
- ❌ Requires more setup and maintenance

### Configuration
```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

### Setup Instructions
```bash
# 1. Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# 2. Pull models
ollama pull llama3
ollama pull nomic-embed-text

# 3. Ollama runs automatically on http://localhost:11434
```

### Available Models (Examples)
- **llama3** - Meta's Llama 3 (8B or 70B)
- **mistral** - Mistral 7B (fast and capable)
- **mixtral** - Mixtral 8x7B (very capable)
- **codellama** - Specialized for code
- **phi** - Microsoft Phi-2 (small and fast)
- **gemma** - Google's Gemma models

### Hardware Requirements
- **Minimum:** 8GB RAM, CPU inference (slow)
- **Recommended:** 16GB+ RAM, NVIDIA GPU with 8GB+ VRAM
- **Optimal:** 32GB+ RAM, NVIDIA GPU with 24GB+ VRAM

### Best For
- Privacy-focused deployments
- Cost-sensitive applications
- Development and testing
- Air-gapped environments
- High-volume usage

---

## 5. Manus Forge

### Overview
Integrated Manus platform using Gemini 2.5 Flash.

### Pros
- ✅ Integrated with Manus ecosystem
- ✅ Good performance
- ✅ Fast response times

### Cons
- ❌ Requires Manus account
- ❌ Less flexible than other options

### Configuration
```env
LLM_PROVIDER=forge
BUILT_IN_FORGE_API_KEY=your-forge-api-key
BUILT_IN_FORGE_API_URL=https://forge.manus.im
```

---

## 6. Custom OpenAI-Compatible API

### Overview
Use any OpenAI-compatible API endpoint (Azure OpenAI, LocalAI, vLLM, etc.).

### Pros
- ✅ Maximum flexibility
- ✅ Can use any compatible provider
- ✅ Supports custom deployments

### Cons
- ❌ Requires compatible API
- ❌ More complex setup
- ❌ Quality and performance vary

### Configuration
```env
LLM_PROVIDER=custom
CUSTOM_LLM_BASE_URL=https://your-api.com/v1
CUSTOM_LLM_API_KEY=your-api-key
CUSTOM_LLM_MODEL=your-model-name
CUSTOM_LLM_EMBEDDING_MODEL=your-embedding-model
```

### Compatible Providers
- Azure OpenAI
- LocalAI
- vLLM
- LM Studio
- Text Generation WebUI
- FastChat
- And many more...

---

## Recommendations by Use Case

### For Production (Best Quality)
**Recommended:** OpenAI or Claude
```env
LLM_PROVIDER=openai
OPENAI_MODEL=gpt-4
```
or
```env
LLM_PROVIDER=claude
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

### For Cost-Effective Production
**Recommended:** DeepSeek
```env
LLM_PROVIDER=deepseek
DEEPSEEK_MODEL=deepseek-chat
```

### For Privacy/Self-Hosted
**Recommended:** Ollama
```env
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3
STORAGE_PROVIDER=local
```

### For Development/Testing
**Recommended:** Ollama (free) or DeepSeek (cheap)
```env
LLM_PROVIDER=ollama
OLLAMA_MODEL=mistral
```

### For Long Documents
**Recommended:** Claude (200K context)
```env
LLM_PROVIDER=claude
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

### For Code Generation
**Recommended:** DeepSeek Coder or CodeLlama
```env
LLM_PROVIDER=deepseek
DEEPSEEK_MODEL=deepseek-coder
```

---

## Switching Providers

Switching between providers is easy - just update your `.env` file:

```bash
# Stop application
pm2 stop codexai  # or however you're running it

# Edit .env file
nano .env

# Change LLM_PROVIDER and related settings
LLM_PROVIDER=claude
CLAUDE_API_KEY=sk-ant-your-key
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Restart application
pm2 restart codexai
```

No code changes required!

---

## Cost Comparison (1M tokens)

| Provider | Input Cost | Output Cost | Total (50/50) |
|----------|------------|-------------|---------------|
| OpenAI GPT-4 | $30 | $60 | $45 |
| OpenAI GPT-3.5 | $0.50 | $1.50 | $1 |
| Claude 3.5 Sonnet | $3 | $15 | $9 |
| Claude 3 Haiku | $0.25 | $1.25 | $0.75 |
| DeepSeek Chat | $0.14 | $0.28 | $0.21 |
| Ollama | $0 | $0 | $0 |

---

## Performance Comparison

### Response Quality (Legal Tasks)
1. **OpenAI GPT-4** - ⭐⭐⭐⭐⭐
2. **Claude 3.5 Sonnet** - ⭐⭐⭐⭐⭐
3. **OpenAI GPT-3.5** - ⭐⭐⭐⭐
4. **DeepSeek Chat** - ⭐⭐⭐⭐
5. **Ollama Llama3** - ⭐⭐⭐⭐
6. **Ollama Mistral** - ⭐⭐⭐

### Response Speed
1. **OpenAI GPT-3.5** - ⚡⚡⚡⚡⚡
2. **DeepSeek** - ⚡⚡⚡⚡⚡
3. **Claude 3 Haiku** - ⚡⚡⚡⚡
4. **OpenAI GPT-4** - ⚡⚡⚡⚡
5. **Claude 3.5 Sonnet** - ⚡⚡⚡
6. **Ollama (GPU)** - ⚡⚡⚡
7. **Ollama (CPU)** - ⚡

---

## Troubleshooting

### OpenAI: "Invalid API key"
- Check your API key at https://platform.openai.com/api-keys
- Ensure no extra spaces in `.env` file
- Verify API key has sufficient credits

### Claude: "Authentication error"
- Get API key from https://console.anthropic.com/
- API key should start with `sk-ant-`
- Check account has credits

### DeepSeek: "Unauthorized"
- Register at https://platform.deepseek.com/
- Generate API key in dashboard
- Verify account is activated

### Ollama: "Connection refused"
- Ensure Ollama is running: `ollama serve`
- Check port 11434 is not blocked
- Verify model is pulled: `ollama list`

### General: "Model not found"
- Check model name matches provider's available models
- Update `.env` with correct model name
- Restart application after changes

---

## Support

For issues or questions:
- Check `.env.example` for configuration examples
- See `DEPLOYMENT.md` for deployment guide
- Open issue on GitHub: https://github.com/KI-Ind/codexai-app/issues

---

**Last Updated:** January 3, 2026  
**Supported Providers:** 6 (OpenAI, Claude, DeepSeek, Ollama, Forge, Custom)
