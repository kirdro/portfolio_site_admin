import { useState } from "react";

interface AIRequest {
  action: "complete" | "improve" | "summarize" | "translate";
  content: string;
  context?: string;
  language?: string;
}

interface AIResponse {
  result: string;
  action: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export function useBlogAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAI = async (request: AIRequest): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/blog-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка сервера");
      }

      const data: AIResponse = await response.json();
      return data.result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const completeText = (content: string, context?: string) => {
    return callAI({
      action: "complete",
      content,
      context,
      language: "ru",
    });
  };

  const improveText = (content: string) => {
    return callAI({
      action: "improve",
      content,
      language: "ru",
    });
  };

  const summarizeText = (content: string) => {
    return callAI({
      action: "summarize", 
      content,
      language: "ru",
    });
  };

  const translateText = (content: string, targetLanguage: "ru" | "en" = "en") => {
    return callAI({
      action: "translate",
      content,
      language: targetLanguage,
    });
  };

  return {
    isLoading,
    error,
    completeText,
    improveText,
    summarizeText,
    translateText,
    callAI,
  };
}