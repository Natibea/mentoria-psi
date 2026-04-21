import { useState, useEffect, useRef } from "react";

const load = (k, fallback) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const todayStr = () => new Date().toISOString().split("T")[0];

const DEFAULT_CONFIG = { brandName: "Mentoria Psi", brandSub: "Alto Fluxo", accentColor: "#e2b96f", bgColor: "#12121f", logoUrl: null };
const DEFAULT_MENTEES = [{ id: 1, name: "Mentorado 1" }, { id: 2, name: "Mentorado 2" }, { id: 3, name: "Mentorado 3" }];
const THEMES = [
  { label: "Dourado", accent: "#e2b96f", bg: "#12121f" },
  { label: "Água", accent: "#7ec8c8", bg: "#0d1f2d" },
  { label: "Rosa", accent: "#e8a0bf", bg: "#1a0f1a" },
  { label: "Verde", accent: "#7ecba1", bg: "#0d1f18" },
  { label: "Coral", accent: "#f4836b", bg: "#1f0f0d" },
  { label: "Lilás", accent: "#b39ddb", bg: "#130f1f" },
];

export default function App() {
  const [config, setConfig] = useState(() => load("psi_cfg", DEFAULT_CONFIG));
  const [mentees, setMentees] = useState(() => load("psi_mentees", DEFAULT_MENTEES));
  const [taskData, setTaskData] = useState(() => load("psi_tasks", {}));
  const [role, setRole] = useState(null);
  const [menteeId, setMenteeId] = useState(null);
  const [view, setView] = useState("home");
  const [ready, setReady] = useState(false);
  const logoRef = useRef();

  useEffect(() => { setTimeout(() => setReady(true), 80); }, []);
  useEffect(() => { save("psi_cfg", config); }, [config]);
  useEffect(() => { save("psi_mentees", mentees); }, [mentees]);
  useEffect(() => { save("psi_tasks", taskData); }, [taskData]);

  const { accentColor: accent, bgColor: bg, brandName, brandSub, logoUrl } = config;
  const text = "#f0ece0";

  const dataKey = menteeId ? `m_${menteeId}` : "__none__";
  const getMetas = () => taskData[dataKey]?.metas || [];
  const getTarefas = () => taskData[dataKey]?.tarefas || [];
  const updField = (field, val) => setTaskData(p => ({ ...p, [dataKey]: { ...p[dataKey], [field]: val } }));

  const addMeta = (txt) => { if (txt.trim()) updField("metas", [...getMetas(), { id: Date.now(), text: txt.trim(), done: false, createdAt: todayStr(), doneAt: null }]); };
  const toggleMeta = (id) => updField("metas", getMetas().map(m => m.id === id ? { ...m, done: !m.done, doneAt: !m.done ? todayStr() : null } : m));
  const delMeta = (id) => updField("metas", getMetas().filter(m => m.id !== id));
  const addTarefa = (txt, date) => { if (txt.trim()) updField("tarefas", [...getTarefas(), { id: Date.now(), text: txt.trim(), date, done: false }]); };
  const toggleTarefa = (id) => updField("tarefas", getTarefas().map(t => t.id === id ? { ...t, done: !t.done } : t));
  const delTarefa = (id) => updField("tarefas", getTarefas().filter(t => t.id !== id));

  const addMentee = () => setMentees(p => [...p, { id: Date.now(), name: `Mentorado ${p.length + 1}` }]);
  const renameMentee = (id, name) => setMentees(p => p.map(m => m.id === id ? { ...m, name } : m));
  const delMentee = (id) => { setMentees(p => p.filter(m => m.id !== id)); if (menteeId === id) setMenteeId(null); };

  // styles factory
  const S = (extra = {}) => ({
    fontFamily: "'Palatino Linotype','Book Antiqua',Palatino,serif",
    color: text,
    ...extra,
  });

  const card = { background: `${accent}0d`, border: `1px solid ${accent}22`, borderRadius: 11, padding: "13px 14px", marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 11, cursor: "pointer" };
  const inp = { width: "100%", background: `${accent}0e`, border: `1px solid ${accent}28`, borderRadius: 8, padding: "11px 13px", color: text, fontSize: 14, fontFamily: "'Palatino Linotype',serif", outline: "none", boxSizing: "border-box", marginBottom: 8 };
  const primaryBtn = { background: accent, color: bg, border: "none", borderRadius: 8, padding: "11px 18px", fontSize: 13, fontWeight: "bold", cursor: "pointer", width: "100%", fontFamily: "'Palatino Linotype',serif", marginBottom: 8, letterSpacing: 0.6 };
  const ghostBtn = { background: "transparent", color: accent, border: `1px solid ${accent}38`, borderRadius: 8, padding: "11px 18px", fontSize: 13, cursor: "pointer", width: "100%", fontFamily: "'Palatino Linotype',serif", marginBottom: 8 };
  const secLabel = { fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: accent, opacity: 0.75, marginBottom: 12 };
  const circle = (done) => ({ width: 20, height: 20, minWidth: 20, borderRadius: "50%", border: `2px solid ${accent}`, background: done ? accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2, flexShrink: 0 });
  const empty = { textAlign: "center", opacity: 0.3, fontSize: 13, fontStyle: "italic", padding: "28px 0" };

  const navItems = [
    { id: "home", label: "Início" },
    { id: "metas", label: "Metas" },
    { id: "tarefas", label: "Tarefas" },
    { id: "historico", label: "Histórico" },
    ...(role === "mentor" ? [{ id: "config", label: "Config" }] : []),
  ];

  const MenteePicker = () => role !== "mentor" ? null : (
    <div style={{ marginBottom: 18 }}>
      <div style={secLabel}>Mentorado</div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        {mentees.map(m => (
          <button key={m.id} onClick={() => setMenteeId(m.id)} style={{
            background: menteeId === m.id ? accent : `${accent}12`, color: menteeId === m.id ? bg : text,
            border: "none", borderRadius: 20, padding: "7px 15px", fontSize: 13, cursor: "pointer",
            fontFamily: "'Palatino Linotype',serif", transition: "all 0.15s",
          }}>{m.name}</button>
        ))}
      </div>
    </div>
  );

  // LOGIN
  if (!role) {
    return (
      <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, fontFamily: "'Palatino Linotype',serif" }}>
        <div style={{ textAlign: "center", marginBottom: 44, opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(16px)", transition: "all 0.5s ease" }}>
          {logoUrl
            ? <img src={logoUrl} alt="logo" style={{ width: 68, height: 68, borderRadius: 12, objectFit: "cover", marginBottom: 16, border: `1px solid ${accent}40` }} />
            : <div style={{ fontSize: 44, marginBottom: 14 }}>🧠</div>}
          <div style={{ fontSize: 10, letterSpacing: 5, textTransform: "uppercase", color: accent, marginBottom: 8 }}>{brandName}</div>
          <h1 style={{ fontSize: 26, fontWeight: "normal", fontStyle: "italic", color: text, margin: "0 0 12px" }}>{brandSub}</h1>
          <div style={{ width: 36, height: 1, background: accent, margin: "0 auto", opacity: 0.4 }} />
        </div>
        <div style={{ width: "100%", maxWidth: 300 }}>
          <p style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: text, opacity: 0.4, marginBottom: 20 }}>Entrar como</p>
          <button onClick={() => { setRole("mentor"); setMenteeId(mentees[0]?.id || null); setView("home"); }} style={{ ...primaryBtn, marginBottom: 14 }}>🧭 Mentor</button>
          <div style={{ borderTop: `1px solid ${accent}20`, paddingTop: 14 }}>
            {mentees.map(m => (
              <button key={m.id} onClick={() => { setRole("mentorado"); setMenteeId(m.id); setView("home"); }} style={{ ...ghostBtn }}>
                🌱 {m.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // HOME
  const HomeView = () => {
    const metas = getMetas(); const tarefas = getTarefas();
    const done = metas.filter(m => m.done).length;
    const pct = metas.length ? Math.round((done / metas.length) * 100) : 0;
    const hoje = tarefas.filter(t => t.date === todayStr());
    const hojeDone = hoje.filter(t => t.done).length;
    return (
      <div>
        <MenteePicker />
        <div style={{ marginBottom: 20 }}>
          <div style={secLabel}>Progresso nas Metas</div>
          <div style={{ height: 5, background: `${accent}18`, borderRadius: 3, marginBottom: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: accent, borderRadius: 3, transition: "width 0.6s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.5 }}>
            <span>{done} de {metas.length} concluídas</span>
            <span style={{ color: accent }}>{pct}%</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          {[{ l: "Metas", t: metas.length, d: done }, { l: "Hoje", t: hoje.length, d: hojeDone }].map(s => (
            <div key={s.l} style={{ flex: 1, background: `${accent}0e`, borderRadius: 11, padding: "13px 14px", border: `1px solid ${accent}1a` }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: text, opacity: 0.45 }}>{s.l}</div>
              <div style={{ fontSize: 28, color: accent, margin: "4px 0 2px" }}>{s.d}</div>
              <div style={{ fontSize: 11, color: text, opacity: 0.4 }}>de {s.t}</div>
            </div>
          ))}
        </div>
        <div style={secLabel}>Tarefas de Hoje</div>
        {hoje.length === 0 ? <div style={empty}>Nenhuma tarefa para hoje</div> : hoje.map(t => (
          <div key={t.id} style={card} onClick={() => toggleTarefa(t.id)}>
            <div style={circle(t.done)}>{t.done && <span style={{ color: bg, fontSize: 10 }}>✓</span>}</div>
            <span style={{ flex: 1, fontSize: 14, lineHeight: 1.5, textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.4 : 1 }}>{t.text}</span>
          </div>
        ))}
      </div>
    );
  };

  // METAS
  const MetasView = () => {
    const [txt, setTxt] = useState("");
    const metas = getMetas();
    return (
      <div>
        <MenteePicker />
        <div style={secLabel}>Metas</div>
        {metas.length === 0 && <div style={empty}>Nenhuma meta cadastrada</div>}
        {metas.map(m => (
          <div key={m.id} style={card} onClick={() => toggleMeta(m.id)}>
            <div style={circle(m.done)}>{m.done && <span style={{ color: bg, fontSize: 10 }}>✓</span>}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, lineHeight: 1.5, textDecoration: m.done ? "line-through" : "none", opacity: m.done ? 0.4 : 1 }}>{m.text}</div>
              <div style={{ fontSize: 11, color: accent, opacity: 0.55, marginTop: 3 }}>{m.done ? `✓ ${m.doneAt}` : `Criada ${m.createdAt}`}</div>
            </div>
            <button style={{ background: "none", border: "none", color: accent, opacity: 0.35, cursor: "pointer", fontSize: 20, padding: "0 2px" }} onClick={e => { e.stopPropagation(); delMeta(m.id); }}>×</button>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${accent}18`, paddingTop: 18, marginTop: 12 }}>
          <div style={secLabel}>Nova Meta</div>
          <textarea value={txt} onChange={e => setTxt(e.target.value)} rows={3} placeholder="Descreva a meta..." style={{ ...inp, resize: "none" }} />
          <button onClick={() => { addMeta(txt); setTxt(""); }} style={primaryBtn}>+ Adicionar Meta</button>
        </div>
      </div>
    );
  };

  // TAREFAS
  const TarefasView = () => {
    const [txt, setTxt] = useState("");
    const [date, setDate] = useState(todayStr());
    const tarefas = getTarefas();
    const byDate = tarefas.reduce((a, t) => { (a[t.date] = a[t.date] || []).push(t); return a; }, {});
    const dates = Object.keys(byDate).sort().reverse();
    return (
      <div>
        <MenteePicker />
        <div style={secLabel}>Tarefas</div>
        {dates.length === 0 && <div style={empty}>Nenhuma tarefa cadastrada</div>}
        {dates.map(d => (
          <div key={d} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: accent, letterSpacing: 2, marginBottom: 7, opacity: 0.6 }}>{d === todayStr() ? "📅 Hoje" : d}</div>
            {byDate[d].map(t => (
              <div key={t.id} style={card} onClick={() => toggleTarefa(t.id)}>
                <div style={circle(t.done)}>{t.done && <span style={{ color: bg, fontSize: 10 }}>✓</span>}</div>
                <span style={{ flex: 1, fontSize: 14, textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.4 : 1 }}>{t.text}</span>
                <button style={{ background: "none", border: "none", color: accent, opacity: 0.35, cursor: "pointer", fontSize: 20 }} onClick={e => { e.stopPropagation(); delTarefa(t.id); }}>×</button>
              </div>
            ))}
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${accent}18`, paddingTop: 18, marginTop: 8 }}>
          <div style={secLabel}>Nova Tarefa</div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} />
          <input value={txt} onChange={e => setTxt(e.target.value)} placeholder="Descreva a tarefa..." style={inp} onKeyDown={e => e.key === "Enter" && (addTarefa(txt, date), setTxt(""))} />
          <button onClick={() => { addTarefa(txt, date); setTxt(""); }} style={primaryBtn}>+ Adicionar Tarefa</button>
        </div>
      </div>
    );
  };

  // HISTÓRICO
  const HistoricoView = () => {
    const metas = getMetas(); const tarefas = getTarefas();
    const md = metas.filter(m => m.done); const td = tarefas.filter(t => t.done);
    return (
      <div>
        <MenteePicker />
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          {[{ l: "Metas", total: metas.length, done: md.length }, { l: "Tarefas", total: tarefas.length, done: td.length }].map(s => (
            <div key={s.l} style={{ flex: 1, background: `${accent}0e`, borderRadius: 11, padding: "13px 14px", border: `1px solid ${accent}1a` }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: text, opacity: 0.45 }}>{s.l}</div>
              <div style={{ fontSize: 28, color: accent, margin: "4px 0 2px" }}>{s.done}</div>
              <div style={{ fontSize: 11, color: text, opacity: 0.4 }}>de {s.total}</div>
            </div>
          ))}
        </div>
        {md.length === 0 && td.length === 0 && <div style={empty}>Nenhum item concluído ainda</div>}
        {md.length > 0 && <><div style={secLabel}>Metas Concluídas</div>{md.map(m => (
          <div key={m.id} style={{ ...card, opacity: 0.65 }}>
            <div style={circle(true)}><span style={{ color: bg, fontSize: 10 }}>✓</span></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, textDecoration: "line-through", opacity: 0.5 }}>{m.text}</div>
              <div style={{ fontSize: 11, color: accent, opacity: 0.5, marginTop: 3 }}>Concluída em {m.doneAt}</div>
            </div>
          </div>
        ))}</>}
        {td.length > 0 && <><div style={{ ...secLabel, marginTop: 16 }}>Tarefas Concluídas</div>{td.map(t => (
          <div key={t.id} style={{ ...card, opacity: 0.65 }}>
            <div style={circle(true)}><span style={{ color: bg, fontSize: 10 }}>✓</span></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, textDecoration: "line-through", opacity: 0.5 }}>{t.text}</div>
              <div style={{ fontSize: 11, color: accent, opacity: 0.5, marginTop: 3 }}>{t.date}</div>
            </div>
          </div>
        ))}</>}
      </div>
    );
  };

  // CONFIG
  const ConfigView = () => {
    const [lc, setLc] = useState({ ...config });
    const lRef = useRef();
    return (
      <div>
        {/* IDENTIDADE */}
        <div style={secLabel}>Identidade Visual</div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: text, opacity: 0.5, marginBottom: 8 }}>Logo</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {lc.logoUrl
              ? <img src={lc.logoUrl} alt="logo" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", border: `1px solid ${accent}40` }} />
              : <div style={{ width: 52, height: 52, borderRadius: 10, background: `${accent}18`, border: `1px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🧠</div>}
            <div>
              <input ref={lRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                const file = e.target.files[0]; if (!file) return;
                const r = new FileReader(); r.onload = ev => setLc(p => ({ ...p, logoUrl: ev.target.result })); r.readAsDataURL(file);
              }} />
              <button onClick={() => lRef.current.click()} style={{ ...ghostBtn, width: "auto", padding: "7px 14px", marginBottom: 0 }}>📁 Escolher imagem</button>
              {lc.logoUrl && <button onClick={() => setLc(p => ({ ...p, logoUrl: null }))} style={{ background: "none", border: "none", color: accent, opacity: 0.5, cursor: "pointer", fontSize: 12, marginLeft: 10 }}>remover</button>}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: text, opacity: 0.5, marginBottom: 5 }}>Nome principal</div>
        <input value={lc.brandName} onChange={e => setLc(p => ({ ...p, brandName: e.target.value }))} style={inp} />
        <div style={{ fontSize: 12, color: text, opacity: 0.5, marginBottom: 5 }}>Subtítulo</div>
        <input value={lc.brandSub} onChange={e => setLc(p => ({ ...p, brandSub: e.target.value }))} style={inp} />

        <div style={{ fontSize: 12, color: text, opacity: 0.5, marginBottom: 10, marginTop: 4 }}>Temas prontos</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          {THEMES.map(t => (
            <div key={t.label} onClick={() => setLc(p => ({ ...p, accentColor: t.accent, bgColor: t.bg }))}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: t.accent, border: lc.accentColor === t.accent ? `3px solid ${text}` : "3px solid transparent", transition: "border 0.15s" }} />
              <span style={{ fontSize: 9, color: text, opacity: 0.45 }}>{t.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: text, opacity: 0.45, marginBottom: 6 }}>Cor destaque</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="color" value={lc.accentColor} onChange={e => setLc(p => ({ ...p, accentColor: e.target.value }))}
                style={{ width: 38, height: 38, border: "none", borderRadius: 6, cursor: "pointer", padding: 0 }} />
              <span style={{ fontSize: 11, color: text, opacity: 0.45 }}>{lc.accentColor}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: text, opacity: 0.45, marginBottom: 6 }}>Cor de fundo</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="color" value={lc.bgColor} onChange={e => setLc(p => ({ ...p, bgColor: e.target.value }))}
                style={{ width: 38, height: 38, border: "none", borderRadius: 6, cursor: "pointer", padding: 0 }} />
              <span style={{ fontSize: 11, color: text, opacity: 0.45 }}>{lc.bgColor}</span>
            </div>
          </div>
        </div>

        <button onClick={() => setConfig({ ...lc })} style={primaryBtn}>✓ Salvar Aparência</button>

        {/* MENTORADOS */}
        <div style={{ borderTop: `1px solid ${accent}18`, paddingTop: 20, marginTop: 8 }}>
          <div style={secLabel}>Mentorados</div>
          {mentees.map(m => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <input value={m.name} onChange={e => renameMentee(m.id, e.target.value)}
                style={{ ...inp, marginBottom: 0, flex: 1 }} placeholder="Nome do mentorado" />
              <button onClick={() => delMentee(m.id)} style={{ background: "none", border: "none", color: accent, opacity: 0.4, cursor: "pointer", fontSize: 22, padding: "0 4px", flexShrink: 0 }}>×</button>
            </div>
          ))}
          <button onClick={addMentee} style={ghostBtn}>+ Adicionar Mentorado</button>
        </div>

        {/* DADOS */}
        <div style={{ borderTop: `1px solid ${accent}18`, paddingTop: 16, marginTop: 8 }}>
          <div style={secLabel}>Dados</div>
          <button onClick={() => { if (window.confirm("Apagar TODOS os dados? Isso não pode ser desfeito.")) { setTaskData({}); } }}
            style={{ ...ghostBtn, color: "#f4836b", borderColor: "#f4836b40" }}>
            🗑 Apagar todos os dados
          </button>
        </div>
      </div>
    );
  };

  const titles = { home: "Painel", metas: "Metas", tarefas: "Tarefas", historico: "Histórico", config: "Configurações" };

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "'Palatino Linotype','Book Antiqua',Palatino,serif", display: "flex", flexDirection: "column", maxWidth: 500, margin: "0 auto" }}>
      {/* HEADER */}
      <div style={{ padding: "20px 20px 14px", borderBottom: `1px solid ${accent}22`, display: "flex", alignItems: "center", gap: 12 }}>
        {logoUrl
          ? <img src={logoUrl} alt="logo" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: `1px solid ${accent}38`, flexShrink: 0 }} />
          : <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}18`, border: `1px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🧠</div>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: accent, opacity: 0.75 }}>{brandName}</div>
          <h1 style={{ fontSize: 18, fontWeight: "normal", fontStyle: "italic", margin: 0, lineHeight: 1.2 }}>{titles[view]}</h1>
        </div>
        <button onClick={() => { setRole(null); setMenteeId(null); }} style={{ background: "none", border: `1px solid ${accent}28`, color: accent, borderRadius: 6, padding: "5px 11px", fontSize: 11, cursor: "pointer", opacity: 0.7 }}>Sair</button>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 12px" }}>
        {view === "home" && <HomeView />}
        {view === "metas" && <MetasView />}
        {view === "tarefas" && <TarefasView />}
        {view === "historico" && <HistoricoView />}
        {view === "config" && <ConfigView />}
        <div style={{ height: 12 }} />
      </div>

      {/* NAV */}
      <div style={{ display: "flex", gap: 5, padding: "10px 14px 20px", borderTop: `1px solid ${accent}18` }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} style={{
            flex: 1, background: view === n.id ? accent : `${accent}10`,
            color: view === n.id ? bg : text, border: "none", borderRadius: 7,
            padding: "9px 2px", fontSize: 10, letterSpacing: 0.7, textTransform: "uppercase",
            cursor: "pointer", fontFamily: "'Palatino Linotype',serif",
            fontWeight: view === n.id ? "bold" : "normal", opacity: view === n.id ? 1 : 0.7,
          }}>{n.label}</button>
        ))}
      </div>
    </div>
  );
}
