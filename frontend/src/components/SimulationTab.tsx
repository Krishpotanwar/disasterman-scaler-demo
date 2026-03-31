import { simulate } from '../api/client'
import { useSimulation } from '../hooks/useSimulation'
import { DisasterMap } from './DisasterMap'
import { ResourceBar } from './ResourceBar'
import { EventFeed } from './EventFeed'
import { AgentReasoningPanel } from './AgentReasoningPanel'
import { ScorePanel } from './ScorePanel'
import type { TaskInfo } from '../types'

interface Props {
  tasks: TaskInfo[]
  selectedTask: string
  setSelectedTask: (t: string) => void
  selectedAgent: 'greedy' | 'random' | 'ai_4stage'
  setSelectedAgent: (a: 'greedy' | 'random' | 'ai_4stage') => void
}

const AGENT_LABELS: Record<string, string> = {
  greedy: 'Greedy Heuristic',
  random: 'Random Agent',
  ai_4stage: '4-Stage AI (Groq)',
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'text-green-400',
  medium: 'text-orange-400',
  hard: 'text-red-400',
}

export function SimulationTab({
  tasks, selectedTask, setSelectedTask, selectedAgent, setSelectedAgent,
}: Props) {
  const sim = useSimulation()
  const task = tasks.find(t => t.task_id === selectedTask)

  const run = () => {
    sim.load(() => simulate(selectedTask, selectedAgent))
  }

  // Initial observation (step 0 before anything plays)
  const obs = sim.currentStep?.observation ?? null
  const action = sim.currentStep?.action ?? null
  const reasoning = sim.currentStep?.reasoning ?? null

  const falseSOSZones = task?.false_sos_zones ?? []

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Task selector */}
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Task</label>
            <select
              value={selectedTask}
              onChange={e => setSelectedTask(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
            >
              {tasks.map(t => (
                <option key={t.task_id} value={t.task_id}>
                  {t.name} ({t.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* Agent selector */}
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Agent</label>
            <select
              value={selectedAgent}
              onChange={e => setSelectedAgent(e.target.value as 'greedy' | 'random' | 'ai_4stage')}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
            >
              {Object.entries(AGENT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Speed */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 uppercase tracking-wider">Speed</label>
            <div className="flex rounded-lg overflow-hidden border border-zinc-700">
              {(['slow', 'normal', 'fast'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => sim.setSpeed(s)}
                  className={`px-3 py-2 text-xs capitalize transition-colors ${
                    sim.speed === s
                      ? 'bg-zinc-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={run}
              disabled={sim.isLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              {sim.isLoading ? 'Running AI…' : '▶ Run'}
            </button>
            {sim.result && (
              <>
                <button
                  onClick={sim.isPlaying ? sim.pause : sim.play}
                  className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm transition-colors"
                >
                  {sim.isPlaying ? '⏸' : '▷'}
                </button>
                <button
                  onClick={sim.reset}
                  className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm transition-colors"
                >
                  ↺
                </button>
              </>
            )}
          </div>
        </div>

        {/* Task info */}
        {task && (
          <div className="mt-3 pt-3 border-t border-zinc-800 flex gap-4 text-xs text-zinc-500">
            <span className={DIFFICULTY_COLOR[task.difficulty]}>{task.difficulty.toUpperCase()}</span>
            <span>{task.zones} zones</span>
            <span>{task.max_steps} steps</span>
            {task.false_sos_zones.length > 0 && (
              <span className="text-yellow-600">⚠️ {task.false_sos_zones.length} false SOS zones</span>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {sim.error && (
        <div className="bg-red-950 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
          {sim.error}
        </div>
      )}

      {/* Loading */}
      {sim.isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
          <div className="text-4xl mb-4 animate-spin">⚙</div>
          <p className="text-sm">Running {AGENT_LABELS[selectedAgent]}…</p>
          <p className="text-xs text-zinc-600 mt-1">
            {selectedAgent === 'ai_4stage'
              ? 'This takes ~30–60s (PyTorch → Triage → Planner → Action per step)'
              : 'Computing greedy heuristic…'}
          </p>
        </div>
      )}

      {/* Main content */}
      {sim.result && obs && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Map + resources */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-medium">
                  Disaster Map — Step {sim.currentStep?.step ?? 0} / {sim.result.steps_taken}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  obs.weather === 'clear' ? 'bg-green-900 text-green-400' :
                  obs.weather === 'storm' ? 'bg-yellow-900 text-yellow-400' :
                  'bg-blue-900 text-blue-400'
                }`}>
                  {obs.weather === 'clear' ? '☀️ Clear' : obs.weather === 'storm' ? '⛈ Storm' : '🌊 Flood'}
                </span>
              </div>
              <DisasterMap
                zones={obs.zones}
                action={action}
                falseSOSZones={falseSOSZones}
                pytorchScores={reasoning?.pytorch_scores}
              />
            </div>
            <ResourceBar
              resources={obs.resources}
              initial={sim.result.steps[0]?.observation.resources}
            />
          </div>

          {/* Right: Score + reasoning + feed */}
          <div className="space-y-4">
            <ScorePanel result={sim.result} currentStepIndex={sim.currentStepIndex} />
            {reasoning && (
              <AgentReasoningPanel reasoning={reasoning} agent={AGENT_LABELS[sim.result.agent] ?? sim.result.agent} />
            )}
          </div>
        </div>
      )}

      {/* Event feed (full width below) */}
      {sim.result && sim.result.steps.length > 0 && (
        <EventFeed steps={sim.result.steps} currentStepIndex={sim.currentStepIndex} />
      )}

      {/* Step scrubber */}
      {sim.result && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
            Step Scrubber — {sim.currentStepIndex + 1} / {sim.result.steps_taken}
          </label>
          <input
            type="range"
            min={0}
            max={sim.result.steps.length - 1}
            value={sim.currentStepIndex}
            onChange={e => sim.seekTo(parseInt(e.target.value))}
            className="w-full accent-red-500"
          />
        </div>
      )}
    </div>
  )
}
