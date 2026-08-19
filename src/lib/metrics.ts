import type { AnalysisResult, CodeMetrics } from "../types";

export function computeMetrics(code: string, analysis: AnalysisResult): CodeMetrics {
  const linesOfCode = code.split("\n").filter((l) => l.trim().length > 0).length;
  
  const criticalCount = analysis.diagnostics.filter((d) => d.severity === "critical").length;
  const warningCount = analysis.diagnostics.filter((d) => d.severity === "warning").length;
  const infoCount = analysis.diagnostics.filter((d) => d.severity === "info").length;

  // Weighted health score calculation (Max 100)
  const penalty = criticalCount * 25 + warningCount * 10 + infoCount * 3;
  const healthScore = Math.max(0, 100 - penalty);

  return {
    healthScore,
    linesOfCode,
    criticalCount,
    warningCount,
    infoCount,
  };
}