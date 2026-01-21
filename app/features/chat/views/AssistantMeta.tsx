import { QueryRouting } from "@/lib/streaming/types"

export function AssistantMeta({ selectedModel, queryRouting }: {
  selectedModel?: string;
  queryRouting?: QueryRouting;
}) {
  if (!selectedModel && !queryRouting) return null;

  return (
    <div className="mt-2 text-xs text-muted-foreground">
      {selectedModel && (
        <span className="inline-flex items-center rounded-md border px-2 py-0.5 font-mono">
          {selectedModel}
        </span>
      )}

      {queryRouting?.grades?.length ? (
        <details className="mt-2">
          <summary className="cursor-pointer select-none">
            routing scores
          </summary>
          <ul className="mt-2 space-y-1">
            {queryRouting.grades.map((g) => (
              <li key={g.model} className="flex justify-between gap-3">
                <span className="font-mono">{g.model}</span>
                <span>{g.score}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
