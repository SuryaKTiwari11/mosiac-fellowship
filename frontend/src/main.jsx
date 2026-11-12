import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

/* ─── constants ─────────────────────────────────────────────── */

const FLAVOURS = [
  { name: 'Chocolate', icon: '◒', note: 'Familiar & cozy',  color: 'cocoa'   },
  { name: 'Strawberry', icon: '✿', note: 'Fruity & bright', color: 'berry'   },
  { name: 'Vanilla',   icon: '✳', note: 'Soft & simple',    color: 'vanilla' },
];

const TEXTURE_LABELS = {
  smooth:       'Mixed smoothly',
  okay:         'A few lumps',
  'not-for-us': 'Hard to mix',
};

const CHOOSE_LABELS = {
  yes:   'Yes, please',
  maybe: 'Maybe',
  no:    'Not for us',
};

// Tailwind bg classes for each flavour accent dot
const DOT_BG = {
  cocoa:   'bg-[#c4a98c]',
  berry:   'bg-[#c97b89]',
  vanilla: 'bg-[#c4a84a]',
};

const CARD_COLORS = {
  cocoa: {
    border:  'border-[#e8ddd3]',
    chosen:  'border-[#7b5b41] ring-1 ring-[#7b5b41]',
    iconBg:  'bg-[#ece3d7]',
    iconFg:  'text-[#7b5b41]',
  },
  berry: {
    border:  'border-[#f0dde0]',
    chosen:  'border-[#b36876] ring-1 ring-[#b36876]',
    iconBg:  'bg-[#f1e2e3]',
    iconFg:  'text-[#b36876]',
  },
  vanilla: {
    border:  'border-[#ede9d7]',
    chosen:  'border-[#ae9451] ring-1 ring-[#ae9451]',
    iconBg:  'bg-[#f1eddc]',
    iconFg:  'text-[#ae9451]',
  },
};

/* ─── tiny shared components ────────────────────────────────── */

