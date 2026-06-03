// ─────────────────────────────────────────────
// POST /api/agents/content
// Brand Scout → Supabase + Substack draft
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      content,
      platform = 'substack',
      related_app,
      agent_name = 'Brand Scout',
    } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
    }

    // ── Append standard CTAs if not already in content ──────────────
    const appUrl = related_app === 'PalmTreeFit' ? 'palmtreefit.lovable.app' : null
    const signoff = `I'm Christy. I build things with AI and document the whole messy process. If you've got ideas but keep telling yourself you're not technical enough — stick around. \n\nFollow along: christybuilds.substack.com`
    const ctaBlock = [
      appUrl ? `→ Try it free: ${appUrl}` : null,
      `Full behind-the-scenes at forwardist.app`,
      signoff,
    ].filter(Boolean).join('\n\n')

    const finalContent = content.includes('christybuilds.substack.com')
      ? content
      : `${content}\n\n${ctaBlock}`

    // ── Brand Scout voice ────────────────────────────────────────────
    // Christy's voice — every post must sound like this:
    //
    // TONE: Casual, warm, funny when appropriate. Like a voice memo
    //   to a friend, not a blog post. Never polished, never corporate.
    //
    // AUDIENCE: Non-technical people — small biz owners, parents,
    //   curious humans — who have ideas but think they're "not techy enough."
    //
    // ANGLE: Building in public. Behind the scenes. "I'm figuring this
    //   out too and I'm bringing you along." Not an expert — a fellow
    //   beginner who's a few steps ahead and keeping it real.
    //
    // FORMAT: Short paragraphs. Plain words. Personal stories first,
    //   then the lesson. Start with a relatable problem or moment,
    //   not with "In today's post I will..."
    //
    // NEVER: LinkedIn-speak, "leverage," "synergy," bullet-point listicles,
    //   fake hype, or anything that sounds like a press release.
    // ────────────────────────────────────────────────────────────────

    // ── 1. Save to Supabase ──────────────────────────────────────────
    const { data: post, error: dbError } = await supabase
      .from('content_posts')
      .insert({
        title,
        body: finalContent,
        platform,
        status: 'draft',
        related_app: related_app ?? null,
        agent_name,
      })
      .select()
      .single()

    if (dbError) throw new Error(`DB insert failed: ${dbError.message}`)

    // ── 2. Post directly to Substack ────────────────────────────────
    let substackDraftId: string | null = null
    let draftSent = false

    const publication = process.env.SUBSTACK_PUBLICATION
    const sessionCookie = process.env.SUBSTACK_SESSION_COOKIE

    if (platform === 'substack' && publication && sessionCookie) {
      const decodedCookie = decodeURIComponent(sessionCookie)

      // Convert plain text to Substack's ProseMirror JSON format
      const paragraphs = finalContent
        .split('\n\n')
        .filter((p: string) => p.trim())
        .map((p: string) => ({
          type: 'paragraph',
          content: [{ type: 'text', text: p.trim() }],
        }))

      const prosemirrorBody = JSON.stringify({
        type: 'doc',
        content: paragraphs,
      })

      const substackRes = await fetch(
        `https://${publication}.substack.com/api/v1/drafts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `substack.sid=${decodedCookie}`,
            'User-Agent': 'Mozilla/5.0',
            'Referer': `https://${publication}.substack.com`,
          },
          body: JSON.stringify({
            draft_title: title,
            draft_body: prosemirrorBody,
            draft_subtitle: related_app ? `Built with AI · ${related_app}` : '',
            draft_bylines: [],
            type: 'newsletter',
            audience: 'everyone',
          }),
        }
      )

      const responseText = await substackRes.text()
      console.log('[Substack] status:', substackRes.status)
      console.log('[Substack] response:', responseText.slice(0, 300))

      if (substackRes.ok) {
        const substackData = JSON.parse(responseText)
        substackDraftId = substackData.id?.toString() ?? null
        draftSent = true

        const draftUrl = substackDraftId
          ? `https://${publication}.substack.com/publish/post/${substackDraftId}`
          : null

        await supabase
          .from('content_posts')
          .update({
            status: 'sent',
            draft_sent_at: new Date().toISOString(),
            post_url: draftUrl,
          })
          .eq('id', post.id)
      } else {
        console.error('[Substack API error]', substackRes.status, responseText.slice(0, 200))
      }
    }

    // ── 3. Log to agent_logs ─────────────────────────────────────────
    await supabase.from('agent_logs').insert({
      agent_name,
      action: draftSent ? 'published_to_substack' : 'saved_draft',
      output: {
        message: draftSent
          ? `"${title}" → Substack draft created`
          : `"${title}" saved to Supabase`,
        post_id: post.id,
        substack_draft_id: substackDraftId,
        platform,
        related_app,
      },
      status: 'success',
    })

    return NextResponse.json({
      success: true,
      post_id: post.id,
      draft_sent: draftSent,
      substack_draft_id: substackDraftId,
    })

  } catch (err: any) {
    console.error('[/api/agents/content]', err.message)
    try {
      await supabase.from('agent_logs').insert({
        agent_name: 'Brand Scout',
        action: 'publish_error',
        output: { message: err.message },
        status: 'error',
      })
    } catch (_) {}
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
