'use client'

import { useState } from 'react'

const tracks = [
  {
    id: 'A',
    label: 'Track A',
    title: "The Builder's Cohort",
    tagline: 'For everyday builders who want to make real things with AI',
    color: 'purple',
    price: '$247',
    accent: '#7B68EE',
    accentSoft: 'rgba(123,104,238,0.08)',
    accentBorder: 'rgba(123,104,238,0.18)',
    badge: 'rgba(123,104,238,1)',
    audience: 'Adults · Curious builders · Side-hustlers',
    units: [
      { n: 1, title: 'AI as a Research Partner', desc: 'Prompt engineering fundamentals. Moving from chat to documents. Research, synthesize, and produce professional reports.', project: 'Research Report + Deck' },
      { n: 2, title: 'Prompting Like a Pro', desc: 'System prompts, roles, chain-of-thought, few-shot examples. The difference between generic answers and exactly what you need.', project: 'Prompt Library' },
      { n: 3, title: 'Your First AI App', desc: 'Build a working web app using Claude API and no-code tools. What an API is and how to talk to it without being a developer.', project: 'Working Web App' },
      { n: 4, title: 'Building a Chatbot', desc: 'What makes a chatbot useful vs. annoying. System prompts as personality. Customer service bot, jargon translator, or personal assistant.', project: 'Custom Chatbot' },
      { n: 5, title: 'AI Agents & Tools', desc: 'What agents are, what tools do, and how to give AI the ability to act — not just answer. An agent that compares, decides, and reports.', project: 'Price / Service Watcher' },
      { n: 6, title: 'Automation & Workflows', desc: 'Connecting AI to email, calendar, docs. Making AI do things automatically so you don\'t have to think about it.', project: 'Automated Workflow' },
      { n: 7, title: 'Building in the Browser', desc: 'Chrome extensions, bookmarklets, and browser-based tools. Making AI work inside the tools you already spend time in.', project: 'Chrome Extension' },
      { n: 8, title: 'AI for Content & Creation', desc: 'AI as a creative partner — writing, images, video scripts, newsletters. A content system that doesn\'t require starting from scratch.', project: 'Content System' },
      { n: 9, title: 'Autonomous Agents', desc: 'Multi-agent systems that run in the background, coordinate, and handle tasks without being asked twice.', project: 'Multi-Agent System' },
      { n: 10, title: 'Capstone — Ship Something Real', desc: 'Combine everything into one cohesive project. Your proof of concept — something you can show, share, or sell.', project: ' Capstone Project', capstone: true },
    ],
  },
  {
    id: 'B',
    label: 'Track B',
    title: 'AI for Your Business',
    tagline: 'For small business owners who need AI to work this week, not someday',
    color: 'coral',
    price: '$247',
    accent: '#FF6B6B',
    accentSoft: 'rgba(255,107,107,0.08)',
    accentBorder: 'rgba(255,107,107,0.18)',
    badge: '#FF6B6B',
    audience: 'Entrepreneurs · Solopreneurs · Local businesses',
    units: [
      { n: 1, title: 'AI Audit Your Business', desc: 'Identify the top 5 time drains. Research which AI tools address each. Generate a personalized AI adoption plan — automatically.', project: 'AI Adoption Report' },
      { n: 2, title: 'Customer Communication on Autopilot', desc: 'AI-drafted emails, follow-ups, and responses. Templates that sound like you, not a robot. Cutting response time without cutting quality.', project: 'Email System' },
      { n: 3, title: 'Your AI Customer Service Rep', desc: 'A chatbot that knows your business, answers FAQs, handles bookings, and escalates the hard stuff. Runs 24/7 without you.', project: 'Business Chatbot' },
      { n: 4, title: 'Content Without the Hustle', desc: 'Social media captions, blog posts, product descriptions — built from bullet points. A content system that runs weekly in under an hour.', project: 'Content Calendar' },
      { n: 5, title: 'Pricing & Market Intelligence', desc: 'An agent that monitors competitor pricing, tracks market changes, and sends a weekly briefing. Know what\'s happening without hours of research.', project: 'Market Watch Agent' },
      { n: 6, title: 'Operations & Scheduling', desc: 'AI-powered scheduling, task management, and internal communication. Admin that feels less like admin.', project: 'Ops Workflow' },
      { n: 7, title: 'AI for Sales & Lead Gen', desc: 'Finding leads, qualifying them, drafting outreach, following up. An AI-assisted sales process without a sales team.', project: 'Lead System' },
      { n: 8, title: 'Understanding AI Costs', desc: 'What AI actually costs at scale. API pricing, tokens, and when free tools stop being enough. Track and control your AI spend.', project: 'Cost Tracker' },
      { n: 9, title: 'Choosing the Right AI Tools', desc: 'Claude vs. ChatGPT vs. Gemini — for your use case specifically. How to evaluate, test, and decide without getting overwhelmed.', project: 'AI Tool Comparison' },
      { n: 10, title: 'Capstone — Your AI-Powered Business OS', desc: 'Combine your chatbot, content system, lead tracker, and ops workflow into one connected system. Present your before/after.', project: ' Business OS', capstone: true },
    ],
  },
  {
    id: 'C',
    label: 'Track C',
    title: 'AI Bootcamp for Teens',
    tagline: 'For high schoolers who want to understand AI before the world assumes they do',
    color: 'teal',
    price: '$197',
    accent: '#3DBFA8',
    accentSoft: 'rgba(61,191,168,0.08)',
    accentBorder: 'rgba(61,191,168,0.18)',
    badge: '#3DBFA8',
    audience: 'Ages 14–18 · Future-aware fast learners',
    units: [
      { n: 1, title: 'What AI Actually Is', desc: 'No buzzwords. No hype. What AI is, how it works in plain English, and why it matters for your future — in school, work, and life.', project: 'AI Explainer' },
      { n: 2, title: 'Talking to AI (Without Getting Garbage Back)', desc: 'Prompting as a skill. Why "write me an essay" doesn\'t work. How to give context, ask follow-ups, and get answers that help.', project: 'Prompt Challenge' },
      { n: 3, title: 'AI for School (Without Cheating)', desc: 'AI as a tutor, study partner, brainstorm machine. The ethical line between using AI and having it do your work — and why it matters.', project: 'Study System' },
      { n: 4, title: 'Research Like a Pro', desc: 'AI-powered research beyond Google. Finding sources, synthesizing information, producing a real report — automatically.', project: 'Research Report' },
      { n: 5, title: 'Build Your First App (No Coding Required)', desc: 'What an app actually is. Building something that works using natural language and no-code tools. Deploying it so others can use it.', project: 'Working App' },
      { n: 6, title: 'AI, Ethics & Critical Thinking', desc: 'Bias, misinformation, deepfakes, and data privacy. Not to scare you — to make you smarter than the adults who didn\'t learn this.', project: 'Ethics Debate' },
      { n: 7, title: 'AI & Careers — What\'s Actually Changing', desc: 'Which jobs AI is replacing. Which it\'s creating. What skills will matter in 5 years. How to position yourself as someone who works with AI.', project: 'Career Map' },
      { n: 8, title: 'Building a Chatbot', desc: 'Creating an AI with a personality and purpose. A homework helper, campus events guide, or anything you care about.', project: 'Custom Chatbot' },
      { n: 9, title: 'AI for Side Hustles & Creativity', desc: 'Using AI to start something — a newsletter, a product, a service. Content, audience, and making money doing something you actually like.', project: 'Side Hustle Plan' },
      { n: 10, title: 'Capstone — Demo Day', desc: 'Present your best project live. 5-minute pitch, real feedback. Goes in your portfolio, your college essay, your résumé. You built something real.', project: ' Demo Day', capstone: true },
    ],
  },
]

