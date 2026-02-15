type DeepAnalysisResult = {
  alternatives: string[];
};

export async function requestDeepAnalysis(text: string): Promise<DeepAnalysisResult> {
  const normalized = text.trim();

  if (!normalized) {
    return { alternatives: [] };
  }

  return {
    alternatives: []
  };
}
