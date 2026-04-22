import { useState, useEffect, useRef, useCallback, memo } from "react";

const SUPABASE_URL = "https://oeentaqyqzulymbannrd.supabase.co";
const SUPABASE_KEY = "sb_publishable_trJSD67DmaZ394X98wBNeg_-nFBdiRR";

const sbFetch = async (id) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/dados?id=eq.${encodeURIComponent(id)}&select=valor`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  const data = await res.json();
  return data?.[0]?.valor ?? null;
};

const sbSave = async (id, valor) => {
  await fetch(`${SUPABASE_URL}/rest/v1/dados`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ id, valor })
  });
};

const todayStr = () => new Date().toISOString().split("T")[0];
const DEFAULT_CONFIG = { brandName: "Mentoria Psi", brandSub: "Alto Fluxo", accentColor: "#e2b96f", bgColor: "#12121f", logoUrl: null };
const DEFAULT_MENTEES = [{ id: 1, name: "Mentorado 1", slug: "mentorado-1" }, { id: 2, name: "Mentorado 2", slug: "mentorado-2" }, { id: 3, name: "Mentorado 3", slug: "mentorado-3" }];
const THEMES = [
  { label: "Dourado", accent: "#e2b96f", bg: "#12121f" },
  { label: "Água", accent: "#7ec8c8", bg: "#0d1f2d" },
  { label: "Rosa", accent: "#e8a0bf", bg: "#1a0f1a" },
  { label: "Verde", accent: "#7ecba1", bg: "#0d1f18" },
  { label: "Coral", accent: "#f4836b", bg: "#1f0f0d" },
  { label: "Lilás", accent: "#b39ddb", bg: "#130f1f" },
];

const toSlug = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

function EditableText({ value, onSave, style, multiline }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value), [value]);
  const commit = () => { if (val.trim()) onSave(val.trim()); setEditing(false); };
  if (editing) {
    if (multiline) return <textarea value={val} onChange={e => setVal(e.target.value)} onBlur={commit} onKeyDown={e => e.key === "Escape" && setEditing(false)} autoFocus rows={3} style={{ ...style, resize: "none", width: "100%" }} />;
    return <input value={val} onChange={e => setVal(e.target.value)} onBlur={commit} onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }} autoFocus style={{ ...style, width: "100%" }} />;
  }
  return (
    <span style={{ display: "flex", alignItems: "flex-start", gap: 6, flex: 1 }}>
      <span style={{ flex: 1 }}>{value}</span>
      <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.35, fontSize: 13, padding: "0 2px", flexShrink: 0, lineHeight: 1 }}>✏️</button>
    </span>
  );
}

function LocalInput({ onCommit, placeholder, style, multiline, rows }) {
  const [val, setVal] = useState("");
  const handleKey = (e) => { if (e.key === "Enter" && !multiline) { e.preventDefault(); if (val.trim()) { onCommit(val); setVal(""); } } };
  const handleBlur = () => { if (val.trim()) { onCommit(val); setVal(""); } };
  if (multiline) return <textarea value={val} onChange={e => setVal(e.target.value)} onBlur={handleBlur} placeholder={placeholder} rows={rows || 3} style={{ ...style, resize: "none" }} />;
  return <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={handleKey} onBlur={handleBlur} placeholder={placeholder} style={style} />;
}

function RenameInput({ initial, onSave, style }) {
  const [val, setVal] = useState(initial);
  useEffect(() => setVal(initial), [initial]);
  return <input value={val} onChange={e => setVal(e.target.value)} onBlur={() => onSave(val)} onKeyDown={e => e.key === "Enter" && onSave(val)} style={style} />;
}

const TarefaCard = memo(({ t, expanded, onToggleExpand, accent, bg, text, today, onToggle, onDelete, onEdit, onEditTitulo, onAddAcao, onToggleAcao, onDelAcao, onEditAcao }) => {
  const acoes = t.acoes || [];
  const acoesFeitas = acoes.filter(a => a.done).length;
  const inpStyle = { width: "100%", background: `${accent}0e`, border: `1px solid ${accent}28`, borderRadius: 8, padding: "8px 12px", color: text, fontSize: 13, fontFamily: "'Palatino Linotype',serif", outline: "none", boxSizing: "border-box" };
  const mkCircle = (done, sq) => ({ width: sq ? 16 : 20, height: sq ? 16 : 20, minWidth: sq ? 16 : 20, borderRadius: sq ? 4 : "50%", border: `2px solid ${accent}`, background: done ? accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" });

  return (
    <div style={{ background: `${accent}0d`, border: `1px solid ${accent}22`, borderRadius: 11, padding: "13px 14px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
        <div style={mkCircle(t.done, false)} onClick={() => onToggle(t.id)}>
          {t.done && <span style={{ color: bg, fontSize: 10 }}>✓</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ flex: 1, fontSize: 14, fontWeight: "bold", lineHeight: 1.4, textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.4 : 1 }}>
              <EditableText value={t.titulo} onSave={(v) => onEditTitulo(t.id, v)} style={{ background: `${accent}0e`, border: `1px solid ${accent}28`, borderRadius: 6, padding: "4px 8px", color: text, fontSize: 14, fontFamily: "'Palatino Linotype',serif", outline: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
              {acoes.length > 0 && <span style={{ fontSize: 11, color: accent, opacity: 0.65 }}>{acoesFeitas}/{acoes.length}</span>}
              <button onClick={() => onToggleExpand(t.id)} style={{ background: "none", border: "none", color: accent, cursor: "pointer", fontSize: 14, opacity: 0.6, padding: "0 2px" }}>{expanded ? "▲" : "▼"}</button>
              <button onClick={() => onDelete(t.id)} style={{ background: "none", border: "none", color: accent, opacity: 0.3, cursor: "pointer", fontSize: 20, padding: "0 2px", lineHeight: 1 }}>×</button>
            </div>
          </div>
          <div style={{ fontSize: 11, color: accent, opacity: 0.5, marginTop: 2 }}>{t.date === today ? "📅 Hoje" : t.date}</div>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${accent}18` }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: accent, opacity: 0.6, marginBottom: 8 }}>Ações</div>
          {acoes.length === 0 && <div style={{ fontSize: 12, opacity: 0.3, fontStyle: "italic", marginBottom: 8 }}>Nenhuma ação ainda</div>}
          {acoes.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <div style={mkCircle(a.done, true)} onClick={() => onToggleAcao(t.id, a.id)}>
                {a.done && <span style={{ color: bg, fontSize: 9 }}>✓</span>}
              </div>
              <span style={{ flex: 1, fontSize: 13, textDecoration: a.done ? "line-through" : "none", opacity: a.done ? 0.4 : 0.9, color: text }}>
                <EditableText value={a.text} onSave={(v) => onEditAcao(t.id, a.id, v)} style={{ background: `${accent}0e`, border: `1px solid ${accent}28`, borderRadius: 6, padding: "3px 8px", color: text, fontSize: 13, fontFamily: "'Palatino Linotype',serif", outline: "none" }} />
              </span>
              <button onClick={() => onDelAcao(t.id, a.id)} style={{ background: "none", border: "none", color: accent, opacity: 0.3, cursor: "pointer", fontSize: 17, lineHeight: 1 }}>×</button>
            </div>
          ))}
          <div style={{ marginTop: 8 }}>
            <LocalInput onCommit={(txt) => onAddAcao(t.id, txt)} placeholder="Nova ação... (Enter para salvar)" style={inpStyle} />
          </div>
        </div>
      )}
    </div>
  );
});

