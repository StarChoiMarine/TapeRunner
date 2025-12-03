import type { AIAnalysisResult, RunSession } from '../types/analysis';
import { AI_API_URL, AI_API_KEY, AI_MODEL } from '@env';
import { buildSystemPrompt, buildUserPrompt } from './prompt';

// 호출 형식 확정: 백엔드에 POST /ai/analyze 로 전송할 의도
export type AIRequestPayload = {
  session: Pick<RunSession, 'startedAt' | 'durationSec' | 'left' | 'right'>;
  prompts?: { system: string; user: string };
  options?: { stream?: boolean };
};

// 실제 연동 전까지 모킹
async function mockRequestAnalysis(session: RunSession): Promise<AIAnalysisResult> {
  await new Promise<void>((r) => setTimeout(r, 300));
  const mins = Math.round(session.durationSec / 60);
  const leftSum = Object.values(session.left || {}).reduce((a, b) => a + (b || 0), 0);
  const rightSum = Object.values(session.right || {}).reduce((a, b) => a + (b || 0), 0);
  const tilt = Math.abs(leftSum - rightSum);
  const bias = leftSum > rightSum ? '왼발' : '오른발';

  const biasText = tilt > 0.6 ? `${bias} 편측 하중이 뚜렷합니다.` : '좌우 하중 분포가 비교적 균형적입니다.';

  return {
    text: `세션 길이 ${mins}분. ${biasText} 착지 시 전·후족부 하중 전이가 매끈하도록 보폭과 케이던스를 일정하게 유지하세요. 통증/불편 호소 시 러닝 강도를 낮추고 회복 시간을 확보하세요.`,
    createdAt: new Date().toISOString(),
  };
}


export async function requestAnalysis(session: RunSession, opts?: { signal?: AbortSignal }): Promise<AIAnalysisResult> {
  const API_URL = AI_API_URL || undefined; // 예: https://api.example.com/ai/analyze

  if (API_URL) {
    const system = buildSystemPrompt();
    const user = buildUserPrompt(session);
    // OpenAI Responses API 직접 호출 분기 (엔드포인트가 responses인 경우)
    if (API_URL.includes('/v1/responses')) {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(AI_API_KEY ? { Authorization: `Bearer ${AI_API_KEY}` } : {}),
        },
        body: JSON.stringify({
          model: AI_MODEL || 'gpt-4o-mini',
          input: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          max_output_tokens: 320,
          temperature: 0.4,
        }),
        signal: opts?.signal,
      });
      if (!res.ok) throw new Error(`AI API ${res.status}`);
      const json = await res.json();
      const text = json?.output?.[0]?.content?.[0]?.text || json?.output_text || '';
      return { text, createdAt: new Date().toISOString() };
    } else {
      // 일반 프록시/Chat completions 호환 페이로드
      const payload: AIRequestPayload = {
        session: {
          startedAt: session.startedAt,
          durationSec: session.durationSec,
          left: session.left,
          right: session.right,
        },
        prompts: { system, user },
      };
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(AI_API_KEY ? { Authorization: `Bearer ${AI_API_KEY}` } : {}),
        },
        body: JSON.stringify(payload),
        signal: opts?.signal,
      });
      if (!res.ok) throw new Error(`AI API ${res.status}`);
      const data = (await res.json()) as AIAnalysisResult;
      return data;
    }
  }

  return mockRequestAnalysis(session);
}


