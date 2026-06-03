// ─────────────────────────────────────────────────────────
// POST /api/voice/briefing
//
// 1. Receives live dashboard stats from the Command Center
// 2. Calls Claude to write an opinionated Chief-of-Staff briefing
// 3. Sends the text to ElevenLabs TTS
// 4. Returns audio/mpeg so the browser can play it directly
// ─────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'

interface AttentionItem {
  title: string
  desc: string
  badge: string
}

interface BriefingStats {
  activeAgents: number
  missionLogs: number
  openLeads: number
  newToday: number
  monthlyCost: number
  attentionItems: AttentionItem[]
  students: number
}

const CHIEF_PERSONA = `You are the Chief of Staff for Christy Mederos — The Forwardist.

WHO CHRISTY IS:
- Educator turned AI builder. Spent a decade in education, built AI tools used 10,000+ times in her district.
- Finishing the Overclock AI Ops Accelerator. Bilingual (English/Spanish).
- Passionate about the Hispanic community and small business owners.
- Built 7 apps: PalmTreeFit, GoldRush All Stars, PLC Dashboard, Stop & Jot, Tag Team Family, Restaurant OS, Real Estate App.
- Building in public — documenting the whole messy, real process.

YOUR JOB RIGHT NOW:
Deliver a spoken morning briefing. You have opinions. You notice patterns. You push back when something's off.
Don't just narrate the data — react to it. If leads are sitting untouched, say so. If agents are firing but no revenue's coming in, say something. If everything looks good, say THAT with genuine energy.

RULES:
- Natural conversational speech only. No bullet points, no markdown, no headers.
- Under 75 seconds when spoken aloud (~170 words max).
- Start with a hook — not "Good morning." Make her pay attention.
- End with ONE specific call to action, not a cheerful platitude.
- Sound like a real person who knows this business inside out, not a bot reading a report.`

export async function POST(request: NextRequest) {
  try {
    const stats: BriefingStats = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })
    }
    if (!ELEVENLABS_KEY) {
      return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 })
    }

    // ── Step 1: Claude writes the opinionated briefing ────
    const briefingText = await generateBriefing(stats)

    // ── Step 2: ElevenLabs speaks it ─────────────────────
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: briefingText,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!ttsRes.ok) {
      const err = await ttsRes.text()
      return NextResponse.json({ error: `ElevenLabs error: ${err}` }, { status: 500 })
    }

    const audioBuffer = await ttsRes.arrayBuffer()

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })

  } catch (err: unknown) {
    console.error('[/api/voice/briefing]', (err as Error).message)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

async function generateBriefing(stats: BriefingStats): Promise<string> {
  const { activeAgents, missionLogs, openLeads, newToday, monthlyCost, attentionItems, students } = stats

  const errors = attentionItems.filter(i => i.badge === 'error')
  const newLeads = attentionItems.filter(i => i.badge === 'new lead')

  const snapshot = [
    `Active agents: ${activeAgents} of 6`,
    `Mission logs last 24h: ${missionLogs}`,
    `Open leads: ${openLeads} (${newToday} new today)`,
    `Students enrolled: ${students}`,
    `Monthly AI spend: $${monthlyCost.toFixed(2)}`,
    errors.length > 0
      ? `ERRORS: ${errors.map(e => `${e.title} — ${e.desc}`).join('; ')}`
      : 'No agent errors',
    newLeads.length > 0
      ? `NEW LEADS SITTING OPEN: ${newLeads.map(l => `${l.title} (${l.desc})`).join('; ')}`
      : 'No new leads',
  ].join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: CHIEF_PERSONA,
    messages: [
      {
        role: 'user',
        content: `Here's the live dashboard data. Give me my briefing.\n\n${snapshot}`,
      },
    ],
  })

  const text = message.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join(' ')
    .trim()

  return text
}
