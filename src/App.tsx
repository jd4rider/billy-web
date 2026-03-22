import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const SUBSCRIBE_URL = 'https://billy-worker.billysh.workers.dev/subscribe';

const DOCS_URL = 'https://jd4rider.github.io/billy-starlight';
const GITHUB_URL = 'https://github.com/jd4rider/billy-app';
const INSTALL_URL = 'https://raw.githubusercontent.com/jd4rider/billy-app/main/scripts/install.sh';

// ── Checkout URLs ────────────────────────────────────────────────────────────
// Add ?test=1 to the page URL to switch all checkout buttons to LS test-mode.
// Replace the TEST_* values with your LemonSqueezy test-mode checkout URLs.
const TEST_MODE = new URLSearchParams(window.location.search).has('test');

const URLS = {
  live: {
    pro:    'https://billysh.lemonsqueezy.com/checkout/buy/e42e130f-96b1-48ba-b4d7-93bb59792606?enabled=1420712',
    premium:'https://billysh.lemonsqueezy.com/checkout/buy/3e85bc44-f294-414c-a34d-ccf3e42dc87d?enabled=1420713',
    team5:  'https://billysh.lemonsqueezy.com/checkout/buy/5445951a-324e-43a1-9f21-15b7adb67bdf?enabled=1420715',
    team10: 'https://billysh.lemonsqueezy.com/checkout/buy/47d0ac97-30e8-46d1-bab8-296a08a7bef4?enabled=1420716',
    team25: 'https://billysh.lemonsqueezy.com/checkout/buy/472a5778-f973-4bf1-af57-f936f0db2d40?enabled=1420717',
  },
  test: {
    pro:    'https://billysh.lemonsqueezy.com/checkout/buy/c4644f9f-4521-4cd0-b996-d54ff66d6dc8?enabled=1408429',
    premium:'https://billysh.lemonsqueezy.com/checkout/buy/6e29b223-17b3-44d4-8fb9-2d166343b04a?enabled=1408393',
    team5:  'https://billysh.lemonsqueezy.com/checkout/buy/b3d7bfaf-7917-4e27-bf22-75a86ff027f6?enabled=1408425',
    team10: 'https://billysh.lemonsqueezy.com/checkout/buy/0f746ded-8bca-4ff9-807a-356c1c9cfeb9?enabled=1408426',
    team25: 'https://billysh.lemonsqueezy.com/checkout/buy/5189e3c4-9b10-4745-83aa-a6129be85840?enabled=1408428',
  },
};

const checkout = TEST_MODE ? URLS.test : URLS.live;

interface Feature {
  icon: string;
  title: string;
  desc: string;
  detail: { body: string; bullets: string[]; code?: string; };
}

