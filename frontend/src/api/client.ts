import type { SimResult, CompareResult, TaskInfo } from '../types'

const rawEnvBase = import.meta.env.VITE_API_URL?.trim()
const normalizedEnvBase = rawEnvBase ? rawEnvBase.replace(/\/+$/, '') : ''
const BASE = normalizedEnvBase || (import.meta.env.PROD ? '/api' : 'http://localhost:7860')

export class ApiError extends Error {
  status: number
  body: string
  url: string

  constructor(status: number, body: string, url: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
    this.url = url
  }
}

function buildUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${BASE}${normalizedPath}`
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = buildUrl(path)

  try {
    const res = await fetch(url, options)
    if (!res.ok) {
      const err = await res.text()
      throw new ApiError(res.status, err, url, `API error ${res.status}: ${err}`)
    }
    return res.json() as Promise<T>
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    const message = error instanceof Error ? error.message : String(error)
    throw new ApiError(0, message, url, `Network error: ${message}`)
  }
}

export function getApiInfo() {
  return {
    base: BASE,
    mode: normalizedEnvBase ? 'direct' : import.meta.env.PROD ? 'proxy' : 'local',
    env: normalizedEnvBase || '(not set)',
  } as const
}

export async function fetchTasks(): Promise<TaskInfo[]> {
  const data = await request<{ tasks: TaskInfo[] }>('/tasks')
  return data.tasks
}

export async function simulate(
  taskId: string,
  agent: 'greedy' | 'random' | 'ai_4stage' = 'greedy',
): Promise<SimResult> {
  return request<SimResult>(`/simulate/${taskId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent }),
  })
}

export async function compare(taskId: string): Promise<CompareResult> {
  return request<CompareResult>(`/compare/${taskId}`, { method: 'POST' })
}
