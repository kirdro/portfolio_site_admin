import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '~/server/auth';
import Groq from 'groq-sdk';

// Проверяем наличие GROQ_API_KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const groq =
	GROQ_API_KEY ?
		new Groq({
			apiKey: GROQ_API_KEY,
		})
	:	null;

interface AIRequest {
	action: 'complete' | 'improve' | 'summarize' | 'translate';
	content: string;
	context?: string;
	language?: string;
}

export async function POST(request: NextRequest) {
	try {
		// Проверяем наличие Groq API
		if (!groq) {
			return NextResponse.json(
				{
					error: 'AI функции временно недоступны - не настроен GROQ_API_KEY',
				},
				{ status: 503 },
			);
		}

		// Проверяем аутентификацию
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: 'Необходима авторизация' },
				{ status: 401 },
			);
		}

		const body = (await request.json()) as AIRequest;
		const { action, content, context, language = 'ru' } = body;

		if (!content) {
			return NextResponse.json(
				{ error: 'Содержание не может быть пустым' },
				{ status: 400 },
			);
		}

		let systemPrompt = '';
		let userPrompt = '';

		switch (action) {
			case 'complete':
				systemPrompt = `Ты опытный технический писатель и блогер. Твоя задача - логично и естественно продолжить текст статьи. 
        Пиши на ${language === 'ru' ? 'русском' : 'английском'} языке. 
        Сохраняй стиль и тон исходного текста. 
        Результат должен быть полезным и информативным.`;
				userPrompt = `Продолжи следующий текст статьи:\n\n${content}\n\nКонтекст: ${context || 'технический блог'}`;
				break;

			case 'improve':
				systemPrompt = `Ты редактор технических текстов. Улучши предоставленный текст, сделав его более читаемым, структурированным и профессиональным. 
        Сохрани изначальный смысл и ${language === 'ru' ? 'русский' : 'английский'} язык.
        Исправь грамматические ошибки и улучши стилистику.`;
				userPrompt = `Улучши следующий текст:\n\n${content}`;
				break;

			case 'summarize':
				systemPrompt = `Ты специалист по созданию кратких изложений. Создай краткое и информативное резюме предоставленного текста на ${language === 'ru' ? 'русском' : 'английском'} языке. 
        Выдели основные идеи и ключевые моменты.`;
				userPrompt = `Создай краткое изложение следующего текста:\n\n${content}`;
				break;

			case 'translate':
				const targetLang = language === 'ru' ? 'английский' : 'русский';
				systemPrompt = `Ты профессиональный переводчик технических текстов. Переведи текст на ${targetLang} язык, сохраняя технические термины и смысл.`;
				userPrompt = `Переведи следующий текст:\n\n${content}`;
				break;

			default:
				return NextResponse.json(
					{ error: 'Неподдерживаемое действие' },
					{ status: 400 },
				);
		}

		const completion = await groq.chat.completions.create({
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userPrompt },
			],
			model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
			temperature: 0.7,
			max_tokens: 2048,
			top_p: 1,
			stream: false,
		});

		const result = completion.choices[0]?.message?.content || '';

		if (!result) {
			return NextResponse.json(
				{ error: 'Не удалось сгенерировать ответ' },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			result,
			action,
			usage: completion.usage,
		});
	} catch (error) {
		console.error('Ошибка API блог AI:', error);

		if (error instanceof Error) {
			return NextResponse.json(
				{ error: `Ошибка обработки: ${error.message}` },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 },
		);
	}
}
