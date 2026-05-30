
import { useState, useEffect, useCallback } from "react";

/* ── PALETA ─────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Jost:wght@200;300;400;500&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  :root {
    --v:#7D2438; --r:#A04060; --d:#B8923A; --dc:#D4B06A;
    --nu:#F7EEE6; --nm:#EDD9C8; --cr:#FBF6F0;
    --te:#3D1F2A; --tl:#7A4F5A;
    --dark:#1A0C12; --dark2:#251219; --dark3:#2E1620;
    --gf:#4CAF50; --af:#FFB300; --rf:#EF5350;
  }
  body { font-family:'Jost',sans-serif; font-weight:300; background:var(--dark); color:var(--nu); min-height:100vh; overflow-x:hidden; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:rgba(184,146,58,.2); }
  @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
  .fade { animation: fadeIn .3s ease; }
`;

/* ── HELPERS ────────────────────────────────────────────── */
const dias = (dateStr) => {
  if (!dateStr) return 999;
  return Math.floor((new Date() - new Date(dateStr)) / 86400000);
};
const health = (c) => {
  const d = dias(c.ultimoContato);
  if (d <= 30) return { label: "🟢 Verde", cor: "g", d };
  if (d <= 45) return { label: "🟡 Amarelo", cor: "a", d };
  return { label: "🔴 Vermelho", cor: "r", d };
};
const fmtMRR = (v) => `R$ ${Number(v).toLocaleString("pt-BR")}`;
const fmtData = (s) => {
  if (!s) return "—";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
};

/* ── DADOS INICIAIS ─────────────────────────────────────── */
const CLIENTES_INIT = [
  { id:1, nome:"Acme Tecnologia Ltda", segmento:"SaaS B2B", plano:"Premium", mrr:2500, csm:"Ana Lima", ultimoContato:"2025-04-15", usando:true, obs:"Em expansão — oportunidade de upsell" },
  { id:2, nome:"Clínica Saúde Total", segmento:"Saúde", plano:"Essencial", mrr:980, csm:"Ana Lima", ultimoContato:"2025-03-20", usando:false, obs:"Sem login há 45 dias — acionar urgente" },
  { id:3, nome:"Distribuidora NorteX", segmento:"Distribuição", plano:"Pro", mrr:1800, csm:"Carlos Melo", ultimoContato:"2025-04-10", usando:true, obs:"Indicou 2 empresas — potencial advocacy" },
  { id:4, nome:"Grupo Educação+", segmento:"EdTech", plano:"Premium", mrr:3200, csm:"Ana Lima", ultimoContato:"2025-04-01", usando:true, obs:"Usa pouco módulo avançado — treinar" },
  { id:5, nome:"FinServ Consultores", segmento:"Financeiro", plano:"Pro", mrr:2100, csm:"Carlos Melo", ultimoContato:"2025-03-25", usando:true, obs:"Renovação próxima — agendar QBR" },
  { id:6, nome:"Varejo Express ME", segmento:"Varejo", plano:"Essencial", mrr:650, csm:"Ana Lima", ultimoContato:"2025-04-05", usando:true, obs:"Pequeno porte, alta satisfação NPS 9" },
  { id:7, nome:"Indústria MetalPro", segmento:"Indústria", plano:"Pro", mrr:1600, csm:"Carlos Melo", ultimoContato:"2025-03-10", usando:false, obs:"Contato bloqueado — escalar liderança" },
  { id:8, nome:"LogTech Soluções", segmento:"Logística", plano:"Premium", mrr:2900, csm:"Ana Lima", ultimoContato:"2025-04-12", usando:true, obs:"Case de sucesso em andamento" },
  { id:9, nome:"Escritório Jurídico Paz", segmento:"Jurídico", plano:"Essencial", mrr:720, csm:"Carlos Melo", ultimoContato:"2025-03-18", usando:true, obs:"Mudança de contato — revalidar" },
  { id:10, nome:"AgriTech Colheita", segmento:"AgriTech", plano:"Pro", mrr:1950, csm:"Ana Lima", ultimoContato:"2025-04-14", usando:true, obs:"Expansão prevista no próximo trimestre" },
];

const LOGS_INIT = [
  { id:1, clienteId:1, tipo:"Reunião de Valor (30 dias)", resumo:"Cliente reportou redução de 40% no tempo de fechamento. Dúvida sobre exportação de dados.", proxPassos:"Enviar tutorial de exportação + apresentar módulo analytics", prazo:"2025-04-21", status:"Em Andamento", data:"2025-04-14", csm:"Ana Lima" },
  { id:2, clienteId:2, tipo:"WhatsApp — Reativação", resumo:"Não respondeu. 2ª tentativa sem retorno. Possível churn silencioso.", proxPassos:"Ligar para gestora + escalar se não responder em 48h", prazo:"2025-04-14", status:"Pendente", data:"2025-04-10", csm:"Ana Lima" },
  { id:3, clienteId:8, tipo:"Call de sucesso", resumo:"Cliente atingiu meta de redução de 18% em custos. Interesse em documentar caso de sucesso.", proxPassos:"Enviar template de case + agendar gravação de depoimento", prazo:"2025-04-25", status:"Pendente", data:"2025-04-12", csm:"Ana Lima" },
];

