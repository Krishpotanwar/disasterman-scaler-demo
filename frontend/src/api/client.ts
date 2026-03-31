import type { SimResult, CompareResult, TaskInfo } from '../types'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:7860'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }
  return res.json() as Promise<T>
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
