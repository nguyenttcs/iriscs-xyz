import { Mail } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { BehanceIcon, XIcon } from './icons/BrandIcons';

const EMAIL = 'nguyentt.ir@gmail.com';
const RESET_MS = 2000;

const X_URL = 'https://x.com/irisnguyen_cs';
const BEHANCE_URL = 'https://www.behance.net/nguyentrantt';

/** Same glossy-black treatment the Contact pill used. */
const surface: CSSProperties = {
  background: 'linear-gradient(180deg, #40464F 0%, #1C1F24 48%, #0B0C0E 100%)',
  boxShadow:
    'inset 0 1px 0 rgba(215, 226, 234, 0.30), inset 0 -1px 0 rgba(0, 0, 0, 0.65), 0 6px 18px rgba(0, 0, 0, 0.55)',
  outline: '1px solid rgba(215, 226, 234, 0.22)',
  outlineOffset: '-1px',
};

const shape =
  'flex h-12 w-12 items-center justify-center rounded-full text-[#D7E2EA] transition-transform duration-300 hover:scale-[1.08] sm:h-14 sm:w-14';

function Tooltip({ children, show }: { children: ReactNode; show: boolean }) {
  return (
    <span
      role="tooltip"
      className={`pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-[0.7rem] uppercase tracking-widest transition-opacity duration-200 sm:text-xs ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: 'rgba(12, 12, 12, 0.92)',
        color: '#D7E2EA',
        outline: '1px solid rgba(215, 226, 234, 0.22)',
      }}
    >
      {children}
    </span>
  );
}

export default function SocialLinks({ className = '' }: { className?: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [hovered, setHovered] = useState<string | null>(null);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setStatus('copied');
    } catch {
      // Clipboard blocked (insecure context or denied) — the address stays
      // on screen so it can still be copied by hand.
      setStatus('failed');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus('idle'), RESET_MS);
  };

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      <div className="relative">
        <Tooltip show={hovered === 'mail' || status !== 'idle'}>
          {status === 'copied' ? 'Copied' : EMAIL}
        </Tooltip>
        <button
          type="button"
          onClick={copyEmail}
          onMouseEnter={() => setHovered('mail')}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered('mail')}
          onBlur={() => setHovered(null)}
          aria-label={`Copy email address ${EMAIL}`}
          data-state={status}
          className={shape}
          style={surface}
        >
          <Mail className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={1.75} />
        </button>
        <span className="sr-only" role="status" aria-live="polite">
          {status === 'copied' ? 'Email address copied' : ''}
        </span>
      </div>

      {[
        { key: 'x', href: X_URL, label: 'X', Icon: XIcon, name: 'Iris on X' },
        { key: 'be', href: BEHANCE_URL, label: 'Behance', Icon: BehanceIcon, name: 'Iris on Behance' },
      ].map(({ key, href, label, Icon, name }) => (
        <div key={key} className="relative">
          <Tooltip show={hovered === key}>{label}</Tooltip>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(key)}
            onBlur={() => setHovered(null)}
            className={shape}
            style={surface}
          >
            <Icon className="h-[1.1rem] w-[1.1rem] sm:h-5 sm:w-5" />
          </a>
        </div>
      ))}
    </div>
  );
}