const PLAYBOOK = [
  { id:1, grupo:"risco", situacao:"Cliente sem login há +30 dias", urgencia:"🔴 URGENTE", script:"Oi [Nome], tudo bem? Percebi que faz um tempo que você não acessa a plataforma. Quero entender se teve alguma dificuldade ou mudança de prioridades. Posso te ligar hoje ou amanhã?", objetivo:"Reativar e remover obstáculos", prazo:"24 horas", canal:"WhatsApp / Ligação" },
  { id:2, grupo:"risco", situacao:"Cliente responde NPS 0–6", urgencia:"🔴 URGENTE", script:"[Nome], obrigada pela resposta honesta. Sua percepção é muito importante. Posso agendar 15 minutos esta semana para entender o que posso melhorar?", objetivo:"Converter detrator em passivo", prazo:"24 horas", canal:"E-mail + WhatsApp" },
  { id:3, grupo:"risco", situacao:"Cliente ameaça cancelar", urgencia:"🔴 URGENTE", script:"Entendo e agradeço sua transparência. Antes de qualquer decisão, quero entender o que não está funcionando para ver se consigo resolver. Posso te chamar agora?", objetivo:"Identificar causa raiz + propor solução", prazo:"Imediato", canal:"Ligação" },
  { id:4, grupo:"risco", situacao:"Contato mudou na empresa", urgencia:"🔴 URGENTE", script:"Olá [Novo Nome], sou [Seu Nome], CSM responsável pela conta. Gostaria de agendar 30 min para me apresentar e entender seus objetivos.", objetivo:"Revalidar relacionamento com novo stakeholder", prazo:"48 horas", canal:"E-mail formal" },
  { id:5, grupo:"atencao", situacao:"Cliente sem contato 15–30 dias", urgencia:"🟡 ATENÇÃO", script:"Oi [Nome], passando para saber como as coisas estão indo! Tem alguma dúvida ou algo que eu possa ajudar para aproveitar mais a plataforma?", objetivo:"Manter presença e detectar risco precoce", prazo:"48 horas", canal:"WhatsApp / E-mail" },
  { id:6, grupo:"atencao", situacao:"Renovação em 60 dias", urgencia:"🟡 ATENÇÃO", script:"[Nome], quero agendar nossa Revisão de Valor antes da renovação para mostrar os resultados que conquistamos juntos. Quando você tem disponibilidade?", objetivo:"Antecipar renovação com resultados concretos", prazo:"5 dias", canal:"E-mail + WhatsApp" },
  { id:7, grupo:"atencao", situacao:"Cliente usa só 1 de vários recursos", urgencia:"🟡 ATENÇÃO", script:"Vi que você ainda não explorou o módulo [X] — ele pode [benefício]. Quero te mostrar em 15 minutos como isso pode [resultado]. Topas?", objetivo:"Aumentar adoção e percepção de valor", prazo:"7 dias", canal:"WhatsApp / E-mail" },
  { id:8, grupo:"oportunidade", situacao:"Cliente NPS 9–10", urgencia:"🟢 OPORTUNIDADE", script:"[Nome], fico muito feliz em saber que está sendo útil! Você toparia compartilhar sua experiência em um depoimento rápido? Ajudaria muito outros profissionais.", objetivo:"Gerar prova social e fortalecer marca", prazo:"7 dias", canal:"WhatsApp / E-mail" },
  { id:9, grupo:"oportunidade", situacao:"Cliente atingiu meta com o produto", urgencia:"🟢 OPORTUNIDADE", script:"[Nome], que notícia incrível! Para continuarmos gerando resultado, o próximo passo seria [recurso/plano]. Posso te apresentar como funcionaria?", objetivo:"Identificar upsell natural", prazo:"5 dias", canal:"WhatsApp / Ligação" },
  { id:10, grupo:"oportunidade", situacao:"Aniversário de contrato (1 ano)", urgencia:"🟢 OPORTUNIDADE", script:"[Nome], hoje faz 1 ano que trabalhamos juntos! Quero celebrar e te apresentar os resultados que conquistamos. Te mando um resumo de impacto?", objetivo:"Reforçar valor e criar memória positiva", prazo:"Na data", canal:"WhatsApp / E-mail" },
];

