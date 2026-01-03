import { ENV } from "./env";
import Anthropic from "@anthropic-ai/sdk";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = <T>(value: T | T[]): T[] => {
  return Array.isArray(value) ? value : [value];
};

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if (typeof toolChoice === "object" && "name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice as ToolChoiceExplicit;
};

const getEndpoint = () => {
  switch (ENV.llmProvider) {
    case "openai":
      return `${ENV.openaiBaseUrl}/chat/completions`;
    
    case "ollama":
      return `${ENV.ollamaBaseUrl}/chat/completions`;
    
    case "deepseek":
      return `${ENV.deepseekBaseUrl}/chat/completions`;
    
    case "custom":
      if (!ENV.customLlmBaseUrl) {
        throw new Error("CUSTOM_LLM_BASE_URL is required when using custom provider");
      }
      return `${ENV.customLlmBaseUrl}/chat/completions`;
    
    case "claude":
      // Claude uses SDK, not REST endpoint
      return "";
    
    case "forge":
    default:
      if (ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0) {
        return `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`;
      }
      return "https://forge.manus.im/v1/chat/completions";
  }
};

const assertApiKey = () => {
  switch (ENV.llmProvider) {
    case "openai":
      if (!ENV.openaiApiKey) {
        throw new Error("OPENAI_API_KEY is not configured");
      }
      break;
    
    case "claude":
      if (!ENV.claudeApiKey) {
        throw new Error("CLAUDE_API_KEY is not configured");
      }
      break;
    
    case "deepseek":
      if (!ENV.deepseekApiKey) {
        throw new Error("DEEPSEEK_API_KEY is not configured");
      }
      break;
    
    case "ollama":
      // Ollama typically doesn't require an API key for local instances
      break;
    
    case "custom":
      if (!ENV.customLlmApiKey) {
        console.warn("CUSTOM_LLM_API_KEY is not configured. Proceeding without authentication.");
      }
      break;
    
    case "forge":
      if (!ENV.forgeApiKey) {
        throw new Error("FORGE_API_KEY is not configured");
      }
      break;
  }
};

const getApiKey = () => {
  switch (ENV.llmProvider) {
    case "openai":
      return ENV.openaiApiKey;
    case "claude":
      return ENV.claudeApiKey;
    case "deepseek":
      return ENV.deepseekApiKey;
    case "ollama":
      return ""; // Ollama doesn't require API key
    case "custom":
      return ENV.customLlmApiKey || "";
    case "forge":
    default:
      return ENV.forgeApiKey;
  }
};

const getModel = () => {
  switch (ENV.llmProvider) {
    case "openai":
      return ENV.openaiModel;
    case "claude":
      return ENV.claudeModel;
    case "deepseek":
      return ENV.deepseekModel;
    case "ollama":
      return ENV.ollamaModel;
    case "custom":
      return ENV.customLlmModel;
    case "forge":
    default:
      return "gemini-2.5-flash";
  }
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

// Convert OpenAI format messages to Claude format
const convertToClaudeMessages = (messages: Message[]): { role: string; content: string }[] => {
  const claudeMessages: { role: string; content: string }[] = [];
  let systemMessage = "";

  for (const msg of messages) {
    if (msg.role === "system") {
      // Claude handles system messages separately
      const content = typeof msg.content === "string" 
        ? msg.content 
        : ensureArray(msg.content)
            .map(c => typeof c === "string" ? c : c.type === "text" ? c.text : "")
            .join("\n");
      systemMessage += (systemMessage ? "\n\n" : "") + content;
    } else {
      const content = typeof msg.content === "string"
        ? msg.content
        : ensureArray(msg.content)
            .map(c => typeof c === "string" ? c : c.type === "text" ? c.text : "")
            .join("\n");
      
      claudeMessages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content,
      });
    }
  }

  return claudeMessages;
};

// Invoke Claude using Anthropic SDK
async function invokeClaudeLLM(params: InvokeParams): Promise<InvokeResult> {
  const anthropic = new Anthropic({
    apiKey: ENV.claudeApiKey,
  });

  const { messages, maxTokens, max_tokens } = params;
  
  // Extract system message
  let systemMessage = "";
  const claudeMessages = convertToClaudeMessages(messages);

  // Find system message
  for (const msg of messages) {
    if (msg.role === "system") {
      const content = typeof msg.content === "string"
        ? msg.content
        : ensureArray(msg.content)
            .map(c => typeof c === "string" ? c : c.type === "text" ? c.text : "")
            .join("\n");
      systemMessage += (systemMessage ? "\n\n" : "") + content;
    }
  }

  const response = await anthropic.messages.create({
    model: getModel(),
    max_tokens: maxTokens || max_tokens || 4096,
    system: systemMessage || undefined,
    messages: claudeMessages.filter(m => m.role !== "system"),
  });

  // Convert Claude response to OpenAI format
  const content = response.content
    .map(block => block.type === "text" ? block.text : "")
    .join("\n");

  return {
    id: response.id,
    created: Date.now(),
    model: response.model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content,
        },
        finish_reason: response.stop_reason || "stop",
      },
    ],
    usage: {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  };
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();

  // Use Claude SDK if provider is claude
  if (ENV.llmProvider === "claude") {
    return invokeClaudeLLM(params);
  }

  // For all other providers, use OpenAI-compatible REST API
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const normalizedMessages = messages.map(normalizeMessage);
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  const payload: Record<string, unknown> = {
    model: getModel(),
    messages: normalizedMessages,
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  if (params.maxTokens || params.max_tokens) {
    payload.max_tokens = params.maxTokens || params.max_tokens;
  }

  const endpoint = getEndpoint();
  const apiKey = getApiKey();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM API request failed (${response.status}): ${errorText}`
    );
  }

  const result = await response.json();
  return result as InvokeResult;
}
