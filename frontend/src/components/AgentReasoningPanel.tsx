import { useState } from 'react'
import type { Reasoning } from '../types'

interface Props {
  reasoning: Reasoning
  agent: string
}

function Section({ title, content, defaultOpen = false }: { title: string; content: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center px-3 py-2 text-xs bg-zinc-900 hover:bg-zinc-800 transition-colors text-left"
      >
        <span className="font-medium text-zinc-300">{title}</span>
        <span className="text-zinc-600">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-3 py-2 bg-zinc-950 text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap mono">
          {content}
        </div>
      )}
    </div>
  )
}

export function AgentReasoningPanel({ reasoning, agent }: Props) {
  const scoreLines = reasoning.pytorch_scores
    .map(s => {
      const tag = s.is_false_sos_suspect ? ' ⚠️ FALSE SOS' : ''
      return `Zone ${s.zone_id}: ${s.score.toFixed(3)}${tag}`
    })
    .join('\n')

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Agent Reasoning</h3>
        <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{agent}</span>
      </div>
      <Section title="🧠 PyTorch Zone Scores" content={scoreLines} defaultOpen />
      <Section title="🔍 Triage Analysis" content={reasoning.triage_summary} />
      <Section title="📋 Planning Decision" content={reasoning.plan_decision || '(no plan data)'} />
      <Section title="✅ Action Rationale" content={reasoning.action_rationale} defaultOpen />
    </div>
  )
}
