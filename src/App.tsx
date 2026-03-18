import React, { useState } from 'react';
import './App.css';

const SUBSCRIBE_URL = 'https://billy-worker.billysh.workers.dev/subscribe';

const DOCS_URL = 'https://jd4rider.github.io/billy-starlight';
const GITHUB_URL = 'https://github.com/jd4rider/billy-app';
const INSTALL_URL = 'https://raw.githubusercontent.com/jd4rider/billy-app/main/scripts/install.sh';

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

const features: Feature[] = [
  { icon: '🔒', title: 'Fully Private', desc: 'All AI runs on your machine via Ollama. No data ever leaves your computer.' },
  { icon: '💸', title: 'No Subscription', desc: 'Pay once for Pro or use the free tier forever. No monthly fees, no API keys.' },
  { icon: '🤖', title: 'Agentic Mode', desc: 'Billy proposes shell commands and runs them with your approval. Reads output and self-debugs until it works.' },
  { icon: '🧠', title: 'Memory System', desc: 'Billy learns about you over time. Just say "remember that..." — it saves automatically.' },
  { icon: '📜', title: 'Session History', desc: 'Full conversation history with an interactive session picker. Resume any chat with /history.' },
  { icon: '⌨️', title: 'Command Picker', desc: 'Type / to open a live-filtered command popup. Navigate with arrow keys, execute with Enter.' },
  { icon: '🔄', title: 'Model Switching', desc: 'Switch between any Ollama model on the fly. Pull new models with /pull without leaving the app.' },
  { icon: '📊', title: 'Progress Bars', desc: 'Spring-physics progress bars and collapsible command output — click or Ctrl+X to expand.' },
];

const installCommands: Record<string, string> = {
  'macOS / Linux (Slim)':  `curl -fsSL ${INSTALL_URL} | bash`,
  'Full (Ollama bundled)': `curl -fsSL ${INSTALL_URL} | bash -s -- --full`,
  'Homebrew':              `brew tap jd4rider/billy && brew install billy`,
  'Scoop (Windows)':       `scoop bucket add billy https://github.com/jd4rider/scoop-billy\nscoop install billy`,
  'Build from source':     `git clone ${GITHUB_URL}.git\ncd billy-app && go build -o billy ./cmd/billy`,
};

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
  const [promoCode, setPromoCode] = useState('');
  const [promoMsg, setPromoMsg] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await fetch('https://billy-worker.billysh.workers.dev/validate-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json() as { valid: boolean; message: string };
      setPromoMsg(data.message);
      setPromoApplied(data.valid);
    } catch {
      setPromoMsg('Could not validate code. Try again later.');
    }
  };

  return (
    <section className="section" id="pricing">
      <div className="container" style={{ textAlign: 'center' }}>
        <div className="section-label">Pricing</div>
        <h2>Simple, honest pricing</h2>
        <p className="section-sub" style={{ margin: '0 auto 12px' }}>
          Start free. Upgrade when you're ready — one-time payment, no subscription.
        </p>
        <p className="pre-alpha-note">⚠ Pre-Alpha — download now free while we build out features.</p>

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
            <div className="pricing-desc">Full features, forever. No recurring fees.</div>
            <ul className="pricing-features">
              <li><span className="check">✓</span> <strong>Unlimited</strong> messages</li>
              <li><span className="check">✓</span> All backends (Ollama, Groq, custom HTTP)</li>
              <li><span className="check">✓</span> Full conversation history</li>
              <li><span className="check">✓</span> Memory system</li>
              <li><span className="check">✓</span> Priority command execution</li>
              <li><span className="check">✓</span> All slash commands</li>
            </ul>
            <a href="https://billysh.lemonsqueezy.com/checkout/buy/c4644f9f-4521-4cd0-b996-d54ff66d6dc8?enabled=1408429" className="btn btn-primary" target="_blank" rel="noreferrer">
              Buy Pro — $19
            </a>
          </div>

          {/* PREMIUM */}
          <div className="pricing-card">
            <div><span className="badge badge-premium">Premium</span></div>
            <div className="pricing-name" style={{ marginTop: 12 }}>Premium</div>
            <div className="pricing-price">$49 <span>one-time</span></div>
            <div className="pricing-desc">Everything in Pro, plus upcoming power features.</div>
            <ul className="pricing-features">
              <li><span className="check">✓</span> Everything in Pro</li>
              <li><span className="check">✓</span> Future: voice mode (Whisper + Piper TTS)</li>
              <li><span className="check">✓</span> Future: IDE plugins (VS Code, JetBrains)</li>
              <li><span className="check">✓</span> Priority support (email)</li>
            </ul>
            <a href="https://billysh.lemonsqueezy.com/checkout/buy/6e29b223-17b3-44d4-8fb9-2d166343b04a?enabled=1408393" className="btn btn-amber" target="_blank" rel="noreferrer">
              Buy Premium — $49
            </a>
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
                  <a href="https://billysh.lemonsqueezy.com/checkout/buy/b3d7bfaf-7917-4e27-bf22-75a86ff027f6?enabled=1408425" className="btn btn-outline" target="_blank" rel="noreferrer">Buy</a>
                </div>
                <div className="seat-option">
                  <span className="seat-label">10 seats</span>
                  <span className="seat-price">$130</span>
                  <a href="https://billysh.lemonsqueezy.com/checkout/buy/0f746ded-8bca-4ff9-807a-356c1c9cfeb9?enabled=1408426" className="btn btn-outline" target="_blank" rel="noreferrer">Buy</a>
                </div>
                <div className="seat-option">
                  <span className="seat-label">25 seats</span>
                  <span className="seat-price">$300</span>
                  <a href="https://billysh.lemonsqueezy.com/checkout/buy/5189e3c4-9b10-4745-83aa-a6129be85840?enabled=1408428" className="btn btn-outline" target="_blank" rel="noreferrer">Buy</a>
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
              <a href="mailto:sales@billy.sh" className="btn btn-outline">✉ sales@billy.sh</a>
            </div>
          </div>
        </div>

        {/* PROMO CODE */}
        <div className="promo-section">
          <p>Have a promo code?</p>
          <div className="promo-form">
            <input
              type="text"
              className="promo-input"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyPromo()}
            />
            <button className="btn btn-outline" onClick={applyPromo}>Apply</button>
          </div>
          {promoMsg && (
            <p className={`promo-msg ${promoApplied ? 'promo-success' : 'promo-error'}`}>
              {promoMsg}
            </p>
          )}
        </div>
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
              Get notified when new features ship, devlog posts go live, and when Billy leaves pre-alpha.
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