/* ── ESTILOS INLINE ─────────────────────────────────────── */
const S = {
  app: { display:"flex", minHeight:"100vh", fontFamily:"'Jost',sans-serif" },
  sidebar: { width:220, background:"#251219", borderRight:"1px solid rgba(184,146,58,.1)", display:"flex", flexDirection:"column", flexShrink:0, position:"sticky", top:0, height:"100vh", overflow:"hidden" },
  sbBrand: { padding:"24px 20px 18px", borderBottom:"1px solid rgba(184,146,58,.08)" },
  sbLogo: { fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:"#D4B06A", letterSpacing:".06em", lineHeight:1 },
  sbTag: { fontSize:9, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(247,238,230,.22)", marginTop:4 },
  sbNav: { padding:"14px 0", flex:1 },
  sbFooter: { padding:"16px 20px", borderTop:"1px solid rgba(184,146,58,.08)" },
  main: { flex:1, overflow:"auto", display:"flex", flexDirection:"column" },
  topbar: { background:"#251219", borderBottom:"1px solid rgba(184,146,58,.08)", padding:"14px 26px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 },
  topTitle: { fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:"#F7EEE6", fontWeight:400 },
  topSub: { fontSize:10, color:"rgba(247,238,230,.3)", letterSpacing:".1em", textTransform:"uppercase", marginTop:2 },
  page: { padding:"22px 26px", flex:1 },
};

/* ── COMPONENTES BASE ───────────────────────────────────── */
const NavItem = ({ icon, label, active, badge, onClick }) => (
  <div onClick={onClick} style={{
    display:"flex", alignItems:"center", gap:10, padding:"11px 20px",
    fontSize:11, letterSpacing:".1em", textTransform:"uppercase",
    color: active ? "#D4B06A" : "rgba(247,238,230,.38)",
    borderLeft: active ? "2px solid #B8923A" : "2px solid transparent",
    background: active ? "rgba(184,146,58,.07)" : "transparent",
    cursor:"pointer", transition:"all .2s", userSelect:"none"
  }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.color="rgba(247,238,230,.7)"; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.color="rgba(247,238,230,.38)"; }}
  >
    <span style={{fontSize:14, width:18, textAlign:"center"}}>{icon}</span>
    <span style={{flex:1}}>{label}</span>
    {badge > 0 && <span style={{background:"#EF5350", color:"white", fontSize:9, padding:"1px 7px", borderRadius:10, fontWeight:500}}>{badge}</span>}
  </div>
);

const KPICard = ({ label, value, sub, color = "#F7EEE6" }) => (
  <div style={{ background:"#251219", border:"1px solid rgba(184,146,58,.08)", padding:"18px 18px" }}>
    <div style={{ fontSize:8, letterSpacing:".22em", textTransform:"uppercase", color:"rgba(247,238,230,.28)", marginBottom:8 }}>{label}</div>
    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, fontWeight:300, color, lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:10, color:"rgba(247,238,230,.28)", marginTop:4 }}>{sub}</div>
  </div>
);

const Badge = ({ cor, children }) => {
  const colors = { g:["rgba(27,94,32,.35)","#81C784"], a:["rgba(123,88,0,.35)","#FFD54F"], r:["rgba(183,28,28,.35)","#EF9A9A"], b:["rgba(125,36,56,.35)","#D4B06A"] };
  const [bg, fg] = colors[cor] || colors.b;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:9, fontWeight:500, padding:"3px 10px", background:bg, color:fg, letterSpacing:".06em" }}>{children}</span>;
};

const Btn = ({ children, onClick, variant="gold", size="md", style={} }) => {
  const base = { fontFamily:"'Jost',sans-serif", letterSpacing:".15em", textTransform:"uppercase", cursor:"pointer", transition:"all .2s", border:"none", fontWeight:500 };
  const sizes = { md:{ fontSize:10, padding:"9px 18px" }, sm:{ fontSize:9, padding:"5px 11px" } };
  const variants = {
    gold: { background:"#B8923A", color:"#3D1F2A" },
    outline: { background:"transparent", border:"1px solid rgba(184,146,58,.25)", color:"#D4B06A" },
    danger: { background:"rgba(183,28,28,.2)", border:"1px solid rgba(239,83,80,.2)", color:"#EF9A9A" },
  };
  return <button onClick={onClick} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>{children}</button>;
};

const Input = ({ label, value, onChange, type="text", as, options, placeholder }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={{ fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:"rgba(247,238,230,.38)", marginBottom:8, display:"block" }}>{label}</label>}
    {as === "select" ? (
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(184,146,58,.12)", color:"#F7EEE6", fontFamily:"'Jost',sans-serif", fontSize:13, padding:"11px 14px", outline:"none", fontWeight:300 }}>
        {options?.map(o => <option key={o} value={o} style={{ background:"#251219" }}>{o}</option>)}
      </select>
    ) : as === "textarea" ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(184,146,58,.12)", color:"#F7EEE6", fontFamily:"'Jost',sans-serif", fontSize:13, padding:"11px 14px", outline:"none", fontWeight:300, resize:"vertical", minHeight:80 }} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(184,146,58,.12)", color:"#F7EEE6", fontFamily:"'Jost',sans-serif", fontSize:13, padding:"11px 14px", outline:"none", fontWeight:300 }} />
    )}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position:"fixed", inset:0, background:"rgba(10,4,7,.88)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
    <div style={{ background:"#251219", border:"1px solid rgba(184,146,58,.15)", width:"100%", maxWidth:540, maxHeight:"90vh", overflowY:"auto" }}>
      <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid rgba(184,146,58,.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, color:"#F7EEE6" }}>{title}</div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(247,238,230,.3)", fontSize:16, cursor:"pointer", padding:"4px 8px" }}>✕</button>
      </div>
      <div style={{ padding:24 }}>{children}</div>
    </div>
  </div>
);

