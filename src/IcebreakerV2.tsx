import React, { useState, useRef, useMemo, useEffect } from "react";
import { Shuffle, ArrowRight, ArrowLeft, Heart, Users, Plus, Timer, X, Trash2, Check, ChevronDown } from "lucide-react";

interface Question {
  id: number;
  cat: string;
  text: string;
  custom: boolean;
}

interface CategoryDef {
  label: string;
  glyph: string;
  color: string;
}

const CATEGORIES: Record<string, CategoryDef> = {
  deep:       { label: "Deep",       glyph: "✦", color: "#6366f1" },
  experience: { label: "Experience", glyph: "✺", color: "#0d9488" },
  life:       { label: "Life",       glyph: "❋", color: "#16a34a" },
  fun:        { label: "Fun",        glyph: "☻", color: "#ec4899" },
  reflection: { label: "Reflection", glyph: "◐", color: "#7c3aed" },
  connection: { label: "Connection", glyph: "♡", color: "#e11d48" },
  bold:       { label: "Bold",       glyph: "⚡", color: "#d97706" },
};

const BASE_QUESTIONS: Question[] = (
  [
    ["deep","What belief did you once hold strongly that you've completely changed your mind about?"],
    ["deep","If you could know the absolute truth to one question, what would you ask?"],
    ["deep","When do you feel most like your true self?"],
    ["deep","What's a fear you've never really told anyone about?"],
    ["deep","What does a life well lived look like to you?"],
    ["deep","What part of yourself are you still trying to understand?"],
    ["deep","If this chapter of your life had a title, what would it be?"],
    ["deep","What do you think people misunderstand most about you?"],
    ["deep","What's something you believe that most people around you don't?"],
    ["deep","When was the last time you felt truly at peace?"],
    ["deep","What would you attempt if you knew you couldn't fail?"],
    ["deep","What's a question you're still searching for the answer to?"],
    ["experience","What's the most spontaneous thing you've ever done?"],
    ["experience","Describe a moment that quietly changed the direction of your life."],
    ["experience","What's the best trip or adventure you've ever taken?"],
    ["experience","What's something you did that you never thought you'd be brave enough to do?"],
    ["experience","What's the most beautiful place you've ever seen with your own eyes?"],
    ["experience","Tell us about a time a stranger's kindness really stuck with you."],
    ["experience","What's a skill you taught yourself, and why?"],
    ["experience","What's the most memorable meal you've ever had?"],
    ["experience","Describe a time you were completely out of your comfort zone."],
    ["experience","What's an experience you'd relive exactly as it happened?"],
    ["experience","What's the closest you've come to a real-life movie moment?"],
    ["experience","What's something you tried once and will never do again?"],
    ["life","What's a small daily habit that genuinely makes your life better?"],
    ["life","If you could give your younger self one piece of advice, what would it be?"],
    ["life","What's something you're proud of that you rarely get to talk about?"],
    ["life","What does your ideal ordinary day look like?"],
    ["life","What's a goal you're quietly working toward right now?"],
    ["life","Who has had the biggest influence on who you are today?"],
    ["life","What's something you've changed your mind about as you've gotten older?"],
    ["life","What would you do with your time if money were no object?"],
    ["life","What's a tradition you have, or one you'd love to start?"],
    ["life","What does the word home mean to you?"],
    ["life","What are you most grateful for these days?"],
    ["life","Where do you hope to be five years from now?"],
    ["fun","If you could instantly master any skill, what would it be?"],
    ["fun","What's the most useless talent you have?"],
    ["fun","Dinner with anyone, living or dead — who, and why?"],
    ["fun","What's your go-to karaoke song?"],
    ["fun","If you were a kitchen appliance, which one would you be?"],
    ["fun","What's the weirdest food combination you secretly love?"],
    ["fun","What fictional world would you most want to live in?"],
    ["fun","What's the most embarrassing song on your playlist right now?"],
    ["fun","If animals could talk, which would be the rudest?"],
    ["fun","What's a tiny thing that makes you irrationally happy?"],
    ["fun","What would the title of your autobiography be?"],
    ["fun","If you came with a warning label, what would it say?"],
    ["reflection","What's something you've finally forgiven yourself for?"],
    ["reflection","What are you holding onto that you know you should let go of?"],
    ["reflection","When did you last genuinely surprise yourself?"],
    ["reflection","What's a compliment you received that you've never forgotten?"],
    ["reflection","What season of life do you feel you're in right now?"],
    ["reflection","What's something you used to want that you no longer do?"],
    ["reflection","What's a mistake that ended up teaching you the most?"],
    ["reflection","What does success mean to you now versus ten years ago?"],
    ["reflection","What's a question you wish people asked you more often?"],
    ["reflection","What's something you needed to hear when you were younger?"],
    ["reflection","What are you slowly getting better at?"],
    ["reflection","What part of your routine would you miss most if it vanished?"],
    ["connection","What makes you feel truly understood by someone?"],
    ["connection","What's the kindest thing someone has ever done for you?"],
    ["connection","How do you show people you care about them?"],
    ["connection","What's a friendship that genuinely changed you?"],
    ["connection","What do you value most in the people closest to you?"],
    ["connection","What's something you wish you'd said to someone but never did?"],
    ["connection","Who in your life do you most want to make proud?"],
    ["connection","What's a lesson love has taught you?"],
    ["connection","When do you feel most connected to other people?"],
    ["connection","What quality do you hope people remember you for?"],
    ["connection","Who do you go to when everything falls apart?"],
    ["connection","What does loyalty mean to you?"],
    ["bold","What's an opinion you hold that always starts an argument?"],
    ["bold","What does everyone seem to love that you just don't get?"],
    ["bold","What rule of life do you think is completely overrated?"],
    ["bold","What trend do you secretly hope dies out soon?"],
    ["bold","What's a hill you're willing to die on?"],
    ["bold","What do you think is secretly a scam?"],
    ["bold","What's the most overrated thing about adult life?"],
    ["bold","What would you ban if you ruled the world for one day?"],
    ["bold","What popular piece of advice do you completely disagree with?"],
    ["bold","What's something people take way too seriously?"],
    ["bold","What belief of yours would shock the people who know you?"],
    ["bold","What's a guilty pleasure you refuse to feel guilty about?"],
  ] as [string, string][]
).map(([cat, text], i) => ({ id: i, cat, text, custom: false }));