const features: Feature[] = [
  {
    icon: '🔒', title: 'Fully Private',
    desc: 'All AI runs on your machine via Ollama. No data ever leaves your computer.',
    detail: {
      body: "Every token of every conversation stays on your hardware. There's no telemetry, no usage analytics, no model training on your code. Once the model is downloaded, Billy works fully offline.",
      bullets: [
        'Zero network calls during inference — pure local compute',
        'Perfect for proprietary code, NDA projects, and sensitive environments',
        'No account required — not even an email address',
        'All history stored in ~/.localai/history.db on your machine only',
      ],
    },
  },
  {
    icon: '💸', title: 'No Subscription',
    desc: 'Pay once for Pro or use the free tier forever. No monthly fees, no API keys.',
    detail: {
      body: 'The SaaS AI tools add up fast. Copilot is $10/month, Cursor is $20/month — that\'s $360/year before you\'ve written a line of code. Billy is a one-time purchase that pays for itself in weeks.',
      bullets: [
        'Free tier: unlimited chat, model switching, full TUI — forever',
        'Pro ($19 one-time): memory persistence, custom endpoints, 2 machines',
        'Premium: coming soon — more activations + priority features',
        'Compare: Copilot $120/yr · Cursor $240/yr · Billy $19 once',
      ],
    },
  },
  {
    icon: '🤖', title: 'Agentic Mode',
    desc: 'Billy proposes shell commands and runs them with your approval. Reads output and self-debugs until it works.',
    detail: {
      body: 'When Billy suggests a shell command, it detects the code block and asks permission before running it. It reads the output, feeds it back to the model, and keeps iterating until the task is done.',
      bullets: [
        'Three approval options: Yes (once) · Always (session) · No',
        'Output is captured and injected back into the conversation',
        'Self-debugs on non-zero exit codes automatically',
        'Toggle between Agentic and Safe mode with /mode',
      ],
      code: 'you › fix the failing test\nBilly › Running: go test ./...\n  ┌─ Run command? ──────────────────┐\n  │  go test ./...                  │\n  │  [Y]es  [A]lways  [N]o          │\n  └─────────────────────────────────┘',
    },
  },
  {
    icon: '🧠', title: 'Memory System',
    desc: 'Billy learns about you over time. Just say "remember that..." — it saves automatically.',
    detail: {
      body: "You shouldn't have to re-establish context every session. Just talk to Billy like a collaborator — it detects save intent and stores facts automatically. On Pro+, memories persist indefinitely across every session.",
      bullets: [
        '"Remember that I\'m building a SaaS in Go" — just say it',
        'Stored locally in SQLite, never synced to any server',
        'Injected into every conversation as context automatically',
        'Manage with /memory — list, forget by ID, or clear all',
        'Free tier: session-only · Pro+: persistent across all sessions',
      ],
    },
  },
  {
    icon: '📜', title: 'Session History',
    desc: 'Full conversation history with an interactive session picker. Resume any chat with /history.',
    detail: {
      body: 'Every conversation is saved automatically. Open the session picker to browse, search, and resume any past chat — with full context restored so you can pick up exactly where you left off.',
      bullets: [
        'All sessions saved locally to ~/.localai/history.db',
        '/history opens an interactive fuzzy-search session picker',
        '/session save <name> creates a named checkpoint',
        '/compact summarises long sessions to free up context window',
        'Sessions never expire or get deleted automatically',
      ],
    },
  },
  {
    icon: '⌨️', title: 'Command Picker',
    desc: 'Type / to open a live-filtered command popup. Navigate with arrow keys, execute with Enter.',
    detail: {
      body: "No need to memorise every command. Type / in the input and a live-filtered popup appears with every available command. It's the fastest way to navigate Billy without breaking your flow.",
      bullets: [
        'Fuzzy-filtered as you type — finds commands instantly',
        'Arrow keys to navigate, Enter to execute, Esc to dismiss',
        'Shows commands with descriptions inline',
        'Available commands: /mode, /memory, /model, /pull, /history, /compact, /hint, /backend and more',
      ],
      code: 'you › /mo\n  ┌─ Commands ──────────────────────┐\n  │ ▶ /mode      Switch chat mode   │\n  │   /model     Pick Ollama model  │\n  │   /memory    Manage memories    │\n  └─────────────────────────────────┘',
    },
  },
  {
    icon: '🔄', title: 'Model Switching',
    desc: 'Switch between any Ollama model on the fly. Pull new models with /pull without leaving the app.',
    detail: {
      body: 'Billy is model-agnostic. Use any model Ollama supports — code models, general models, multimodal models. Pro+ users can also point Billy at any OpenAI-compatible endpoint like Groq, LM Studio, or your own server.',
      bullets: [
        '/model opens a picker showing all locally available models',
        '/pull <name> downloads a new model without leaving the app',
        'Pro+: /backend lets you switch to any OpenAI-compatible API',
        'Works with Ollama, Groq, LM Studio, or a self-hosted endpoint',
        'Recommended default: qwen2.5-coder:14b for coding tasks',
      ],
    },
  },
  {
    icon: '📊', title: 'Progress Bars',
    desc: 'Spring-physics progress bars and collapsible command output — click or Ctrl+X to expand.',
    detail: {
      body: 'Long-running commands have animated progress bars. Output appears in collapsible blocks so the chat stays readable. Teaching Mode replaces auto-run commands with "type this yourself" boxes — great for learning.',
      bullets: [
        'Spring-physics animated progress bars during command execution',
        'Click any output block or press Ctrl+X to expand/collapse',
        'Long outputs are truncated in-view but fully accessible',
        'Teaching Mode (/mode teach): shows commands to type instead of running them',
        '/hint requests a step-by-step explanation of the last suggestion',
      ],
    },
  },
];

