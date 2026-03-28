import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const SUBSCRIBE_URL = 'https://billy-worker.billysh.workers.dev/subscribe';

const DOCS_URL = 'https://docs.billysh.online';
const GITHUB_URL = 'https://github.com/jd4rider/billy-app';
const CLI_INSTALL_URL = 'https://raw.githubusercontent.com/jd4rider/billy-app/main/scripts/install.sh';
const DESKTOP_INSTALL_URL = 'https://raw.githubusercontent.com/jd4rider/billy-wails/main/scripts/install.sh';
const CLI_RELEASES_URL = 'https://github.com/jd4rider/billy-app/releases';
const DESKTOP_RELEASES_URL = 'https://github.com/jd4rider/billy-wails/releases';
const RELEASE_TAG = 'v0.2.0';
const DESKTOP_MAC_PKG_URL = `https://github.com/jd4rider/billy-wails/releases/download/${RELEASE_TAG}/billy-macos-universal.pkg`;
const DESKTOP_MAC_ARCHIVE_URL = `https://github.com/jd4rider/billy-wails/releases/download/${RELEASE_TAG}/billy-macos-universal.tar.gz`;
const DESKTOP_WINDOWS_ZIP_URL = `https://github.com/jd4rider/billy-wails/releases/download/${RELEASE_TAG}/billy-windows-amd64-bundle.zip`;
const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/jd4rider';
const GITHUB_SPONSORS_URL = 'https://github.com/sponsors/jd4rider';
const SETUP_HELP_URL = 'mailto:jd4rider@gmail.com?subject=Billy%20Setup%20Help';
const TEAM_HELP_URL = 'mailto:jd4rider@gmail.com?subject=Billy%20Team%20Rollout';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: any[]) => void;
  }
}

type AnalyticsParams = Record<string, string | number | boolean>;

function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