interface BlogPost { slug: string; title: string; date: string; excerpt: string; tags: string[]; coming?: boolean; }

const blogPosts: BlogPost[] = [
  {
    slug: 'introducing-billy-sh',
    title: 'Introducing Billy.sh — Why I Built a Local AI Coding Assistant',
    date: 'Coming Soon',
    excerpt: 'GitHub Copilot costs $10/month. Cursor is $20/month. I wanted a fast, private AI pair programmer that runs entirely on my machine — so I built one in Go.',
    tags: ['announcement', 'open-source'],
    coming: true,
  },
  {
    slug: 'memory-system-deep-dive',
    title: "How Billy's Memory System Works",
    date: 'Coming Soon',
    excerpt: "Just say \"remember that I'm building a SaaS in Go\" — Billy stores it and injects it into every future prompt. Here's how the natural language detection works under the hood.",
    tags: ['deep-dive', 'go'],
    coming: true,
  },
  {
    slug: 'local-ai-good-enough',
    title: 'Is Local AI Good Enough for Real Dev Work?',
    date: 'Coming Soon',
    excerpt: "I've been coding with qwen2.5-coder:7b locally for months. Here's my honest take on where local models shine — and where they still fall short.",
    tags: ['opinion', 'ollama'],
    coming: true,
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
                {post.coming && <span className="blog-tag tag-soon">soon</span>}
              </div>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="blog-meta">
                <span className="blog-date">{post.date}</span>
                {!post.coming && <a href={`/blog/${post.slug}`} className="blog-read-link">Read →</a>}
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

function App() {
  return (
    <div>
      {/* NAV */}
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
            <li><a href={DOCS_URL} target="_blank" rel="noreferrer">Docs</a></li>
            <li>
              <a href={GITHUB_URL} className="btn btn-outline" target="_blank" rel="noreferrer">
                ★ GitHub
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            <span className="badge badge-alpha">⚠ Pre-Alpha — expect rough edges</span>
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
      <section className="section" id="features">
        <div className="container">
          <div className="section-label">Features</div>
          <h2>Everything you need, nothing you don't</h2>
          <p className="section-sub">Built with Go + Bubble Tea. Fast, lightweight, terminal-native.</p>
          <div className="features-grid">
            {features.map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTALL */}
      <InstallSection />

      {/* PRICING */}
      <PricingSection />

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
