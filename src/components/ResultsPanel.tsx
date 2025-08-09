"use client";

import { useMemo } from "react";
import type { PredictResponse } from "@/lib/api";
import { IconBarChart } from "./Icons";

export default function ResultsPanel({ result }: { result: PredictResponse | null }) {
  const top5 = useMemo(() => {
    if (!result) return [] as Array<{ label: string; value: number }>;
    return Object.entries(result.all_predictions)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [result]);

  if (!result) {
    return (
      <div className="text-sm text-black/60">No prediction yet. Upload an image to see results.</div>
    );
  }

  return (
    <div className="space-y-4 text-black">
      <div>
        <div className="text-xs uppercase text-black/60">Predicted class</div>
        <div className="text-lg md:text-xl font-semibold break-words">{result.predicted_class}</div>
        <div className="text-sm text-black/60">Confidence: {(result.confidence_score * 100).toFixed(2)}%</div>
      </div>

      <div>
        <div className="text-xs uppercase text-black/60 mb-2 flex items-center gap-2">
          <IconBarChart />
          Top probabilities
        </div>
        <ul className="space-y-1">
          {top5.map((p) => (
            <li key={p.label} className="flex items-center gap-3">
              <div className="w-32 md:w-40 truncate" title={p.label}>{p.label}</div>
              <div className="flex-1 h-2 bg-black/10 rounded">
                <div className="h-2 bg-black rounded" style={{ width: `${(p.value * 100).toFixed(1)}%` }} />
              </div>
              <div className="w-14 text-right text-sm">{(p.value * 100).toFixed(1)}%</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-xs text-black/60">
        Prediction ID: {result.prediction_id} • {new Date(result.created_at).toLocaleString()} • {result.processing_time.toFixed(3)}s
      </div>
    </div>
  );
}


