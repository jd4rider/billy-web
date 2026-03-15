import React, { useState } from 'react';
import './App.css';

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
  { icon: '🧠', title: 'Memory System', desc: 'Billy learns about you over time. Just say "remember that..." — it saves automatically.' },
  { icon: '📜', title: 'Session History', desc: 'Full conversation history with an interactive session picker. Resume any chat with /history.' },
  { icon: '⌨️', title: 'Command Picker', desc: 'Type / to open a live-filtered command popup. Navigate with arrow keys, execute with Enter.' },
  { icon: '🔄', title: 'Model Switching', desc: 'Switch between any Ollama model on the fly. Pull new models with /pull without leaving the app.' },
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
        <div><span className="t-billy">Billy</span> <span className="t-dim">v0.1.0-alpha · mistral · FREE</span></div>
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
        <p className="section-sub" style={{ margin: '0 auto 48px' }}>
          Start free. Upgrade when you're ready — one-time payment, no subscription.
        </p>
        <div className="pricing-grid">

          <div className="pricing-card">
            <div><span className="badge badge-free">Free</span></div>
            <div className="pricing-name" style={{ marginTop: 12 }}>Starter</div>
            <div className="pricing-price">$0</div>
            <div className="pricing-desc">Open source. Always free. Great for trying it out.</div>
            <ul className="pricing-features">
              <li><span className="check">✓</span> Local Ollama backend</li>
              <li><span className="check">✓</span> 20 messages per session</li>
              <li><span className="check">✓</span> 5 saved conversations</li>
              <li><span className="cross">✗</span> Memory persistence</li>
              <li><span className="cross">✗</span> Unlimited history</li>
              <li><span className="cross">✗</span> Multiple backends</li>
            </ul>
            <a href={GITHUB_URL} className="btn btn-outline" target="_blank" rel="noreferrer">
              Download Free
            </a>
          </div>

          <div className="pricing-card featured">
            <div><span className="badge badge-pro">Pro</span></div>
            <div className="pricing-name" style={{ marginTop: 12 }}>Pro</div>
            <div className="pricing-price">$19 <span>one-time</span></div>
            <div className="pricing-desc">Full features, forever. No recurring fees.</div>
            <ul className="pricing-features">
              <li><span className="check">✓</span> Everything in Free</li>
              <li><span className="check">✓</span> <strong>Unlimited</strong> messages</li>
              <li><span className="check">✓</span> <strong>Unlimited</strong> history</li>
              <li><span className="check">✓</span> Memory persistence</li>
              <li><span className="check">✓</span> Groq backend (coming soon)</li>
              <li><span className="check">✓</span> Priority support</li>
            </ul>
            <a href="#buy" className="btn btn-primary">
              Buy Pro — $19
            </a>
          </div>

          <div className="pricing-card">
            <div><span className="badge badge-alpha">Cloud</span></div>
            <div className="pricing-name" style={{ marginTop: 12 }}>Cloud</div>
            <div className="pricing-price">$9.99 <span>/mo</span></div>
            <div className="pricing-desc">Managed backend on our servers. Coming soon.</div>
            <ul className="pricing-features">
              <li><span className="check">✓</span> Everything in Pro</li>
              <li><span className="check">✓</span> Hosted AI (no local Ollama)</li>
              <li><span className="check">✓</span> Premium models</li>
              <li><span className="check">✓</span> Cross-device sync</li>
              <li><span className="check">✓</span> Usage dashboard</li>
              <li><span className="check">✓</span> Cancel anytime</li>
            </ul>
            <button className="btn btn-outline" disabled style={{ cursor: 'not-allowed', opacity: 0.5, width: '100%', justifyContent: 'center' }}>
              Coming Soon
            </button>
          </div>

        </div>

        {/* Placeholder buy section - replace with real payment embed */}
        <div id="buy" style={{ marginTop: 48, padding: 32, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, maxWidth: 480, margin: '48px auto 0' }}>
          <h3 style={{ marginBottom: 8 }}>Buy Billy Pro</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 20 }}>
            One-time payment · Instant license key delivery · 30-day refund
          </p>
          {/* TODO: Replace with Lemon Squeezy / Shopify buy button embed */}
          <a href="mailto:hello@billy.sh?subject=Billy Pro Purchase" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '12px 24px' }}>
            Buy Pro — $19 →
          </a>
          <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 12 }}>
            Payment via email until shop is live · You'll receive your license key within 24h
          </p>
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
            <img src="/favicon.svg" alt="Billy goat logo" />
            Billy.sh
          </a>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#install">Install</a></li>
            <li><a href="#pricing">Pricing</a></li>
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

      {/* AD BANNER */}
      <section className="ad-section">
        <div className="container">
          {/* AdSense placeholder — replace with real ad unit once approved */}
          {/* <ins className="adsbygoogle"
               style={{ display: 'block' }}
               data-ad-client="ca-pub-XXXXXXXXXX"
               data-ad-slot="XXXXXXXXXX"
               data-ad-format="auto"
               data-full-width-responsive="true" /> */}
          <div className="ad-banner">
            Advertisement · <a href="#pricing">Support Billy by going Pro →</a>
          </div>
        </div>
      </section>

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

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div>
            <strong>Billy.sh</strong> — Local AI, zero fees. &nbsp;
            <span style={{ color: 'var(--muted)' }}>Built with ❤️ and Go.</span>
          </div>
          <div className="footer-links">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
            <a href={DOCS_URL} target="_blank" rel="noreferrer">Docs</a>
            <a href="#pricing">Pricing</a>
            <a href="mailto:hello@billy.sh">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
