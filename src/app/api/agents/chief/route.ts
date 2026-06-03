// ─────────────────────────────────────────────────────────
// POST /api/agents/chief
//
// The Chief orchestrates. Christy talks to her.
// She calls scouts as needed via Claude tool-calling,
// logs every action to agent_logs (live feed),
// and returns a synthesized reply.
// ─────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Tool definitions ─────────────────────────────────────
const tools: Anthropic.Tool[] = [
  {
    name: 'call_research_scout',
    description: 'Calls the Research Scout to pull or update market research — Hispanic business owner stats, AI adoption rates, education gaps, SMB data. Use when Christy asks about data, stats, or market research.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'call_brand_scout',
    description: "Calls the Brand Scout to write and publish a post to Substack in Christy's voice. Use when Christy asks for a post, article, newsletter, or content piece.",
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Title of the post' },
        content: { type: 'string', description: "Full post body in Christy's voice — casual, warm, behind-the-scenes. Short paragraphs. Personal story first, then the lesson." },
        related_app: { type: 'string', description: 'Optional — app being featured (e.g. PalmTreeFit)' },
      },
      required: ['title', 'content'],
    },
  },
]

// ── Chief system prompt ──────────────────────────────────
const CHIEF_SYSTEM = `You are the Chief — orchestrator for The Forwardist, Christy Mederos's build-in-public platform.

WHO CHRISTY IS:
- Educator with a decade in education, built AI tools for her district (10k+ bot uses)
- Finishing the Overclock AI Ops Accelerator
- Bilingual (English/Spanish), passionate about the Hispanic community and small business owners
- Building in public — documenting the whole messy, real process
- Built 7 apps: PalmTreeFit, GoldRush All Stars, PLC Dashboard, Stop & Jot, Tag Team Family, Restaurant OS (Spanish), Real Estate App (Spanish)

YOUR JOB:
- Christy talks to you. You figure out what needs to happen and call the right scouts.
- Never tell her to go run an agent herself — you handle it and report back.
- Be direct, warm, and efficient. You know her well.
- When you call a scout, briefly tell Christy what you're doing ("On it — pulling that with Research Scout…")
- After a scout returns, synthesize the result into a clean reply. Don't dump raw data.

SCOUTS AVAILABLE:
- call_research_scout: updates the research report with latest market data
- call_brand_scout: writes + publishes a post to Substack in Christy's voice

TONE: Confident, warm, capable. Like a great chief of staff who knows the business inside out.`

// ── Scout callers ────────────────────────────────────────
async function callResearchScout(): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/api/agents/research`, { method: 'POST' })
    const data = await res.json()
    return data.success
      ? 'Research report updated with latest Hispanic business market stats.'
      : `Research Scout error: ${data.error}`
  } catch (e: unknown) {
    return `Research Scout failed: ${(e as Error).message}`
  }
}

async function callBrandScout(input: { title: string; content: string; related_app?: string }): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/api/agents/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, agent_name: 'Brand Scout' }),
    })
    const data = await res.json()
    if (data.success) {
      return data.draft_sent
        ? `Post "${input.title}" drafted and sent to Substack.`
        : `Post "${input.title}" saved as a draft.`
    }
    return `Brand Scout error: ${data.error}`
  } catch (e: unknown) {
    return `Brand Scout failed: ${(e as Error).message}`
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    if (!message) return NextResponse.json({ error: 'message is required' }, { status: 400 })

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        reply: "I need an Anthropic API key to think. Add ANTHROPIC_API_KEY to your environment variables, then restart."
      })
    }

    // Log Chief receiving the task
    await supabase.from('agent_logs').insert({
      agent_name: 'Chief',
      action: 'received_task',
      output: { message: `Task: "${message.slice(0, 80)}${message.length > 80 ? '…' : ''}"` },
      status: 'success',
    })

    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: message }
    ]

    let finalReply = ''
    let iterations = 0

    // ── Agentic loop ─────────────────────────────────────
    while (iterations < 5) {
      iterations++

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: CHIEF_SYSTEM,
        tools,
        messages,
      })

      // Collect text
      const textBlocks = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text')
      if (textBlocks.length > 0) {
        finalReply = textBlocks.map(b => b.text).join('\n')
      }

      // Done if no tool use
      if (response.stop_reason !== 'tool_use') break

      // Add model response to history
      messages.push({ role: 'assistant', content: response.content })

      // Execute tool calls
      const toolResults: Anthropic.ToolResultBlockParam[] = []
      for (const block of response.content) {
        if (block.type !== 'tool_use') continue
        const scoutName = block.name === 'call_research_scout' ? 'Research Scout' : 'Brand Scout'

        await supabase.from('agent_logs').insert({
          agent_name: scoutName,
          action: 'called_by_chief',
          output: { message: `Chief delegated to ${scoutName}` },
          status: 'running',
        })

        let result = ''
        if (block.name === 'call_research_scout') {
          result = await callResearchScout()
        } else if (block.name === 'call_brand_scout') {
          result = await callBrandScout(block.input as { title: string; content: string; related_app?: string })
        }

        await supabase.from('agent_logs').insert({
          agent_name: scoutName,
          action: 'completed',
          output: { message: result },
          status: 'success',
        })

        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result })
      }

      messages.push({ role: 'user', content: toolResults })
    }

    return NextResponse.json({ reply: finalReply || 'Done — check the activity feed for details.' })

  } catch (err: unknown) {
    const error = err as Error
    console.error('[/api/agents/chief]', error.message)
    await supabase.from('agent_logs').insert({
      agent_name: 'Chief',
      action: 'error',
      output: { message: error.message },
      status: 'error',
    })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
