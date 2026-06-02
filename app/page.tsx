'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('realtime-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_logs' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchData)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchData() {
    const [logData, taskData, leadData, productData] = await Promise.all([
      supabase.from('agent_logs').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
    ])
    if (logData.data) setLogs(logData.data)
    if (taskData.data) setTasks(taskData.data)
    if (leadData.data) setLeads(leadData.data)
    if (productData.data) setProducts(productData.data)
  }

  const agentRoster = [
    { name: 'Research Scout', color: 'bg-green-500' },
    { name: 'Brand Scout', color: 'bg-pink-500' },
    { name: 'Lead Tracker', color: 'bg-yellow-500' },
    { name: 'Product Librarian', color: 'bg-blue-500' },
    { name: 'Pricing Monitor', color: 'bg-orange-500' },
    { name: 'Curriculum Architect', color: 'bg-purple-500' },
  ]

  const statusColors: Record<string, string> = {
    new: 'bg-blue-900 text-blue-300',
    contacted: 'bg-yellow-900 text-yellow-300',
    proposal: 'bg-orange-900 text-orange-300',
    closed: 'bg-green-900 text-green-300',
    live: 'bg-green-900 text-green-300',
    building: 'bg-yellow-900 text-yellow-300',
    'giving away': 'bg-blue-900 text-blue-300',
    selling: 'bg-purple-900 text-purple-300',
    success: 'bg-green-900 text-green-300',
    error: 'bg-red-900 text-red-300',
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">AI School HQ</h1>
          <p className="text-gray-400 mt-1">Mission Control — Your AI-Powered Business OS</p>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Mission Log */}
          <div className="bg-gray-900 rounded-xl p-6 col-span-3">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Mission Log</h2>
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">Waiting for agent activity...</p>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 border-b border-gray-800 pb-3">
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                    <span className="text-blue-400 text-sm font-medium w-36 shrink-0">{log.agent_name}</span>
                    <span className="text-gray-300 text-sm flex-1">{log.action}</span>
                    {log.output?.message && (
                      <span className="text-gray-500 text-xs flex-1 truncate">{log.output.message}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColors[log.status] ?? 'bg-gray-800 text-gray-400'}`}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leads */}
          <div className="bg-gray-900 rounded-xl p-6 col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Leads</h2>
            {leads.length === 0 ? (
              <p className="text-gray-500 text-sm">No leads yet...</p>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div key={lead.id} className="border-b border-gray-800 pb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{lead.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[lead.status] ?? 'bg-gray-800 text-gray-400'}`}>
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{lead.what_they_want}</p>
                    {lead.source && <p className="text-xs text-gray-600 mt-0.5">via {lead.source}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products */}
          <div className="bg-gray-900 rounded-xl p-6 col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Products</h2>
            {products.length === 0 ? (
              <p className="text-gray-500 text-sm">No products yet...</p>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="border-b border-gray-800 pb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{product.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[product.status] ?? 'bg-gray-800 text-gray-400'}`}>
                        {product.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{product.description}</p>
                    {product.url && (
                      <a href={product.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-400 mt-0.5 block truncate">
                        {product.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agent Roster */}
          <div className="bg-gray-900 rounded-xl p-6 col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Agent Roster</h2>
            <div className="space-y-3">
              {agentRoster.map((agent) => {
                const lastSeen = logs.find(l => l.agent_name === agent.name)
                return (
                  <div key={agent.name} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${lastSeen ? agent.color : 'bg-gray-700'}`}></div>
                    <span className="text-sm text-gray-300 flex-1">{agent.name}</span>
                    {lastSeen && (
                      <span className="text-xs text-gray-600">
                        {new Date(lastSeen.created_at).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Task Queue */}
          <div className="bg-gray-900 rounded-xl p-6 col-span-3">
            <h2 className="text-xl font-semibold mb-4 text-orange-400">Task Queue</h2>
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No tasks queued...</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {tasks.map((task) => (
                  <div key={task.id} className="border border-gray-800 rounded-lg p-3">
                    <p className="text-sm text-white">{task.task}</p>
                    <p className="text-xs text-gray-500 mt-1">→ {task.assigned_to}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${statusColors[task.status] ?? 'bg-gray-800 text-gray-400'}`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}