const alacarte = [
  { icon: '', title: 'Prompting Masterclass', desc: 'Go from generic outputs to precision results. One session, one skill, immediate impact.', price: '$49', tag: 'Coming Soon' },
  { icon: '', title: 'Build Your First Chatbot', desc: 'A focused workshop on creating, deploying, and customizing a chatbot for your specific need.', price: '$49', tag: 'Coming Soon' },
  { icon: '', title: 'Automation Essentials', desc: 'Connect your tools and make AI run tasks automatically — no code, no IT department needed.', price: '$69', tag: 'Coming Soon' },
  { icon: '', title: 'AI for Small Business', desc: 'A 90-minute deep dive on the three AI moves that save small business owners the most time.', price: '$49', tag: 'Coming Soon' },
]

export default function CoursesPage() {
  const [activeTrack, setActiveTrack] = useState('A')
  const track = tracks.find(t => t.id === activeTrack)!

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --hero-bg: #1C1A2E;
          --hero-text: #F0EEF8;
          --hero-muted: rgba(240,238,248,0.55);
          --page-bg: #F7F6F2;
          --card-bg: #FFFFFF;
          --ink: #1A1825;
          --body: #4A4760;
          --muted: #8E8BA8;
          --border: rgba(26,24,37,0.08);
          --accent: #7B68EE;
          --accent-soft: rgba(123,104,238,0.1);
        }
        html { scroll-behavior: smooth; }
        body { font-family: 'Instrument Sans', sans-serif; background: var(--page-bg); color: var(--ink); overflow-x: hidden; }

        /* NAV */
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; background: rgba(28,26,46,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.08); }
        .nav-logo { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 17px; letter-spacing: -.03em; color: var(--hero-text); text-decoration: none; }
        .nav-logo em { font-style: normal; color: var(--accent); }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-size: 13.5px; color: var(--hero-muted); text-decoration: none; transition: color .2s; }
        .nav-links a:hover { color: var(--hero-text); }
        .nav-cta { background: var(--accent) !important; color: white !important; padding: 8px 20px; border-radius: 100px; font-weight: 500 !important; font-size: 13px !important; }

        /* HERO */
        .courses-hero { background: var(--hero-bg); padding: 120px 40px 80px; position: relative; overflow: hidden; }
        .hero-glow { position: absolute; top: -100px; right: -80px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(123,104,238,.22) 0%, transparent 65%); pointer-events: none; }
        .hero-grid { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(255,255,255,.05) 1px, transparent 1px); background-size: 36px 36px; pointer-events: none; }
        .hero-inner { max-width: 1080px; margin: 0 auto; position: relative; z-index: 2; }
        .hero-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(123,104,238,.15); border: 1px solid rgba(123,104,238,.3); border-radius: 100px; padding: 5px 14px; font-size: 12px; color: rgba(200,195,255,.9); margin-bottom: 28px; }
        .courses-hero h1 { font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(40px, 5.5vw, 72px); font-weight: 800; letter-spacing: -.03em; line-height: 1.04; color: var(--hero-text); margin-bottom: 20px; }
        .courses-hero h1 span { color: var(--accent); }
        .courses-hero p { font-size: 17px; font-weight: 300; color: var(--hero-muted); line-height: 1.75; max-width: 540px; margin-bottom: 44px; }
        .hero-meta { display: flex; gap: 48px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,.08); }
        .hero-meta-val { font-family: 'Bricolage Grotesque', sans-serif; font-size: 30px; font-weight: 700; color: var(--hero-text); letter-spacing: -.02em; line-height: 1; margin-bottom: 4px; }
        .hero-meta-val span { color: var(--accent); }
        .hero-meta-label { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--hero-muted); }

        /* EXTENSION SHOWCASE */
        .ext-section { background: linear-gradient(180deg, #1C1A2E 0%, #231F38 100%); padding: 0 40px; border-bottom: 1px solid rgba(123,104,238,0.15); }
        .ext-section-inner { max-width: 1080px; margin: 0 auto; padding: 80px 0; }
        .ext-top { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; margin-bottom: 56px; }
        .ext-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(123,104,238,0.15); border: 1px solid rgba(123,104,238,0.3); border-radius: 100px; padding: 5px 14px; font-size: 11px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: rgba(200,195,255,0.9); margin-bottom: 20px; }
        .ext-store-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); border-radius: 100px; padding: 5px 14px; font-size: 11px; font-weight: 500; letter-spacing: .06em; color: #6EE7B7; margin-left: 8px; }
        .ext-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(28px, 3.5vw, 42px); font-weight: 800; letter-spacing: -.03em; color: var(--hero-text); margin-bottom: 16px; line-height: 1.08; }
        .ext-title span { color: var(--accent); }
        .ext-desc { font-size: 15px; font-weight: 300; color: var(--hero-muted); line-height: 1.8; margin-bottom: 32px; }
        .ext-features { display: flex; flex-direction: column; gap: 14px; margin-bottom: 32px; }
        .ext-feature { display: flex; align-items: flex-start; gap: 12px; }
        .ext-feature-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
        .ext-feature-text strong { display: block; font-size: 13.5px; font-weight: 600; color: var(--hero-text); margin-bottom: 2px; }
        .ext-feature-text span { font-size: 12.5px; color: var(--hero-muted); line-height: 1.55; }
        .ext-enroll-note { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 500; color: var(--accent); padding: 8px 16px; border: 1px solid rgba(123,104,238,0.3); border-radius: 100px; background: rgba(123,104,238,0.08); }

        /* SCREENSHOTS */
        .ext-screenshot-wrap { position: relative; margin-left: auto; }
        .ext-screenshot-sidebar { width: 480px; border-radius: 14px; box-shadow: 0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06); display: block; }
        .ext-popup-float { position: absolute; bottom: -24px; left: -80px; width: 175px; border-radius: 12px; box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08); display: block; }

        /* FEATURE PILLS ROW */
        .ext-pills-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .ext-pill-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; }
        .ext-pill-card-icon { font-size: 24px; margin-bottom: 10px; }
        .ext-pill-card-title { font-size: 13px; font-weight: 600; color: var(--hero-text); margin-bottom: 5px; }
        .ext-pill-card-desc { font-size: 12px; color: var(--hero-muted); line-height: 1.55; }

        /* SECTION */
        .section { max-width: 1080px; margin: 0 auto; padding: 80px 40px; }
        .eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); margin-bottom: 14px; }
        .eyebrow::before { content: ''; display: inline-block; width: 14px; height: 2px; background: var(--accent); border-radius: 2px; }
        .section-h2 { font-family: 'Bricolage Grotesque', sans-serif; font-size: clamp(28px, 3.5vw, 42px); font-weight: 700; letter-spacing: -.025em; line-height: 1.1; color: var(--ink); margin-bottom: 12px; }
        .section-sub { font-size: 15px; font-weight: 300; color: var(--body); line-height: 1.8; max-width: 560px; }
        .divider { height: 1px; background: rgba(26,24,37,0.08); margin: 0 40px; }

        /* TRACK SELECTOR CARDS */
        .track-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 48px; margin-bottom: 0; }
        .track-tab { display: flex; flex-direction: column; gap: 0; padding: 24px; border-radius: 20px; border: 2px solid var(--border); background: white; cursor: pointer; transition: all .2s; font-family: 'Instrument Sans', sans-serif; text-align: left; position: relative; overflow: hidden; }
        .track-tab:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(26,24,37,0.1); }
        .track-tab.active-purple { border-color: rgba(123,104,238,0.5); background: rgba(123,104,238,0.04); box-shadow: 0 8px 32px rgba(123,104,238,0.12); }
        .track-tab.active-coral  { border-color: rgba(255,107,107,0.5); background: rgba(255,107,107,0.04); box-shadow: 0 8px 32px rgba(255,107,107,0.12); }
        .track-tab.active-teal   { border-color: rgba(61,191,168,0.5);  background: rgba(61,191,168,0.04);  box-shadow: 0 8px 32px rgba(61,191,168,0.12); }
        .tab-emoji { font-size: 32px; margin-bottom: 12px; }
        .tab-label { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
        .tab-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 19px; font-weight: 700; letter-spacing: -.02em; color: var(--ink); margin-bottom: 6px; line-height: 1.2; }
        .tab-who { font-size: 12px; color: var(--body); font-weight: 300; line-height: 1.5; margin-bottom: 14px; }
        .tab-price { font-family: 'Bricolage Grotesque', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -.02em; }
        .tab-weeks { font-size: 11px; color: var(--muted); margin-top: 1px; }
        .tab-active-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; border-radius: 0; }
        .tab-dot { display: none; }

        /* TRACK PANEL */
        .track-panel { margin-top: 16px; }
        .track-header-bar { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding: 24px 28px; border-radius: 16px 16px 0 0; border: 1px solid; border-bottom: none; }
        .track-header-left h3 { font-family: 'Bricolage Grotesque', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 4px; color: var(--ink); }
        .track-header-left p { font-size: 13px; font-weight: 300; color: var(--body); }
        .track-audience { font-size: 11px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin-top: 4px; }
        .price-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; letter-spacing: .06em; padding: 6px 16px; border-radius: 100px; color: white; white-space: nowrap; flex-shrink: 0; }

        /* UNITS TABLE */
        .units-table { width: 100%; border-collapse: collapse; border: 1px solid rgba(26,24,37,0.08); border-radius: 0 0 16px 16px; overflow: hidden; }
        .units-table th { background: white; font-size: 10px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); text-align: left; padding: 12px 18px; border-bottom: 1px solid rgba(26,24,37,0.08); }
        .units-table td { padding: 14px 18px; font-size: 13px; color: var(--body); border-bottom: 1px solid rgba(26,24,37,0.06); vertical-align: top; }
        .units-table tr:last-child td { border-bottom: none; }
        .units-table tr:hover td { background: rgba(123,104,238,0.02); }
        .capstone-row td { background: rgba(123,104,238,0.03); }
        .unit-num { font-family: 'Bricolage Grotesque', sans-serif; font-size: 12px; font-weight: 700; color: var(--muted); white-space: nowrap; }
        .unit-title { font-weight: 500; color: var(--ink); margin-bottom: 3px; font-size: 13.5px; }
        .unit-desc { font-size: 12.5px; color: var(--body); font-weight: 300; line-height: 1.6; }
        .unit-project { font-size: 12px; font-weight: 500; white-space: nowrap; }

        /* ENROLL CTA */
        .enroll-bar { background: var(--hero-bg); border-radius: 0 0 16px 16px; border: 1px solid rgba(255,255,255,0.06); border-top: none; padding: 20px 28px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .enroll-bar-text { font-size: 13px; color: var(--hero-muted); }
        .enroll-bar-text strong { color: var(--hero-text); font-weight: 500; }
        .btn-enroll { display: inline-flex; align-items: center; gap: 8px; background: var(--accent); color: white; font-family: 'Instrument Sans', sans-serif; font-size: 13px; font-weight: 500; padding: 10px 24px; border-radius: 100px; border: none; cursor: pointer; text-decoration: none; transition: transform .2s, box-shadow .2s; box-shadow: 0 4px 20px rgba(123,104,238,.3); }
        .btn-enroll:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(123,104,238,.4); }

        /* ALACARTE */
        .alacarte-bg { background: #EFEDE8; }
        .alacarte-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 40px; }
        .alacarte-card { background: white; border: 1px solid rgba(26,24,37,0.08); border-radius: 20px; padding: 28px; transition: transform .2s, box-shadow .2s; }
        .alacarte-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(26,24,37,0.09); }
        .alacarte-icon { font-size: 32px; margin-bottom: 16px; }
        .alacarte-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); background: rgba(26,24,37,0.05); border-radius: 100px; padding: 3px 10px; margin-bottom: 12px; }
        .alacarte-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: -.02em; color: var(--ink); margin-bottom: 8px; }
        .alacarte-desc { font-size: 13px; color: var(--body); font-weight: 300; line-height: 1.65; margin-bottom: 20px; }
        .alacarte-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid rgba(26,24,37,0.07); }
        .alacarte-price { font-family: 'Bricolage Grotesque', sans-serif; font-size: 20px; font-weight: 700; color: var(--accent); letter-spacing: -.02em; }
        .alacarte-cta { font-size: 12px; font-weight: 500; color: var(--muted); }

        /* FOOTER */
        .footer-wrap { background: #1C1A2E; padding: 48px 40px; }
        .footer-inner { max-width: 1080px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .footer-logo { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 16px; color: #F0EEF8; letter-spacing: -.02em; }
        .footer-logo em { font-style: normal; color: var(--accent); }
        .footer-nav { display: flex; gap: 28px; list-style: none; }
        .footer-nav a { font-size: 13px; color: rgba(240,238,248,0.5); text-decoration: none; transition: color .2s; }
        .footer-nav a:hover { color: #F0EEF8; }
        .footer-copy { font-size: 12px; color: rgba(240,238,248,0.3); }

        @media (max-width: 768px) {
          .ext-top { grid-template-columns: 1fr; }
          .popup-mockup { display: none; }
          .ext-pills-row { grid-template-columns: 1fr 1fr; }
          .alacarte-grid { grid-template-columns: 1fr 1fr; }
          .track-tabs { grid-template-columns: 1fr; }
          .hero-meta { gap: 24px; flex-wrap: wrap; }
          .section { padding: 60px 24px; }
          .courses-hero { padding: 100px 24px 60px; }
          .ext-banner { padding: 0 24px; }
          .nav-links { display: none; }
          .units-table th:nth-child(3), .units-table td:nth-child(3) { display: none; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="nav-logo">theForward<em>ist</em></a>
        <ul className="nav-links">
          <li><a href="/#shelf">What I Build</a></li>
          <li><a href="/courses">Learn</a></li>
          <li><a href="/#about">About</a></li>
          <li><a href="/#newsletter">Newsletter</a></li>
          <li><a href="#enroll" className="nav-cta">Enroll</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <div className="courses-hero">
        <div className="hero-glow" />
        <div className="hero-grid" />
        <div className="hero-inner">
          <div className="hero-tag"> AI School HQ — Curriculum</div>
          <h1>Learn AI like it was<br />made <span>for you.</span></h1>
          <p>Three tracks. Three audiences. One mission: make AI practical, accessible, and actually useful — no computer science degree required. And never was.</p>
          <div className="hero-meta">
            <div>
              <div className="hero-meta-val">3</div>
              <div className="hero-meta-label">Tracks</div>
            </div>
            <div>
              <div className="hero-meta-val"><span>10</span></div>
              <div className="hero-meta-label">Units Each</div>
            </div>
            <div>
              <div className="hero-meta-val">5</div>
              <div className="hero-meta-label">Live Projects</div>
            </div>
            <div>
              <div className="hero-meta-val">0</div>
              <div className="hero-meta-label">Prerequisites</div>
            </div>
          </div>
        </div>
      </div>

      {/* EXTENSION SHOWCASE */}
      <div className="ext-section">
        <div className="ext-section-inner">

          {/* TOP: copy + popup mockup */}
          <div className="ext-top">
            <div>
              <div style={{ marginBottom: 20 }}>
                <span className="ext-badge"> Included with Enrollment</span>
                <span className="ext-store-badge"> Coming to Chrome Web Store</span>
              </div>
              <div className="ext-title">Your AI tutor<br />lives in your <span>browser.</span></div>
              <p className="ext-desc">
                Meet <strong style={{ color: 'rgba(240,238,248,0.9)' }}>Claude Companion</strong> — a Chrome extension built alongside this curriculum, unit by unit. It activates right inside claude.ai and gives you exactly the guidance you need for the project you&apos;re working on. No tab-switching. No hunting for help. Just start your unit and it&apos;s already there.
              </p>
              <div className="ext-features">
                <div className="ext-feature">
                  <span className="ext-feature-icon"></span>
                  <div className="ext-feature-text">
                    <strong>Unit-aware guidance</strong>
                    <span>Set your track and unit in the popup. The extension loads scaffold tips, starter prompts, and project checklists tailored to exactly what you&apos;re building that week.</span>
                  </div>
                </div>
                <div className="ext-feature">
                  <span className="ext-feature-icon"></span>
                  <div className="ext-feature-text">
                    <strong>Live glossary tooltips</strong>
                    <span>Hover any AI term — prompt, agent, token, API — and get a plain-English definition without leaving the page. Built for people who didn&apos;t come from tech.</span>
                  </div>
                </div>
                <div className="ext-feature">
                  <span className="ext-feature-icon"></span>
                  <div className="ext-feature-text">
                    <strong>Three support levels</strong>
                    <span>Minimal (just a nudge), Guided (tips + prompts), or Full (full scaffold). Dial it back as you get confident. You&apos;re in control.</span>
                  </div>
                </div>
                <div className="ext-feature">
                  <span className="ext-feature-icon"></span>
                  <div className="ext-feature-text">
                    <strong>Built in public — Unit 7 is literally this</strong>
                    <span>Track A, Unit 7 is &quot;Building in the Browser.&quot; Students watch this extension get built live, then build their own. The curriculum and the tool are the same thing.</span>
                  </div>
                </div>
              </div>
              <div className="ext-enroll-note"> Extension access included with any track enrollment</div>
            </div>

            {/* REAL SCREENSHOTS */}
            <div className="ext-screenshot-wrap">
              <img
                src="/screenshots/ext-sidebar.png"
                alt="Claude Companion sidebar open on claude.ai showing Unit 3 scaffold tips and starter prompt"
                className="ext-screenshot-sidebar"
              />
              <img
                src="/screenshots/ext-popup.png"
                alt="Claude Companion popup showing track selector with Builder's Cohort selected"
                className="ext-popup-float"
              />
              <div style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: 'rgba(240,238,248,0.3)', fontStyle: 'italic' }}>
                Coming to Chrome Web Store · Free with enrollment
              </div>
            </div>
          </div>

          {/* BOTTOM: 4-up feature cards */}
          <div className="ext-pills-row">
            <div className="ext-pill-card">
              <div className="ext-pill-card-icon"></div>
              <div className="ext-pill-card-title">Starter Prompts</div>
              <div className="ext-pill-card-desc">Every unit ships with a ready-to-run prompt you can paste into Claude and immediately get results.</div>
            </div>
            <div className="ext-pill-card">
              <div className="ext-pill-card-icon"></div>
              <div className="ext-pill-card-desc">The sidebar nudge tells you exactly what to do next — never stare at a blank Claude window wondering where to start.</div>
              <div className="ext-pill-card-title">Step-by-Step Nudges</div>
            </div>
            <div className="ext-pill-card">
              <div className="ext-pill-card-icon"></div>
              <div className="ext-pill-card-title">30+ Glossary Terms</div>
              <div className="ext-pill-card-desc">Hover any jargon — prompt, agent, token, system prompt — and get a plain-English definition in place.</div>
            </div>
            <div className="ext-pill-card">
              <div className="ext-pill-card-icon"></div>
              <div className="ext-pill-card-title">Unlocks as You Progress</div>
              <div className="ext-pill-card-desc">Each unit you complete unlocks the next unit&apos;s content. Your progress, your pace, your browser.</div>
            </div>
          </div>

        </div>
      </div>

      {/* CURRICULUM TRACKS */}
      <div style={{ background: 'var(--page-bg)' }}>
        <div className="section">
          <div className="eyebrow">Curriculum Tracks</div>
          <h2 className="section-h2">Ten weeks.<br />Three ways to learn it.</h2>
          <p className="section-sub">Each track covers the same core skills — prompting, building, automating, deploying — through the lens of what matters most to that audience. Same destination, different road.</p>

          {/* TRACK SELECTOR CARDS */}
          <div className="track-tabs">
            {tracks.map(t => (
              <button
                key={t.id}
                className={`track-tab ${activeTrack === t.id ? `active-${t.color}` : ''}`}
                onClick={() => setActiveTrack(t.id)}
              >
                <div className="tab-emoji">{t.id === 'A' ? '' : t.id === 'B' ? '' : ''}</div>
                <div className="tab-label">{t.label}</div>
                <div className="tab-title">{t.id === 'A' ? 'For Everyday Builders' : t.id === 'B' ? 'For Small Business Owners' : 'For High Schoolers'}</div>
                <div className="tab-who">{t.audience}</div>
                <div className="tab-price" style={{ color: t.accent }}>{t.price}</div>
                <div className="tab-weeks">10 weeks · {t.id === 'C' ? 'Teen-friendly pace' : 'Live cohort'}</div>
                {activeTrack === t.id && <div className="tab-active-bar" style={{ background: t.accent }} />}
              </button>
            ))}
          </div>

          {/* TRACK PANEL */}
          <div className="track-panel">
            <div
              className="track-header-bar"
              style={{
                background: track.accentSoft,
                borderColor: track.accentBorder,
              }}
            >
              <div className="track-header-left">
                <h3>{track.title}</h3>
                <p>{track.tagline}</p>
                <div className="track-audience">{track.audience}</div>
              </div>
              <span className="price-badge" style={{ background: track.accent }}>
                10 Weeks · {track.price}
              </span>
            </div>

            <table className="units-table">
              <thead>
                <tr>
                  <th style={{ width: 64 }}>Unit</th>
                  <th>Topic & What You Learn</th>
                  <th style={{ width: 180 }}>Project / Deliverable</th>
                </tr>
              </thead>
              <tbody>
                {track.units.map(u => (
                  <tr key={u.n} className={u.capstone ? 'capstone-row' : ''}>
                    <td><div className="unit-num">Unit {u.n}</div></td>
                    <td>
                      <div className="unit-title">{u.title}</div>
                      <div className="unit-desc">{u.desc}</div>
                    </td>
                    <td>
                      <div className="unit-project" style={{ color: track.accent }}>{u.project}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="enroll-bar" id="enroll">
              <div className="enroll-bar-text">
                <strong>Ready to start?</strong> Join the waitlist — {track.title} · {track.price} · Includes Chrome Extension access
              </div>
              <a href="/#newsletter" className="btn-enroll">Join the Waitlist →</a>
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* À-LA-CARTE */}
      <div className="alacarte-bg">
        <div className="section">
          <div className="eyebrow">À-la-carte</div>
          <h2 className="section-h2">Not ready for 10 weeks?<br />Start with one skill.</h2>
          <p className="section-sub">Focused workshops on single topics — no fluff, no commitment. Pick the one that solves your most urgent problem right now.</p>
          <div className="alacarte-grid">
            {alacarte.map(c => (
              <div key={c.title} className="alacarte-card">
                <div className="alacarte-icon">{c.icon}</div>
                <div className="alacarte-tag">{c.tag}</div>
                <div className="alacarte-title">{c.title}</div>
                <div className="alacarte-desc">{c.desc}</div>
                <div className="alacarte-footer">
                  <div className="alacarte-price">{c.price}</div>
                  <div className="alacarte-cta">Notify me →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer-wrap">
        <div className="footer-inner">
          <div className="footer-logo">theForward<em>ist</em></div>
          <ul className="footer-nav">
            <li><a href="/#shelf">What I Build</a></li>
            <li><a href="/courses">Courses</a></li>
            <li><a href="/#newsletter">Newsletter</a></li>
            <li><a href="/#about">About</a></li>
          </ul>
          <p className="footer-copy">Built with Claude · © 2026</p>
        </div>
      </div>
    </>
  )
}
