import { useState, useRef } from "react";

// ── Helpers ──────────────────────────────────────────────
const store = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save  = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const fmt   = (n) => "$" + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const now = new Date();
const thisYear = now.getFullYear();
const thisMonth = now.getMonth();

// ── Category icons ────────────────────────────────────────
const CAT_ICONS = { Groceries:"🛒", Rent:"🏠", Restaurant:"🍽️", Activities:"🎯", Transport:"🚌", Shopping:"🛍️", Essentials:"⭐", Subscriptions:"🔄", Other:"📦" };

// ── Color palette (from image — sage green) ───────────────
const C = {
  bg: "#f4f5f0",
  card: "#ffffff",
  green: "#4a7c59",
  greenLight: "#e8efe9",
  greenMid: "#7aab89",
  text: "#1a1a1a",
  muted: "#6b7280",
  border: "#e5e7eb",
  red: "#dc2626",
  amber: "#d97706",
};

// ── Sub-components ────────────────────────────────────────

function SectionHeader({ title, icon, onAdd }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:16 }}>{icon}</span>
        <span style={{ fontSize:16, fontWeight:700, color:C.text }}>{title}</span>
      </div>
      {onAdd && (
        <button onClick={onAdd} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:18, lineHeight:1 }}>⋯</button>
      )}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background:C.card, borderRadius:12, padding:16, border:`1px solid ${C.border}`, ...style }}>
      {children}
    </div>
  );
}

