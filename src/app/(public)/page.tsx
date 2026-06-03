'use client'

import { useEffect, useRef, useState } from 'react'

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
      else setValue(target)
    }
    requestAnimationFrame(tick)
  }, [active, target, duration])
  return value
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I can help you find courses, apps, or anything else on this site. What are you looking for?' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [carouselSnap, setCarouselSnap] = useState(0)

  function scrollCarousel(dir: 'left' | 'right') {
    const el = carouselRef.current
    if (!el) return
    const cardW = el.offsetWidth / 3 + 6
    el.scrollBy({ left: dir === 'right' ? cardW : -cardW, behavior: 'smooth' })
  }

  function onCarouselScroll() {
    const el = carouselRef.current
    if (!el) return
    const cardW = el.scrollWidth / apps.length
    setCarouselSnap(Math.round(el.scrollLeft / cardW))
  }

  async function sendChat() {
    const text = chatInput.trim()
    if (!text || chatLoading) return
    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: text }]
    setChatMessages(newMessages)
    setChatInput('')
    setChatLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, something went wrong.' }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I ran into an error. Try again!' }])
    } finally {
      setChatLoading(false)
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  const n1 = useCountUp(56, 1400, statsVisible)
  const n2 = useCountUp(84, 1400, statsVisible)
  const n3a = useCountUp(85, 1400, statsVisible)
  const n3b = useCountUp(90, 1400, statsVisible)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!statsRef.current) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStatsVisible(true); io.disconnect() } },
      { threshold: 0.3 }
    )
    io.observe(statsRef.current)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } }),
      { threshold: 0.1 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  const apps = [
    { img: '/screenshots/palmtreefit.jpg', bg: 'rgba(72,199,181,0.1)', tag: '● Free', tagCls: 'tag-free', name: 'PalmTreeFit', desc: 'Fitness accountability built for real life — no gym required, no complicated plans. Just show up and go.', audience: 'For everyone', cta: 'Try it free →', href: 'https://palmtreefit.lovable.app', delay: 0 },
    { img: '/screenshots/tagteamfamily.jpg', bg: 'rgba(255,200,100,0.1)', tag: '● Live', tagCls: 'tag-free', name: 'Tag Team Family', desc: 'A family coordination app built to keep everyone on the same page — chores, schedules, and all.', audience: 'For families', cta: 'Check it out →', href: 'https://tagteamfamily.vercel.app', delay: 50 },
    { img: '/screenshots/stopandjot.jpg', bg: 'rgba(100,180,255,0.1)', tag: '● Live', tagCls: 'tag-free', name: 'Stop & Jot', desc: 'A quick-capture note tool for educators — jot it down before you forget it.', audience: 'For educators', cta: 'Try it →', href: 'https://stop-and-jot-medley.vercel.app', delay: 100 },
    { img: '/screenshots/plcdashboard.jpg', bg: 'rgba(168,85,247,0.1)', tag: '● Live', tagCls: 'tag-free', name: 'PLC Dashboard', desc: 'Professional Learning Community dashboard built for schools — data-driven collaboration made simple.', audience: 'For educators', cta: 'View it →', href: 'https://plc-next.vercel.app', delay: 150 },
    { img: '/screenshots/goldrush.jpg', bg: 'rgba(255,165,0,0.1)', tag: '● Live', tagCls: 'tag-free', name: 'Gold Rush Allstars', desc: 'A custom app built for an allstar cheer team to manage rosters, schedules, and team updates.', audience: 'For teams', cta: 'View it →', href: 'https://goldrushallstars.lovable.app', delay: 200 },
    { img: '/screenshots/forwardist.jpg', bg: 'rgba(123,104,238,0.1)', tag: '● Building', tagCls: 'tag-building', name: 'The Forwardist', desc: 'Multi-agent dashboard for running an AI-powered business. This very site — built live, in public.', audience: 'For builders', cta: 'Follow along →', href: 'https://christybuilds.substack.com', delay: 250 },
    { img: null, bg: 'rgba(255,107,107,0.1)', tag: '● Coming Soon', tagCls: 'tag-soon', name: 'Restaurant OS', desc: 'AI tools built for independent restaurant owners. Built by someone in the community, for the community.', audience: 'For small business', cta: 'Join waitlist →', href: '#', delay: 300 },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --hero-bg:     #1C1A2E;
          --hero-bg2:    #231F38;
          --hero-text:   #F0EEF8;
          --hero-muted:  rgba(240,238,248,0.55);
          --page-bg:     #F7F6F2;
          --card-bg:     #FFFFFF;
          --ink:         #1A1825;
          --body:        #4A4760;
          --muted:       #8E8BA8;
          --border:      rgba(26,24,37,0.08);
          --border-med:  rgba(26,24,37,0.14);
          --accent:      #7B68EE;
          --accent-soft: rgba(123,104,238,0.1);
          --accent-bdr:  rgba(123,104,238,0.25);
          --footer-bg:   #1C1A2E;
          --footer-muted:rgba(240,238,248,0.5);
        }

        html { scroll-behavior: smooth; }
        body { font-family: 'Instrument Sans', sans-serif; background: var(--page-bg); color: var(--ink); overflow-x: hidden; }

        /* ── NAV ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          height: 60px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px;
          transition: background .3s, border-color .3s, backdrop-filter .3s;
          border-bottom: 1px solid transparent;
        }
        .nav.scrolled { background: rgba(247,246,242,0.92); backdrop-filter: blur(16px); border-color: var(--border); }
        .nav-logo { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 17px; letter-spacing: -.03em; color: var(--hero-text); text-decoration: none; transition: color .3s; }
        .nav.scrolled .nav-logo { color: var(--ink); }
        .nav-logo em { font-style: normal; color: var(--accent); }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-size: 13.5px; color: var(--hero-muted); text-decoration: none; transition: color .2s; }
        .nav.scrolled .nav-links a { color: var(--body); }
        .nav-links a:hover { color: var(--hero-text); }
        .nav.scrolled .nav-links a:hover { color: var(--ink); }
        .nav-cta { background: var(--accent) !important; color: white !important; padding: 8px 20px; border-radius: 100px; font-weight: 500 !important; font-size: 13px !important; transition: opacity .2s, transform .15s !important; }
        .nav-cta:hover { opacity: .88; transform: translateY(-1px); }

        /* ── HERO ── */
        .hero {
          background: var(--hero-bg); min-height: 100vh;
          display: flex; flex-direction: column; justify-content: center;
          padding: 120px 40px 100px; position: relative; overflow: hidden;
        }
        .hero-glow { position: absolute; top: -120px; right: -80px; width: 700px; height: 700px; background: radial-gradient(circle at center, rgba(123,104,238,.22) 0%, rgba(123,104,238,.06) 45%, transparent 70%); pointer-events: none; }
        .hero-glow2 { position: absolute; bottom: -100px; left: -60px; width: 500px; height: 500px; background: radial-gradient(circle at center, rgba(255,107,107,.12) 0%, transparent 65%); pointer-events: none; }
        .hero-grid { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(255,255,255,.06) 1px, transparent 1px); background-size: 36px 36px; pointer-events: none; mask-image: radial-gradient(ellipse 90% 80% at 60% 40%, black 0%, transparent 75%); }
        .hero-inner { position: relative; z-index: 2; max-width: 1080px; margin: 0 auto; width: 100%; }

        .hero-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(123,104,238,.15); border: 1px solid var(--accent-bdr); border-radius: 100px; padding: 5px 14px 5px 8px; font-size: 12px; color: rgba(200,195,255,.9); margin-bottom: 32px; animation: fadeUp .6s .1s ease both; }
        .hero-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 2.5s ease-in-out infinite; }

        .hero h1 { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: clamp(44px, 6.5vw, 82px); line-height: 1.03; letter-spacing: -.03em; color: var(--hero-text); margin-bottom: 28px; max-width: 820px; animation: fadeUp .6s .2s ease both; }
        .accent-word { color: var(--accent); }
        .warm-word { color: #FF9B7B; }

        .hero-desc { font-size: 18px; font-weight: 300; color: var(--hero-muted); line-height: 1.75; max-width: 520px; margin-bottom: 44px; animation: fadeUp .6s .3s ease both; }
        .hero-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; animation: fadeUp .6s .4s ease both; }

        .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: var(--accent); color: white; font-family: 'Instrument Sans', sans-serif; font-size: 14px; font-weight: 500; padding: 14px 28px; border-radius: 100px; border: none; cursor: pointer; text-decoration: none; transition: transform .2s, box-shadow .2s; box-shadow: 0 4px 24px rgba(123,104,238,.3); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(123,104,238,.4); }
        .btn-ghost { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.08); color: var(--hero-text); font-family: 'Instrument Sans', sans-serif; font-size: 14px; font-weight: 400; padding: 14px 28px; border-radius: 100px; border: 1px solid rgba(255,255,255,.12); cursor: pointer; text-decoration: none; transition: background .2s, transform .2s; }
        .btn-ghost:hover { background: rgba(255,255,255,.14); transform: translateY(-2px); }

        .hero-stats { display: none; }
        .hero-stat { text-align: center; }
        .hero-stat-n { font-family: 'Bricolage Grotesque', sans-serif; font-size: 22px; font-weight: 700; color: var(--hero-text); letter-spacing: -.02em; line-height: 1; }
        .hero-stat-l { font-size: 11px; color: var(--hero-muted); margin-top: 3px; letter-spacing: .03em; }
        .hero-stat-divider { width: 1px; height: 32px; background: rgba(255,255,255,.1); }

        /* ── STATS BAR ── */
        .stats-bar { background: var(--hero-bg); padding: 64px 40px; width: 100%; }
        .stats-bar-inner { max-width: 1080px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: center; }
        .stat-col { text-align: center; padding: 0 40px; border-left: 1px solid rgba(255,255,255,.08); display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .stat-col:first-child { border-left: none; }
        .stat-num { font-family: 'Bricolage Grotesque', sans-serif; font-size: 72px; font-weight: 800; color: var(--accent); letter-spacing: -.03em; line-height: 1; margin-bottom: 16px; }
        .stat-label { font-size: 16px; font-weight: 300; color: #F0EEF8; line-height: 1.5; margin-bottom: 6px; max-width: 240px; }
        .stat-sub { font-size: 13px; color: rgba(240,238,248,.55); margin-bottom: 12px; }
        .stat-source { font-size: 11px; color: rgba(240,238,248,.35); font-style: italic; margin-top: auto; padding-top: 8px; }

        /* ── SHARED SECTION ── */
        .section { padding: 96px 40px; max-width: 1080px; margin: 0 auto; }
        .eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; }
        .eyebrow::before { content: ''; display: inline-block; width: 16px; height: 2px; background: var(--accent); border-radius: 2px; }
        .section-h2 { font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(30px, 3.5vw, 46px); font-weight: 700; letter-spacing: -.025em; line-height: 1.1; color: var(--ink); margin-bottom: 14px; }
        .section-sub { font-size: 16px; font-weight: 300; color: var(--body); line-height: 1.75; max-width: 520px; }
        .divider { height: 1px; background: var(--border); margin: 0 40px; }
        .link-arrow { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; color: var(--accent); text-decoration: none; transition: gap .2s; }
        .link-arrow:hover { gap: 10px; }

        /* ── SHELF ── */
        .shelf-bg { background: var(--page-bg); }
        .shelf-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
        .apps-carousel-wrap { position: relative; }
        .apps-carousel-track { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-bottom: 4px; }
        .apps-carousel-track::-webkit-scrollbar { display: none; }
        .carousel-arrow { position: absolute; top: 40%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%; background: white; border: 1px solid rgba(26,24,37,0.12); box-shadow: 0 4px 16px rgba(26,24,37,0.12); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; color: var(--ink); z-index: 10; transition: box-shadow .2s, transform .2s; }
        .carousel-arrow:hover { box-shadow: 0 8px 24px rgba(26,24,37,0.18); transform: translateY(calc(-50% - 2px)); }
        .carousel-arrow.left { left: -20px; }
        .carousel-arrow.right { right: -20px; }
        .carousel-dots { display: flex; justify-content: center; gap: 6px; margin-top: 24px; }
        .carousel-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(26,24,37,0.15); border: none; cursor: pointer; padding: 0; transition: all .2s; }
        .carousel-dot.active { width: 20px; border-radius: 3px; background: var(--accent); }
        .app-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 20px; padding: 28px; transition: transform .22s, box-shadow .22s, border-color .22s; cursor: pointer; scroll-snap-align: start; flex-shrink: 0; }
        .app-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(26,24,37,.1); border-color: var(--accent-bdr); }
        .app-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; }
        .app-screenshot { width: 100%; height: 160px; border-radius: 12px; object-fit: cover; object-position: top; margin-bottom: 20px; border: 1px solid var(--border); background: var(--surface); }
        .app-screenshot-placeholder { width: 100%; height: 160px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; border: 1px dashed var(--border); }
        .app-tag { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 500; letter-spacing: .05em; padding: 3px 10px; border-radius: 100px; margin-bottom: 12px; }
        .tag-free     { background: rgba(72,199,100,.1); color: #2E9E50; }
        .tag-building { background: rgba(123,104,238,.1); color: var(--accent); }
        .tag-soon     { background: rgba(255,155,123,.1); color: #D4663A; }
        .app-name { font-family: 'Bricolage Grotesque', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: -.02em; color: var(--ink); margin-bottom: 8px; }
        .app-desc { font-size: 13.5px; color: var(--body); font-weight: 300; line-height: 1.65; margin-bottom: 20px; }
        .app-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border); }
        .app-audience { font-size: 12px; color: var(--muted); }
        .app-cta { font-size: 12px; font-weight: 500; color: var(--accent); text-decoration: none; display: flex; align-items: center; gap: 4px; transition: gap .15s; }
        .app-cta:hover { gap: 8px; }

        /* ── LEARN ── */
        .learn-bg { background: #EFEDE8; }
        .learn-grid { display: grid; grid-template-columns: 5fr 4fr; gap: 16px; margin-top: 48px; }
        .learn-card { background: var(--card-bg); border-radius: 24px; padding: 40px; border: 1px solid var(--border); transition: box-shadow .22s; }
        .learn-card:hover { box-shadow: 0 12px 40px rgba(26,24,37,.08); }
        .learn-card.dark { background: var(--hero-bg); border-color: transparent; }
        .learn-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 500; letter-spacing: .05em; padding: 4px 12px; border-radius: 100px; margin-bottom: 24px; }
        .badge-flagship { background: var(--accent); color: white; }
        .badge-alacarte { background: rgba(26,24,37,.06); color: var(--body); }
        .badge-teens    { background: rgba(72,199,181,.12); color: #1E8A7A; }
        .learn-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 26px; font-weight: 700; letter-spacing: -.02em; line-height: 1.1; margin-bottom: 12px; }
        .learn-card.dark .learn-title { color: #F0EEF8; }
        .learn-card:not(.dark) .learn-title { color: var(--ink); }
        .learn-desc { font-size: 14px; font-weight: 300; line-height: 1.7; margin-bottom: 16px; }
        .learn-card.dark .learn-desc { color: rgba(240,238,248,.6); }
        .learn-card:not(.dark) .learn-desc { color: var(--body); }
        .learn-pain { font-size: 12.5px; font-weight: 400; font-style: italic; line-height: 1.6; margin-bottom: 28px; }
        .learn-card.dark .learn-pain { color: rgba(240,238,248,.4); }
        .learn-card:not(.dark) .learn-pain { color: var(--muted); }
        .learn-meta { display: flex; gap: 28px; margin-bottom: 28px; padding-bottom: 28px; }
        .learn-card.dark .learn-meta { border-bottom: 1px solid rgba(255,255,255,.08); }
        .learn-card:not(.dark) .learn-meta { border-bottom: 1px solid var(--border); }
        .learn-meta-val { font-family: 'Bricolage Grotesque', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: -.02em; color: var(--accent); line-height: 1; margin-bottom: 3px; }
        .learn-meta-label { font-size: 11px; color: var(--muted); letter-spacing: .05em; text-transform: uppercase; }
        .learn-card.dark .learn-meta-label { color: rgba(240,238,248,.35); }
        .side-stack { display: flex; flex-direction: column; gap: 16px; }

        /* ── ABOUT ── */
        .about-bg { background: var(--page-bg); }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .about-visual { background: linear-gradient(135deg, var(--hero-bg) 0%, #2D2848 100%); border-radius: 28px; height: 400px; display: flex; align-items: center; justify-content: center; font-size: 72px; position: relative; overflow: hidden; }
        .about-visual::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 30% 30%, rgba(123,104,238,.3), transparent 60%); }
        .about-text h2 { font-family: 'Bricolage Grotesque', sans-serif; font-size: 36px; font-weight: 700; letter-spacing: -.025em; line-height: 1.15; color: var(--ink); margin-bottom: 20px; }
        .about-text p { font-size: 15px; color: var(--body); font-weight: 300; line-height: 1.8; margin-bottom: 16px; }
        .about-text p:last-of-type { margin-bottom: 32px; }
        .btn-primary-light { display: inline-flex; align-items: center; gap: 8px; background: var(--accent); color: white; font-family: 'Instrument Sans', sans-serif; font-size: 14px; font-weight: 500; padding: 14px 28px; border-radius: 100px; border: none; cursor: pointer; text-decoration: none; transition: transform .2s, box-shadow .2s; box-shadow: 0 4px 24px rgba(123,104,238,.3); }
        .btn-primary-light:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(123,104,238,.4); }

        /* ── NEWSLETTER + FOOTER ── */
        .footer-wrap { background: var(--footer-bg); padding: 96px 40px 48px; }
        .footer-inner { max-width: 1080px; margin: 0 auto; }
        .newsletter { text-align: center; margin-bottom: 80px; }
        .newsletter h2 { font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(32px, 4vw, 52px); font-weight: 800; letter-spacing: -.03em; line-height: 1.05; color: #F0EEF8; margin-bottom: 14px; }
        .newsletter h2 span { color: var(--accent); }
        .newsletter p { font-size: 15px; color: var(--footer-muted); font-weight: 300; max-width: 440px; margin: 0 auto 36px; line-height: 1.75; }
        .email-row { display: flex; justify-content: center; max-width: 420px; margin: 0 auto; border-radius: 100px; overflow: hidden; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06); }
        .email-input { flex: 1; background: transparent; border: none; color: #F0EEF8; font-family: 'Instrument Sans', sans-serif; font-size: 14px; font-weight: 300; padding: 14px 20px; outline: none; }
        .email-input::placeholder { color: var(--footer-muted); }
        .email-btn { background: var(--accent); color: white; border: none; font-family: 'Instrument Sans', sans-serif; font-size: 13px; font-weight: 500; padding: 12px 24px; border-radius: 100px; margin: 4px; cursor: pointer; transition: opacity .2s; white-space: nowrap; }
        .email-btn:hover { opacity: .88; }
        .email-note { font-size: 12px; color: var(--footer-muted); margin-top: 14px; }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 40px; border-top: 1px solid rgba(255,255,255,.08); flex-wrap: wrap; gap: 16px; }
        .footer-logo { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 16px; color: #F0EEF8; letter-spacing: -.02em; }
        .footer-logo em { font-style: normal; color: var(--accent); }
        .footer-nav { display: flex; gap: 28px; list-style: none; }
        .footer-nav a { font-size: 13px; color: var(--footer-muted); text-decoration: none; transition: color .2s; }
        .footer-nav a:hover { color: #F0EEF8; }
        .footer-copy { font-size: 12px; color: var(--footer-muted); }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse  { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.6; transform:scale(.85); } }
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .65s ease, transform .65s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-d1 { transition-delay: .1s; }
        .reveal-d2 { transition-delay: .2s; }
        .reveal-d3 { transition-delay: .3s; }

        /* ── CHATBOT ── */
        .chat-fab { position: fixed; bottom: 28px; right: 28px; z-index: 1000; width: 56px; height: 56px; border-radius: 50%; background: var(--accent); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 24px rgba(123,104,238,.45); transition: transform .2s, box-shadow .2s; }
        .chat-fab:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 8px 32px rgba(123,104,238,.55); }
        .chat-window { position: fixed; bottom: 96px; right: 28px; z-index: 1000; width: 340px; max-height: 480px; background: #fff; border-radius: 20px; box-shadow: 0 16px 64px rgba(26,24,37,.18); display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border); animation: fadeUp .25s ease; }
        .chat-header { background: var(--hero-bg); padding: 14px 18px; display: flex; align-items: center; gap: 10px; }
        .chat-header-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; flex-shrink: 0; }
        .chat-header-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 14px; font-weight: 700; color: #F0EEF8; flex: 1; }
        .chat-header-close { background: none; border: none; cursor: pointer; color: rgba(240,238,248,.5); font-size: 18px; line-height: 1; padding: 0 2px; transition: color .2s; }
        .chat-header-close:hover { color: #F0EEF8; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .chat-bubble { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 13.5px; line-height: 1.55; }
        .chat-bubble.user { background: var(--accent); color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
        .chat-bubble.assistant { background: #F3F2F8; color: var(--ink); align-self: flex-start; border-bottom-left-radius: 4px; }
        .chat-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; background: #F3F2F8; border-radius: 14px; border-bottom-left-radius: 4px; align-self: flex-start; }
        .chat-typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--muted); animation: typingDot 1.2s ease-in-out infinite; }
        .chat-typing span:nth-child(2) { animation-delay: .2s; }
        .chat-typing span:nth-child(3) { animation-delay: .4s; }
        @keyframes typingDot { 0%,80%,100% { opacity:.3; transform:scale(.8); } 40% { opacity:1; transform:scale(1); } }
        .chat-input-row { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--border); }
        .chat-input { flex: 1; border: 1px solid var(--border); border-radius: 100px; padding: 9px 14px; font-family: 'Instrument Sans', sans-serif; font-size: 13px; color: var(--ink); outline: none; transition: border-color .2s; background: var(--page-bg); }
        .chat-input:focus { border-color: var(--accent); }
        .chat-send { background: var(--accent); border: none; border-radius: 50%; width: 34px; height: 34px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity .2s; }
        .chat-send:disabled { opacity: .4; cursor: default; }
        @media (max-width: 480px) { .chat-window { width: calc(100vw - 32px); right: 16px; } .chat-fab { right: 16px; bottom: 20px; } }

        @media (max-width: 768px) {
          .app-card { min-width: calc(85vw) !important; width: calc(85vw) !important; }
          .carousel-arrow { display: none; }
          .learn-grid, .about-grid { grid-template-columns: 1fr; }
          .nav-links { display: none; }
          .hero-stats { display: none; }
          .section { padding: 64px 24px; }
          .stats-bar { padding: 48px 24px; }
          .stats-bar-inner { grid-template-columns: 1fr; gap: 40px; }
          .stat-col { border-left: none; border-top: 1px solid rgba(255,255,255,.08); padding: 32px 0 0; }
          .stat-col:first-child { border-top: none; padding-top: 0; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <a href="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.jpg" alt="" style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'cover' }} />
          <span>theForward<em>ist</em></span>
        </a>
        <ul className="nav-links">
          <li><a href="#shelf">What I Build</a></li>
          <li><a href="/courses">Learn</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#newsletter">Newsletter</a></li>
          <li><a href="#newsletter" className="nav-cta">Get Started</a></li>
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section className="hero" id="home">
        <div className="hero-glow" />
        <div className="hero-glow2" />
        <div className="hero-grid" />
        <div className="hero-inner">
          <div className="hero-tag">
            <span className="hero-tag-dot" />
            AI tools, courses &amp; resources — built for real life
          </div>
          <h1>
            AI isn&apos;t just<br />
            for <span className="accent-word">tech people.</span><br />
            <span className="warm-word">It never was.</span>
          </h1>
          <p className="hero-desc">
            I build AI-powered apps, teach practical courses, and share everything — for small business owners, everyday builders, and high schoolers who can&apos;t wait for school to catch up.
          </p>
          <div className="hero-actions">
            <a href="#shelf" className="btn-primary">See What I&apos;ve Built ↓</a>
            <a href="/courses" className="btn-ghost">Take a Class</a>
          </div>
        </div>
        <div className="hero-stats">
          {[['7+','Apps Built'],['3','Audiences Served'],['100%','Built in Public']].map(([n,l], i) => (
            <>
              {i > 0 && <div key={`d${i}`} className="hero-stat-divider" />}
              <div key={l} className="hero-stat">
                <div className="hero-stat-n">{n}</div>
                <div className="hero-stat-l">{l}</div>
              </div>
            </>
          ))}
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="stats-bar" ref={statsRef}>
        <div className="stats-bar-inner">
          {[
            { num: `${n1}%`, label: 'wage premium for workers with AI skills', sub: null, source: 'PwC 2025' },
            { num: `${n2}%`, label: 'of teens use AI for schoolwork', sub: 'only 14% of schools teach it', source: 'College Board 2025' },
            { num: `${n3a}–${n3b}%`, label: 'completion rate for cohort-based courses', sub: 'vs. 10–15% for self-paced', source: 'Ruzuku 2026' },
          ].map((s, i) => (
            <div key={i} className="stat-col">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
              {s.sub && <div className="stat-sub">{s.sub}</div>}
              <div className="stat-source">{s.source}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SHELF ── */}
      <div className="shelf-bg" id="shelf">
        <div className="section">
          <div className="shelf-header reveal">
            <div>
              <div className="eyebrow">What I Build</div>
              <h2 className="section-h2">Real apps.<br />Real problems solved.</h2>
            </div>
            <a href="https://christybuilds.substack.com" target="_blank" rel="noreferrer" className="link-arrow">Follow the builds →</a>
          </div>
          <p className="section-sub reveal" style={{ marginBottom: 48 }}>
            I build things I actually needed — then I share them. Some are free. Some aren&apos;t. All of them work.
          </p>
          <div className="apps-carousel-wrap">
            <button className="carousel-arrow left" onClick={() => scrollCarousel('left')} aria-label="Previous">‹</button>
            <button className="carousel-arrow right" onClick={() => scrollCarousel('right')} aria-label="Next">›</button>

            <div
              className="apps-carousel-track"
              ref={carouselRef}
              onScroll={onCarouselScroll}
            >
              {apps.map((app, i) => (
                <div
                  key={app.name}
                  className="app-card"
                  style={{ width: 'calc((100% - 32px) / 3)', minWidth: 'calc((100% - 32px) / 3)' }}
                >
                  {app.img
                    ? <img src={app.img} alt={app.name} className="app-screenshot" />
                    : <div className="app-screenshot-placeholder" style={{ background: app.bg }}></div>
                  }
                  <div className={`app-tag ${app.tagCls}`}>{app.tag}</div>
                  <div className="app-name">{app.name}</div>
                  <div className="app-desc">{app.desc}</div>
                  <div className="app-footer">
                    <span className="app-audience">{app.audience}</span>
                    <a href={app.href} className="app-cta" target={app.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{app.cta}</a>
                  </div>
                </div>
              ))}
            </div>

            <div className="carousel-dots">
              {apps.map((_, i) => (
                <button
                  key={i}
                  className={`carousel-dot ${i === carouselSnap ? 'active' : ''}`}
                  onClick={() => {
                    const el = carouselRef.current
                    if (!el) return
                    const cardW = el.scrollWidth / apps.length
                    el.scrollTo({ left: i * cardW, behavior: 'smooth' })
                  }}
                  aria-label={`Go to app ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* ── LEARN ── */}
      <div className="learn-bg" id="learn">
        <div className="section">
          <div className="reveal">
            <div className="eyebrow">Learn</div>
            <h2 className="section-h2">Real skills.<br />Plain English. No prerequisites.</h2>
            <p className="section-sub" style={{ marginTop: 10 }}>
              Built for the business owner, the teacher, the side-hustler — anyone ready to use AI without needing a tech background to get started.
            </p>
          </div>
          <div className="learn-grid">
            {/* Featured card */}
            <div className="learn-card dark reveal">
              <span className="learn-badge badge-flagship"> Flagship Program</span>
              <div className="learn-title">10-Week AI Cohort</div>
              <div className="learn-desc">
                There are accelerators out there for seasoned operators, business leaders, and technologists. This isn&apos;t that — and that&apos;s the point.
              </div>
              <div className="learn-desc" style={{ marginTop: -8 }}>
                This cohort takes the same 10-week, live-cohort structure built for the enterprise world and translates every single piece of it into plain English. No jargon. No prerequisites. No coding. Just you, a small group, and real AI skills you&apos;ll actually use.
              </div>

              {/* Week breakdown */}
              <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { weeks: 'Weeks 1–3', title: 'Find Your Leverage', desc: 'Where does AI actually fit in your life or business? We figure it out together — not in theory, with your real work.' },
                  { weeks: 'Weeks 4–6', title: 'Connect the Dots', desc: 'Link tools together so they run while you rest. No code. Just the right setup.' },
                  { weeks: 'Weeks 7–10', title: 'Build & Ship', desc: 'You leave with something real — a tool, a workflow, an agent — that you built yourself and can show people.' },
                ].map(({ weeks, title, desc }) => (
                  <div key={weeks} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ minWidth: 76, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(123,104,238,0.7)', paddingTop: 2 }}>{weeks}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#F0EEF8', marginBottom: 2 }}>{title}</div>
                      <div style={{ fontSize: 12.5, color: 'rgba(240,238,248,0.5)', lineHeight: 1.55 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="learn-pain" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16, marginTop: 4 }}>
                &ldquo;Inspired by programs built for enterprise operators — designed for the rest of us.&rdquo;
              </div>

              <div className="learn-meta">
                {[['10','Weeks'],['Live','Sessions'],['Small','Group'],['$247','Investment']].map(([v,l]) => (
                  <div key={l}>
                    <div className="learn-meta-val">{v}</div>
                    <div className="learn-meta-label">{l}</div>
                  </div>
                ))}
              </div>
              <a href="/courses" className="btn-primary">See the Curriculum →</a>
            </div>

            {/* Side stack */}
            <div className="side-stack">
              <div className="learn-card reveal reveal-d1">
                <span className="learn-badge badge-alacarte">À-la-carte</span>
                <div className="learn-title">Single Topic Workshops</div>
                <div className="learn-desc">Not ready for 10 weeks? Pick one skill and get good at it. Prompting, automations, AI tools for your business — starting at $49, no fluff.</div>
                <div className="learn-pain">52% of small business owners say skill gaps are their #1 barrier to using AI. One workshop changes that.</div>
                <a href="/courses#alacarte" className="link-arrow">Browse workshops →</a>
              </div>
              <div className="learn-card reveal reveal-d2">
                <span className="learn-badge badge-teens"> For Teens</span>
                <div className="learn-title">AI Bootcamp for High Schoolers</div>
                <div className="learn-desc">Your school probably isn&apos;t teaching this yet. The world you&apos;re about to enter already expects it. Get ahead before the gap gets wider.</div>
                <div className="learn-pain">84% of teens use AI. Only 14% of schools teach it. This bootcamp closes that gap — in plain English, for real life.</div>
                <a href="/courses" className="link-arrow">Learn more →</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* ── ABOUT ── */}
      <div className="about-bg" id="about">
        <div className="section">
          <div className="about-grid reveal">
            <div className="about-visual">
              <span style={{ position: 'relative', zIndex: 1 }}></span>
            </div>
            <div className="about-text">
              <div className="eyebrow">About</div>
              <h2>Educator. Builder.<br />Always moving forward.</h2>
              <p>I&apos;ve spent a decade in education — and over that time I became the person my district called when they needed AI to actually work for teachers. I&apos;ve built bots that have seen over 10,000 uses across my district, presented at conferences on AI in education, and I&apos;m currently completing the <strong>Overclock AI Operations Accelerator</strong> — a 10-week program for operators building production-grade AI systems.</p>
              <p>I&apos;m bilingual and I build with the communities I know — Hispanic small business owners, educators, and anyone who&apos;s been told this technology isn&apos;t for them. I&apos;m here to prove otherwise, one app at a time.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                <a href="https://www.linkedin.com/in/christymederos10" target="_blank" rel="noreferrer" className="btn-primary-light" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── NEWSLETTER + FOOTER ── */}
      <div className="footer-wrap" id="newsletter">
        <div className="footer-inner">
          <div className="newsletter reveal">
            <div className="eyebrow" style={{ justifyContent: 'center', color: 'rgba(200,195,255,0.8)' }}>
              <span style={{ background: 'var(--accent)', display: 'inline-block', width: 16, height: 2, borderRadius: 2 }} />
              Newsletter
            </div>
            <h2>The build log.<br /><span>In your inbox.</span></h2>
            <p>Every week: one tool I found, one thing I built, one way you can have it too. Written by an AI agent. Curated by me. Free to read.</p>
            <a href="https://christybuilds.substack.com" target="_blank" rel="noreferrer" className="email-btn" style={{ display: 'inline-block', textDecoration: 'none', padding: '14px 32px', fontSize: 15, borderRadius: 100 }}>
              Subscribe on Substack →
            </a>
            <p className="email-note" style={{ marginTop: 16 }}>Free posts weekly · Follow along at christybuilds.substack.com</p>
          </div>
          <div className="footer-bottom">
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/logo.jpg" alt="" style={{ width: 22, height: 22, borderRadius: 5, objectFit: 'cover' }} />
              <span>theForward<em>ist</em></span>
            </div>
            <ul className="footer-nav">
              <li><a href="#shelf">What I Build</a></li>
              <li><a href="/courses">Learn</a></li>
              <li><a href="#newsletter">Newsletter</a></li>
              <li><a href="#about">About</a></li>
            </ul>
            <p className="footer-copy">Built with Claude · Running on agents · © 2026 · <a href="/dashboard" style={{ color: 'rgba(255,255,255,0.15)', textDecoration: 'none', fontSize: 11 }}>&#9679;</a></p>
          </div>
        </div>
      </div>
      {/* ── CHATBOT ── */}
      {chatOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-dot" />
            <div className="chat-header-title">Ask me anything</div>
            <button className="chat-header-close" onClick={() => setChatOpen(false)} aria-label="Close chat">×</button>
          </div>
          <div className="chat-messages">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>{msg.content}</div>
            ))}
            {chatLoading && (
              <div className="chat-typing">
                <span /><span /><span />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="What are you looking for?"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
            />
            <button className="chat-send" onClick={sendChat} disabled={chatLoading || !chatInput.trim()} aria-label="Send">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
      <button className="chat-fab" onClick={() => setChatOpen(o => !o)} aria-label="Open chat">
        {chatOpen
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
      </button>
    </>
  )
}
