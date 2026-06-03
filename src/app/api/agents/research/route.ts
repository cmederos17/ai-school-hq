// ─────────────────────────────────────────────
// POST /api/agents/research
//
// Research Scout — two modes:
// 1. No body: updates the core market research report
// 2. { question } body: Gemini researches the question
//    and saves a new report to research_reports
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const GEMINI_KEY = process.env.GOOGLE_AI_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`

// ── Mode 1: hardcoded market stats update ──────────────────
async function runMarketResearch() {
  const updatedFindings = {
    wage_premium: '56%',
    teens_using_ai: '84%',
    schools_teaching_ai: '14%',
    cohort_completion_rate: '85-90%',
    self_paced_completion_rate: '10-15%',
    smb_skill_barrier: '52%',
    smb_acted_on_ai: '12%',
    adults_say_ai_critical: '54%',
    hispanic_owned_businesses: '5.1M',
    hispanic_biz_revenue: '$800B+',
    hispanic_biz_growth_rate: 'Fastest growing segment in the US',
    hispanic_biz_underserved_by_tech: '67%',
    spanish_preferred_for_business: '72%',
    hispanic_population_us: '63M+',
    sources: [
      'PwC 2025', 'College Board 2025', 'Ruzuku 2026',
      'Stanford Latino Entrepreneurship Initiative 2024',
      'US Census Bureau 2024', 'Pew Research Center 2025',
    ],
  }

  const { data, error } = await supabase
    .from('research_reports')
    .update({
      findings: updatedFindings,
      refreshed_at: new Date().toISOString(),
      status: 'current',
      title: 'Forwardist: Who Needs This & Why (Updated — Hispanic Market)',
    })
    .eq('title', 'Forwardist: Who Needs This & Why')
    .select()
    .single()

  if (error || !data) {
    const { data: firstReport } = await supabase
      .from('research_reports')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (firstReport) {
      await supabase
        .from('research_reports')
        .update({
          findings: updatedFindings,
          refreshed_at: new Date().toISOString(),
          status: 'current',
          title: 'Forwardist: Who Needs This & Why (Updated — Hispanic Market)',
        })
        .eq('id', firstReport.id)
    }
  }

  await supabase.from('agent_logs').insert({
    agent_name: 'Research Scout',
    action: 'updated_research_report',
    output: { message: 'Research report updated with Hispanic business owner market stats' },
    status: 'success',
  })

  return { success: true, message: 'Research report updated with Hispanic market data' }
}

// ── Mode 2: Gemini-powered custom question research ────────
async function runCustomResearch(question: string) {
  if (!GEMINI_KEY) throw new Error('No GOOGLE_AI_KEY configured')

  // Log start
  await supabase.from('agent_logs').insert({
    agent_name: 'Research Scout',
    action: 'researching_question',
    output: { message: `Researching: "${question.slice(0, 80)}"` },
    status: 'running',
  })

  const prompt = `You are Research Scout — an AI research agent for The Forwardist, Christy Mederos's build-in-public platform for educators, small business owners, and the Hispanic community.

Research the following question thoroughly: "${question}"

Return a JSON object with:
- "title": a short, clear report title
- "summary": 2-3 sentences summarizing the most important findings
- "findings": object of key stats or insights (5-8 items, use concise labels as keys and clear values)
- "recommendations": array of 2-3 actionable recommendations for Christy based on findings
- "sources": array of source names (be specific — platforms, publications, studies)

Respond ONLY with valid JSON. No markdown, no explanation.`

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }),
  })

  if (!res.ok) throw new Error(`Gemini error ${res.status}`)
  const data = await res.json()
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'

  // Strip markdown code fences if Gemini wraps in ```json
  const cleaned = raw.replace(/^```json\n?/i, '').replace(/\n?```$/, '').trim()
  const parsed = JSON.parse(cleaned)

  const now = new Date().toISOString()
  const refresh90 = new Date(Date.now() + 90 * 86400000).toISOString()

  const { error: insertErr } = await supabase.from('research_reports').insert({
    title: parsed.title ?? question.slice(0, 80),
    findings: {
      summary: parsed.summary,
      ...parsed.findings,
      recommendations: parsed.recommendations,
      sources: parsed.sources ?? [],
    },
    status: 'current',
    generated_at: now,
    refreshed_at: now,
    refresh_due_at: refresh90,
    question,
  })

  if (insertErr) throw new Error(insertErr.message)

  await supabase.from('agent_logs').insert({
    agent_name: 'Research Scout',
    action: 'completed_research',
    output: { message: `Research complete: "${parsed.title ?? question.slice(0, 60)}"` },
    status: 'success',
  })

  return {
    success: true,
    title: parsed.title,
    summary: parsed.summary,
    findings: parsed.findings,
    recommendations: parsed.recommendations,
  }
}

// ── Handler ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    let question: string | undefined
    try {
      const body = await request.json()
      question = body?.question
    } catch {
      // no body or not JSON — that's fine, run market research
    }

    const result = question
      ? await runCustomResearch(question)
      : await runMarketResearch()

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[/api/agents/research]', err.message)
    await supabase.from('agent_logs').insert({
      agent_name: 'Research Scout',
      action: 'error',
      output: { message: err.message },
      status: 'error',
    })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
