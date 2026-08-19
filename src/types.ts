export type Severity = "critical" | "warning" | "info";

export interface Diagnostic {
  startLine: number;
  endLine: number;
  severity: Severity;
  title: string;
  message: string;
  remediation: string;
}

export interface PerformanceAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  bottleneck: string;
}

export interface AnalysisResult {
  language: string;
  plainLanguageSummary: string;
  performanceAnalysis: PerformanceAnalysis;
  diagnostics: Diagnostic[];
  optimizedCode: string;
}

/** Derived client-side metrics */
export interface CodeMetrics {
  linesOfCode: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  /** 0–100 health score: 100 − (critical×20) − (warning×5) − (info×1), clamped */
  healthScore: number;
}

export function deriveMetrics(
  code: string,
  diagnostics: Diagnostic[] = []
): CodeMetrics {
  const linesOfCode = code ? code.split("\n").length : 0;
  const criticalCount = diagnostics.filter((d) => d.severity === "critical").length;
  const warningCount = diagnostics.filter((d) => d.severity === "warning").length;
  const infoCount = diagnostics.filter((d) => d.severity === "info").length;

  const healthScore = Math.max(
    0,
    Math.min(100, 100 - criticalCount * 20 - warningCount * 5 - infoCount * 1)
  );

  return { linesOfCode, criticalCount, warningCount, infoCount, healthScore };
}