const installCommands: Record<string, string> = {
  'macOS / Linux (Slim)':  `curl -fsSL ${INSTALL_URL} | bash`,
  'Full (Ollama bundled)': `curl -fsSL ${INSTALL_URL} | bash -s -- --full`,
  'Homebrew':              `brew tap jd4rider/billy && brew install billy`,
  'Scoop (Windows)':       `scoop bucket add billy https://github.com/jd4rider/scoop-billy\nscoop install billy`,
  'Build from source':     `git clone ${GITHUB_URL}.git\ncd billy-app && go build -o billy ./cmd/billy`,
};

function FeatureModal({ feature, onClose }: { feature: Feature; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-icon">{feature.icon}</div>
        <h2 className="modal-title">{feature.title}</h2>
        <p className="modal-body">{feature.detail.body}</p>
        {feature.detail.code && (
          <pre className="modal-code">{feature.detail.code}</pre>
        )}
        <ul className="modal-bullets">
          {feature.detail.bullets.map(b => <li key={b}>{b}</li>)}
        </ul>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const [active, setActive] = useState<Feature | null>(null);
  return (
    <>
      <section className="section" id="features">
        <div className="container">
          <div className="section-label">Features</div>
          <h2>Everything you need, nothing you don't</h2>
          <p className="section-sub">Built with Go + Bubble Tea. Fast, lightweight, terminal-native.</p>
          <div className="features-grid">
            {features.map(f => (
              <div
                className="feature-card feature-card-clickable"
                key={f.title}
                onClick={() => setActive(f)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setActive(f)}
              >
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className="feature-learn">Learn more →</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {active && <FeatureModal feature={active} onClose={() => setActive(null)} />}
    </>
  );
}

function TerminalDemo() {
  return (
    <div className="terminal-demo">
      <div className="terminal-bar">
        <div className="term-dot" style={{ background: '#ff5f57' }} />
        <div className="term-dot" style={{ background: '#ffbd2e' }} />
        <div className="term-dot" style={{ background: '#28c840' }} />
        <span className="term-title">billy</span>
      </div>
      <div className="terminal-body">
        <div><span className="t-billy">Billy</span> <span className="t-dim">v0.1.1-alpha · mistral · FREE</span></div>
        <div className="t-dim">─────────────────────────────────────</div>
        <div><span className="t-prompt">you › </span><span className="t-cmd">Remember that I'm building a SaaS in Go</span></div>
        <div><span className="t-billy">Billy › </span><span className="t-res">Got it! I'll remember that you're building a SaaS product in Go. 🐐</span></div>
        <div className="t-dim">&nbsp;</div>
        <div><span className="t-prompt">you › </span><span className="t-cmd">What's a good way to handle database migrations?</span></div>
        <div><span className="t-billy">Billy › </span><span className="t-res">For your Go SaaS, I'd recommend <strong>goose</strong> or <strong>golang-migrate</strong>...</span></div>
        <div className="t-dim">&nbsp;</div>
        <div><span className="t-prompt">you › </span><span className="t-cmd">/</span><span className="t-dim"> ← command picker opens</span></div>
      </div>
    </div>
  );
}

function InstallSection() {
  const tabs = Object.keys(installCommands);
  const [active, setActive] = useState(tabs[0]);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(installCommands[active]).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <section className="install-section" id="install">
      <div className="container">
        <div className="section-label">Install</div>
        <h2>Get Billy in 60 seconds</h2>
        <p className="section-sub" style={{ marginBottom: 32 }}>
          Requires <a href="https://ollama.com" target="_blank" rel="noreferrer">Ollama</a> running locally,
          or use the Full build which bundles Ollama automatically.
        </p>
        <div className="install-tabs">
          {tabs.map(t => (
            <button key={t} className={`tab-btn${active === t ? ' active' : ''}`} onClick={() => setActive(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="code-block">
          <code style={{ whiteSpace: 'pre' }}>{installCommands[active]}</code>
          <button className="copy-btn" onClick={copy}>{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="section" id="pricing">
      <div className="container" style={{ textAlign: 'center' }}>
        <div className="section-label">Pricing</div>
        <h2>Simple, honest pricing</h2>
        <p className="section-sub" style={{ margin: '0 auto 12px' }}>
          Start free. Upgrade when you're ready — one-time payment, no subscription.
        </p>
        <p className="pre-alpha-note">Alpha — download now free while we build out features.</p>

        {/* Main 3-col grid: Free / Pro / Premium */}
        <div className="pricing-grid">

          {/* FREE */}
          <div className="pricing-card">
            <div><span className="badge badge-free">Free</span></div>
            <div className="pricing-name" style={{ marginTop: 12 }}>Starter</div>
            <div className="pricing-price">$0</div>
            <div className="pricing-desc">Open source. Always free.</div>
            <ul className="pricing-features">
              <li><span className="check">✓</span> 20 messages per session</li>
              <li><span className="check">✓</span> Local Ollama only</li>
              <li><span className="check">✓</span> 5 conversation history slots</li>
              <li><span className="check">✓</span> Basic slash commands</li>
              <li><span className="cross">✗</span> Memory persistence</li>
              <li><span className="cross">✗</span> Multiple backends</li>
            </ul>
            <a href={`${GITHUB_URL}/releases`} className="btn btn-outline" target="_blank" rel="noreferrer">
              Download Free
            </a>
          </div>

          {/* PRO */}
          <div className="pricing-card featured">
            <div><span className="badge badge-pro">Pro</span></div>
            <div className="pricing-name" style={{ marginTop: 12 }}>Pro</div>
            <div className="pricing-price">$19 <span>one-time</span></div>
            <div className="pricing-desc">Full features, forever. <strong>Use on 2 machines.</strong></div>
            <ul className="pricing-features">
              <li><span className="check">✓</span> <strong>Unlimited</strong> messages</li>
              <li><span className="check">✓</span> <strong>Install on 2 machines</strong> (home + work)</li>
              <li><span className="check">✓</span> All backends (Ollama, Groq, custom HTTP)</li>
              <li><span className="check">✓</span> Full conversation history</li>
              <li><span className="check">✓</span> Memory system</li>
              <li><span className="check">✓</span> All slash commands</li>
            </ul>
            <div className="pricing-compare">vs. GitHub Copilot $10/mo forever</div>
            <a href={checkout.pro} className="btn btn-primary" target="_blank" rel="noreferrer">
              Buy Pro — $19
            </a>
          </div>

          {/* PREMIUM */}
          <div className="pricing-card">
            <div><span className="badge badge-premium">Premium</span></div>
            <div className="pricing-name" style={{ marginTop: 12 }}>Premium</div>
            <div className="pricing-price">$49 <span>one-time</span></div>
            <div className="pricing-desc">Everything in Pro. <strong>Use on 3 machines.</strong></div>
            <ul className="pricing-features">
              <li><span className="check">✓</span> Everything in Pro</li>
              <li><span className="check">✓</span> <strong>Install on 3 machines</strong></li>
              <li><span className="check">✓</span> Future: voice mode (Whisper + Piper TTS)</li>
              <li><span className="check">✓</span> Future: IDE plugins (VS Code, JetBrains)</li>
              <li><span className="check">✓</span> Priority support (email)</li>
            </ul>
            <div className="pricing-compare">vs. Cursor $20/mo — pay once, done</div>
            <button className="btn btn-amber" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              Premium — Coming Soon
            </button>
          </div>

        </div>

        {/* TEAM */}
        <div className="team-card">
          <div className="team-card-inner">
            <div className="team-card-left">
              <span className="badge badge-team">Team</span>
              <div className="pricing-name" style={{ marginTop: 12 }}>Team</div>
              <div className="pricing-price">$14 <span>/seat</span></div>
              <div className="pricing-desc">Volume pricing for development teams.</div>
              <ul className="pricing-features">
                <li><span className="check">✓</span> Everything in Pro</li>
                <li><span className="check">✓</span> Shared team memory</li>
                <li><span className="check">✓</span> Admin dashboard (coming soon)</li>
                <li><span className="check">✓</span> Volume discounts</li>
              </ul>
            </div>
            <div className="team-card-right">
              <div className="seat-options">
                <div className="seat-option">
                  <span className="seat-label">5 seats</span>
                  <span className="seat-price">$70</span>
                  <a href={checkout.team5} className="btn btn-outline" target="_blank" rel="noreferrer">Buy</a>
                </div>
                <div className="seat-option">
                  <span className="seat-label">10 seats</span>
                  <span className="seat-price">$130</span>
                  <a href={checkout.team10} className="btn btn-outline" target="_blank" rel="noreferrer">Buy</a>
                </div>
                <div className="seat-option">
                  <span className="seat-label">25 seats</span>
                  <span className="seat-price">$300</span>
                  <a href={checkout.team25} className="btn btn-outline" target="_blank" rel="noreferrer">Buy</a>
                </div>
              </div>
              <p className="enterprise-note">
                Need 50+ seats? <a href="tel:+14063967246">Call 406-396-7246</a> for Enterprise pricing.
              </p>
            </div>
          </div>
        </div>

        {/* ENTERPRISE */}
        <div className="enterprise-cta">
          <div className="enterprise-inner">
            <div className="enterprise-info">
              <span className="badge badge-enterprise">Enterprise</span>
              <div className="pricing-name" style={{ marginTop: 12 }}>Enterprise</div>
              <div className="pricing-price" style={{ fontSize: '1.6rem' }}>Custom pricing</div>
              <div className="pricing-desc">Unlimited seats, self-hosted option, dedicated support.</div>
            </div>
            <ul className="pricing-features enterprise-features">
              <li><span className="check">✓</span> Unlimited seats</li>
              <li><span className="check">✓</span> Self-hosted option</li>
              <li><span className="check">✓</span> Custom integrations</li>
              <li><span className="check">✓</span> Dedicated support</li>
              <li><span className="check">✓</span> SLA</li>
            </ul>
            <div className="enterprise-ctas">
              <a href="tel:+14063967246" className="btn btn-primary">📞 406-396-7246</a>
              <a href="mailto:jd4rider@gmail.com" className="btn btn-outline">✉ jd4rider@gmail.com</a>
            </div>
          </div>
        </div>

        <p className="pricing-promo-note">Have a discount code? Enter it at checkout — LemonSqueezy applies it automatically.</p>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const subscribe = async () => {
    if (!email.trim() || !email.includes('@')) {
      setMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch(SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { ok: boolean; message: string };
      setMsg(data.message);
      setStatus(data.ok ? 'success' : 'error');
      if (data.ok) setEmail('');
    } catch {
      setMsg('Could not subscribe right now. Try again later.');
      setStatus('error');
    }
  };

  return (
    <section className="newsletter-section" id="newsletter">
      <div className="container">
        <div className="newsletter-inner">
          <div className="newsletter-text">
            <h2>Stay in the loop</h2>
            <p>
              Get notified when new features ship, devlog posts go live, and when Billy hits beta.
              No spam. Unsubscribe anytime.
            </p>
          </div>
          <div className="newsletter-form-wrap">
            <div className="newsletter-form">
              <input
                type="email"
                className="newsletter-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && subscribe()}
                disabled={status === 'loading' || status === 'success'}
              />
              <button
                className="btn btn-primary"
                onClick={subscribe}
                disabled={status === 'loading' || status === 'success'}
              >
                {status === 'loading' ? 'Subscribing…' : status === 'success' ? '✓ Subscribed!' : 'Subscribe'}
              </button>
            </div>
            {msg && (
              <p className={`newsletter-msg ${status === 'success' ? 'nl-success' : 'nl-error'}`}>{msg}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

interface BlogPost { slug: string; url: string; title: string; date: string; excerpt: string; tags: string[]; }

const BLOG_BASE = 'https://jd4rider.github.io/billy-blog/blog';

const blogPosts: BlogPost[] = [
  {
    slug: 'introducing-billy-sh',
    url: `${BLOG_BASE}/introducing-billy-sh/`,
    title: 'Introducing Billy.sh — Why I Built a Local AI Coding Assistant',
    date: 'Mar 17 2026',
    excerpt: 'GitHub Copilot costs $10/month. Cursor is $20/month. I wanted a fast, private AI pair programmer that runs entirely on my machine — so I built one in Go.',
    tags: ['announcement', 'open-source'],
  },
  {
    slug: 'how-billys-memory-works',
    url: `${BLOG_BASE}/how-billys-memory-works/`,
    title: "How Billy's Memory System Works",
    date: 'Mar 17 2026',
    excerpt: "Just say \"remember that I'm building a SaaS in Go\" — Billy stores it and injects it into every future prompt. Here's how the natural language detection works under the hood.",
    tags: ['deep-dive', 'go'],
  },
  {
    slug: 'local-ai-good-enough',
    url: `${BLOG_BASE}/local-ai-good-enough/`,
    title: 'Is Local AI Good Enough for Real Dev Work?',
    date: 'Mar 17 2026',
    excerpt: "I've been coding with qwen2.5-coder:14b locally for a while now. Here's my honest take on where local models shine — and where they still fall short.",
    tags: ['opinion', 'ollama'],
  },
];

function BlogSection() {
  return (
    <section className="section" id="blog">
      <div className="container">
        <div className="section-label">Blog</div>
        <h2>From the author</h2>
        <p className="section-sub">Development insights, tutorials, and the story of building Billy.sh.</p>
        <div className="blog-grid">
          {blogPosts.map(post => (
            <div className="blog-card" key={post.slug}>
              <div className="blog-tags">
                {post.tags.map(t => <span className="blog-tag" key={t}>{t}</span>)}
              </div>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="blog-meta">
                <span className="blog-date">{post.date}</span>
                <a href={post.url} target="_blank" rel="noreferrer" className="blog-read-link">Read →</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface DevlogEntry { version: string; date: string; title: string; items: string[]; }

const devlogEntries: DevlogEntry[] = [
  {
    version: 'v0.1.8-alpha',
    date: 'March 2026',
    title: 'Custom endpoints & multi-backend support',
    items: [
      'Pro+ users can now point Billy at any OpenAI-compatible endpoint — Groq, OpenRouter, LM Studio, your own server',
      'New backend config: set backend.type = "custom", backend.url, backend.model, backend.api_key in config.toml',
      'Environment variable overrides: BILLY_BACKEND_TYPE, BILLY_BACKEND_URL, BILLY_BACKEND_MODEL, BILLY_API_KEY',
      '/backend command shows active backend, model, and config file path',
      '/backend reload — hot-reload backend settings without restarting Billy',
      'Ollama auto-launch skipped when pointing at a remote host',
      'License gate enforced in the factory — free tier stays local-only',
    ],
  },
  {
    version: 'v0.1.7-alpha',
    date: 'March 2026',
    title: 'Licensing polish & UX improvements',
    items: [
      'Polished /activate, /deactivate, and /license display text — clearer prompts and status messages',
      'One-shot mode respects license tier limits consistently with TUI mode',
      'README rewrite — full command reference, configuration guide, environment variables, and roadmap',
      'Variant ID map updated for both test and live LemonSqueezy products',
    ],
  },
  {
    version: 'v0.1.6-alpha',
    date: 'March 2026',
    title: 'LemonSqueezy native activation & /deactivate',
    items: [
      'Migrated from custom Ed25519 keys to LemonSqueezy License Keys API — phone-home activation with seat enforcement',
      'Pro license: 2 activations (home + work machine); Premium: 3 activations',
      'New /deactivate command — frees your seat so you can move to another machine',
      'Upgrade path: activating a new key (e.g. Pro → Premium) auto-deactivates the old seat',
      'Background re-validation every 7 days keeps licenses current without interrupting work',
      'Activation stored encrypted in SQLite — no plaintext keys on disk',
    ],
  },
  {
    version: 'v0.1.1-alpha',
    date: 'March 2026',
    title: 'Agentic mode, collapsible output & TUI polish',
    items: [
      'Interactive agentic picker — arrow-key Approve / Skip / Abort / Run all instead of y/n',
      'Command output fed back to Billy as context — self-debugging loop until it works',
      'Collapsible long output: click or Ctrl+X to expand; Billy reads full content',
      'Progress bars via harmonica spring-physics animation',
      'Mouse support — click to expand collapsed command output',
      'You › / Billy › / Command › labels consistently left-aligned (lipgloss newline fix)',
    ],
  },
  {
    version: 'v0.1.0-alpha',
    date: 'March 2026',
    title: 'First public release',
    items: [
      'Full TUI with Bubble Tea — chat, history, command picker',
      'Memory system — natural language detection + system prompt injection',
      'Agentic mode — shell command detection with permission prompts',
      'Slash commands: /suggest, /explain, /cd, /ls, /git, /compact, /session',
      'License system — Ed25519 keys, offline validation, 5 tiers',
      'Homebrew tap + Scoop bucket + .deb/.rpm/.apk packages',
    ],
  },
  {
    version: 'v0.0.8',
    date: 'February 2026',
    title: 'Memory & session history',
    items: [
      'SQLite-backed conversation history with interactive /history picker',
      'Context compaction (/compact) — AI summarizes old messages to save tokens',
      'Session checkpoints (/session) — save and restore named conversation points',
      'Token estimate in status bar with amber warning at 75% capacity',
    ],
  },
  {
    version: 'v0.0.5',
    date: 'January 2026',
    title: 'Core TUI & Ollama integration',
    items: [
      'Bubble Tea TUI with viewport, word wrap, and streaming spinner',
      'Ollama HTTP backend — streaming chat responses',
      'TOML config system and SQLite history store',
      'Billy goat mascot — SVG + PNG at 9 sizes + favicon',
    ],
  },
];

// ── Testimonials ─────────────────────────────────────────────────────────────
// Add real quotes here as they come in. Name + role + quote is all you need.
// For Product Hunt reviews, link to the PH page instead of a URL.
interface Testimonial { name: string; role: string; quote: string; avatar?: string; }

const testimonials: Testimonial[] = [
  // Placeholder — replace with real user quotes as they come in.
  // {
  //   name: 'Jane D.',
  //   role: 'Senior SWE at Acme',
  //   quote: 'Replaced Copilot CLI on day one. No API bills, same quality.',
  // },
];

function TestimonialsSection() {
  if (testimonials.length === 0) return null; // hide until we have real quotes
  return (
    <section className="section" id="reviews">
      <div className="container" style={{ textAlign: 'center' }}>
        <div className="section-label">Reviews</div>
        <h2>What developers are saying</h2>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">
                {t.avatar && <img src={t.avatar} alt={t.name} className="testimonial-avatar" />}
                <div>
                  <strong>{t.name}</strong>
                  <span className="testimonial-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductHuntSection() {
  return (
    <section className="section" id="producthunt">
      <div className="container" style={{ textAlign: 'center' }}>
        <div className="section-label">Product Hunt</div>
        <h2>We're live on Product Hunt 🎉</h2>
        <p className="section-sub">If Billy saves you money on subscriptions, an upvote goes a long way.</p>
        <div className="ph-badge-row">
          <a href="https://www.producthunt.com/posts/billy-sh?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-billy-sh"
            target="_blank" rel="noreferrer">
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=billy-sh&theme=dark"
              alt="Billy.sh - Local AI coding assistant, no subscription | Product Hunt"
              style={{ width: 250, height: 54 }}
            />
          </a>
        </div>
      </div>
    </section>
  );
}

function GiscusSection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || ref.current.querySelector('iframe')) return;
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', 'jd4rider/billy-web');
    script.setAttribute('data-repo-id', 'R_kgDORnzA2Q');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDORnzA2c4C4v0W');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'dark');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    ref.current.appendChild(script);
  }, []);
  return (
    <section className="section bg-alt" id="community">
      <div className="container">
        <div className="section-label">Community</div>
        <h2>Questions & feedback</h2>
        <p className="section-sub">Ask questions, share what you built, or leave a review. Sign in with GitHub.</p>
        <div className="giscus-fallback">
          <a href="https://github.com/jd4rider/billy-web/discussions" target="_blank" rel="noreferrer" className="btn btn-secondary">
            💬 Open GitHub Discussions
          </a>
        </div>
        <div ref={ref} className="giscus-container" />
      </div>
    </section>
  );
}

function DevlogSection() {
  return (
    <section className="section bg-alt" id="devlog">
      <div className="container">
        <div className="section-label">Devlog</div>
        <h2>What we've shipped</h2>
        <p className="section-sub">A running log of what's been built, version by version.</p>
        <div className="devlog-timeline">
          {devlogEntries.map((entry, i) => (
            <div className="devlog-entry" key={entry.version}>
              <div className="devlog-marker">
                <div className="devlog-dot" />
                {i < devlogEntries.length - 1 && <div className="devlog-line" />}
              </div>
              <div className="devlog-content">
                <div className="devlog-header">
                  <span className="devlog-version">{entry.version}</span>
                  <span className="devlog-date">{entry.date}</span>
                </div>
                <div className="devlog-title">{entry.title}</div>
                <ul className="devlog-items">
                  {entry.items.map(item => (
                    <li key={item}><span className="check">✓</span> {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NavHamburger({ docsUrl, githubUrl }: { docsUrl: string; githubUrl: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <nav>
      <div className="nav-inner">
        <a href="/" className="nav-logo">
          <img src={process.env.PUBLIC_URL + '/favicon.svg'} alt="Billy goat logo" />
          Billy.sh
        </a>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#install">Install</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#blog">Blog</a></li>
          <li><a href="#devlog">Devlog</a></li>
          <li><a href={docsUrl} target="_blank" rel="noreferrer">Docs</a></li>
          <li>
            <a href={githubUrl} className="btn btn-outline" target="_blank" rel="noreferrer">★ GitHub</a>
          </li>
        </ul>
        <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>
      </div>
      <div className={`nav-mobile${open ? ' open' : ''}`}>
        <a href="#features" onClick={close}>Features</a>
        <a href="#install" onClick={close}>Install</a>
        <a href="#pricing" onClick={close}>Pricing</a>
        <a href="#blog" onClick={close}>Blog</a>
        <a href="#devlog" onClick={close}>Devlog</a>
        <a href={docsUrl} target="_blank" rel="noreferrer" onClick={close}>Docs</a>
        <a href={githubUrl} target="_blank" rel="noreferrer" onClick={close}>★ GitHub</a>
      </div>
    </nav>
  );
}

function App() {
  return (
    <div>
      {TEST_MODE && (
        <div style={{ background: '#f59e0b', color: '#000', textAlign: 'center', padding: '6px 12px', fontSize: 13, fontWeight: 600 }}>
          ⚠️ TEST MODE — checkout buttons use LemonSqueezy test-mode URLs. Use a test card (e.g. 4242 4242 4242 4242).
        </div>
      )}
      {/* NAV */}
      <NavHamburger docsUrl={DOCS_URL} githubUrl={GITHUB_URL} />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            <span className="badge badge-alpha">Alpha — expect rough edges</span>
          </div>
          <h1>
            AI coding assistant<br />
            <span>without the monthly bill.</span>
          </h1>
          <p>
            Billy runs entirely on your machine using local Ollama models.
            No API keys, no subscriptions, no data leaving your computer.
          </p>
          <div className="hero-ctas">
            <a href="#install" className="btn btn-primary" style={{ fontSize: '1rem', padding: '12px 28px' }}>
              ⬇ Download Free
            </a>
            <a href="#pricing" className="btn btn-outline" style={{ fontSize: '1rem', padding: '12px 28px' }}>
              Buy Pro — $19
            </a>
            <a href={GITHUB_URL} className="btn btn-outline" target="_blank" rel="noreferrer" style={{ fontSize: '1rem', padding: '12px 28px' }}>
              ★ Star on GitHub
            </a>
          </div>
          <div className="hero-sub">
            Free forever · One-time Pro upgrade · Open source
          </div>
          <TerminalDemo />
        </div>
      </section>

      {/* AdSense Banner - enable after account approval
      <div className="ad-banner">
        <ins className="adsbygoogle" style={{display: 'block'}}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="XXXXXXXXXX"
          data-ad-format="auto" />
      </div>
      */}

      {/* FEATURES */}
      <FeaturesSection />

      {/* INSTALL */}
      <InstallSection />

      {/* PRICING */}
      <PricingSection />

      {/* TESTIMONIALS */}
      <TestimonialsSection />

      {/* PRODUCT HUNT */}
      <ProductHuntSection />

      {/* COMMUNITY / GISCUS */}
      <GiscusSection />

      {/* BLOG */}
      <BlogSection />

      {/* DEVLOG */}
      <DevlogSection />

      {/* NEWSLETTER */}
      <NewsletterSection />

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div>
            <strong>Billy.sh</strong> — Local AI, zero fees. &nbsp;
            <span style={{ color: 'var(--muted)' }}>Built with ❤️ and Go.</span>
          </div>
          <div className="footer-contact">
            <a href="mailto:jd4rider@gmail.com">✉ jd4rider@gmail.com</a>
            <a href="tel:+14063967246">📞 406-396-7246</a>
          </div>
          <div className="footer-links">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
            <a href={DOCS_URL} target="_blank" rel="noreferrer">Docs</a>
            <a href="#producthunt">Product Hunt</a>
            <a href="#community">Community</a>
            <a href="#blog">Blog</a>
            <a href="#devlog">Devlog</a>
            <a href="#pricing">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