function Kicker({ children, className = '' }) {
  return (
    <p className={`text-[10px] tracking-[1.5px] text-[#426549] font-bold uppercase ${className}`}>
      {children}
    </p>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#293b2e] text-white text-xs font-medium px-5 py-3 rounded-full shadow-xl pointer-events-none whitespace-nowrap"
    >
      {message}
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex gap-2 items-start text-[#934c43] bg-[#f8eae6] border border-[#f0d0cb] rounded-xl px-4 py-3 text-xs mb-5"
    >
      <span className="mt-0.5 flex-none">⚠</span>
      <span>{message}</span>
    </div>
  );
}

/* Star rating — hover preview + keyboard arrow nav */
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div
      role="radiogroup"
      aria-label="Enjoyment rating out of 5"
      className="flex gap-0.5"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-label={`${n} star${n > 1 ? 's' : ''} out of 5`}
          aria-checked={value === n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' && value < 5) { e.preventDefault(); onChange(value + 1); }
            if (e.key === 'ArrowLeft'  && value > 1) { e.preventDefault(); onChange(value - 1); }
            if (e.key === 'ArrowRight' && value === 0) onChange(1);
          }}
          className={`text-[26px] leading-none p-0.5 bg-transparent border-0 cursor-pointer transition-colors ${
            n <= display ? 'text-[#dfaf55]' : 'text-[#d8d9cf]'
          } hover:text-[#dfaf55]`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/* Segmented radio-style button group */
function SegmentedGroup({ options, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map(([key, text]) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          onClick={() => onChange(key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            value === key
              ? 'bg-[#eaf0e5] text-[#2d5236] border-[#8da58a] font-bold shadow-sm'
              : 'bg-white text-[#777f76] border-[#e5e6de] hover:bg-[#f5f7f3] hover:border-[#c8cfc6]'
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

/* Flavour accent dot */
function FlavorDot({ color, className = 'w-2.5 h-2.5' }) {
  return (
    <span
      className={`${className} rounded-full inline-block flex-none ${DOT_BG[color] || 'bg-gray-300'}`}
      aria-hidden="true"
    />
  );
}

/* ─── HowItWorksModal ───────────────────────────────────────── */
function HowItWorksModal({ onClose }) {
  const closeRef = useRef(null);

  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-[#26342c]/60 z-40 grid place-items-center p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
    >
      <section
        className="relative max-w-sm w-full bg-[#fffefa] rounded-2xl p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close how it works"
          className="absolute right-4 top-3 text-2xl text-[#7e887d] hover:text-[#29342d] bg-transparent border-0 cursor-pointer leading-none"
        >
          ×
        </button>

        <Kicker>How it works</Kicker>
        <h2 id="guide-title" className="font-serif font-semibold text-2xl mt-2 mb-3 leading-snug">
          A small helper for a real choice.
        </h2>
        <p className="text-sm leading-relaxed text-[#70796f]">
          Public reviews suggest some parents want to try flavours before committing to a larger pack.
          This journal helps compare taste and mixing experiences, using your own notes so the next
          choice feels less like guesswork.
        </p>
        <ol className="mt-3 mb-4 pl-5 space-y-1 text-sm text-[#70796f] list-decimal">
          <li>Choose the flavour you tried.</li>
          <li>Rate enjoyment and note how it mixed.</li>
          <li>After a few tries, see your own preference pattern.</li>
        </ol>
        <div className="bg-[#f2f0e6] rounded-xl p-3 text-[10px] leading-relaxed text-[#737a70]">
          <strong>Important:</strong> This is an early concept based on desk research only.
          Customer interviews are needed to validate the problem and may change the solution.
          Not an official Little Joys product. Not medical advice.
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full bg-[#426549] text-white rounded-full py-2.5 text-sm font-bold hover:bg-[#375641] transition-colors cursor-pointer"
        >
          Got it →
        </button>
      </section>
    </div>
  );
}

/* ─── TastingForm ───────────────────────────────────────────── */
function TastingForm({ onSaved }) {
  const [selected,    setSelected]    = useState('Chocolate');
  const [rating,      setRating]      = useState(0);
  const [texture,     setTexture]     = useState('smooth');
  const [wouldChoose, setWouldChoose] = useState('');
  const [note,        setNote]        = useState('');
  const [busy,        setBusy]        = useState(false);
  const [validErr,    setValidErr]    = useState('');
  const [saved,       setSaved]       = useState(false); // success flash

  async function handleSave() {
    if (!rating) {
      setValidErr('Please choose a star rating before saving.');
      return;
    }
    if (!wouldChoose) {
      setValidErr('Please choose yes, maybe, or not for us before saving.');
      return;
    }
    setValidErr('');
    setBusy(true);
    try {
      const res = await fetch('/api/tastings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flavour: selected, rating, texture, wouldChoose, note }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Could not save. Please try again.');

      // Reset form fields (keep flavour selected for quick re-use)
      setRating(0);
      setWouldChoose('');
      setTexture('smooth');
      setNote('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      onSaved(body, `${selected} tasting saved ✓`);
    } catch (e) {
      setValidErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      id="tasting"
      className="bg-[#fffefa] border border-[#e5e6de] rounded-2xl p-5 sm:p-6"
      aria-label="Tasting journal form"
    >
      <div className="flex justify-between items-start mb-1">
        <div>
          <Kicker>Your tasting journal</Kicker>
          <h2 className="font-serif font-semibold text-2xl mt-1 leading-snug">
            What are you trying today?
          </h2>
        </div>
        <span className="text-xs font-bold text-[#426549] flex-none ml-3" aria-hidden="true">
          01 <span className="text-[#a4aa9f] font-normal">/ 03</span>
        </span>
      </div>
      <p className="text-xs text-[#7a8279] mt-2 mb-4">
        Pick the flavour you tried. No need to rate every one at once.
      </p>

      {/* ── Flavour selector ── */}
      <fieldset>
        <legend className="sr-only">Choose a flavour</legend>
        <div className="grid grid-cols-3 gap-2">
          {FLAVOURS.map((f) => {
            const c = CARD_COLORS[f.color];
            const isChosen = selected === f.name;
            return (
              <button
                key={f.name}
                type="button"
                role="radio"
                aria-checked={isChosen}
                onClick={() => setSelected(f.name)}
                className={`relative border-2 rounded-xl p-3 text-left cursor-pointer transition-all hover:-translate-y-0.5 bg-white ${
                  isChosen ? c.chosen : `${c.border} hover:border-[#c8cfc6]`
                }`}
              >
                <span className={`w-9 h-9 rounded-full grid place-items-center text-xl mb-2.5 ${c.iconBg} ${c.iconFg}`}>
                  {f.icon}
                </span>
                <span className="block text-xs font-bold leading-tight">{f.name}</span>
                <span className="block text-[10px] text-[#7a8279] mt-0.5 leading-tight">{f.note}</span>
                {isChosen && (
                  <span className="absolute right-2 top-2 text-[#426549] text-xs" aria-hidden="true">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="border-t border-[#e5e6de] my-5" />

      {/* ── Q1: Rating ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b border-[#f2f2ec]">
        <div className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-[#f0f1eb] text-[#426549] text-[10px] font-bold grid place-items-center flex-none mt-0.5">1</span>
          <div>
            <p className="text-xs font-bold">How much did you enjoy it?</p>
            <p className="text-[10px] text-[#7a8279] mt-0.5">Go with your first instinct.</p>
          </div>
        </div>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* ── Q2: Texture ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-[#f2f2ec]">
        <div className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-[#f0f1eb] text-[#426549] text-[10px] font-bold grid place-items-center flex-none mt-0.5">2</span>
          <div>
            <p className="text-xs font-bold">How did it mix?</p>
            <p className="text-[10px] text-[#7a8279] mt-0.5">Every kitchen is a little different.</p>
          </div>
        </div>
        <SegmentedGroup
          label="Mixing experience"
          options={Object.entries(TEXTURE_LABELS)}
          value={texture}
          onChange={setTexture}
        />
      </div>

      {/* ── Q3: Would choose ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3">
        <div className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-[#f0f1eb] text-[#426549] text-[10px] font-bold grid place-items-center flex-none mt-0.5">3</span>
          <div>
            <p className="text-xs font-bold">Would you choose it again?</p>
            <p className="text-[10px] text-[#7a8279] mt-0.5">A simple yes, maybe, or not this one.</p>
          </div>
        </div>
        <SegmentedGroup
          label="Would choose again"
          options={Object.entries(CHOOSE_LABELS)}
          value={wouldChoose}
          onChange={setWouldChoose}
        />
      </div>

      {/* ── Optional note ── */}
      <div className="mt-3">
        <label htmlFor="tasting-note" className="block text-[10px] font-bold mb-1.5 text-[#29342d]">
          A little note{' '}
          <span className="text-[8px] tracking-widest text-[#999f96] font-normal ml-1">OPTIONAL</span>
        </label>
        <textarea
          id="tasting-note"
          maxLength={180}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What did you notice? e.g. tried it warm after school…"
          className="w-full min-h-[52px] resize-y border border-[#e5e6de] rounded-xl bg-white px-3 py-2.5 text-xs placeholder:text-[#b0b5ac] focus:outline-2 focus:outline-[#8da58a]"
        />
        <p className="text-right text-[9px] text-[#aab0a7] mt-0.5">{note.length} / 180</p>
      </div>

      {/* ── Validation error ── */}
      {validErr && (
        <div role="alert" className="flex gap-2 items-start text-xs text-[#934c43] bg-[#f8eae6] rounded-xl px-3 py-2.5 mt-2">
          <span className="flex-none mt-0.5">⚠</span>
          <span>{validErr}</span>
        </div>
      )}

      {/* ── Save row ── */}
      <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-[#f2f2ec]">
        <span className="text-[9px] text-[#8d958b] leading-relaxed">Your notes stay on this device only.</span>
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className={`flex-none rounded-full px-5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            saved
              ? 'bg-[#4a7a56] text-white scale-95'
              : 'bg-[#426549] text-white hover:bg-[#375641]'
          } disabled:opacity-60`}
        >
          {busy ? 'Saving…' : saved ? 'Saved ✓' : 'Save taste note →'}
        </button>
      </div>
    </section>
  );
}

/* ─── SummaryPanel ──────────────────────────────────────────── */
function SummaryPanel({ tastings }) {
  const summary = useMemo(() =>
    FLAVOURS.map((f) => {
      const rows = tastings.filter((t) => t.flavour === f.name);
      const avg  = rows.length ? rows.reduce((s, x) => s + x.rating, 0) / rows.length : 0;
      const yes  = rows.filter((x) => x.wouldChoose === 'yes').length;
      return { ...f, count: rows.length, avg, yes };
    }),
    [tastings],
  );

  const best = [...summary]
    .filter((x) => x.count)
    .sort((a, b) => b.avg - a.avg || b.yes - a.yes)[0];

  const tried = summary.filter((x) => x.count).length;

  return (
    <aside className="flex flex-col gap-3" aria-label="Your flavour summary">

      {/* ── Preference card ── */}
      <section className="bg-[#fffefa] border border-[#e5e6de] rounded-2xl p-5">
        <div className="flex justify-between items-start">
          <div>
            <Kicker>Your little guide</Kicker>
            <h2 className="font-serif font-semibold text-xl mt-1 leading-snug">What's clicking?</h2>
          </div>
          <span className="w-7 h-7 bg-[#edf1e8] text-[#426549] rounded-full grid place-items-center text-sm flex-none" aria-hidden="true">✳</span>
        </div>

        {best ? (
          <div className="bg-[#eff3eb] rounded-xl px-4 py-3 mt-4 mb-3">
            <p className="text-[8px] tracking-widest font-bold text-[#748171] uppercase">Your current top pick</p>
            <div className="flex justify-between items-center mt-1.5">
              <span className="font-serif font-semibold text-xl">{best.name}</span>
              <span className="text-sm font-bold text-[#426549]">
                {best.avg.toFixed(1)}<span className="text-[9px] text-[#7a8279] font-normal"> /5</span>
              </span>
            </div>
            <p className="text-[9px] text-[#6d786b] mt-1 leading-relaxed">
              Based on your notes only — a helpful nudge, not a promise.
            </p>
          </div>
        ) : (
          <div className="bg-[#f8f7f2] rounded-xl p-4 mt-4 mb-3 text-center">
            <p className="text-xl text-[#c8a252]" aria-hidden="true">✧</p>
            <p className="font-serif font-semibold text-sm mt-1">Your flavour story starts here.</p>
            <p className="text-[10px] text-[#7a8279] mt-1 leading-relaxed">
              Save a taste note and your personal guide will appear.
            </p>
          </div>
        )}

        {/* ── Progress bar ── */}
        <div className="border-t border-[#e5e6de] pt-3">
          <div className="flex justify-between items-center">
            <span className="text-[8px] tracking-widest font-bold text-[#748171] uppercase">Flavours tried</span>
            <strong className="text-[11px] text-[#29342d]">
              {tried} <span className="text-[#92998f] font-normal text-[10px]">of 3</span>
            </strong>
          </div>
          <div
            className="h-1 bg-[#eeefe9] rounded-full mt-2 overflow-hidden"
            role="progressbar"
            aria-valuenow={tried}
            aria-valuemin={0}
            aria-valuemax={3}
            aria-label={`${tried} of 3 flavours tried`}
          >
            <div
              className="h-full bg-[#799472] rounded-full transition-all duration-500"
              style={{ width: `${(tried / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Per-flavour rows ── */}
        <div className="mt-3 space-y-1.5">
          {summary.map((s) => (
            <div key={s.name} className="flex items-center gap-2 text-[10px] text-[#5e685f]">
              <FlavorDot color={s.color} className="w-2 h-2" />
              <span>{s.name}</span>
              <span className="ml-auto text-[9px] text-[#8b9288]">
                {s.count ? `${s.avg.toFixed(1)} ★ · ${s.count} note${s.count > 1 ? 's' : ''}` : 'Not tried yet'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gentle reminder card ── */}
      <section className="bg-[#f0eee4] rounded-2xl p-4">
        <span className="text-lg text-[#b48e42]" aria-hidden="true">☼</span>
        <Kicker className="mt-1.5">A gentle reminder</Kicker>
        <h3 className="font-serif font-semibold text-base mt-1.5 mb-1 leading-snug">
          One try doesn't have to decide everything.
        </h3>
        <p className="text-[10px] text-[#737a70] leading-relaxed">
          Taste can depend on the day, the mix, and what else is going on.
          Keep notes that help you — not rules.
        </p>
      </section>

      {/* ── Privacy note ── */}
      <div className="flex items-start gap-2.5 px-1">
        <span className="text-[#426549] text-base mt-0.5 flex-none" aria-hidden="true">⌑</span>
        <p className="text-[9px] text-[#858d82] leading-relaxed">
          <strong className="text-[#596359]">Made for your family, kept private.</strong><br />
          No account, child name, or phone number. Notes are stored locally on this device.
        </p>
      </div>
    </aside>
  );
}

/* ─── HistorySection ────────────────────────────────────────── */
function HistorySection({ tastings, onClear, loadError }) {
  const [clearing, setClearing] = useState(false);

  async function handleClear() {
    if (!window.confirm('Clear all taste notes saved on this device? This cannot be undone.')) return;
    setClearing(true);
    try {
      const res = await fetch('/api/tastings', { method: 'DELETE' });
      if (res.ok) {
        onClear();
      } else {
        alert('Could not clear notes. Please try again.');
      }
    } catch {
      alert('Network error. Could not clear notes.');
    } finally {
      setClearing(false);
    }
  }

  return (
    <section className="pt-10 pb-12" aria-labelledby="history-heading">
      <div className="flex justify-between items-end mb-4">
        <div>
          <Kicker>Your notes</Kicker>
          <h2 id="history-heading" className="font-serif font-semibold text-2xl mt-1 leading-snug">
            A little trail of tries
          </h2>
        </div>
        {tastings.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            disabled={clearing}
            className="text-xs text-[#8b6b60] underline underline-offset-2 hover:text-[#6b4b40] bg-transparent border-0 cursor-pointer disabled:opacity-60"
          >
            {clearing ? 'Clearing…' : 'Clear notes'}
          </button>
        )}
      </div>

      <ErrorBanner message={loadError} />

      {tastings.length === 0 ? (
        <div className="bg-[#f1f0e8] rounded-xl p-6 text-xs text-[#858b81] text-center leading-relaxed">
          <p className="text-2xl mb-2" aria-hidden="true">✧</p>
          Your saved taste notes will show up here.<br />
          Start with the flavour you tried today.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[...tastings].reverse().map((t) => {
            const flav = FLAVOURS.find((f) => f.name === t.flavour);
            const dateStr = new Date(t.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short',
            });
            return (
              <article
                key={t.id}
                className="flex items-start gap-3 bg-[#fffefa] border border-[#e5e6de] rounded-xl p-3.5 hover:border-[#d0d4cc] transition-colors"
              >
                <FlavorDot color={flav?.color} className="w-2.5 h-2.5 mt-1.5 flex-none" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-xs font-bold truncate">{t.flavour}</span>
                    <time
                      dateTime={t.createdAt}
                      className="text-[9px] text-[#92998f] flex-none"
                    >
                      {dateStr}
                    </time>
                  </div>
                  <div className="text-[9px] mt-1.5 flex flex-wrap gap-x-1.5 items-center">
                    <span className="text-[#cfaa5f]" aria-label={`${t.rating} stars`}>
                      {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                    </span>
                    <span className="text-[#dde0d9]">·</span>
                    <span className="text-[#808880]">{TEXTURE_LABELS[t.texture]}</span>
                    <span className="text-[#dde0d9]">·</span>
                    <span className="text-[#949b91]">{CHOOSE_LABELS[t.wouldChoose] || t.wouldChoose}</span>
                  </div>
                  {t.note && (
                    <p className="font-serif italic text-xs text-[#757d73] mt-2 leading-snug border-t border-[#f0f1eb] pt-1.5">
                      "{t.note}"
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ─── HeroSection ───────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-8 items-center pt-10 pb-8"
      aria-label="Introduction"
    >
      <div>
        <Kicker><span className="mr-1.5" aria-hidden="true">✳</span>The Little Joys taste test</Kicker>
        <h1 className="font-serif font-semibold leading-[1.03] tracking-tight text-[clamp(36px,5.5vw,60px)] mt-4 mb-3">
          Find the flavour<br />
          that feels like{' '}
          <em className="font-medium text-[#69866a] not-italic">the one.</em>
        </h1>
        <p className="text-sm leading-relaxed text-[#7a8279] max-w-md">
          Try a few flavours at home. Keep a simple note of what your family enjoys,
          so choosing the next pack feels easier.
        </p>
        <a
          href="#tasting"
          className="inline-flex items-center gap-4 mt-6 bg-[#426549] text-white rounded-full px-5 py-3 text-xs font-bold hover:bg-[#375641] transition-colors"
        >
          Start a taste note <span aria-hidden="true">↓</span>
        </a>
      </div>

      {/* Decorative illustration — hidden on mobile */}
      <div
        className="relative rounded-[46%_54%_48%_52%] bg-[#f0eee3] h-[280px] max-w-[380px] w-full overflow-hidden justify-self-end hidden md:block"
        aria-hidden="true"
        role="presentation"
      >
        <div className="absolute w-52 h-52 bg-[#e5d5b4] rounded-full right-16 top-7" />
        <div className="absolute z-10 text-4xl left-12 top-16 -rotate-[18deg] text-[#b16f60]">✿</div>
        <div className="absolute z-10 text-5xl right-12 bottom-16 rotate-[16deg] text-[#71845e]">◒</div>
        <div className="absolute z-10 text-3xl left-24 bottom-10 text-[#d5a751]">✳</div>
        {/* Cup */}
        <div className="absolute z-20 left-[calc(50%-56px)] top-[76px] w-28">
          <div className="h-4 rounded-full bg-[#fffefa] border-2 border-[#ded9cb]" />
          <div className="h-32 bg-gradient-to-r from-[#fdfcf5] to-[#eeeadf] border border-[#ded9cb] border-t-0 rounded-b-3xl grid place-items-center relative shadow-sm">
            <div className="absolute right-[-26px] top-7 w-7 h-14 border-[7px] border-[#dfdbcf] border-l-0 rounded-r-2xl" />
            <span className="text-sm font-bold leading-tight tracking-tight text-center">
              little<br /><b className="text-[#426549]">joys</b>
            </span>
          </div>
        </div>
        <p className="absolute bottom-5 right-5 font-serif italic text-xs text-[#71756a]">
          A tiny taste. A clearer choice.
        </p>
      </div>
    </section>
  );
}

/* ─── App (root) ────────────────────────────────────────────── */
function App() {
  const [tastings,  setTastings]  = useState([]);
  const [loadError, setLoadError] = useState('');
  const [toast,     setToast]     = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [loading,   setLoading]   = useState(true);

  async function fetchTastings() {
    setLoading(true);
    try {
      const res = await fetch('/api/tastings');
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      setTastings(await res.json());
      setLoadError('');
    } catch (e) {
      setLoadError(
        'Could not reach the local API. Run npm run dev to start both services, then refresh. ' +
        `(${e.message})`
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTastings(); }, []);

  function flash(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  function handleSaved(entry, msg) {
    if (entry) setTastings((prev) => [...prev, entry]);
    flash(msg);
  }

  function handleCleared() {
    setTastings([]);
    flash('Taste notes cleared.');
  }

  return (
    <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <header className="h-[70px] border-b border-[#e5e6de] flex items-center justify-between gap-4">
        <span className="text-[18px] font-bold tracking-tight text-[#29342d]" aria-label="Little Joys Flavour Finder">
          little <span className="text-[#426549]">joys</span>
          <span className="text-xs text-[#959a91] font-medium ml-2">/ taste notes</span>
        </span>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="text-xs font-semibold text-[#426549] bg-transparent border-0 cursor-pointer hover:underline flex-none"
        >
          How it works ↗
        </button>
      </header>

      <main>
        <HeroSection />

        {/* ── Steps strip ── */}
        <div
          className="border-t border-b border-[#e5e6de] py-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[10px] tracking-wide text-[#747c72]"
          aria-label="Steps"
        >
          <span>01&nbsp;&nbsp;Choose a flavour</span>
          <span className="text-[#c1c5ba]" aria-hidden="true">·</span>
          <span>02&nbsp;&nbsp;Try it your way</span>
          <span className="text-[#c1c5ba]" aria-hidden="true">·</span>
          <span>03&nbsp;&nbsp;Remember what worked</span>
        </div>

        {/* ── Loading skeleton ── */}
        {loading ? (
          <div
            className="mt-7 grid grid-cols-1 md:grid-cols-[1.45fr_0.72fr] gap-5"
            aria-busy="true"
            aria-label="Loading your tasting notes…"
          >
            {[400, 280].map((h, i) => (
              <div
                key={i}
                className="bg-[#f0f1eb] rounded-2xl animate-pulse"
                style={{ height: h }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-1 md:grid-cols-[1.45fr_0.72fr] gap-5 items-start">
            <TastingForm onSaved={handleSaved} />
            <SummaryPanel tastings={tastings} />
          </div>
        )}

        <HistorySection
          tastings={tastings}
          onClear={handleCleared}
          loadError={loading ? '' : loadError}
        />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e5e6de] py-5 flex flex-wrap items-center gap-4">
        <span className="text-sm font-bold tracking-tight text-[#29342d] whitespace-nowrap">
          little <span className="text-[#426549]">joys</span>
        </span>
        <p className="flex-1 text-[9px] text-[#92998f] leading-relaxed min-w-[180px]">
          An independent student concept for the Mosaic Fellowship Builder Challenge.
          Not an official Little Joys product. This tool records preferences only —
          it does not provide nutrition or medical advice.
        </p>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="text-[10px] text-[#426549] font-semibold bg-transparent border-0 cursor-pointer hover:underline whitespace-nowrap"
        >
          About this concept
        </button>
      </footer>

      {showGuide && <HowItWorksModal onClose={() => setShowGuide(false)} />}
      <Toast message={toast} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
