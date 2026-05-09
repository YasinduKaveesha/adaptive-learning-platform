/**
 * API client for Component A backend (FastAPI).
 *
 * Base URL is resolved per platform:
 *  - Android emulator: 10.0.2.2 (host loopback)
 *  - iOS simulator / physical device: localhost
 *
 * Override via the API_BASE_URL env variable for production.
 */

import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';
import type {
  ClassificationResponse,
  Language,
  SessionSnapshot,
  StartScreeningResponse,
  SubmitResponseResponse,
  StartGrade5ScreeningResponse,
  Grade5DemoTasksResponse,
  SubmitGrade5ResponseResponse,
} from '../types';

const DEFAULT_HOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export const API_BASE_URL: string =
  (typeof process !== 'undefined' && (process.env as any)?.EXPO_PUBLIC_API_BASE_URL) ||
  DEFAULT_HOST;

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function handleError(err: unknown): never {
  if (err instanceof AxiosError && err.response) {
    const { error, message } = err.response.data as { error?: string; message?: string };
    throw new Error(message ?? error ?? 'API error');
  }
  throw err;
}

// ── Endpoints ────────────────────────────────────────────────────────────────

export async function startScreening(
  studentId: string,
  language: Language,
  initiatedBy = 'self',
): Promise<StartScreeningResponse> {
  try {
    const { data } = await client.post<StartScreeningResponse>(
      `/api/v1/students/${studentId}/screening/start`,
      { initiated_by: initiatedBy, language_preference: language, context: 'initial_screening' },
    );
    return data;
  } catch (err) {
    return handleError(err);
  }
}

export async function submitResponse(
  sessionId: string,
  itemId: string,
  correct: boolean,
  reactionTimeMs: number,
  hesitationCount = 0,
): Promise<SubmitResponseResponse> {
  try {
    const { data } = await client.post<SubmitResponseResponse>(
      `/api/v1/screening/sessions/${sessionId}/respond`,
      {
        item_id: itemId,
        correct,
        reaction_time_ms: reactionTimeMs,
        hesitation_count: hesitationCount,
      },
    );
    return data;
  } catch (err) {
    return handleError(err);
  }
}

export async function getClassification(
  studentId: string,
): Promise<ClassificationResponse> {
  try {
    const { data } = await client.get<ClassificationResponse>(
      `/api/v1/students/${studentId}/classification`,
    );
    return data;
  } catch (err) {
    return handleError(err);
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    await client.get('/health');
    return true;
  } catch {
    return false;
  }
}

// ── Grade 5 Adaptive Screening Endpoints ─────────────────────────────────────

export async function startGrade5Screening(
  studentId: string,
  language: Language,
  initiatedBy = 'self',
): Promise<StartGrade5ScreeningResponse> {
  try {
    const { data } = await client.post<StartGrade5ScreeningResponse>(
      `/api/v1/students/${studentId}/screening/grade5/start`,
      { initiated_by: initiatedBy, language_preference: language, grade_level: 5 },
    );
    return data;
  } catch (err) {
    return handleError(err);
  }
}

export async function getGrade5DemoTasks(): Promise<Grade5DemoTasksResponse> {
  try {
    const { data } = await client.get<Grade5DemoTasksResponse>(
      '/api/v1/task-bank/grade5/demo',
    );
    return data;
  } catch (err) {
    return handleError(err);
  }
}

export async function submitGrade5Response(
  sessionId: string,
  taskId: string,
  correct: boolean,
  reactionTimeMs: number,
  hesitationCount = 0,
  hintUsed = false,
): Promise<SubmitGrade5ResponseResponse> {
  try {
    const { data } = await client.post<SubmitGrade5ResponseResponse>(
      `/api/v1/screening/grade5/sessions/${sessionId}/respond`,
      {
        task_id: taskId,
        correct,
        reaction_time_ms: reactionTimeMs,
        hesitation_count: hesitationCount,
        hint_used: hintUsed,
      },
    );
    return data;
  } catch (err) {
    return handleError(err);
  }
}
