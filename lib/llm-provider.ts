import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export type LLMProvider = 'openai' | 'anthropic';

export interface LLMConfig {
  provider: LLMProvider;
  model?: string;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
  provider: LLMProvider;
}

export interface LLMRequestOptions {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

function isAnthropicAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function isOpenAIAvailable(): boolean {
  return !!(process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY);
}

function getDefaultProvider(): LLMProvider {
  const configuredProvider = process.env.LLM_PROVIDER?.toLowerCase();
  
  if (configuredProvider === 'anthropic' || configuredProvider === 'claude') {
    if (isAnthropicAvailable()) {
      return 'anthropic';
    }
    console.warn('[LLM Provider] Anthropic requested but ANTHROPIC_API_KEY not set. Falling back to OpenAI.');
  }
  
  return 'openai';
}

function getDefaultModel(provider: LLMProvider): string {
  if (provider === 'anthropic') {
    return process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
  }
  return process.env.OPENAI_MODEL || 'gpt-4o';
}

function getOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined,
  });
}

function getAnthropicClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

export async function generateCompletion(
  options: LLMRequestOptions,
  config?: Partial<LLMConfig>
): Promise<LLMResponse> {
  const provider = config?.provider || getDefaultProvider();
  const model = config?.model || getDefaultModel(provider);

  if (provider === 'anthropic' && isAnthropicAvailable()) {
    try {
      return await generateAnthropicCompletion(options, model);
    } catch (error) {
      console.error('[LLM Provider] Anthropic request failed, falling back to OpenAI:', error);
      if (isOpenAIAvailable()) {
        return generateOpenAICompletion(options, getDefaultModel('openai'));
      }
      throw error;
    }
  }
  
  return generateOpenAICompletion(options, model);
}

async function generateOpenAICompletion(
  options: LLMRequestOptions,
  model: string
): Promise<LLMResponse> {
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model,
    messages: options.messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1500,
    ...(options.jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
  });

  const content = response.choices[0]?.message?.content || '';

  return {
    content,
    model: response.model,
    usage: {
      input_tokens: response.usage?.prompt_tokens,
      output_tokens: response.usage?.completion_tokens,
      total_tokens: response.usage?.total_tokens,
    },
    provider: 'openai',
  };
}

async function generateAnthropicCompletion(
  options: LLMRequestOptions,
  model: string
): Promise<LLMResponse> {
  const anthropic = getAnthropicClient();

  const systemMessage = options.messages.find(m => m.role === 'system')?.content;
  const nonSystemMessages = options.messages.filter(m => m.role !== 'system');

  const response = await anthropic.messages.create({
    model,
    max_tokens: options.maxTokens ?? 1500,
    ...(systemMessage ? { system: systemMessage } : {}),
    messages: nonSystemMessages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  const textContent = response.content.find(block => block.type === 'text');
  const content = textContent?.type === 'text' ? textContent.text : '';

  return {
    content,
    model: response.model,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens,
    },
    provider: 'anthropic',
  };
}

export function parseJSONResponse<T>(content: string, fallback: T): T {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in LLM response');
      return fallback;
    }
    return JSON.parse(jsonMatch[0]) as T;
  } catch (error) {
    console.error('Failed to parse LLM JSON response:', error);
    return fallback;
  }
}

export function getCurrentProviderInfo(): { provider: LLMProvider; model: string; available: boolean } {
  const provider = getDefaultProvider();
  const available = provider === 'anthropic' ? isAnthropicAvailable() : isOpenAIAvailable();
  return {
    provider,
    model: getDefaultModel(provider),
    available,
  };
}