/* ── MODAL CLIENTE ──────────────────────────────────────── */
function ModalCliente({ cliente, onSave, onClose }) {
  const emp = { nome:"", segmento:"", plano:"Essencial", mrr:"", csm:"Ana Lima", ultimoContato:"", usando:"true", obs:"" };
  const [f, setF] = useState(cliente ? { ...cliente, mrr:String(cliente.mrr), usando:String(cliente.usando) } : emp);
  const s = (k, v) => setF(p => ({ ...p, [k]:v }));
  const save = () => {
    if (!f.nome.trim()) return;
    onSave({ ...f, mrr:Number(f.mrr)||0, usando: f.usando === "true" });
  };
  return (
    <Modal title={cliente ? "Editar Cliente" : "Novo Cliente"} onClose={onClose}>
      <Input label="Nome do Cliente *" value={f.nome} onChange={v=>s("nome",v)} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Input label="Segmento" value={f.segmento} onChange={v=>s("segmento",v)} />
        <Input label="Plano" value={f.plano} onChange={v=>s("plano",v)} as="select" options={["Essencial","Pro","Premium"]} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Input label="MRR (R$)" value={f.mrr} onChange={v=>s("mrr",v)} type="number" />
        <Input label="CSM Responsável" value={f.csm} onChange={v=>s("csm",v)} as="select" options={["Ana Lima","Carlos Melo","Alê Melo"]} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Input label="Último Contato" value={f.ultimoContato} onChange={v=>s("ultimoContato",v)} type="date" />
        <Input label="Está Usando?" value={f.usando} onChange={v=>s("usando",v)} as="select" options={["true","false"]} />
      </div>
      <Input label="Observações" value={f.obs} onChange={v=>s("obs",v)} as="textarea" />
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20, paddingTop:16, borderTop:"1px solid rgba(184,146,58,.08)" }}>
        <Btn variant="outline" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={save}>Salvar</Btn>
      </div>
    </Modal>
  );
}

/* ── MODAL LOG ──────────────────────────────────────────── */
function ModalLog({ clientes, onSave, onClose }) {
  const [f, setF] = useState({ clienteId:"", tipo:"Check-in mensal", resumo:"", proxPassos:"", prazo:"", status:"Pendente", csm:"Ana Lima" });
  const s = (k,v) => setF(p=>({...p,[k]:v}));
  const TIPOS = ["Check-in mensal","Reunião de Valor (30 dias)","Reunião de Valor (60 dias)","QBR — Revisão Trimestral","Call de Onboarding","WhatsApp — Reativação","WhatsApp — Follow-up","E-mail — Onboarding","Ligação — Resgate de churn","Treinamento","Reunião de Expansão"];
  const save = () => { if (!f.clienteId || !f.resumo.trim()) return; onSave(f); };
  return (
    <Modal title="Registrar Interação" onClose={onClose}>
      <Input label="Cliente *" value={String(f.clienteId)} onChange={v=>s("clienteId",Number(v))} as="select" options={[""].concat(clientes.map(c=>String(c.id)))} />
      {/* Hack: mostrar nomes */}
      <div style={{ marginTop:-12, marginBottom:16 }}>
        <select value={String(f.clienteId)} onChange={e=>s("clienteId",Number(e.target.value))} style={{ width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(184,146,58,.12)", color:"#F7EEE6", fontFamily:"'Jost',sans-serif", fontSize:13, padding:"11px 14px", outline:"none" }}>
          <option value="">Selecione o cliente...</option>
          {clientes.map(c=><option key={c.id} value={c.id} style={{background:"#251219"}}>{c.nome}</option>)}
        </select>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Input label="Tipo de Contato" value={f.tipo} onChange={v=>s("tipo",v)} as="select" options={TIPOS} />
        <Input label="CSM" value={f.csm} onChange={v=>s("csm",v)} as="select" options={["Ana Lima","Carlos Melo","Alê Melo"]} />
      </div>
      <Input label="Resumo da Conversa *" value={f.resumo} onChange={v=>s("resumo",v)} as="textarea" />
      <Input label="Próximos Passos" value={f.proxPassos} onChange={v=>s("proxPassos",v)} as="textarea" placeholder="O que foi combinado?" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Input label="Prazo" value={f.prazo} onChange={v=>s("prazo",v)} type="date" />
        <Input label="Status" value={f.status} onChange={v=>s("status",v)} as="select" options={["Pendente","Em Andamento","Concluído","Bloqueado"]} />
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:20, paddingTop:16, borderTop:"1px solid rgba(184,146,58,.08)" }}>
        <Btn variant="outline" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={save}>Registrar</Btn>
      </div>
    </Modal>
  );
}

