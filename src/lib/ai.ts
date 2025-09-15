/**
 * Утилита для работы с AI API (Groq)
 */

// Динамический импорт groq-sdk для избежания проблем с сборкой
let groqClient: any = null;

async function getGroqClient() {
	if (!groqClient) {
		try {
			const { Groq } = await import('groq-sdk');
			groqClient = new Groq({
				apiKey: process.env.GROQ_API_KEY || '',
			});
		} catch (error) {
			console.error('Failed to load Groq SDK:', error);
			throw new Error('Groq SDK not available');
		}
	}
	return groqClient;
}

export interface AIMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface AIResponse {
	content: string;
	tokens: number;
	model: string;
	responseTime: number;
}

/**
 * Отправляет сообщение в AI и получает ответ
 */
export async function sendAIMessage(
	messages: AIMessage[],
	options?: {
		model?: string;
		temperature?: number;
		maxTokens?: number;
	},
): Promise<AIResponse> {
	const startTime = Date.now();

	try {
		const groq = await getGroqClient();
		const completion = await groq.chat.completions.create({
			model: options?.model || process.env.GROQ_MODEL || 'llama3-8b-8192',
			messages: messages.map((msg) => ({
				role: msg.role,
				content: msg.content,
			})),
			temperature: options?.temperature || 0.7,
			max_tokens: options?.maxTokens || 2048,
			stream: false,
		});

		const responseTime = Date.now() - startTime;
		const content = completion.choices[0]?.message?.content || '';
		const tokens = completion.usage?.total_tokens || 0;

		return {
			content,
			tokens,
			model: completion.model,
			responseTime: responseTime / 1000, // в секундах
		};
	} catch (error) {
		console.error('AI API Error:', error);
		throw new Error('Ошибка при обращении к AI API');
	}
}

/**
 * Проверяет статус AI API
 */
export async function checkAIStatus(): Promise<{
	available: boolean;
	latency: number;
	error?: string;
}> {
	const startTime = Date.now();

	try {
		// Проверяем наличие API ключа
		if (!process.env.GROQ_API_KEY) {
			return {
				available: false,
				latency: Date.now() - startTime,
				error: 'GROQ_API_KEY not configured',
			};
		}

		const groq = await getGroqClient();

		// Простой тест-запрос
		await groq.chat.completions.create({
			model: process.env.GROQ_MODEL || 'llama3-8b-8192',
			messages: [{ role: 'user', content: 'Test' }],
			max_tokens: 1,
		});

		const latency = Date.now() - startTime;

		return {
			available: true,
			latency,
		};
	} catch (error) {
		return {
			available: false,
			latency: Date.now() - startTime,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

/**
 * Системный промпт по умолчанию для AI ассистента портфолио
 */
export const DEFAULT_SYSTEM_PROMPT = `Ты ИИ-ассистент портфолио сайта kirdro.ru разработчика Кирилла Дроздова.

Твоя цель - помочь посетителям узнать больше о:
- Проектах Кирилла и его разработках
- Навыках и опыте в веб-разработке
- Технологиях которые он использует (React, Next.js, TypeScript, Node.js, PostgreSQL и др.)
- Контактной информации для сотрудничества

ВАЖНЫЕ ПРАВИЛА:
- Отвечай дружелюбно, профессионально и по существу
- Пиши на русском языке
- Если не знаешь точного ответа, честно скажи об этом
- При необходимости предложи связаться напрямую с Кириллом
- Не выдумывай информацию о проектах или навыках
- Помогай посетителям понять, подходит ли Кирилл для их задач

Кирилл - опытный fullstack разработчик, специализирующийся на современных веб-технологиях.`;

/**
 * Модели AI доступные в системе
 */
export const AI_MODELS = {
	'llama3-8b-8192': 'Llama 3 8B (быстрый)',
	'llama3-70b-8192': 'Llama 3 70B (качественный)',
	'mixtral-8x7b-32768': 'Mixtral 8x7B (сбалансированный)',
} as const;

export type AIModel = keyof typeof AI_MODELS;