export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [mentees, setMentees] = useState(DEFAULT_MENTEES);
  const [taskData, setTaskData] = useState({});
  const [role, setRole] = useState(null);
  const [menteeId, setMenteeId] = useState(null);
  const [view, setView] = useState("home");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
  const saveTimer = useRef({});
  const logoRef = useRef();

  // Detect slug in URL for direct mentee access
  useEffect(() => {
    const path = window.location.pathname.replace("/", "").toLowerCase();
    if (path && path !== "") {
      const loadAll = async () => {
        const [cfg, men, tasks] = await Promise.all([sbFetch("config"), sbFetch("mentees"), sbFetch("tasks")]);
        const resolvedMentees = men || DEFAULT_MENTEES;
        if (cfg) setConfig(cfg);
        setMentees(resolvedMentees);
        if (tasks) setTaskData(tasks);
        const found = resolvedMentees.find(m => (m.slug || toSlug(m.name)) === path);
        if (found) { setRole("mentorado"); setMenteeId(found.id); }
        setLoading(false);
        setTimeout(() => setReady(true), 80);
      };
      loadAll();
    } else {
      const loadAll = async () => {
        const [cfg, men, tasks] = await Promise.all([sbFetch("config"), sbFetch("mentees"), sbFetch("tasks")]);
        if (cfg) setConfig(cfg);
        if (men) setMentees(men);
        if (tasks) setTaskData(tasks);
        setLoading(false);
        setTimeout(() => setReady(true), 80);
      };
      loadAll();
    }
  }, []);

  const debounceSave = useCallback((key, val, delay = 2000) => {
    if (saveTimer.current[key]) clearTimeout(saveTimer.current[key]);
    saveTimer.current[key] = setTimeout(() => sbSave(key, val), delay);
  }, []);

  useEffect(() => { if (!loading) debounceSave("config", config); }, [config, loading]);
  useEffect(() => { if (!loading) debounceSave("mentees", mentees); }, [mentees, loading]);
  useEffect(() => { if (!loading) debounceSave("tasks", taskData); }, [taskData, loading]);

  const toggleExpand = useCallback((id) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] })), []);

  const { accentColor: accent, bgColor: bg, brandName, brandSub, logoUrl } = config;
  const text = "#f0ece0";
  const today = todayStr();

  const dataKey = menteeId ? `m_${menteeId}` : "__none__";
  const getMetas = useCallback(() => taskData[dataKey]?.metas || [], [taskData, dataKey]);
  const getTarefas = useCallback(() => taskData[dataKey]?.tarefas || [], [taskData, dataKey]);
  const updField = useCallback((field, val) => setTaskData(p => ({ ...p, [dataKey]: { ...p[dataKey], [field]: val } })), [dataKey]);

  const addMeta = useCallback((txt) => { if (txt.trim()) updField("metas", [...getMetas(), { id: Date.now(), text: txt.trim(), done: false, createdAt: today, doneAt: null }]); }, [getMetas, updField, today]);
  const toggleMeta = useCallback((id) => updField("metas", getMetas().map(m => m.id === id ? { ...m, done: !m.done, doneAt: !m.done ? today : null } : m)), [getMetas, updField, today]);
  const delMeta = useCallback((id) => updField("metas", getMetas().filter(m => m.id !== id)), [getMetas, updField]);
  const editMeta = useCallback((id, text) => updField("metas", getMetas().map(m => m.id === id ? { ...m, text } : m)), [getMetas, updField]);

  const addTarefa = useCallback((titulo, date) => { if (titulo.trim()) updField("tarefas", [...getTarefas(), { id: Date.now(), titulo: titulo.trim(), date, acoes: [], done: false }]); }, [getTarefas, updField]);
  const toggleTarefa = useCallback((id) => updField("tarefas", getTarefas().map(t => t.id === id ? { ...t, done: !t.done } : t)), [getTarefas, updField]);
  const delTarefa = useCallback((id) => updField("tarefas", getTarefas().filter(t => t.id !== id)), [getTarefas, updField]);
  const editTitulo = useCallback((id, titulo) => updField("tarefas", getTarefas().map(t => t.id === id ? { ...t, titulo } : t)), [getTarefas, updField]);
  const addAcao = useCallback((tarefaId, txt) => { if (!txt.trim()) return; updField("tarefas", getTarefas().map(t => t.id === tarefaId ? { ...t, acoes: [...(t.acoes || []), { id: Date.now(), text: txt.trim(), done: false }] } : t)); }, [getTarefas, updField]);
  const toggleAcao = useCallback((tarefaId, acaoId) => updField("tarefas", getTarefas().map(t => t.id === tarefaId ? { ...t, acoes: (t.acoes || []).map(a => a.id === acaoId ? { ...a, done: !a.done } : a) } : t)), [getTarefas, updField]);
  const delAcao = useCallback((tarefaId, acaoId) => updField("tarefas", getTarefas().map(t => t.id === tarefaId ? { ...t, acoes: (t.acoes || []).filter(a => a.id !== acaoId) } : t)), [getTarefas, updField]);
  const editAcao = useCallback((tarefaId, acaoId, text) => updField("tarefas", getTarefas().map(t => t.id === tarefaId ? { ...t, acoes: (t.acoes || []).map(a => a.id === acaoId ? { ...a, text } : a) } : t)), [getTarefas, updField]);

  const addMentee = () => { const name = `Mentorado ${mentees.length + 1}`; setMentees(p => [...p, { id: Date.now(), name, slug: toSlug(name) }]); };
  const renameMentee = (id, name) => setMentees(p => p.map(m => m.id === id ? { ...m, name, slug: toSlug(name) } : m));
  const delMentee = (id) => { setMentees(p => p.filter(m => m.id !== id)); if (menteeId === id) setMenteeId(null); };

  const inp = { width: "100%", background: `${accent}0e`, border: `1px solid ${accent}28`, borderRadius: 8, padding: "11px 13px", color: text, fontSize: 14, fontFamily: "'Palatino Linotype',serif", outline: "none", boxSizing: "border-box", marginBottom: 8 };
  const primaryBtn = { background: accent, color: bg, border: "none", borderRadius: 8, padding: "11px 18px", fontSize: 13, fontWeight: "bold", cursor: "pointer", width: "100%", fontFamily: "'Palatino Linotype',serif", marginBottom: 8, letterSpacing: 0.6 };
  const ghostBtn = { background: "transparent", color: accent, border: `1px solid ${accent}38`, borderRadius: 8, padding: "11px 18px", fontSize: 13, cursor: "pointer", width: "100%", fontFamily: "'Palatino Linotype',serif", marginBottom: 8 };
  const secLabel = { fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: accent, opacity: 0.75, marginBottom: 12 };
  const mkCircle = (done) => ({ width: 20, height: 20, minWidth: 20, borderRadius: "50%", border: `2px solid ${accent}`, background: done ? accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2, flexShrink: 0 });
  const empty = { textAlign: "center", opacity: 0.3, fontSize: 13, fontStyle: "italic", padding: "28px 0" };
  const flatCard = { background: `${accent}0d`, border: `1px solid ${accent}22`, borderRadius: 11, padding: "13px 14px", marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 11 };

  const cardProps = { accent, bg, text, today, onToggle: toggleTarefa, onDelete: delTarefa, onEditTitulo: editTitulo, onAddAcao: addAcao, onToggleAcao: toggleAcao, onDelAcao: delAcao, onEditAcao: editAcao, onToggleExpand: toggleExpand };

  const baseUrl = window.location.origin;

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

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#12121f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Palatino Linotype',serif", color: "#f0ece0" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>🧠</div>
        <div style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: "#e2b96f", opacity: 0.7 }}>Carregando...</div>
      </div>
    </div>
  );

  if (!role) return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, fontFamily: "'Palatino Linotype',serif" }}>
      <div style={{ textAlign: "center", marginBottom: 44, opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(16px)", transition: "all 0.5s ease" }}>
        {logoUrl ? <img src={logoUrl} alt="logo" style={{ width: 68, height: 68, borderRadius: 12, objectFit: "cover", marginBottom: 16 }} /> : <div style={{ fontSize: 44, marginBottom: 14 }}>🧠</div>}
        <div style={{ fontSize: 10, letterSpacing: 5, textTransform: "uppercase", color: accent, marginBottom: 8 }}>{brandName}</div>
        <h1 style={{ fontSize: 26, fontWeight: "normal", fontStyle: "italic", color: text, margin: "0 0 12px" }}>{brandSub}</h1>
        <div style={{ width: 36, height: 1, background: accent, margin: "0 auto", opacity: 0.4 }} />
      </div>
      <div style={{ width: "100%", maxWidth: 300 }}>
        <p style={{ textAlign: "center", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: text, opacity: 0.4, marginBottom: 20 }}>Entrar como</p>
        <button onClick={() => { setRole("mentor"); setMenteeId(mentees[0]?.id || null); setView("home"); }} style={{ ...primaryBtn, marginBottom: 14 }}>🧭 Mentor</button>
        <div style={{ borderTop: `1px solid ${accent}20`, paddingTop: 14 }}>
          {mentees.map(m => (
            <button key={m.id} onClick={() => { setRole("mentorado"); setMenteeId(m.id); setView("home"); }} style={{ ...ghostBtn }}>🌱 {m.name}</button>
          ))}
        </div>
      </div>
    </div>
  );

  const HomeView = () => {
    const metas = getMetas(); const tarefas = getTarefas();
    const done = metas.filter(m => m.done).length;
    const pct = metas.length ? Math.round((done / metas.length) * 100) : 0;
    const hoje = tarefas.filter(t => t.date === today);
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
          <TarefaCard key={t.id} t={t} expanded={!!expandedCards[t.id]} {...cardProps} />
        ))}
      </div>
    );
  };

  const MetasView = () => {
    const metas = getMetas();
    return (
      <div>
        <MenteePicker />
        <div style={secLabel}>Metas</div>
        {metas.length === 0 && <div style={empty}>Nenhuma meta cadastrada</div>}
        {metas.map(m => (
          <div key={m.id} style={flatCard}>
            <div style={{ ...mkCircle(m.done), cursor: "pointer" }} onClick={() => toggleMeta(m.id)}>{m.done && <span style={{ color: bg, fontSize: 10 }}>✓</span>}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, lineHeight: 1.5, textDecoration: m.done ? "line-through" : "none", opacity: m.done ? 0.4 : 1 }}>
                <EditableText value={m.text} onSave={(v) => editMeta(m.id, v)} style={{ background: `${accent}0e`, border: `1px solid ${accent}28`, borderRadius: 6, padding: "4px 8px", color: text, fontSize: 14, fontFamily: "'Palatino Linotype',serif", outline: "none" }} multiline />
              </div>
              <div style={{ fontSize: 11, color: accent, opacity: 0.55, marginTop: 3 }}>{m.done ? `✓ ${m.doneAt}` : `Criada ${m.createdAt}`}</div>
            </div>
            <button style={{ background: "none", border: "none", color: accent, opacity: 0.35, cursor: "pointer", fontSize: 20, padding: "0 2px", flexShrink: 0 }} onClick={() => delMeta(m.id)}>×</button>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${accent}18`, paddingTop: 18, marginTop: 12 }}>
          <div style={secLabel}>Nova Meta</div>
          <LocalInput onCommit={addMeta} placeholder="Descreva a meta e pressione Enter..." style={inp} multiline rows={3} />
        </div>
      </div>
    );
  };

  const TarefasView = () => {
    const [taskDate, setTaskDate] = useState(today);
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
            <div style={{ fontSize: 11, color: accent, letterSpacing: 2, marginBottom: 7, opacity: 0.6 }}>{d === today ? "📅 Hoje" : d}</div>
            {byDate[d].map(t => <TarefaCard key={t.id} t={t} expanded={!!expandedCards[t.id]} {...cardProps} />)}
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${accent}18`, paddingTop: 18, marginTop: 8 }}>
          <div style={secLabel}>Nova Tarefa</div>
          <input type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)} style={inp} />
          <LocalInput onCommit={(txt) => addTarefa(txt, taskDate)} placeholder="Título da tarefa... (Enter para salvar)" style={inp} />
          <div style={{ fontSize: 11, opacity: 0.4, fontStyle: "italic", marginTop: -4 }}>Abra com ▼ para adicionar ações.</div>
        </div>
      </div>
    );
  };

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
          <div key={m.id} style={{ ...flatCard, opacity: 0.65 }}>
            <div style={mkCircle(true)}><span style={{ color: bg, fontSize: 10 }}>✓</span></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, textDecoration: "line-through", opacity: 0.5 }}>{m.text}</div>
              <div style={{ fontSize: 11, color: accent, opacity: 0.5, marginTop: 3 }}>Concluída em {m.doneAt}</div>
            </div>
          </div>
        ))}</>}
        {td.length > 0 && <><div style={{ ...secLabel, marginTop: 16 }}>Tarefas Concluídas</div>{td.map(t => (
          <div key={t.id} style={{ ...flatCard, opacity: 0.65 }}>
            <div style={mkCircle(true)}><span style={{ color: bg, fontSize: 10 }}>✓</span></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, textDecoration: "line-through", opacity: 0.5 }}>{t.titulo}</div>
              <div style={{ fontSize: 11, color: accent, opacity: 0.5, marginTop: 3 }}>{t.date}</div>
            </div>
          </div>
        ))}</>}
      </div>
    );
  };

  const ConfigView = () => {
    const [lc, setLc] = useState({ ...config });
    const lRef = useRef();
    return (
      <div>
        <div style={secLabel}>Identidade Visual</div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: text, opacity: 0.5, marginBottom: 8 }}>Logo</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {lc.logoUrl ? <img src={lc.logoUrl} alt="logo" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover" }} /> : <div style={{ width: 52, height: 52, borderRadius: 10, background: `${accent}18`, border: `1px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🧠</div>}
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
        <RenameInput initial={lc.brandName} onSave={v => setLc(p => ({ ...p, brandName: v }))} style={inp} />
        <div style={{ fontSize: 12, color: text, opacity: 0.5, marginBottom: 5 }}>Subtítulo</div>
        <RenameInput initial={lc.brandSub} onSave={v => setLc(p => ({ ...p, brandSub: v }))} style={inp} />
        <div style={{ fontSize: 12, color: text, opacity: 0.5, marginBottom: 10, marginTop: 4 }}>Temas prontos</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          {THEMES.map(t => (
            <div key={t.label} onClick={() => setLc(p => ({ ...p, accentColor: t.accent, bgColor: t.bg }))}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: t.accent, border: lc.accentColor === t.accent ? `3px solid ${text}` : "3px solid transparent" }} />
              <span style={{ fontSize: 9, color: text, opacity: 0.45 }}>{t.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: text, opacity: 0.45, marginBottom: 6 }}>Cor destaque</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="color" value={lc.accentColor} onChange={e => setLc(p => ({ ...p, accentColor: e.target.value }))} style={{ width: 38, height: 38, border: "none", borderRadius: 6, cursor: "pointer", padding: 0 }} />
              <span style={{ fontSize: 11, color: text, opacity: 0.45 }}>{lc.accentColor}</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: text, opacity: 0.45, marginBottom: 6 }}>Cor de fundo</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="color" value={lc.bgColor} onChange={e => setLc(p => ({ ...p, bgColor: e.target.value }))} style={{ width: 38, height: 38, border: "none", borderRadius: 6, cursor: "pointer", padding: 0 }} />
              <span style={{ fontSize: 11, color: text, opacity: 0.45 }}>{lc.bgColor}</span>
            </div>
          </div>
        </div>
        <button onClick={() => setConfig({ ...lc })} style={primaryBtn}>✓ Salvar Aparência</button>

        <div style={{ borderTop: `1px solid ${accent}18`, paddingTop: 20, marginTop: 8 }}>
          <div style={secLabel}>Mentorados & Links</div>
          {mentees.map(m => (
            <div key={m.id} style={{ marginBottom: 14, background: `${accent}08`, borderRadius: 10, padding: "12px 14px", border: `1px solid ${accent}18` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <RenameInput initial={m.name} onSave={name => renameMentee(m.id, name)} style={{ ...inp, marginBottom: 0, flex: 1 }} />
                <button onClick={() => delMentee(m.id)} style={{ background: "none", border: "none", color: accent, opacity: 0.4, cursor: "pointer", fontSize: 22, padding: "0 4px", flexShrink: 0 }}>×</button>
              </div>
              <div style={{ fontSize: 11, color: accent, opacity: 0.6, marginBottom: 4 }}>Link de acesso:</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 12, color: text, opacity: 0.7, background: `${accent}10`, padding: "6px 10px", borderRadius: 6, flex: 1, wordBreak: "break-all" }}>
                  {baseUrl}/{m.slug || toSlug(m.name)}
                </div>
                <button onClick={() => navigator.clipboard.writeText(`${baseUrl}/${m.slug || toSlug(m.name)}`)}
                  style={{ background: accent, color: bg, border: "none", borderRadius: 6, padding: "6px 10px", fontSize: 11, cursor: "pointer", flexShrink: 0 }}>
                  Copiar
                </button>
              </div>
            </div>
          ))}
          <button onClick={addMentee} style={ghostBtn}>+ Adicionar Mentorado</button>
        </div>

        <div style={{ borderTop: `1px solid ${accent}18`, paddingTop: 16, marginTop: 8 }}>
          <div style={secLabel}>Dados</div>
          <button onClick={() => { if (window.confirm("Apagar TODOS os dados?")) { setTaskData({}); } }} style={{ ...ghostBtn, color: "#f4836b", borderColor: "#f4836b40" }}>🗑 Apagar todos os dados</button>
        </div>
      </div>
    );
  };

  const titles = { home: "Painel", metas: "Metas", tarefas: "Tarefas", historico: "Histórico", config: "Configurações" };

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "'Palatino Linotype','Book Antiqua',Palatino,serif", display: "flex", flexDirection: "column", maxWidth: 500, margin: "0 auto" }}>
      <div style={{ padding: "20px 20px 14px", borderBottom: `1px solid ${accent}22`, display: "flex", alignItems: "center", gap: 12 }}>
        {logoUrl ? <img src={logoUrl} alt="logo" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} /> : <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}18`, border: `1px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🧠</div>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: accent, opacity: 0.75 }}>{brandName}</div>
          <h1 style={{ fontSize: 18, fontWeight: "normal", fontStyle: "italic", margin: 0, lineHeight: 1.2 }}>{titles[view]}</h1>
        </div>
        <button onClick={() => {
          if (role === "mentorado") {
            // Mentorada volta para a própria tela de login (reload do link dela)
            window.location.reload();
          } else {
            setRole(null); setMenteeId(null); window.history.pushState({}, "", "/");
          }
        }} style={{ background: "none", border: `1px solid ${accent}28`, color: accent, borderRadius: 6, padding: "5px 11px", fontSize: 11, cursor: "pointer", opacity: 0.7 }}>Sair</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 12px" }}>
        {view === "home" && <HomeView />}
        {view === "metas" && <MetasView />}
        {view === "tarefas" && <TarefasView />}
        {view === "historico" && <HistoricoView />}
        {view === "config" && <ConfigView />}
        <div style={{ height: 12 }} />
      </div>
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