/* ── PÁGINA: BASE DE CLIENTES ───────────────────────────── */
function PageBase({ clientes, setClientes }) {
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtro, setFiltro] = useState("todos");

  const save = (form) => {
    if (editando) {
      setClientes(cs => cs.map(c => c.id === editando.id ? { ...form, id:c.id } : c));
    } else {
      setClientes(cs => [...cs, { ...form, id: Date.now() }]);
    }
    setModal(false); setEditando(null);
  };
  const del = (id) => { if (window.confirm("Remover este cliente?")) setClientes(cs => cs.filter(c => c.id !== id)); };
  const abrir = (c) => { setEditando(c); setModal(true); };

  const filtrados = clientes.filter(c => filtro === "todos" || health(c).cor === filtro);
  const mrr = clientes.reduce((a,c) => a + c.mrr, 0);
  const g = clientes.filter(c=>health(c).cor==="g").length;
  const am = clientes.filter(c=>health(c).cor==="a").length;
  const r = clientes.filter(c=>health(c).cor==="r").length;

  const cols = "2fr 1fr 0.8fr 1fr 1fr 1.2fr 80px";

  return (
    <div style={S.page} className="fade">
      {(modal || editando) && <ModalCliente cliente={editando} onSave={save} onClose={()=>{setModal(false);setEditando(null)}} />}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:22 }}>
        <KPICard label="Total Clientes" value={clientes.length} sub="ativos" />
        <KPICard label="MRR Total" value={`R$ ${(mrr/1000).toFixed(1)}k`} sub="receita mensal" color="#D4B06A" />
        <KPICard label="🟢 Verdes" value={g} sub="≤ 30 dias" color="#4CAF50" />
        <KPICard label="🟡 Amarelos" value={am} sub="31–45 dias" color="#FFB300" />
        <KPICard label="🔴 Vermelhos" value={r} sub="> 45 dias" color="#EF5350" />
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ display:"flex", gap:8 }}>
          {[["todos","Todos"],["r","🔴 Em Risco"],["a","🟡 Atenção"],["g","🟢 Saudáveis"]].map(([k,l]) => (
            <button key={k} onClick={()=>setFiltro(k)} style={{ fontFamily:"'Jost',sans-serif", fontSize:10, letterSpacing:".1em", textTransform:"uppercase", padding:"7px 14px", border:`1px solid ${filtro===k?"rgba(184,146,58,.5)":"rgba(184,146,58,.12)"}`, background: filtro===k?"rgba(184,146,58,.08)":"transparent", color: filtro===k?"#D4B06A":"rgba(247,238,230,.4)", cursor:"pointer", transition:"all .2s" }}>{l}</button>
          ))}
        </div>
        <Btn onClick={()=>{setEditando(null);setModal(true)}}>+ Novo Cliente</Btn>
      </div>

      <div style={{ background:"#251219", border:"1px solid rgba(184,146,58,.08)", overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:cols, padding:"10px 16px", borderBottom:"1px solid rgba(184,146,58,.08)" }}>
          {["Cliente","Segmento","Plano","MRR","CSM","Health Score",""].map(h => (
            <div key={h} style={{ fontSize:8, letterSpacing:".2em", textTransform:"uppercase", color:"rgba(247,238,230,.28)", fontWeight:500 }}>{h}</div>
          ))}
        </div>
        {filtrados.length === 0 && (
          <div style={{ textAlign:"center", padding:"48px 20px", color:"rgba(247,238,230,.3)" }}>
            <div style={{fontSize:32, marginBottom:10}}>📭</div>
            <div style={{fontSize:13}}>Nenhum cliente neste filtro</div>
          </div>
        )}
        {filtrados.map((c, i) => {
          const hs = health(c);
          return (
            <div key={c.id} onClick={()=>abrir(c)} style={{ display:"grid", gridTemplateColumns:cols, padding:"14px 16px", borderBottom: i < filtrados.length-1 ? "1px solid rgba(255,255,255,.025)" : "none", alignItems:"center", cursor:"pointer", transition:"background .15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(184,146,58,.03)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div>
                <div style={{ fontSize:12, fontWeight:400, color:"#F7EEE6" }}>{c.nome}</div>
                {c.obs && <div style={{ fontSize:10, color:"rgba(247,238,230,.28)", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.obs}</div>}
              </div>
              <div style={{ fontSize:11, color:"rgba(247,238,230,.55)" }}>{c.segmento}</div>
              <div><Badge cor="b">{c.plano}</Badge></div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:15, color:"#D4B06A" }}>{fmtMRR(c.mrr)}</div>
              <div style={{ fontSize:11, color:"rgba(247,238,230,.45)" }}>{c.csm}</div>
              <div><Badge cor={hs.cor}>{hs.label} · {hs.d}d</Badge></div>
              <div style={{ display:"flex", gap:6 }} onClick={e=>e.stopPropagation()}>
                <Btn variant="outline" size="sm" onClick={()=>abrir(c)}>✏</Btn>
                <Btn variant="danger" size="sm" onClick={()=>del(c.id)}>✕</Btn>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── PÁGINA: LOG ────────────────────────────────────────── */
function PageLog({ clientes, logs, setLogs }) {
  const [modal, setModal] = useState(false);
  const getNome = (id) => clientes.find(c=>c.id===id)?.nome || "—";
  const save = (form) => {
    setLogs(ls => [{ ...form, id:Date.now(), data:new Date().toISOString().split("T")[0] }, ...ls]);
    setModal(false);
  };
  const del = (id) => { if(window.confirm("Remover este registro?")) setLogs(ls=>ls.filter(l=>l.id!==id)); };
  const statusStyle = (s) => ({ "Pendente":["rgba(184,146,58,.15)","rgba(247,238,230,.35)"], "Em Andamento":["rgba(123,88,0,.25)","#FFD54F"], "Concluído":["rgba(27,94,32,.25)","#81C784"], "Bloqueado":["rgba(183,28,28,.2)","#EF9A9A"] }[s] || ["transparent","gray"]);

  return (
    <div style={S.page} className="fade">
      {modal && <ModalLog clientes={clientes} onSave={save} onClose={()=>setModal(false)} />}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ fontSize:11, color:"rgba(247,238,230,.3)", letterSpacing:".1em", textTransform:"uppercase" }}>{logs.length} interações registradas</div>
        <Btn onClick={()=>setModal(true)}>+ Registrar Interação</Btn>
      </div>
      {logs.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(247,238,230,.3)" }}>
          <div style={{fontSize:36, marginBottom:12}}>📝</div>
          <div style={{fontSize:13, lineHeight:1.6}}>Nenhuma interação registrada ainda.<br/>Clique em "+ Registrar Interação" para começar.</div>
        </div>
      )}
      {logs.map(l => {
        const [sbg, sfg] = statusStyle(l.status);
        return (
          <div key={l.id} style={{ background:"#251219", border:"1px solid rgba(184,146,58,.06)", padding:"18px 20px", marginBottom:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10, flexWrap:"wrap" }}>
              <div style={{ fontSize:13, fontWeight:400, color:"#F7EEE6" }}>{getNome(l.clienteId)}</div>
              <div style={{ fontSize:9, letterSpacing:".1em", color:"rgba(247,238,230,.4)", padding:"3px 10px", border:"1px solid rgba(184,146,58,.12)" }}>{l.tipo}</div>
              <div style={{ marginLeft:"auto", display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:10, color:"rgba(247,238,230,.28)" }}>{fmtData(l.data)}</span>
                <span style={{ fontSize:9, padding:"2px 9px", background:sbg, color:sfg, letterSpacing:".06em" }}>{l.status}</span>
                <Btn variant="danger" size="sm" onClick={()=>del(l.id)}>✕</Btn>
              </div>
            </div>
            <div style={{ fontSize:12, color:"rgba(247,238,230,.58)", lineHeight:1.65, marginBottom:8 }}>{l.resumo}</div>
            {l.proxPassos && (
              <div style={{ fontSize:11, color:"#D4B06A", display:"flex", gap:6, alignItems:"flex-start" }}>
                <span style={{flexShrink:0}}>→</span>
                <span>{l.proxPassos}</span>
                {l.prazo && <span style={{ color:"rgba(247,238,230,.28)", marginLeft:8, fontSize:10, flexShrink:0 }}>{fmtData(l.prazo)}</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── PÁGINA: PLAYBOOK ───────────────────────────────────── */
function PagePlaybook() {
  const [copied, setCopied] = useState(null);
  const copy = (id, text) => {
    navigator.clipboard?.writeText(text).catch(()=>{});
    setCopied(id); setTimeout(()=>setCopied(null), 2000);
  };
  const grupos = [
    { key:"risco", title:"🚨  RISCO DE CHURN", bg:"rgba(183,28,28,.18)", fg:"#EF9A9A", border:"#EF5350" },
    { key:"atencao", title:"⚠️  ATENÇÃO / RISCO MODERADO", bg:"rgba(123,88,0,.18)", fg:"#FFD54F", border:"#FFB300" },
    { key:"oportunidade", title:"🌱  OPORTUNIDADE DE EXPANSÃO", bg:"rgba(27,94,32,.18)", fg:"#81C784", border:"#4CAF50" },
  ];
  return (
    <div style={S.page} className="fade">
      {grupos.map(g => (
        <div key={g.key} style={{ marginBottom:24 }}>
          <div style={{ fontSize:9, letterSpacing:".25em", textTransform:"uppercase", padding:"10px 16px", fontWeight:500, background:g.bg, color:g.fg, borderLeft:`3px solid ${g.border}`, marginBottom:8 }}>{g.title}</div>
          {PLAYBOOK.filter(p=>p.grupo===g.key).map(p => (
            <div key={p.id} style={{ background:"#251219", border:"1px solid rgba(184,146,58,.06)", padding:"18px 20px", marginBottom:6 }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:"#F7EEE6", fontWeight:400 }}>
                  <span style={{ fontSize:10, padding:"2px 8px", background:"rgba(184,146,58,.08)", color:"rgba(247,238,230,.45)", letterSpacing:".06em", flexShrink:0 }}>{p.urgencia}</span>
                  {p.situacao}
                </div>
                <button onClick={()=>copy(p.id,p.script)} style={{ background:"transparent", border:"1px solid rgba(184,146,58,.15)", color: copied===p.id?"#81C784":"#D4B06A", fontFamily:"'Jost',sans-serif", fontSize:9, letterSpacing:".12em", textTransform:"uppercase", padding:"5px 12px", cursor:"pointer", flexShrink:0, transition:"all .2s" }}>
                  {copied===p.id?"✓ Copiado":"Copiar script"}
                </button>
              </div>
              <div style={{ fontSize:12, color:"rgba(247,238,230,.48)", lineHeight:1.7, fontStyle:"italic", borderLeft:"2px solid rgba(184,146,58,.18)", paddingLeft:14, marginBottom:12 }}>"{p.script}"</div>
              <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                {[["🎯",p.objetivo],["⏱",p.prazo],["📱",p.canal]].map(([icon,text])=>(
                  <span key={text} style={{ fontSize:10, color:"rgba(247,238,230,.28)", letterSpacing:".06em" }}>{icon} {text}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── PÁGINA: DASHBOARD ──────────────────────────────────── */
function PageDash({ clientes, logs }) {
  const total = clientes.length || 1;
  const mrr = clientes.reduce((a,c)=>a+c.mrr,0);
  const g = clientes.filter(c=>health(c).cor==="g");
  const am = clientes.filter(c=>health(c).cor==="a");
  const r = clientes.filter(c=>health(c).cor==="r");
  const usando = clientes.filter(c=>c.usando);
  const pct = v => Math.round(v/total*100);

  const alertas = [
    ...r.map(c=>({ tipo:"r", text:<><strong style={{color:"#F7EEE6",fontWeight:400}}>{c.nome}</strong> — {health(c).d} dias sem contato. Acionar agora.</> })),
    ...am.map(c=>({ tipo:"a", text:<><strong style={{color:"#F7EEE6",fontWeight:400}}>{c.nome}</strong> — {health(c).d} dias sem contato. Verificar engajamento.</> })),
    ...clientes.filter(c=>!c.usando).map(c=>({ tipo:"r", text:<><strong style={{color:"#F7EEE6",fontWeight:400}}>{c.nome}</strong> — não está usando o produto.</> })),
  ];

  const planos = ["Essencial","Pro","Premium"].map(p=>({
    p, count:clientes.filter(c=>c.plano===p).length,
    mrr:clientes.filter(c=>c.plano===p).reduce((a,c)=>a+c.mrr,0)
  }));
  const maxC = Math.max(...planos.map(p=>p.count),1);

  const card = (children, style={}) => (
    <div style={{ background:"#251219", border:"1px solid rgba(184,146,58,.08)", padding:"20px 22px", ...style }}>{children}</div>
  );
  const cardTitle = (t) => <div style={{ fontSize:9, letterSpacing:".22em", textTransform:"uppercase", color:"rgba(247,238,230,.28)", marginBottom:16 }}>{t}</div>;

  return (
    <div style={S.page} className="fade">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
        <KPICard label="MRR Total" value={`R$ ${(mrr/1000).toFixed(1)}k`} sub={`${clientes.length} clientes`} color="#D4B06A" />
        <KPICard label="% Saudáveis" value={`${pct(g.length)}%`} sub={`${g.length} de ${clientes.length}`} color="#4CAF50" />
        <KPICard label="% em Risco" value={`${pct(r.length)}%`} sub={`${r.length} vermelhos`} color="#EF5350" />
        <KPICard label="Usando Produto" value={`${pct(usando.length)}%`} sub={`${usando.length} de ${clientes.length}`} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {card(<>
          {cardTitle("Alertas Ativos")}
          {alertas.length === 0 && <div style={{fontSize:12,color:"rgba(247,238,230,.28)",textAlign:"center",padding:"16px 0"}}>✅ Nenhum alerta no momento</div>}
          {alertas.slice(0,6).map((a,i)=>(
            <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 0", borderBottom: i<Math.min(alertas.length,6)-1?"1px solid rgba(255,255,255,.025)":"none" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:a.tipo==="r"?"#EF5350":"#FFB300", flexShrink:0, marginTop:4 }}></div>
              <div style={{ fontSize:12, color:"rgba(247,238,230,.65)", lineHeight:1.5 }}>{a.text}</div>
            </div>
          ))}
        </>)}

        {card(<>
          {cardTitle("Distribuição por Plano")}
          {planos.map(p=>(
            <div key={p.p} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <div style={{ fontSize:11, color:"rgba(247,238,230,.55)", width:72, flexShrink:0 }}>{p.p}</div>
              <div style={{ flex:1, height:6, background:"rgba(255,255,255,.06)" }}>
                <div style={{ width:`${Math.round(p.count/maxC*100)}%`, height:"100%", background:"#B8923A", transition:"width .4s ease" }}></div>
              </div>
              <div style={{ fontSize:11, color:"rgba(247,238,230,.38)", width:20, textAlign:"right" }}>{p.count}</div>
            </div>
          ))}
          <div style={{ borderTop:"1px solid rgba(184,146,58,.08)", paddingTop:12, marginTop:4 }}>
            {planos.map(p=>(
              <div key={p.p} style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(247,238,230,.38)", padding:"3px 0" }}>
                <span>{p.p}</span><span style={{color:"#D4B06A"}}>{fmtMRR(p.mrr)}</span>
              </div>
            ))}
          </div>
        </>)}

        {card(<>
          {cardTitle("Health Score — Visão Geral")}
          <div style={{ display:"flex", height:12, marginBottom:16, overflow:"hidden" }}>
            <div style={{ width:`${pct(g.length)}%`, background:"#4CAF50", transition:"width .4s" }}></div>
            <div style={{ width:`${pct(am.length)}%`, background:"#FFB300" }}></div>
            <div style={{ width:`${pct(r.length)}%`, background:"#EF5350" }}></div>
          </div>
          {[{l:"🟢 Verde (≤30d)",c:g.length,col:"#4CAF50"},{l:"🟡 Amarelo (31–45d)",c:am.length,col:"#FFB300"},{l:"🔴 Vermelho (>45d)",c:r.length,col:"#EF5350"}].map(item=>(
            <div key={item.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.025)" }}>
              <span style={{fontSize:12,color:"rgba(247,238,230,.58)"}}>{item.l}</span>
              <span style={{fontSize:13,fontWeight:400,color:item.col}}>{item.c} <span style={{fontSize:10,color:"rgba(247,238,230,.28)"}}>({pct(item.c)}%)</span></span>
            </div>
          ))}
        </>)}

        {card(<>
          {cardTitle("Últimas Interações")}
          {logs.length === 0 && <div style={{fontSize:12,color:"rgba(247,238,230,.28)",textAlign:"center",padding:"16px 0"}}>Nenhuma interação registrada</div>}
          {logs.slice(0,5).map((l,i)=>(
            <div key={l.id} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom: i<Math.min(logs.length,5)-1?"1px solid rgba(255,255,255,.025)":"none" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#B8923A", flexShrink:0, marginTop:4 }}></div>
              <div>
                <div style={{fontSize:12,color:"#F7EEE6",fontWeight:400}}>{clientes.find(c=>c.id===l.clienteId)?.nome||"—"}</div>
                <div style={{fontSize:10,color:"rgba(247,238,230,.28)",marginTop:2}}>{l.tipo} · {fmtData(l.data)}</div>
              </div>
            </div>
          ))}
        </>)}
      </div>
    </div>
  );
}

/* ── APP ROOT ────────────────────────────────────────────── */
export default function App() {
  const load = () => {
    try {
      const raw = localStorage.getItem("csmv_v1");
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return { clientes: CLIENTES_INIT, logs: LOGS_INIT };
  };

  const [aba, setAba] = useState("base");
  const [data, setData] = useState(load);

  useEffect(() => {
    try { localStorage.setItem("csmv_v1", JSON.stringify(data)); } catch(e) {}
  }, [data]);

  const setClientes = useCallback(fn => setData(d => ({ ...d, clientes: typeof fn === "function" ? fn(d.clientes) : fn })), []);
  const setLogs = useCallback(fn => setData(d => ({ ...d, logs: typeof fn === "function" ? fn(d.logs) : fn })), []);

  const vermelhos = data.clientes.filter(c => health(c).cor === "r").length;
  const navItems = [
    { key:"base", icon:"👥", label:"Base de Clientes", badge: vermelhos },
    { key:"log", icon:"📝", label:"Log de Interações" },
    { key:"playbook", icon:"📋", label:"Playbook" },
    { key:"dash", icon:"📊", label:"Dashboard" },
  ];
  const titles = { base:"Base de Clientes", log:"Log de Interações", playbook:"Playbook de Gatilhos", dash:"Dashboard" };
  const subs = { base:"Health Score automático por dias sem contato", log:"Histórico completo de interações", playbook:"Scripts prontos para cada situação", dash:"Métricas e alertas em tempo real" };

  return (
    <>
      <style>{CSS}</style>
      <div style={S.app}>
        {/* SIDEBAR */}
        <div style={S.sidebar}>
          <div style={S.sbBrand}>
            <div style={S.sbLogo}>CS Dashboard</div>
            <div style={S.sbTag}>Mínimo Viável · @alemelo_cx</div>
          </div>
          <div style={S.sbNav}>
            {navItems.map(n => <NavItem key={n.key} {...n} active={aba===n.key} onClick={()=>setAba(n.key)} />)}
          </div>
          <div style={S.sbFooter}>
            <div style={{ fontSize:11, color:"rgba(247,238,230,.28)", letterSpacing:".06em" }}>@alemelo_cx</div>
            <div style={{ fontSize:9, color:"rgba(247,238,230,.18)", marginTop:3, letterSpacing:".08em" }}>CS Mínimo Viável</div>
          </div>
        </div>

        {/* MAIN */}
        <div style={S.main}>
          <div style={S.topbar}>
            <div>
              <div style={S.topTitle}>{titles[aba]}</div>
              <div style={S.topSub}>{subs[aba]}</div>
            </div>
            {vermelhos > 0 && (
              <div style={{ fontSize:10, color:"#EF9A9A", padding:"8px 14px", border:"1px solid rgba(239,83,80,.25)", background:"rgba(183,28,28,.15)", letterSpacing:".08em" }}>
                ⚠ {vermelhos} cliente{vermelhos>1?"s":""} em risco
              </div>
            )}
          </div>
          {aba === "base" && <PageBase clientes={data.clientes} setClientes={setClientes} />}
          {aba === "log" && <PageLog clientes={data.clientes} logs={data.logs} setLogs={setLogs} />}
          {aba === "playbook" && <PagePlaybook />}
          {aba === "dash" && <PageDash clientes={data.clientes} logs={data.logs} />}
        </div>
      </div>
    </>
  );
}