function ProgressBar({ pct, color = C.green }) {
  return (
    <div style={{ height:6, background:C.greenLight, borderRadius:99, overflow:"hidden", marginTop:6 }}>
      <div style={{ width:`${Math.min(100,pct)}%`, height:"100%", background:color, borderRadius:99, transition:"width .4s" }}/>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────
export default function Finance() {
  // Budget categories
  const t = { finDesc:"Description", finBudget:"Monthly Budget", finAccounts:"Accounts", finSubs:"Subscriptions", finGoals:"Goals", finNotes:"Notes", finSummary:"Summary", finEdit:"Edit", finExpense:"Expense", finIncome:"Income", finNew:"+ New", finActive:"Active", finPaused:"Paused", finThisYear:"This Year" };
  const [budgets, setBudgets] = useState(() => store("fin_budgets", [
    { id:1, name:"Groceries",     icon:"🛒", limit:300, spent:250 },
    { id:2, name:"Rent",          icon:"🏠", limit:700, spent:650 },
    { id:3, name:"Restaurant",    icon:"🍽️", limit:100, spent:25  },
    { id:4, name:"Activities",    icon:"🎯", limit:200, spent:50  },
    { id:5, name:"Transport",     icon:"🚌", limit:200, spent:50  },
    { id:6, name:"Shopping",      icon:"🛍️", limit:150, spent:0   },
    { id:7, name:"Essentials",    icon:"⭐", limit:300, spent:75  },
    { id:8, name:"Subscriptions", icon:"🔄", limit:50,  spent:20  },
  ]));

  // Expenses
  const [expenses, setExpenses] = useState(() => store("fin_expenses", [
    { id:1, name:"Rent",        date:"2026-05-01", amount:650, category:"Rent",      account:"Checking" },
    { id:2, name:"Wi-Fi",       date:"2026-05-02", amount:30,  category:"Essentials",account:"Credit"   },
    { id:3, name:"Electricity", date:"2026-05-02", amount:45,  category:"Essentials",account:"Checking" },
    { id:4, name:"Groceries",   date:"2026-05-03", amount:120, category:"Groceries", account:"Credit"   },
  ]));

  // Incomes
  const [incomes, setIncomes] = useState(() => store("fin_incomes", [
    { id:1, type:"Salary", amount:1500, date:"2026-05-01" },
  ]));

  // Accounts
  const [accounts, setAccounts] = useState(() => store("fin_accounts", [
    { id:1, name:"Checking Account", balance:8670,   icon:"🏛️" },
    { id:2, name:"Savings",          balance:10000,  icon:"💰" },
    { id:3, name:"Credit Card",      balance:-733,   icon:"💳" },
  ]));

  // Subscriptions
  const [subs, setSubs] = useState(() => store("fin_subs", [
    { id:1, name:"Amazon Prime", amount:9,  active:true  },
    { id:2, name:"Netflix",      amount:20, active:true  },
  ]));

  // Goals
  const [goals, setGoals] = useState(() => store("fin_goals", [
    { id:1, name:"New PC", target:550, saved:200 },
  ]));

  // Notes
  const [notes, setNotes] = useState(() => store("fin_notes", ""));

  // Modal state
  const [modal, setModal] = useState(null); // { type, data }
  const [activeExpTab, setActiveExpTab] = useState("month");
  const [activeSumTab, setActiveSumTab] = useState("year");
  const [summaryView, setSummaryView] = useState("year");
  const [editModal, setEditModal] = useState(null);
  const [eForm, setEForm] = useState({});

  const openEdit = (type, item, idx) => { setEForm({...item}); setEditModal({type, item, idx}); };

  const saveEdit = () => {
    if (!editModal) return;
    const {type, idx} = editModal;
    if (type==="expense") {
      const ne = expenses.map((e,i)=>i===idx?{...e,...eForm,amount:+eForm.amount}:e);
      persist("fin_expenses",setExpenses,ne);
    } else if (type==="income") {
      const ni = incomes.map((x,i)=>i===idx?{...x,...eForm,amount:+eForm.amount}:x);
      persist("fin_incomes",setIncomes,ni);
    } else if (type==="account") {
      const na = accounts.map((a,i)=>i===idx?{...a,...eForm,balance:+eForm.balance}:a);
      persist("fin_accounts",setAccounts,na);
    } else if (type==="sub") {
      const ns = subs.map((s,i)=>i===idx?{...s,...eForm,amount:+eForm.amount}:s);
      persist("fin_subs",setSubs,ns);
    } else if (type==="goal") {
      const ng = goals.map((g,i)=>i===idx?{...g,...eForm,target:+eForm.target,saved:+eForm.saved}:g);
      persist("fin_goals",setGoals,ng);
    } else if (type==="budget") {
      const nb = budgets.map((b,i)=>i===idx?{...b,...eForm,limit:+eForm.limit,spent:+eForm.spent}:b);
      persist("fin_budgets",setBudgets,nb);
    }
    setEditModal(null);
  };

  const deleteItem = () => {
    if (!editModal) return;
    const {type, idx} = editModal;
    if (type==="expense") persist("fin_expenses",setExpenses,expenses.filter((_,i)=>i!==idx));
    else if (type==="income") persist("fin_incomes",setIncomes,incomes.filter((_,i)=>i!==idx));
    else if (type==="account") persist("fin_accounts",setAccounts,accounts.filter((_,i)=>i!==idx));
    else if (type==="sub") persist("fin_subs",setSubs,subs.filter((_,i)=>i!==idx));
    else if (type==="goal") persist("fin_goals",setGoals,goals.filter((_,i)=>i!==idx));
    else if (type==="budget") persist("fin_budgets",setBudgets,budgets.filter((_,i)=>i!==idx));
    setEditModal(null);
  };

  // Quick add form
  const [qForm, setQForm] = useState({ name:"", amount:"", date:new Date().toISOString().slice(0,10), category:"Groceries", account:"Checking", type:"expense" });

  const persist = (key, setter, val) => { setter(val); save(key, val); };

  // Totals
  const totalIncome  = incomes.reduce((a,i) => a + Number(i.amount), 0);
  const totalExpense = expenses.reduce((a,e) => a + Number(e.amount), 0);
  const net = totalIncome - totalExpense;

  // Summary months
  const summaryData = MONTHS.map((m, mi) => {
    const inc = incomes.filter(i => new Date(i.date).getMonth() === mi && new Date(i.date).getFullYear() === thisYear).reduce((a,i)=>a+Number(i.amount),0);
    const exp = expenses.filter(e => new Date(e.date).getMonth() === mi && new Date(e.date).getFullYear() === thisYear).reduce((a,e)=>a+Number(e.amount),0);
    return { month: m.slice(0,3) + " " + thisYear, inc, exp, net: inc - exp };
  });

  const addExpense = () => {
    if (!qForm.name || !qForm.amount) return;
    const e = { id:Date.now(), name:qForm.name, date:qForm.date, amount:+qForm.amount, category:qForm.category, account:qForm.account };
    const ne = [e, ...expenses];
    persist("fin_expenses", setExpenses, ne);
    // Update budget spent
    const nb = budgets.map(b => b.name === qForm.category ? {...b, spent: b.spent + +qForm.amount} : b);
    persist("fin_budgets", setBudgets, nb);
    setQForm(f=>({...f, name:"", amount:""}));
  };

  const addIncome = () => {
    if (!qForm.name || !qForm.amount) return;
    const i = { id:Date.now(), type:qForm.name, amount:+qForm.amount, date:qForm.date };
    persist("fin_incomes", setIncomes, [i, ...incomes]);
    setQForm(f=>({...f, name:"", amount:""}));
  };

  return (
    <div style={{ background:C.bg, fontFamily:"DM Sans", margin:"0 -24px", paddingBottom:48 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet"/>

      {/* Hero banner */}
      <div style={{ background:`linear-gradient(135deg, ${C.green} 0%, #2d5a3d 100%)`,
        padding:"28px 32px 24px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, opacity:0.08,
          backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
          backgroundSize:"20px 20px" }}/>
        <h1 style={{ fontFamily:"DM Sans", fontSize:32, color:"white", margin:0, position:"relative" }}>
          Budget & Finance Tracker
        </h1>
        <p style={{ color:"rgba(255,255,255,0.7)", margin:"4px 0 0", fontSize:13, position:"relative" }}>
          {MONTHS[thisMonth]} {thisYear}
        </p>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px" }}>

        {/* ── Edit Modal ── */}
      {editModal && (
        <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",
          justifyContent:"center",background:"rgba(0,0,0,0.35)"}} onClick={()=>setEditModal(null)}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:"white",borderRadius:16,padding:24,width:320,
              boxShadow:"0 12px 40px rgba(0,0,0,0.18)"}}>
            <h3 style={{margin:"0 0 16px",fontSize:16,fontWeight:700,color:C.text,
              textTransform:"capitalize"}}>{t.finEdit}</h3>

            {/* Expense fields */}
            {editModal.type==="expense" && (<>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Нэр</label>
              <input value={eForm.name||""} onChange={e=>setEForm(f=>({...f,name:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Дүн</label>
              <input type="number" value={eForm.amount||""} onChange={e=>setEForm(f=>({...f,amount:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Огноо</label>
              <input type="date" value={eForm.date||""} onChange={e=>setEForm(f=>({...f,date:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Категори</label>
              <select value={eForm.category||""} onChange={e=>setEForm(f=>({...f,category:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12}}>
                {budgets.map(b=><option key={b.id}>{b.name}</option>)}
              </select>
            </>)}

            {/* Income fields */}
            {editModal.type==="income" && (<>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Төрөл</label>
              <input value={eForm.type||""} onChange={e=>setEForm(f=>({...f,type:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Дүн</label>
              <input type="number" value={eForm.amount||""} onChange={e=>setEForm(f=>({...f,amount:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12}}/>
            </>)}

            {/* Account fields */}
            {editModal.type==="account" && (<>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Нэр</label>
              <input value={eForm.name||""} onChange={e=>setEForm(f=>({...f,name:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Үлдэгдэл</label>
              <input type="number" value={eForm.balance||""} onChange={e=>setEForm(f=>({...f,balance:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12}}/>
            </>)}

            {/* Subscription fields */}
            {editModal.type==="sub" && (<>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Нэр</label>
              <input value={eForm.name||""} onChange={e=>setEForm(f=>({...f,name:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Сарын дүн</label>
              <input type="number" value={eForm.amount||""} onChange={e=>setEForm(f=>({...f,amount:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12}}/>
            </>)}

            {/* Goal fields */}
            {editModal.type==="goal" && (<>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Нэр</label>
              <input value={eForm.name||""} onChange={e=>setEForm(f=>({...f,name:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Зорилтот дүн</label>
              <input type="number" value={eForm.target||""} onChange={e=>setEForm(f=>({...f,target:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Хадгалсан дүн</label>
              <input type="number" value={eForm.saved||""} onChange={e=>setEForm(f=>({...f,saved:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12}}/>
            </>)}

            {/* Budget fields */}
            {editModal.type==="budget" && (<>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Нэр</label>
              <input value={eForm.name||""} onChange={e=>setEForm(f=>({...f,name:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Хязгаар</label>
              <input type="number" value={eForm.limit||""} onChange={e=>setEForm(f=>({...f,limit:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
              <label style={{fontSize:11,color:C.muted,fontWeight:600}}>Зарцуулсан</label>
              <input type="number" value={eForm.spent||""} onChange={e=>setEForm(f=>({...f,spent:e.target.value}))}
                style={{width:"100%",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12}}/>
            </>)}

            <div style={{display:"flex",gap:8}}>
              <button onClick={saveEdit}
                style={{flex:1,padding:"9px",borderRadius:8,border:"none",
                  background:C.green,color:"white",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                Хадгалах
              </button>
              <button onClick={deleteItem}
                style={{padding:"9px 14px",borderRadius:8,border:`1px solid ${C.border}`,
                  background:"#fff1f2",color:C.red,fontSize:13,cursor:"pointer"}}>🗑</button>
              <button onClick={()=>setEditModal(null)}
                style={{padding:"9px 14px",borderRadius:8,border:`1px solid ${C.border}`,
                  background:"white",fontSize:13,cursor:"pointer"}}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Row */}
        <div style={{ display:"flex", gap:10, margin:"20px 0 0", flexWrap:"wrap" }}>
          {/* Quick add expense */}
          <Card style={{ flex:1, minWidth:260 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:10, letterSpacing:.5, textTransform:"uppercase" }}>Quick Add</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <input value={qForm.name} onChange={e=>setQForm(f=>({...f,name:e.target.value}))} placeholder={t.finDesc}
                style={{ flex:2, minWidth:100, border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 10px", fontSize:13, outline:"none" }}/>
              <input value={qForm.amount} onChange={e=>setQForm(f=>({...f,amount:e.target.value}))} placeholder="$0.00" type="number"
                style={{ width:80, border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 10px", fontSize:13, outline:"none" }}/>
              <input value={qForm.date} onChange={e=>setQForm(f=>({...f,date:e.target.value}))} type="date"
                style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 8px", fontSize:12, outline:"none" }}/>
              <select value={qForm.category} onChange={e=>setQForm(f=>({...f,category:e.target.value}))}
                style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 8px", fontSize:12, outline:"none" }}>
                {budgets.map(b=><option key={b.id}>{b.name}</option>)}
              </select>
              <button onClick={addExpense}
                style={{ background:C.red, color:"white", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>{t.finExpense ? "− " + t.finExpense : "− Expense"}</button>
              <button onClick={addIncome}
                style={{ background:C.green, color:"white", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>{t.finIncome ? "+ " + t.finIncome : "+ Income"}</button>
            </div>
          </Card>

          {/* This Month summary */}
          <Card style={{ minWidth:160 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:8, letterSpacing:.5, textTransform:"uppercase" }}>This Month</div>
            <div style={{ fontSize:11, color:C.muted }}>Total Incomes</div>
            <div style={{ fontSize:15, fontWeight:700, color:C.green }}>{fmt(totalIncome)}</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:6 }}>Total Expenses</div>
            <div style={{ fontSize:15, fontWeight:700, color:C.red }}>{fmt(totalExpense)}</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:6 }}>Net</div>
            <div style={{ fontSize:15, fontWeight:700, color: net>=0 ? C.green : C.red }}>{fmt(net)}</div>
          </Card>
        </div>

        {/* Main Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:16 }}>

          {/* Monthly Budget */}
          <Card>
            <SectionHeader title={t.finBudget} icon="📊"/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {budgets.map(b => {
                const pct = b.limit > 0 ? Math.round(b.spent / b.limit * 100) : 0;
                const over = pct > 90;
                return (
                  <div key={b.id} onClick={()=>openEdit("budget",b,budgets.findIndex(x=>x.id===b.id))}
                    style={{ background:C.greenLight, borderRadius:10, padding:"10px 12px", cursor:"pointer", transition:"filter .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.filter="brightness(0.96)"}
                    onMouseLeave={e=>e.currentTarget.style.filter="none"}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                      <span style={{ fontSize:14 }}>{b.icon}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:C.text }}>{b.name}</span>
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, color: over ? C.red : C.text }}>{fmt(b.spent)}</div>
                    <ProgressBar pct={pct} color={over ? C.red : C.green}/>
                    <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>{pct}% of {fmt(b.limit)}</div>
                  </div>
                );
              })}
              <div onClick={() => { const n = prompt("Category name:"); if(!n) return; const nb=[...budgets,{id:Date.now(),name:n,icon:"📦",limit:+(prompt("Monthly limit:")||0),spent:0}]; persist("fin_budgets",setBudgets,nb); }}
                style={{ border:`1.5px dashed ${C.border}`, borderRadius:10, padding:"10px 12px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:C.muted, fontSize:12 }}>{t.finNew}</div>
            </div>
          </Card>

          {/* Right column: Accounts + Subscriptions + Goals */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Accounts */}
            <Card>
              <SectionHeader title={t.finAccounts} icon="🏛️"/>
              {accounts.map(a => (
                <div key={a.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"8px 10px", borderRadius:8, marginBottom:6, background:C.greenLight }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:16 }}>{a.icon}</span>
                    <span style={{ fontSize:13, fontWeight:500 }}>{a.name}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{ fontSize:14, fontWeight:700, color: a.balance < 0 ? C.red : C.text }}>{fmt(a.balance)}</span>
                    <button onClick={()=>openEdit("account",a,accounts.findIndex(x=>x.id===a.id))}
                      style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:13,padding:"2px 4px"}}>✏️</button>
                  </div>
                </div>
              ))}
              <div onClick={()=>{ const n=prompt("Account name:"); if(!n) return; const b=+(prompt("Balance:")||0); const na=[...accounts,{id:Date.now(),name:n,balance:b,icon:"💰"}]; persist("fin_accounts",setAccounts,na); }}
                style={{ textAlign:"center", fontSize:12, color:C.muted, cursor:"pointer", marginTop:4, padding:"6px", borderRadius:8, border:`1px dashed ${C.border}` }}>
                + New account
              </div>
            </Card>

            {/* Subscriptions */}
            <Card>
              <SectionHeader title={t.finSubs} icon="🔄"/>
              {subs.map(s => (
                <div key={s.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"8px 10px", borderRadius:8, marginBottom:6, background:C.greenLight }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{s.name}</div>
                    <div style={{ fontSize:11, color:C.muted }}>{fmt(s.amount)}/mo</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background: s.active?"#dcfce7":"#f3f4f6", color: s.active?C.green:C.muted, fontWeight:700 }}>
                      {s.active?t.finActive:t.finPaused}
                    </span>
                    <button onClick={()=>{ const ns=subs.map(x=>x.id===s.id?{...x,active:!x.active}:x); persist("fin_subs",setSubs,ns); }}
                      style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:C.muted }}>Toggle</button>
                    <button onClick={()=>openEdit("sub",s,subs.findIndex(x=>x.id===s.id))}
                      style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:13}}>✏️</button>
                  </div>
                </div>
              ))}
              <div onClick={()=>{ const n=prompt("Service name:"); if(!n) return; const a=+(prompt("Monthly amount:")||0); const ns=[...subs,{id:Date.now(),name:n,amount:a,active:true}]; persist("fin_subs",setSubs,ns); }}
                style={{ textAlign:"center", fontSize:12, color:C.muted, cursor:"pointer", marginTop:4, padding:"6px", borderRadius:8, border:`1px dashed ${C.border}` }}>
                + Add
              </div>
            </Card>

            {/* Goals */}
            <Card>
              <SectionHeader title={t.finGoals} icon="🎯"/>
              {goals.map(g => {
                const pct = g.target > 0 ? Math.round(g.saved / g.target * 100) : 0;
                return (
                  <div key={g.id} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:13, fontWeight:600 }}>🏷️ {g.name}</span>
                      <span style={{ fontSize:12, color:C.muted }}>{fmt(g.saved)} / {fmt(g.target)}</span>
                    </div>
                    <ProgressBar pct={pct}/>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:3}}>
                      <span style={{ fontSize:10, color:C.muted }}>{pct}%</span>
                      <button onClick={()=>openEdit("goal",g,goals.findIndex(x=>x.id===g.id))}
                        style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:12}}>✏️</button>
                    </div>
                  </div>
                );
              })}
              <div onClick={()=>{ const n=prompt("Goal name:"); if(!n) return; const t=+(prompt("Target amount:")||0); const ng=[...goals,{id:Date.now(),name:n,target:t,saved:0}]; persist("fin_goals",setGoals,ng); }}
                style={{ textAlign:"center", fontSize:12, color:C.muted, cursor:"pointer", padding:"6px", borderRadius:8, border:`1px dashed ${C.border}` }}>
                + New goal
              </div>
            </Card>
          </div>
        </div>

        {/* Expenses + Incomes row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:16 }}>

          {/* Expenses */}
          <Card>
            <SectionHeader title="Expenses" icon="💸"/>
            <div style={{ display:"flex", gap:6, marginBottom:12 }}>
              {["week","month","year"].map(t=>(
                <button key={t} onClick={()=>setActiveExpTab(t)}
                  style={{ padding:"4px 10px", borderRadius:20, border:`1px solid ${activeExpTab===t?C.green:C.border}`,
                    background:activeExpTab===t?C.greenLight:"white", color:activeExpTab===t?C.green:C.muted,
                    fontSize:11, fontWeight:600, cursor:"pointer" }}>
                  This {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:4, marginBottom:6,
              fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.5 }}>
              <span>Expense</span><span>Date</span><span>Amount</span><span>Category</span>
            </div>
            {expenses.slice(0,6).map(e=>(
              <div key={e.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:4,
                padding:"7px 0", borderTop:`1px solid ${C.border}`, alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:14 }}>{CAT_ICONS[e.category]||"📦"}</span>
                  <span style={{ fontSize:12, fontWeight:500 }}>{e.name}</span>
                </div>
                <span style={{ fontSize:11, color:C.muted }}>{e.date}</span>
                <span style={{ fontSize:12, fontWeight:700, color:C.red }}>{fmt(e.amount)}</span>
                <span style={{ fontSize:10, color:C.muted }}>{e.category}</span>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>openEdit("expense",e,expenses.findIndex(x=>x.id===e.id))}
                  style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:12}}>✏️</button>
                <button onClick={()=>{ if(confirm("Устгах уу?")) persist("fin_expenses",setExpenses,expenses.filter(x=>x.id!==e.id)); }}
                  style={{background:"none",border:"none",cursor:"pointer",color:C.red,fontSize:12}}>🗑</button>
              </div>
              </div>
            ))}
            <div style={{ textAlign:"right", fontSize:12, fontWeight:700, color:C.red, marginTop:8, borderTop:`1px solid ${C.border}`, paddingTop:8 }}>
              SUM {fmt(totalExpense)}
            </div>
          </Card>

          {/* Incomes */}
          <Card>
            <SectionHeader title="Incomes" icon="💵"/>
            <div style={{ display:"flex", gap:6, marginBottom:12 }}>
              {["month","year"].map(t=>(
                <button key={t} onClick={()=>{}}
                  style={{ padding:"4px 10px", borderRadius:20, border:`1px solid ${C.border}`,
                    background:"white", color:C.muted, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                  This {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap" }}>
              {["Salary","Refund","Other"].map(type=>{
                const sum = incomes.filter(i=>i.type===type).reduce((a,i)=>a+Number(i.amount),0);
                return (
                  <div key={type} style={{ padding:"6px 12px", borderRadius:8, background:C.greenLight, fontSize:12 }}>
                    <span style={{ color:C.muted }}>{type} </span>
                    <span style={{ fontWeight:700, color: sum>0?C.green:C.muted }}>{fmt(sum)}</span>
                  </div>
                );
              })}
            </div>
            {incomes.map(i=>(
              <div key={i.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"8px 10px", borderRadius:8, background:C.greenLight, marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14 }}>💼</span>
                  <span style={{ fontSize:13, fontWeight:500 }}>{i.type}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{ fontSize:14, fontWeight:700, color:C.green }}>{fmt(i.amount)}</span>
                  <button onClick={()=>openEdit("income",i,incomes.findIndex(x=>x.id===i.id))}
                    style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:12}}>✏️</button>
                  <button onClick={()=>{ if(confirm("Устгах уу?")) persist("fin_incomes",setIncomes,incomes.filter(x=>x.id!==i.id)); }}
                    style={{background:"none",border:"none",cursor:"pointer",color:C.red,fontSize:12}}>🗑</button>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Notes */}
        <Card style={{ marginTop:16 }}>
          <SectionHeader title={t.finNotes} icon="📝"/>
          <textarea value={notes} onChange={e=>{setNotes(e.target.value);save("fin_notes",e.target.value);}}
            placeholder="Тэмдэглэл..."
            style={{ width:"100%", minHeight:80, border:`1px solid ${C.border}`, borderRadius:8,
              padding:"10px 12px", fontSize:13, outline:"none", resize:"vertical",
              fontFamily:"inherit", color:C.text, boxSizing:"border-box" }}/>
        </Card>

        {/* Summary */}
        <Card style={{ marginTop:16 }}>
          <SectionHeader title={t.finSummary} icon="📈"/>
          <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
            {["year","Q1","Q2","Q3","Q4"].map(t=>(
              <button key={t} onClick={()=>setSummaryView(t)}
                style={{ padding:"4px 12px", borderRadius:20, border:`1px solid ${summaryView===t?C.green:C.border}`,
                  background:summaryView===t?C.greenLight:"white", color:summaryView===t?C.green:C.muted,
                  fontSize:11, fontWeight:600, cursor:"pointer" }}>
                {t==="year"?"This Year":t}
              </button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10 }}>
            {summaryData
              .filter((_,i)=>{
                if(summaryView==="Q1") return i<3;
                if(summaryView==="Q2") return i>=3&&i<6;
                if(summaryView==="Q3") return i>=6&&i<9;
                if(summaryView==="Q4") return i>=9;
                return true;
              })
              .map((m,i)=>(
              <div key={i} style={{ padding:"12px", borderRadius:10, background:C.greenLight }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                  <span style={{ fontSize:12 }}>🕐</span>
                  <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{m.month}</span>
                </div>
                <div style={{ fontSize:10, color:C.muted }}>Total Incomes</div>
                <div style={{ fontSize:13, fontWeight:700, color:C.green }}>{fmt(m.inc)}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>Total Expenses</div>
                <div style={{ fontSize:13, fontWeight:700, color:m.exp>0?C.red:C.muted }}>{fmt(m.exp)}</div>
                <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>Net</div>
                <div style={{ fontSize:13, fontWeight:700, color:m.net>=0?C.green:C.red }}>{fmt(m.net)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