const CIRC = 2 * Math.PI * 22;

function hexAlpha(hex: string, pct: number): string {
  const a = Math.round(pct * 255).toString(16).padStart(2, "0");
  return hex + a;
}

let customIdCounter = BASE_QUESTIONS.length;

export default function IcebreakerV2() {
  const [active, setActive]           = useState<Set<string>>(new Set(Object.keys(CATEGORIES)));
  const [allQs, setAllQs]             = useState<Question[]>(BASE_QUESTIONS);
  const [history, setHistory]         = useState<Question[]>([]);
  const [historyIdx, setHistoryIdx]   = useState(-1);
  const [flipped, setFlipped]         = useState(false);
  const [drawCount, setDrawCount]     = useState(0);
  const usedRef  = useRef(new Set<number>());
  const lockRef  = useRef(false);

  const current   = historyIdx >= 0 ? history[historyIdx] : null;
  const canGoBack = historyIdx > 0;

  const [favs, setFavs]               = useState<Question[]>([]);
  const [playerMode, setPlayerMode]   = useState(1);
  const [playerNames, setPlayerNames] = useState(["Player 1", "Player 2"]);
  const [curPlayer, setCurPlayer]     = useState(0);
  const [timerDur, setTimerDur]       = useState(0);
  const [timerLeft, setTimerLeft]     = useState(0);
  const [timerOn, setTimerOn]         = useState(false);
  const [timerDone, setTimerDone]     = useState(false);
  const [panel, setPanel]             = useState<string | null>(null);
  const [customText, setCustomText]   = useState("");
  const [customCat, setCustomCat]     = useState("deep");

  useEffect(() => {
    if (!timerOn || timerLeft <= 0) {
      if (timerOn && timerLeft <= 0) { setTimerOn(false); setTimerDone(true); }
      return;
    }
    const t = setTimeout(() => setTimerLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timerOn, timerLeft]);

  const pool = useMemo(() => allQs.filter(q => active.has(q.cat)), [allQs, active]);

  const startTimer = () => {
    if (timerDur > 0) { setTimerLeft(timerDur); setTimerOn(true); setTimerDone(false); }
  };
  const stopTimer = () => { setTimerOn(false); setTimerDone(false); setTimerLeft(0); };

  const draw = () => {
    if (lockRef.current || !pool.length) return;
    lockRef.current = true;
    let avail = pool.filter(q => !usedRef.current.has(q.id));
    if (!avail.length) { usedRef.current = new Set(); avail = [...pool]; }
    const next = avail[Math.floor(Math.random() * avail.length)];
    usedRef.current.add(next.id);
    const reveal = (_q: Question, newIdx: number, newHistory: Question[]) => {
      setHistory(newHistory);
      setHistoryIdx(newIdx);
      setDrawCount(c => c + 1);
      if (playerMode === 2) setCurPlayer(p => 1 - p);
      requestAnimationFrame(() => setFlipped(true));
      startTimer();
      setTimeout(() => (lockRef.current = false), 650);
    };
    const newHistory = [...history.slice(0, historyIdx + 1), next];
    const newIdx     = historyIdx + 1;
    if (!flipped) { reveal(next, newIdx, newHistory); }
    else { setFlipped(false); stopTimer(); setTimeout(() => reveal(next, newIdx, newHistory), 320); }
  };

  const goBack = () => {
    if (!canGoBack || lockRef.current) return;
    lockRef.current = true;
    setFlipped(false); stopTimer();
    setTimeout(() => {
      setHistoryIdx(i => i - 1);
      setDrawCount(c => c + 1);
      requestAnimationFrame(() => setFlipped(true));
      startTimer();
      setTimeout(() => (lockRef.current = false), 650);
    }, 320);
  };

  const reset = () => {
    if (lockRef.current) return;
    setFlipped(false); stopTimer();
    setTimeout(() => {
      setHistory([]); setHistoryIdx(-1);
      usedRef.current = new Set(); setDrawCount(0); setCurPlayer(0);
    }, 320);
  };

  const toggleCat = (k: string) => setActive(prev => {
    const n = new Set(prev);
    if (n.has(k)) { if (n.size > 1) n.delete(k); } else n.add(k);
    return n;
  });

  const toggleFav = (e: React.MouseEvent, q: Question) => {
    e.stopPropagation();
    setFavs(prev => prev.find(f => f.id === q.id) ? prev.filter(f => f.id !== q.id) : [...prev, q]);
  };

  const addQ = () => {
    const text = customText.trim();
    if (!text) return;
    setAllQs(prev => [...prev, { id: ++customIdCounter, cat: customCat, text, custom: true }]);
    setCustomText(""); setPanel(null);
  };

  const cat      = current ? CATEGORIES[current.cat] : null;
  const isFav    = current ? favs.some(f => f.id === current.id) : false;
  const timerPct = timerDur > 0 ? timerLeft / timerDur : 0;
  const dashOff  = CIRC * (1 - timerPct);
  const p1color  = "#6366f1";
  const p2color  = "#ec4899";

  return (
    <div style={r.root}>
      <style>{CSS}</style>
      <div className="g-grain" />

      <header style={r.hdr}>
        <div style={r.eyebrow}>✦ &nbsp;a game for warming up the room</div>
        <h1 style={r.title}>Icebreaker</h1>
        <p style={r.sub}>Pick topics · Tap the deck · Start the conversation.</p>
      </header>

      <div style={r.chips}>
        {Object.entries(CATEGORIES).map(([k, c]) => {
          const on = active.has(k);
          return (
            <button key={k} onClick={() => toggleCat(k)} className="g-chip" style={{
              borderColor: on ? c.color : "rgba(255,255,255,0.14)",
              background:  on ? c.color : "rgba(255,255,255,0.04)",
              color:       on ? "#fff"  : "rgba(245,241,234,0.5)",
              boxShadow:   on ? `0 5px 18px -5px ${c.color}99` : "none",
            }}>
              <span style={{ fontSize: 12 }}>{c.glyph}</span>{c.label}
            </button>
          );
        })}
      </div>

      {playerMode === 2 && current && (
        <div key={`${curPlayer}-${drawCount}`} className="g-pill" style={{
          borderColor: curPlayer === 0 ? p1color : p2color,
          color:       curPlayer === 0 ? p1color : p2color,
        }}>
          <span className="g-dot" style={{ background: curPlayer === 0 ? p1color : p2color }} />
          <strong>{playerNames[curPlayer]}</strong>&nbsp;<span style={{ opacity: 0.7 }}>is up</span>
        </div>
      )}

      <div style={r.stage}>
        <div className="g-stack g-s3" />
        <div className="g-stack g-s2" />
        <div className="g-flipwrap" onClick={draw}>
          <div className="g-flip" style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
            <div className="g-face g-back">
              <div className="g-back-border" />
              <div className="g-back-inner">
                <div className="g-back-star">✦</div>
                <div className="g-back-name">ICEBREAKER</div>
              </div>
              <div className="g-cardhint">{current ? "Tap for next card" : "Tap to draw a card"}</div>
            </div>

            <div className={`g-face g-front${timerDone ? " g-timeblink" : ""}`}>
              {cat && current && (
                <>
                  <div className="g-top">
                    <div className="g-catpill" style={{ background: hexAlpha(cat.color, 0.13), color: cat.color }}>
                      <span>{cat.glyph}</span>
                      <span className="g-catname">{cat.label}</span>
                    </div>
                    {current.custom && (
                      <span className="g-custbadge" style={{ background: hexAlpha(cat.color, 0.13), color: cat.color }}>
                        Custom
                      </span>
                    )}
                    <button className="g-heartbtn" onClick={e => toggleFav(e, current)}
                      style={{ color: isFav ? "#e11d48" : "rgba(245,241,234,0.3)" }}>
                      <Heart size={19} fill={isFav ? "#e11d48" : "none"} strokeWidth={2} />
                    </button>
                  </div>

                  <p key={drawCount} className="g-question">{current.text}</p>

                  <div className="g-bottom">
                    {timerDur > 0 ? (
                      <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
                        <svg width={52} height={52} style={{ transform: "rotate(-90deg)", display: "block" }}>
                          <circle cx={26} cy={26} r={22} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={3.5} />
                          <circle cx={26} cy={26} r={22} fill="none"
                            stroke={timerDone ? "#e11d48" : cat.color} strokeWidth={3.5}
                            strokeDasharray={CIRC} strokeDashoffset={dashOff}
                            strokeLinecap="round"
                            style={{ transition: timerOn ? "stroke-dashoffset 0.95s linear" : "none" }}
                          />
                        </svg>
                        <span className="g-timernum" style={{ color: timerDone ? "#e11d48" : "rgba(245,241,234,0.8)" }}>
                          {timerDone ? "✓" : timerLeft}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(245,241,234,0.38)" }}>
                        No.&nbsp;{String(drawCount).padStart(2, "0")}
                      </span>
                    )}
                    <span style={{ fontSize: 18, color: cat.color }}>{cat.glyph}</span>
                  </div>

                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6,
                    background: cat.color, borderRadius: "20px 20px 0 0" }} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={r.btns}>
        {canGoBack && (
          <button onClick={goBack} className="g-btn g-btn-ghost">
            <ArrowLeft size={15} strokeWidth={2} /> Back
          </button>
        )}
        <button onClick={draw} className="g-btn g-btn-primary">
          {current ? "Next card" : "Draw a card"}
          <ArrowRight size={16} strokeWidth={2.4} />
        </button>
        <button onClick={reset} className="g-btn g-btn-ghost">
          <Shuffle size={15} strokeWidth={2} /> Reset
        </button>
      </div>

      <div style={r.footer}>{pool.length} questions · {active.size} topic{active.size !== 1 ? "s" : ""}</div>

      <nav style={r.navbar}>
        <button className="g-tool" onClick={() => setPanel(p => p === "favs" ? null : "favs")}>
          <Heart size={20} fill={favs.length ? "#e11d48" : "none"}
            stroke={favs.length ? "#e11d48" : "rgba(245,241,234,0.5)"} strokeWidth={2} />
          <span>{favs.length ? `Saved (${favs.length})` : "Saved"}</span>
        </button>
        <button className="g-tool" onClick={() => setPanel(p => p === "players" ? null : "players")}>
          <Users size={20} stroke={playerMode === 2 ? p1color : "rgba(245,241,234,0.5)"} strokeWidth={2} />
          <span>Players</span>
        </button>
        <button className="g-tool" onClick={() => setPanel(p => p === "add" ? null : "add")}>
          <Plus size={20} stroke="rgba(245,241,234,0.5)" strokeWidth={2} />
          <span>Add Q</span>
        </button>
        <button className="g-tool" onClick={() => setPanel(p => p === "timer" ? null : "timer")}>
          <Timer size={20} stroke={timerDur ? "#d97706" : "rgba(245,241,234,0.5)"} strokeWidth={2} />
          <span>{timerDur ? `${timerDur}s` : "Timer"}</span>
        </button>
      </nav>

      {panel === "favs" && (
        <div className="g-backdrop" onClick={() => setPanel(null)}>
          <div className="g-sheet g-sheet-tall" onClick={e => e.stopPropagation()}>
            <div className="g-handle" />
            <div className="g-shdr">
              <h2 className="g-stitle">♡ &nbsp;Saved Cards</h2>
              <button className="g-xbtn" onClick={() => setPanel(null)}><X size={18} /></button>
            </div>
            {!favs.length
              ? <p className="g-empty">Heart a card while it's showing to save it here.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {favs.map(fav => {
                    const c = CATEGORIES[fav.cat];
                    return (
                      <div key={fav.id} className="g-favcard" style={{ borderLeftColor: c.color }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 7 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                            textTransform: "uppercase", color: c.color }}>
                            {c.glyph} {c.label}
                          </span>
                          {fav.custom && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700,
                            letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px",
                            borderRadius: 999, background: hexAlpha(c.color, 0.18), color: c.color }}>
                            Custom
                          </span>}
                          <button className="g-delbtn"
                            onClick={() => setFavs(f => f.filter(x => x.id !== fav.id))}>
                            <Trash2 size={13} strokeWidth={2} />
                          </button>
                        </div>
                        <p style={{ fontFamily: "'Fraunces',serif", fontSize: 15.5, margin: 0,
                          lineHeight: 1.35, color: "#f5f1ea" }}>{fav.text}</p>
                      </div>
                    );
                  })}
                </div>
            }
          </div>
        </div>
      )}

      {panel === "players" && (
        <div className="g-backdrop" onClick={() => setPanel(null)}>
          <div className="g-sheet" onClick={e => e.stopPropagation()}>
            <div className="g-handle" />
            <div className="g-shdr">
              <h2 className="g-stitle">👥 &nbsp;Players</h2>
              <button className="g-xbtn" onClick={() => setPanel(null)}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {[1, 2].map(n => (
                <button key={n} onClick={() => { setPlayerMode(n); setCurPlayer(0); }}
                  className="g-modebtn" style={{
                    background: playerMode === n ? "#f5f1ea" : "rgba(255,255,255,0.06)",
                    color:      playerMode === n ? "#1a1622" : "rgba(245,241,234,0.6)",
                    boxShadow:  playerMode === n ? "0 6px 18px -8px rgba(245,241,234,0.45)" : "none",
                  }}>
                  {n === 1 ? "Solo" : "2 Players"}
                </button>
              ))}
            </div>
            {playerMode === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[0, 1].map(i => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                      background: i === 0 ? p1color : p2color, display: "block" }} />
                    <input className="g-nameinput" value={playerNames[i]} maxLength={20}
                      placeholder={`Player ${i + 1}`}
                      onChange={e => setPlayerNames(prev => { const n = [...prev]; n[i] = e.target.value; return n; })}
                    />
                  </div>
                ))}
                <p className="g-panelhint">Turns alternate on each drawn card.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {panel === "add" && (
        <div className="g-backdrop" onClick={() => setPanel(null)}>
          <div className="g-sheet" onClick={e => e.stopPropagation()}>
            <div className="g-handle" />
            <div className="g-shdr">
              <h2 className="g-stitle">✏️ &nbsp;Add a Question</h2>
              <button className="g-xbtn" onClick={() => setPanel(null)}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label className="g-lbl">Category</label>
              <div style={{ position: "relative" }}>
                <select className="g-select" value={customCat} onChange={e => setCustomCat(e.target.value)}>
                  {Object.entries(CATEGORIES).map(([k, c]) => (
                    <option key={k} value={k}>{c.glyph} {c.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)", color: "rgba(245,241,234,0.4)", pointerEvents: "none" }} />
              </div>
              <label className="g-lbl" style={{ marginTop: 10 }}>Your Question</label>
              <textarea className="g-textarea" rows={3} value={customText}
                placeholder="Type your question here…"
                onChange={e => setCustomText(e.target.value)} />
              <button className="g-submit" disabled={!customText.trim()} onClick={addQ}>
                <Check size={15} strokeWidth={2.5} /> Add to deck
              </button>
            </div>
          </div>
        </div>
      )}

      {panel === "timer" && (
        <div className="g-backdrop" onClick={() => setPanel(null)}>
          <div className="g-sheet" onClick={e => e.stopPropagation()}>
            <div className="g-handle" />
            <div className="g-shdr">
              <h2 className="g-stitle">⏱ &nbsp;Answer Timer</h2>
              <button className="g-xbtn" onClick={() => setPanel(null)}><X size={18} /></button>
            </div>
            <p className="g-panelhint">Countdown starts the moment a card is drawn.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 14 }}>
              {([{ l: "Off", v: 0 }, { l: "30s", v: 30 }, { l: "60s", v: 60 }, { l: "90s", v: 90 }] as const).map(opt => (
                <button key={opt.v} className="g-timeropt"
                  onClick={() => { setTimerDur(opt.v); stopTimer(); setPanel(null); }}
                  style={{
                    background: timerDur === opt.v ? "#d97706" : "rgba(255,255,255,0.06)",
                    color:      timerDur === opt.v ? "#fff" : "rgba(245,241,234,0.65)",
                    boxShadow:  timerDur === opt.v ? "0 5px 18px -6px #d97706bb" : "none",
                  }}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const r: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh", width: "100%",
    background: "radial-gradient(120% 90% at 50% 0%, #24203a 0%, #181525 50%, #0f0d1b 100%)",
    color: "#f5f1ea", fontFamily: "'Archivo',sans-serif",
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "clamp(20px,5vw,50px) 20px 100px", position: "relative", overflow: "hidden",
  },
  hdr:    { textAlign: "center", maxWidth: 520, zIndex: 2 },
  eyebrow:{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "rgba(245,241,234,0.4)", marginBottom: 12, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center" },
  title:  { fontFamily: "'Fraunces',serif", fontStyle: "italic",
            fontSize: "clamp(44px,11vw,84px)", fontWeight: 600, lineHeight: 0.93,
            margin: 0, letterSpacing: "-0.02em",
            background: "linear-gradient(160deg,#fff 10%,#c9bce8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  sub:    { fontSize: 14, lineHeight: 1.5, margin: "12px 0 0", color: "rgba(245,241,234,0.5)" },
  chips:  { display: "flex", flexWrap: "wrap", justifyContent: "center",
            gap: 8, margin: "24px 0 4px", maxWidth: 580, zIndex: 2 },
  stage:  { position: "relative", width: "min(320px,86vw)", height: 450,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "18px 0 6px", zIndex: 2 },
  btns:   { display: "flex", gap: 12, marginTop: 12, zIndex: 2 },
  footer: { marginTop: 14, fontSize: 11.5, letterSpacing: "0.05em",
            color: "rgba(245,241,234,0.32)", zIndex: 2 },
  navbar: {
    position: "fixed", bottom: 0, left: 0, right: 0,
    display: "flex", justifyContent: "space-around", alignItems: "center",
    background: "rgba(18,15,28,0.92)", backdropFilter: "blur(16px)",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    paddingTop: 8,
    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
    zIndex: 50,
  },
};

const CSS = `
*{box-sizing:border-box;}
html,body{margin:0;padding:0;background:#0f0d1b;}

.g-grain{position:absolute;inset:0;pointer-events:none;opacity:.04;z-index:1;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}

.g-chip{display:inline-flex;align-items:center;gap:5px;padding:6px 13px;border-radius:999px;
  border:1.5px solid;font-size:12.5px;font-weight:600;cursor:pointer;
  transition:transform .14s ease,box-shadow .14s ease;font-family:'Archivo',sans-serif;}
.g-chip:hover{transform:translateY(-1px);}

.g-pill{display:inline-flex;align-items:center;gap:7px;padding:6px 16px;border-radius:999px;
  border:1.5px solid;font-size:13px;font-family:'Archivo',sans-serif;margin-bottom:4px;z-index:2;
  animation:gpillin .35s cubic-bezier(.34,1.5,.64,1) both;}
@keyframes gpillin{from{transform:scale(.85) translateY(-6px);opacity:0}to{transform:scale(1);opacity:1}}
.g-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}

.g-stack{position:absolute;width:280px;max-width:86vw;height:410px;border-radius:20px;
  border:1px solid rgba(255,255,255,.05);}
.g-s2{background:#1e1b30;transform:translate(9px,12px) rotate(3.5deg);}
.g-s3{background:#18162b;transform:translate(-10px,18px) rotate(-4.5deg);}

.g-flipwrap{position:relative;width:280px;max-width:86vw;height:410px;
  perspective:1600px;cursor:pointer;z-index:3;-webkit-tap-highlight-color:transparent;}
.g-flip{width:100%;height:100%;transform-style:preserve-3d;
  transition:transform .56s cubic-bezier(.7,.05,.24,1);}
.g-flipwrap:active .g-flip{transform:scale(.97) rotateY(var(--r,0deg));}

.g-face{position:absolute;inset:0;border-radius:20px;
  backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;}

.g-back{background:linear-gradient(150deg,#2e2848 0%,#1c1a30 100%);
  border:1px solid rgba(255,255,255,.08);
  box-shadow:0 28px 56px -20px rgba(0,0,0,.7);
  display:flex;flex-direction:column;align-items:center;justify-content:center;}
.g-back-border{position:absolute;inset:14px;border-radius:12px;
  border:1.5px solid rgba(255,255,255,.1);
  background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.03) 0 1.5px,transparent 1.5px 10px),
    repeating-linear-gradient(-45deg,rgba(255,255,255,.03) 0 1.5px,transparent 1.5px 10px);}
.g-back-inner{position:relative;text-align:center;z-index:1;}
.g-back-star{font-size:46px;color:#b9a8e8;margin-bottom:10px;
  filter:drop-shadow(0 0 20px rgba(140,100,230,.55));
  animation:gfloat 3s ease-in-out infinite;}
@keyframes gfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.g-back-name{font-family:'Fraunces',serif;font-style:italic;font-weight:600;
  letter-spacing:.3em;font-size:13.5px;color:rgba(245,241,234,.6);padding-left:.3em;}
.g-cardhint{position:absolute;bottom:22px;font-size:11px;letter-spacing:.16em;
  text-transform:uppercase;color:rgba(245,241,234,.38);font-weight:600;
  animation:gpulse 2.4s ease-in-out infinite;}
@keyframes gpulse{0%,100%{opacity:.3}50%{opacity:.75}}
.g-panelhint{font-size:12.5px;color:rgba(245,241,234,.4);line-height:1.5;margin:10px 0 0;}

.g-front{transform:rotateY(180deg);
  background:linear-gradient(150deg,#2e2848 0%,#1c1a30 100%);
  color:#f5f1ea;border:1px solid rgba(255,255,255,.08);
  box-shadow:0 28px 56px -20px rgba(0,0,0,.7);
  padding:28px 24px 22px;display:flex;flex-direction:column;}
.g-front.g-timeblink{animation:gtimeblink .6s ease 3;}
@keyframes gtimeblink{
  0%,100%{box-shadow:0 28px 56px -20px rgba(0,0,0,.7)}
  50%{box-shadow:0 28px 56px -20px rgba(0,0,0,.7),0 0 0 6px rgba(225,29,72,.3)}}

.g-top{display:flex;align-items:center;gap:8px;margin-top:4px;}
.g-catpill{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;}
.g-catname{font-size:11.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;}
.g-custbadge{font-size:10px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;padding:3px 8px;border-radius:999px;}
.g-heartbtn{margin-left:auto;background:none;border:none;cursor:pointer;
  padding:4px;border-radius:50%;line-height:0;transition:transform .15s ease;}
.g-heartbtn:hover{transform:scale(1.2);}

.g-question{font-family:'Fraunces',serif;font-weight:500;color:#f5f1ea;
  font-size:clamp(20px,5.6vw,26px);line-height:1.28;margin:auto 0;
  letter-spacing:-.012em;animation:gqin .45s .1s both ease;}
@keyframes gqin{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}

.g-bottom{display:flex;align-items:center;justify-content:space-between;
  border-top:1px solid rgba(255,255,255,.1);padding-top:12px;margin-top:12px;}
.g-timernum{position:absolute;inset:0;display:flex;align-items:center;
  justify-content:center;font-size:14px;font-weight:700;font-family:'Archivo',sans-serif;}

.g-btn{display:inline-flex;align-items:center;gap:8px;font-family:'Archivo',sans-serif;
  font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;
  cursor:pointer;border:1.5px solid transparent;transition:all .16s ease;}
.g-btn-primary{background:#f5f1ea;color:#1a1622;
  box-shadow:0 10px 26px -10px rgba(245,241,234,.5);}
.g-btn-primary:hover{transform:translateY(-2px);box-shadow:0 14px 30px -10px rgba(245,241,234,.65);}
.g-btn-ghost{background:transparent;color:rgba(245,241,234,.65);
  border-color:rgba(255,255,255,.16);}
.g-btn-ghost:hover{color:#fff;border-color:rgba(255,255,255,.35);}
.g-btn:active{transform:scale(.97);}

.g-tool{display:flex;flex-direction:column;align-items:center;gap:4px;
  background:none;border:none;cursor:pointer;padding:6px 18px;border-radius:12px;
  transition:background .14s ease;font-family:'Archivo',sans-serif;flex:1;}
.g-tool:hover{background:rgba(255,255,255,.07);}
.g-tool>span{font-size:10px;letter-spacing:.06em;font-weight:600;
  color:rgba(245,241,234,.5);text-transform:uppercase;}

.g-backdrop{position:fixed;inset:0;background:rgba(10,8,18,.75);
  backdrop-filter:blur(6px);z-index:100;display:flex;align-items:flex-end;justify-content:center;}
.g-sheet{background:#1e1b2f;border-radius:24px 24px 0 0;
  padding:10px 22px 40px;width:100%;max-width:560px;
  border:1px solid rgba(255,255,255,.1);border-bottom:none;
  animation:gslideup .3s cubic-bezier(.32,.8,.3,1) both;}
.g-sheet-tall{max-height:66vh;overflow-y:auto;}
@keyframes gslideup{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}
.g-handle{width:40px;height:4px;border-radius:999px;
  background:rgba(255,255,255,.18);margin:0 auto 20px;}
.g-shdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
.g-stitle{font-family:'Fraunces',serif;font-style:italic;font-size:22px;
  font-weight:600;margin:0;color:#f5f1ea;}
.g-xbtn{background:rgba(255,255,255,.08);border:none;border-radius:50%;
  width:32px;height:32px;display:grid;place-items:center;
  cursor:pointer;color:rgba(245,241,234,.7);}
.g-xbtn:hover{background:rgba(255,255,255,.14);}
.g-empty{text-align:center;padding:28px 0;font-size:14px;
  color:rgba(245,241,234,.42);line-height:1.6;margin:0;}

.g-favcard{background:rgba(255,255,255,.04);border-radius:14px;padding:13px 15px;
  border-left:4px solid;border-top:1px solid rgba(255,255,255,.07);
  border-right:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.07);}
.g-delbtn{margin-left:auto;background:none;border:none;cursor:pointer;
  color:rgba(245,241,234,.3);padding:2px;line-height:0;transition:color .14s;}
.g-delbtn:hover{color:#e11d48;}

.g-modebtn{flex:1;padding:12px;border-radius:12px;border:none;cursor:pointer;
  font-family:'Archivo',sans-serif;font-weight:600;font-size:14px;transition:all .16s ease;}
.g-nameinput{flex:1;background:rgba(255,255,255,.07);
  border:1.5px solid rgba(255,255,255,.12);border-radius:10px;
  padding:10px 14px;font-family:'Archivo',sans-serif;font-size:14px;
  color:#f5f1ea;outline:none;font-weight:500;}
.g-nameinput:focus{border-color:rgba(255,255,255,.35);}

.g-lbl{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:rgba(245,241,234,.48);margin-top:10px;}
.g-select{width:100%;appearance:none;background:rgba(255,255,255,.07);
  border:1.5px solid rgba(255,255,255,.12);border-radius:10px;
  padding:10px 36px 10px 14px;font-family:'Archivo',sans-serif;
  font-size:14px;color:#f5f1ea;outline:none;cursor:pointer;}
.g-textarea{background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);
  border-radius:10px;padding:12px 14px;font-family:'Fraunces',serif;
  font-size:16px;color:#f5f1ea;resize:none;outline:none;line-height:1.45;}
.g-textarea:focus{border-color:rgba(255,255,255,.32);}
.g-submit{display:flex;align-items:center;justify-content:center;gap:8px;
  margin-top:16px;padding:13px;border-radius:12px;border:none;cursor:pointer;
  background:#f5f1ea;color:#1a1622;font-family:'Archivo',sans-serif;
  font-weight:700;font-size:14px;transition:all .15s ease;
  box-shadow:0 8px 22px -8px rgba(245,241,234,.4);}
.g-submit:disabled{opacity:.35;cursor:not-allowed;box-shadow:none;}
.g-submit:not(:disabled):hover{transform:translateY(-1px);}

.g-timeropt{padding:14px 10px;border-radius:12px;border:none;cursor:pointer;
  font-family:'Archivo',sans-serif;font-weight:700;font-size:15px;transition:all .15s ease;}
`;
