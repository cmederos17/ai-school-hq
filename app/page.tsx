'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    fetchData()
    
    // Real-time listener — updates live as agents write to database
    const channel = supabase
      .channel('realtime-logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_logs' }, fetchData)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchData() {
    const { data: logData } = await supabase.from('agent_logs').select('*').order('created_at', { ascending: false }).limit(20)
    const { data: taskData } = await supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(10)
    if (logData) setLogs(logData)
    if (taskData) setTasks(taskData)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">AI School HQ</h1>
          <p className="text-gray-400 mt-1">Mission Control — Agent Activity Dashboard</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          
          {/* Mission Log */}
          <div className="bg-gray-900 rounded-xl p-6 col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Mission Log</h2>
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">Waiting for agent activity...</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 border-b border-gray-800 pb-3">
                    <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                    <span className="text-blue-400 text-sm font-medium">{log.agent_name}</span>
                    <span className="text-gray-300 text-sm">{log.action}</span>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                      log.status === 'completed' ? 'bg-green-900 text-green-300' : 
                      log.status === 'pending_review' ? 'bg-yellow-900 text-yellow-300' : 
                      'bg-red-900 text-red-300'
                    }`}>{log.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task Queue */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Task Queue</h2>
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No tasks queued...</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="border-b border-gray-800 pb-3">
                    <p className="text-sm text-white">{task.task}</p>
                    <p className="text-xs text-gray-500 mt-1">→ {task.assigned_to}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agent Roster */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Agent Roster</h2>
            <div className="space-y-2">
              {['Curriculum Architect', 'Competitor Spy', 'Research Scout', 'Ad Copywriter', 'Onboarding Concierge', 'Newsletter Writer'].map((agent) => (
                <div key={agent} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                  <span className="text-sm text-gray-300">{agent}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}