function trackCta(target: string, location: string, params: AnalyticsParams = {}) {
  trackEvent('cta_click', { target, location, ...params });
}

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
    desc: 'Billy ships open by default. No monthly fees, no login wall, no artificial limits.',
    detail: {
      body: 'Billy is built around a simple idea: the real tool should stay free, local, and honest. If you know how to wire up Ollama or your own backend, you can do it yourself. If you want help, you can support the project through setup services, donations, or future convenience bundles.',
      bullets: [
        'Full local CLI is available without a paywall',
        'No ads, no telemetry, no forced account creation',
        'Pay only if you want setup help, to support development, or later convenience bundles',
        'Designed to stay local-first and community-supported',
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
      body: "You shouldn't have to re-establish context every session. Just talk to Billy like a collaborator — it detects save intent and stores facts automatically. Memories persist locally across sessions with no cloud profile and no paid unlock required.",
      bullets: [
        '"Remember that I\'m building a SaaS in Go" — just say it',
        'Stored locally in SQLite, never synced to any server',
        'Injected into every conversation as context automatically',
        'Manage with /memory — list, forget by ID, or clear all',
        'Works in the open-core build out of the box',
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
      body: 'Billy is model-agnostic. Use any model Ollama supports — code models, general models, multimodal models. You can also point Billy at any OpenAI-compatible endpoint like Groq, LM Studio, or your own server.',
      bullets: [
        '/model opens a picker showing all locally available models',
        '/pull <name> downloads a new model without leaving the app',
        '/backend lets you switch to any OpenAI-compatible API',
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
  'Desktop (macOS / Linux)': `curl -fsSL ${DESKTOP_INSTALL_URL} | bash`,
  'CLI (macOS / Linux)':     `curl -fsSL ${CLI_INSTALL_URL} | bash`,
  'Homebrew (CLI)':          `brew tap jd4rider/billy && brew install billy`,
  'Scoop (Windows CLI)':     `scoop bucket add billy https://github.com/jd4rider/scoop-billy\nscoop install billy`,
  'Build from source':       `git clone ${GITHUB_URL}.git\ncd billy-app && go build -o billy ./cmd/billy`,
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
        <div><span className="t-billy">Billy</span> <span className="t-dim">v0.2.0 · qwen2.5-coder · OPEN</span></div>
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
      trackEvent('install_command_copy', { method: active });
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
          Use the CLI if you want Billy in your terminal first. Use Billy Desktop if you want the GUI app bundled with the same local `billy` CLI.
        </p>
        <div className="install-tabs">
          {tabs.map(t => (
            <button
              key={t}
              className={`tab-btn${active === t ? ' active' : ''}`}
              onClick={() => {
                setActive(t);
                trackEvent('install_method_select', { method: t });
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="code-block">
          <code style={{ whiteSpace: 'pre' }}>{installCommands[active]}</code>
          <button className="copy-btn" onClick={copy}>{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 20 }}>
          <a href={DESKTOP_MAC_PKG_URL} className="btn btn-outline" target="_blank" rel="noreferrer" onClick={() => trackCta('desktop_pkg', 'install')}>macOS .pkg</a>
          <a href={DESKTOP_MAC_ARCHIVE_URL} className="btn btn-outline" target="_blank" rel="noreferrer" onClick={() => trackCta('desktop_macos_archive', 'install')}>macOS .tar.gz</a>
          <a href={DESKTOP_WINDOWS_ZIP_URL} className="btn btn-outline" target="_blank" rel="noreferrer" onClick={() => trackCta('desktop_windows_zip', 'install')}>Windows .zip</a>
          <a href={CLI_RELEASES_URL} className="btn btn-outline" target="_blank" rel="noreferrer" onClick={() => trackCta('cli_releases', 'install')}>CLI releases</a>
          <a href={DESKTOP_RELEASES_URL} className="btn btn-outline" target="_blank" rel="noreferrer" onClick={() => trackCta('desktop_releases', 'install')}>Desktop releases</a>
        </div>
        <p className="section-sub" style={{ marginTop: 18 }}>
          Linux CLI packages live on the CLI releases page. Linux desktop bundles use the same Wails app path and are being wired into native packages next.
        </p>
      </div>
    </section>
  );
}

function SupportSection() {
  return (
    <section className="section" id="support">
      <div className="container" style={{ textAlign: 'center' }}>
        <div className="section-label">Support Model</div>
        <h2>Free core. Paid convenience if you want it.</h2>
        <p className="section-sub" style={{ margin: '0 auto 12px' }}>
          Billy is moving to a support-first model: the app stays usable without a purchase.<br />
          Pay only if you want setup help, want to support the project, or later choose a convenience bundle.
        </p>
        <p className="section-sub" style={{ margin: '0 auto 24px', maxWidth: 760, fontStyle: 'italic' }}>
          Build software and games that are free, honest, and clean - funded by people who believe in them, not by exploiting users.
        </p>
        <div className="pricing-discount-banner">
          Billy is intentionally ad-free and local-first. If it helps your workflow, support development instead of buying through a forced paywall.
        </div>

        <div className="pricing-grid">
          <div className="pricing-card">
            <div><span className="badge badge-free">Free</span></div>
            <div className="pricing-name" style={{ marginTop: 12 }}>Free Core</div>
            <div className="pricing-price">$0</div>
            <div className="pricing-desc">Full local CLI. DIY setup. Open by default.</div>
            <ul className="pricing-features">
              <li><span className="check">✓</span> Local Ollama workflow</li>
              <li><span className="check">✓</span> Memory, history, sessions, and agent mode</li>
              <li><span className="check">✓</span> Custom OpenAI-compatible backends</li>
              <li><span className="check">✓</span> Homebrew, Scoop, script, and package installs</li>
              <li><span className="check">✓</span> Public docs and community support</li>
              <li><span className="check">✓</span> No ads or forced account</li>
            </ul>
            <a
              href={`${GITHUB_URL}/releases`}
              className="btn btn-outline"
              target="_blank"
              rel="noreferrer"
              onClick={() => trackCta('download_free', 'support')}
            >
              Download Billy
            </a>
          </div>

          <div className="pricing-card featured">
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              <span className="badge badge-pro">Setup Help</span>
              <span className="badge badge-best-value">Hands-on</span>
            </div>
            <div className="pricing-name" style={{ marginTop: 12 }}>Guided Setup</div>
            <div className="pricing-price">Custom <span>service</span></div>
            <div className="pricing-desc">Don’t want to fight with models, paths, or config? I can help wire it up.</div>
            <div className="pricing-savings">Best fit if you want Billy working fast on your machine.</div>
            <ul className="pricing-features">
              <li><span className="check">✓</span> Ollama install and first-model setup</li>
              <li><span className="check">✓</span> Custom backend wiring if you want cloud fallback</li>
              <li><span className="check">✓</span> OS-specific troubleshooting</li>
              <li><span className="check">✓</span> Remote or guided setup options</li>
              <li><span className="check">✓</span> Useful if you want Billy working quickly, not perfectly manually</li>
            </ul>
            <div className="pricing-compare">The app stays open. This is convenience, not access.</div>
            <a
              href={SETUP_HELP_URL}
              className="btn btn-primary"
              onClick={() => trackCta('setup_help', 'support')}
            >
              Ask about setup help →
            </a>
          </div>

          <div className="pricing-card">
            <div><span className="badge badge-premium">Support</span></div>
            <div className="pricing-name" style={{ marginTop: 12 }}>Keep Billy Sustainable</div>
            <div className="pricing-price">Optional <span>support</span></div>
            <div className="pricing-desc">Help fund ad-free apps, docs, games, and future local-first tools.</div>
            <ul className="pricing-features">
              <li><span className="check">✓</span> Buy Me a Coffee and GitHub Sponsors links stay public</li>
              <li><span className="check">✓</span> Funds docs, domains, release work, and new features</li>
              <li><span className="check">✓</span> Supports the wider family of wholesome, ad-free tools</li>
              <li><span className="check">✓</span> No feature lock required to help out</li>
            </ul>
            <div className="pricing-compare">Future convenience bundles may return, but the core app stays open.</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={BUY_ME_A_COFFEE_URL}
                className="btn btn-outline"
                target="_blank"
                rel="noreferrer"
                onClick={() => trackCta('buy_me_a_coffee', 'support_card')}
              >
                ☕ Buy me a coffee
              </a>
              <a
                href={GITHUB_SPONSORS_URL}
                className="btn btn-outline"
                target="_blank"
                rel="noreferrer"
                onClick={() => trackCta('github_sponsors', 'support_card')}
              >
                ❤️ GitHub Sponsors
              </a>
            </div>
          </div>
        </div>

        <div className="team-card">
          <div className="team-card-inner">
            <div className="team-card-left">
              <span className="badge badge-team">Team</span>
              <div className="pricing-name" style={{ marginTop: 12 }}>Church, classroom, or team rollout</div>
              <div className="pricing-price">Guided <span>adoption</span></div>
              <div className="pricing-desc">Need help getting Billy working across multiple machines or a shared environment?</div>
              <ul className="pricing-features">
                <li><span className="check">✓</span> Guided installation across multiple machines</li>
                <li><span className="check">✓</span> Shared recommendations for models and workflows</li>
                <li><span className="check">✓</span> Help with privacy-friendly local setups</li>
                <li><span className="check">✓</span> Good fit for classrooms, ministries, and small dev teams</li>
              </ul>
            </div>
            <div className="team-card-right">
              <div className="seat-options">
                <div className="seat-option">
                  <span className="seat-label">Starter help</span>
                  <span className="seat-price">Email me</span>
                  <a
                    href={TEAM_HELP_URL}
                    className="btn btn-outline"
                    onClick={() => trackCta('team_help', 'support_team', { option: 'starter_help' })}
                  >
                    Ask
                  </a>
                </div>
                <div className="seat-option">
                  <span className="seat-label">Rollout call</span>
                  <span className="seat-price">Phone or email</span>
                  <a
                    href="tel:+14063967246"
                    className="btn btn-outline"
                    onClick={() => trackCta('team_phone', 'support_team', { option: 'rollout_call' })}
                  >
                    Call
                  </a>
                </div>
                <div className="seat-option">
                  <span className="seat-label">Future packs</span>
                  <span className="seat-price">Coming soon</span>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  >
                    Soon
                  </button>
                </div>
              </div>
              <p className="enterprise-note">
                If you want Billy installed for a group without fighting the setup yourself, <a href="tel:+14063967246">call 406-396-7246</a> or email me.
              </p>
            </div>
          </div>
        </div>

        <div className="enterprise-cta">
          <div className="enterprise-inner">
            <div className="enterprise-info">
              <span className="badge badge-enterprise">Coming Soon</span>
              <div className="pricing-name" style={{ marginTop: 12 }}>Convenience bundles</div>
              <div className="pricing-price" style={{ fontSize: '1.6rem' }}>Supporter packs</div>
              <div className="pricing-desc">Future premium options will focus on convenience, automation, and specialty workflows, not locking away the core app.</div>
            </div>
            <ul className="pricing-features enterprise-features">
              <li><span className="check">✓</span> Convenience scripts and installers</li>
              <li><span className="check">✓</span> Workflow packs and curated setups</li>
              <li><span className="check">✓</span> Optional specialty integrations</li>
              <li><span className="check">✓</span> No ads and no crippleware</li>
            </ul>
            <div className="enterprise-ctas">
              <a href="tel:+14063967246" className="btn btn-primary" onClick={() => trackCta('support_phone', 'support_enterprise')}>📞 406-396-7246</a>
              <a href={SETUP_HELP_URL} className="btn btn-outline" onClick={() => trackCta('support_email', 'support_enterprise')}>✉ Ask about setup</a>
            </div>
          </div>
        </div>

        <p className="pricing-promo-note">
          The goal is simple: keep Billy free, local-first, and honest. Pay for help or to support the mission, not because the app is artificially locked down.
        </p>
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
      if (data.ok) {
        trackEvent('newsletter_subscribe', { location: 'newsletter' });
        setEmail('');
      }
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

type CarouselVariant = 'proof' | 'blog';

interface FancyCarouselProps<T> {
  items: T[];
  variant: CarouselVariant;
  hint: string;
  getKey: (item: T) => string;
  getAriaLabel: (item: T, index: number) => string;
  renderSlide: (item: T, index: number) => React.ReactNode;
}

function FancyCarousel<T>({
  items,
  variant,
  hint,
  getKey,
  getAriaLabel,
  renderSlide,
}: FancyCarouselProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);

  const selectSlide = (index: number) => {
    const next = (index + items.length) % items.length;
    setActiveIndex(next);
  };

  const getOffset = (index: number) => {
    let diff = index - activeIndex;
    if (diff > items.length / 2) diff -= items.length;
    if (diff < -items.length / 2) diff += items.length;
    return diff;
  };

  const getSlideClass = (offset: number) => {
    if (offset === 0) return 'is-active';
    if (offset === -1) return 'is-prev';
    if (offset === 1) return 'is-next';
    return offset < 0 ? 'is-far-prev' : 'is-far-next';
  };

  const cssVars = (
    variant === 'proof'
      ? {
          '--carousel-card-max-width': '820px',
          '--carousel-card-min-height': '340px',
          '--carousel-stage-height': '410px',
          '--carousel-shift': 'clamp(180px, 21vw, 320px)',
          '--carousel-side-scale': '0.9',
        }
      : {
          '--carousel-card-max-width': '380px',
          '--carousel-card-min-height': '290px',
          '--carousel-stage-height': '360px',
          '--carousel-shift': 'clamp(150px, 18vw, 260px)',
          '--carousel-side-scale': '0.92',
        }
  ) as React.CSSProperties;

  return (
    <div className={`fancy-carousel fancy-carousel-${variant}`} style={cssVars}>
      <div className="fancy-carousel-stage">
        {items.map((item, index) => {
          const offset = getOffset(index);
          return (
            <article
              key={getKey(item)}
              className={`fancy-slide ${getSlideClass(offset)}`}
              aria-hidden={offset !== 0}
            >
              {renderSlide(item, index)}
            </article>
          );
        })}
      </div>
      <div className="fancy-carousel-controls">
        <button
          type="button"
          className="carousel-btn"
          aria-label="Show previous slide"
          onClick={() => selectSlide(activeIndex - 1)}
        >
          ←
        </button>
        <div className="fancy-carousel-dots" role="tablist" aria-label={`${variant} carousel`}>
          {items.map((item, index) => (
            <button
              key={getKey(item)}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={getAriaLabel(item, index)}
              className={`fancy-carousel-dot${index === activeIndex ? ' active' : ''}`}
              onClick={() => selectSlide(index)}
            />
          ))}
        </div>
        <button
          type="button"
          className="carousel-btn"
          aria-label="Show next slide"
          onClick={() => selectSlide(activeIndex + 1)}
        >
          →
        </button>
      </div>
      <p className="fancy-carousel-hint">{hint}</p>
    </div>
  );
}

interface BlogPost { slug: string; url: string; title: string; date: string; excerpt: string; tags: string[]; }

const BLOG_BASE = 'https://blog.billysh.online/blog';

const blogPosts: BlogPost[] = [
  {
    slug: 'what-local-coding-models-actually-work',
    url: `${BLOG_BASE}/what-local-coding-models-actually-work/`,
    title: 'What Local Coding Models Actually Work in a Terminal Workflow?',
    date: 'Mar 26 2026',
    excerpt: 'A practical rubric for evaluating local coding models in Ollama: latency, patch quality, command discipline, repo awareness, and where each model actually fits.',
    tags: ['deep-dive', 'ollama', 'benchmark'],
  },
  {
    slug: 'introducing-billy-sh',
    url: `${BLOG_BASE}/introducing-billy-sh/`,
    title: 'Introducing Billy — Why I Built a Local AI Coding Assistant',
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
        <div className="blog-section-head">
          <div>
            <div className="section-label">Blog</div>
            <h2>From the author</h2>
            <p className="section-sub">Development insights, tutorials, and the story of building Billy.</p>
          </div>
          <div className="blog-section-actions">
            <a
              href="https://blog.billysh.online/blog/"
              className="btn btn-outline"
              target="_blank"
              rel="noreferrer"
              onClick={() => trackCta('blog_index', 'homepage_blog_header')}
            >
              View all posts
            </a>
          </div>
        </div>
        <FancyCarousel
          items={blogPosts}
          variant="blog"
          hint="Use the arrows or dots to browse all posts."
          getKey={(post) => post.slug}
          getAriaLabel={(post, index) => `Show blog post ${index + 1}: ${post.title}`}
          renderSlide={(post) => (
            <div className="blog-card">
              <div className="blog-tags">
                {post.tags.map(t => <span className="blog-tag" key={t}>{t}</span>)}
              </div>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="blog-meta">
                <span className="blog-date">{post.date}</span>
                <a href={post.url} target="_blank" rel="noreferrer" className="blog-read-link" onClick={() => trackCta('blog_post', 'homepage_blog', { slug: post.slug })}>Read →</a>
              </div>
            </div>
          )}
        />
      </div>
    </section>
  );
}

interface DevlogEntry { version: string; date: string; title: string; items: string[]; }

const devlogEntries: DevlogEntry[] = [
  {
    version: 'v0.2.0',
    date: 'March 2026',
    title: 'Open-core Billy + first desktop bundle pipeline',
    items: [
      'Billy now ships open by default with no forced upgrade path',
      'Desktop bundles now package Billy.app or Billy.exe alongside the billy CLI',
      'macOS pkg/tar.gz and Windows zip release paths are wired up',
      'CLI install, desktop install, and release downloads now live side by side',
    ],
  },
  {
    version: 'model',
    date: 'March 2026',
    title: 'Billy pivots to an open-core, support-first model',
    items: [
      'The local CLI now ships fully unlocked with no forced upgrade path',
      'Custom OpenAI-compatible backends work in the open-core build',
      'Support shifts toward setup help, sponsorship, and future convenience bundles',
      'Billy stays ad-free, local-first, and usable without a purchase',
    ],
  },
  {
    version: 'site',
    date: 'March 2026',
    title: 'Custom domains live: billysh.online, docs, and blog',
    items: [
      'Main site now lives at billysh.online instead of a GitHub Pages path',
      'Docs moved to docs.billysh.online and the blog moved to blog.billysh.online',
      'Repo homepage links, in-app support prompts, and README URLs updated to the new domains',
      'GitHub Pages HTTPS rollout is enabled per-host as certificates become available',
    ],
  },
  {
    version: 'v0.1.8-alpha',
    date: 'March 2026',
    title: 'Custom endpoints & multi-backend support',
    items: [
      'Billy can now point at any OpenAI-compatible endpoint — Groq, OpenRouter, LM Studio, your own server',
      'New backend config: set backend.type = "custom", backend.url, backend.model, backend.api_key in config.toml',
      'Environment variable overrides: BILLY_BACKEND_TYPE, BILLY_BACKEND_URL, BILLY_BACKEND_MODEL, BILLY_API_KEY',
      '/backend command shows active backend, model, and config file path',
      '/backend reload — hot-reload backend settings without restarting Billy',
      'Ollama auto-launch skipped when pointing at a remote host',
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
      'Cross-platform packaging via Homebrew, Scoop, and Linux packages',
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
interface ProofItem {
  label: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
  target: string;
  location: string;
  external?: boolean;
}

const proofItems: ProofItem[] = [
  {
    label: 'Shipping',
    title: 'Billy is shipping again with a clean open-core release line',
    detail: 'The new Billy release line rolls the open-core CLI and the desktop bundle story into one install surface instead of splitting the product across old upgrade tiers.',
    href: `${GITHUB_URL}/releases`,
    cta: 'View releases',
    target: 'releases',
    location: 'proof_shipping',
    external: true,
  },
  {
    label: 'Install',
    title: 'Cross-platform installs are already live',
    detail: 'Install Billy via shell script, Homebrew, or Scoop on macOS, Linux, and Windows.',
    href: '#install',
    cta: 'See install options',
    target: 'install',
    location: 'proof_install',
  },
  {
    label: 'Docs',
    title: 'Public docs, blog, and devlog are live',
    detail: 'The docs, blog, and shipping log all live on their own public subdomains and update alongside the app.',
    href: DOCS_URL,
    cta: 'Read the docs',
    target: 'docs',
    location: 'proof_docs',
    external: true,
  },
  {
    label: 'Ownership',
    title: 'Open source code and public support links are live',
    detail: 'You can inspect the source on GitHub and support Billy through public sponsor links without hiding the tool behind a paywall.',
    href: GITHUB_URL,
    cta: 'Inspect the code',
    target: 'github',
    location: 'proof_ownership',
    external: true,
  },
];

function ProofSection() {
  return (
    <section className="section" id="proof">
      <div className="container" style={{ textAlign: 'center' }}>
        <div className="section-label">Proof</div>
        <h2>Real proof, not placeholder hype</h2>
        <p className="section-sub">Billy is already shipping in public with live installs, public docs, and a support-first model.</p>
        <FancyCarousel
          items={proofItems}
          variant="proof"
          hint="Use the arrows or dots to browse the proof points."
          getKey={(item) => item.title}
          getAriaLabel={(item, index) => `Show proof card ${index + 1}: ${item.title}`}
          renderSlide={(item, index) => (
            <div className="proof-card-content">
              <div className="proof-card-meta">
                <div className="proof-label">{item.label}</div>
                <div className="proof-card-counter">
                  {String(index + 1).padStart(2, '0')} / {String(proofItems.length).padStart(2, '0')}
                </div>
              </div>
              <h3 className="proof-card-title">{item.title}</h3>
              <p className="proof-card-detail">{item.detail}</p>
              <div className="proof-card-actions">
                <a
                  href={item.href}
                  className="btn btn-primary"
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noreferrer' : undefined}
                  onClick={() => trackCta(item.target, item.location)}
                >
                  {item.cta}
                </a>
                <span className="proof-card-note">Public artifact, live today</span>
              </div>
            </div>
          )}
        />
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
          <a
            href="https://www.producthunt.com/posts/billy-sh?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-billy-sh"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackCta('product_hunt', 'homepage')}
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=billy-sh&theme=dark"
              alt="Billy - local AI coding assistant, no subscription | Product Hunt"
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
          <a href="https://github.com/jd4rider/billy-web/discussions" target="_blank" rel="noreferrer" className="btn btn-secondary" onClick={() => trackCta('community', 'giscus_fallback')}>
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
          Billy
        </a>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#install">Install</a></li>
          <li><a href="#support">Support</a></li>
          <li><a href="#blog">Blog</a></li>
          <li><a href="#devlog">Devlog</a></li>
          <li><a href={docsUrl} target="_blank" rel="noreferrer" onClick={() => trackCta('docs', 'nav_desktop')}>Docs</a></li>
          <li>
            <a href={githubUrl} className="btn btn-outline" target="_blank" rel="noreferrer" onClick={() => trackCta('github', 'nav_desktop')}>★ GitHub</a>
          </li>
        </ul>
        <button className="nav-hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>
      </div>
      <div className={`nav-mobile${open ? ' open' : ''}`}>
        <a href="#features" onClick={close}>Features</a>
        <a href="#install" onClick={close}>Install</a>
        <a href="#support" onClick={close}>Support</a>
        <a href="#blog" onClick={close}>Blog</a>
        <a href="#devlog" onClick={close}>Devlog</a>
        <a href={docsUrl} target="_blank" rel="noreferrer" onClick={() => { trackCta('docs', 'nav_mobile'); close(); }}>Docs</a>
        <a href={githubUrl} target="_blank" rel="noreferrer" onClick={() => { trackCta('github', 'nav_mobile'); close(); }}>★ GitHub</a>
      </div>
    </nav>
  );
}

function App() {
  return (
    <div>
      {/* NAV */}
      <NavHamburger docsUrl={DOCS_URL} githubUrl={GITHUB_URL} />

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <h1>
            Local AI coding assistant<br />
            <span>for your terminal.</span>
          </h1>
          <p>
            Billy runs entirely on your machine using local Ollama models.
            No API keys, no subscriptions, no data leaving your computer.
          </p>
          <div className="hero-ctas">
            <a href="#install" className="btn btn-primary" style={{ fontSize: '1rem', padding: '12px 28px' }} onClick={() => trackCta('download_free', 'hero')}>
              ⬇ Download Billy
            </a>
            <a href="#support" className="btn btn-outline" style={{ fontSize: '1rem', padding: '12px 28px' }} onClick={() => trackCta('support_billy', 'hero')}>
              Support Billy
            </a>
            <a href={GITHUB_URL} className="btn btn-outline" target="_blank" rel="noreferrer" style={{ fontSize: '1rem', padding: '12px 28px' }} onClick={() => trackCta('github', 'hero')}>
              ★ Star on GitHub
            </a>
          </div>
          <div className="hero-sub">
            Free core · Local-first · Open source · Community-supported
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

      {/* SUPPORT */}
      <SupportSection />

      {/* PROOF */}
      <ProofSection />

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
            <strong>Billy</strong> — Local AI, zero fees. &nbsp;
            <span style={{ color: 'var(--muted)' }}>Built with ❤️ and Go by <a href="https://jd4codes.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>JD4Codes</a>.</span>
          </div>
          <div className="footer-contact">
            <a href="mailto:jd4rider@gmail.com">✉ jd4rider@gmail.com</a>
            <a href="tel:+14063967246">📞 406-396-7246</a>
          </div>
          <div className="footer-links">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" onClick={() => trackCta('github', 'footer')}>GitHub</a>
            <a href={DOCS_URL} target="_blank" rel="noreferrer" onClick={() => trackCta('docs', 'footer')}>Docs</a>
            <a href="#producthunt">Product Hunt</a>
            <a href="#community">Community</a>
            <a href="#blog">Blog</a>
            <a href="#devlog">Devlog</a>
            <a href="#support">Support</a>
          </div>
          <div className="footer-support">
            If Billy helps your workflow →{' '}
            <a
              href={BUY_ME_A_COFFEE_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackCta('buy_me_a_coffee', 'footer_support')}
            >
              ☕ Buy me a coffee
            </a>{' '}
            ·{' '}
            <a
              href={GITHUB_SPONSORS_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackCta('github_sponsors', 'footer_support')}
            >
              ❤️ GitHub Sponsors
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
