export type QueryRouting = {
  selected_model: string;
  grades: Array<{
    model: string;
    grade_label: string;
    grade_value: number;
    score: number;
  }>;
};

export type ChatCompletionChunk = {
  id?: string;
  object?: string;
  choices?: Array<{
    index?: number;
    finish_reason?: string | null;
    delta?: {
      content?: string;
      reasoning_content?: string;
      reasoning?: string;
      role?: "assistant" | "user" | "system" | string;
    };
  }>;
  query_routing?: QueryRouting;
};
