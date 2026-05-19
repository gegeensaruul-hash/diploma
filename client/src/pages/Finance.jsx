import { useState, useRef } from "react";
import { getUserStore, setUserStore } from "../utils/userStorage";
import { MdAccountBalanceWallet, MdTrendingUp, MdTrendingDown, MdPayments, MdHistory, MdEmojiEvents } from "react-icons/md";

// ── Helpers ──────────────────────────────────────────────
const store = getUserStore;
const save = setUserStore;
const fmt   = (n) => "$" + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const now = new Date();
const thisYear = now.getFullYear();
const thisMonth = now.getMonth();
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

// ── Color palette (Dark SaaS) ──────────────────────────────
const C = {
  bg: "#020617",
  card: "rgba(15, 23, 42, 0.4)",
  accent: "#6366f1",
  accentLight: "rgba(99, 102, 241, 0.15)",
  text: "#f8fafc",
  muted: "#94a3b8",
  border: "rgba(255, 255, 255, 0.08)",
  red: "#ef4444",
  green: "#10b981",
};

// ── Sub-components ────────────────────────────────────────

function SectionHeader({ title, icon }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
      <div style={{ width:32, height:32, borderRadius:8, background:C.accentLight, display:"flex", alignItems:"center", justifyContent:"center", color:C.accent }}>
        {icon}
      </div>
      <h3 style={{ fontSize:16, fontWeight:800, color:C.text, margin:0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h3>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div className="premium-card" style={{ background:C.card, backdropFilter: "blur(20px)", padding:24, ...style }}>
      {children}
    </div>
  );
}

function ProgressBar({ pct, color = C.accent }) {
  return (
    <div style={{ height:8, background:"rgba(255,255,255,0.05)", borderRadius:99, overflow:"hidden", marginTop:10 }}>
      <div style={{ width:`${Math.min(100,pct)}%`, height:"100%", background:color, borderRadius:99, transition:"width .6s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: `0 0 10px ${color}44` }}/>
    </div>
  );
}

export default function Finance() {
  const t = { finDesc:"Description", finBudget:"Budgeting", finAccounts:"Accounts", finSubs:"Subscriptions", finGoals:"Financial Goals", finNotes:"Notes", finSummary:"Monthly Summary", finEdit:"Edit", finExpense:"Expense", finIncome:"Income", finNew:"+ New", finActive:"Active", finPaused:"Paused", finThisYear:"This Year" };
  
  // Starting with empty states to avoid "different data" issues for new users
  const [budgets, setBudgets] = useState(() => store("fin_budgets", []));
  const [expenses, setExpenses] = useState(() => store("fin_expenses", []));
  const [incomes, setIncomes] = useState(() => store("fin_incomes", []));
  const [accounts, setAccounts] = useState(() => store("fin_accounts", [
    { id:1, name:"Main Account", balance:0, icon:"M" }
  ]));
  const [subs, setSubs] = useState(() => store("fin_subs", []));
  const [goals, setGoals] = useState(() => store("fin_goals", []));

  const [notes, setNotes] = useState(() => store("fin_notes", ""));
  const [editModal, setEditModal] = useState(null);
  const [eForm, setEForm] = useState({});
  const [qForm, setQForm] = useState({ name:"", amount:"", date:new Date().toISOString().slice(0,10), category:"General", account:"Main", type:"expense" });

  const persist = (key, setter, val) => { setter(val); save(key, val); };

  const totalIncome  = incomes.reduce((a,i) => a + Number(i.amount), 0);
  const totalExpense = expenses.reduce((a,e) => a + Number(e.amount), 0);
  const net = totalIncome - totalExpense;

  const addExpense = () => {
    if (!qForm.name || !qForm.amount) return;
    const e = { id:Date.now(), name:qForm.name, date:qForm.date, amount:+qForm.amount, category:qForm.category, account:qForm.account };
    persist("fin_expenses", setExpenses, [e, ...expenses]);
    setQForm(f=>({...f, name:"", amount:""}));
  };

  const addIncome = () => {
    if (!qForm.name || !qForm.amount) return;
    const i = { id:Date.now(), type:qForm.name, amount:+qForm.amount, date:qForm.date };
    persist("fin_incomes", setIncomes, [i, ...incomes]);
    setQForm(f=>({...f, name:"", amount:""}));
  };

  return (
    <div className="animate-in space-y-6">
      <style>{`
        .fin-input { 
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); 
          border-radius: 12px; padding: 10px 14px; color: #fff; font-size: 14px; outline: none; transition: all 0.2s;
        }
        .fin-input:focus { border-color: #6366f1; background: rgba(255,255,255,0.06); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        .fin-btn { 
          padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s;
          display: flex; align-items: center; gap: 8px; font-size: 13px;
        }
        .fin-btn-red { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .fin-btn-red:hover { background: rgba(239, 68, 68, 0.25); transform: translateY(-2px); }
        .fin-btn-green { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .fin-btn-green:hover { background: rgba(16, 185, 129, 0.25); transform: translateY(-2px); }
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-1px" }}>Finance Tracker</h2>
          <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>Manage your wealth with precision</p>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <div className="premium-card" style={{ padding: "12px 20px", display: "flex", flexDirection: "column", minWidth: 140 }}>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Monthly Net</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: net >= 0 ? C.green : C.red }}>{fmt(net)}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <input className="fin-input" style={{ flex: 2 }} placeholder="Description (e.g. Salary, Rent)" value={qForm.name} onChange={e=>setQForm(f=>({...f,name:e.target.value}))}/>
        <input className="fin-input" style={{ width: 120 }} type="number" placeholder="0.00" value={qForm.amount} onChange={e=>setQForm(f=>({...f,amount:e.target.value}))}/>
        <button className="fin-btn fin-btn-red" onClick={addExpense}><MdTrendingDown size={18}/> Expense</button>
        <button className="fin-btn fin-btn-green" onClick={addIncome}><MdTrendingUp size={18}/> Income</button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budgeting */}
        <Card>
          <SectionHeader title={t.finBudget} icon={<MdPayments size={18}/>}/>
          {budgets.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13, border: "1px dashed rgba(255,255,255,0.05)", borderRadius: 16 }}>
              No active budgets. Start tracking expenses to see your progress.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {budgets.map(b => {
                const pct = b.limit > 0 ? Math.round(b.spent / b.limit * 100) : 0;
                return (
                  <div key={b.id} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{b.name}</span>
                      <span style={{ fontSize:12, fontWeight:700, color: pct > 90 ? C.red : C.muted }}>{fmt(b.spent)}</span>
                    </div>
                    <ProgressBar pct={pct} color={pct > 90 ? C.red : C.accent}/>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Accounts & Goals */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card>
            <SectionHeader title={t.finAccounts} icon={<MdAccountBalanceWallet size={18}/>}/>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {accounts.map(a => (
                <div key={a.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding: 14, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accentLight, display: "flex", alignItems: "center", justifyContent: "center", color: C.accent, fontWeight: 800 }}>{a.name[0]}</div>
                    <span style={{ fontSize:14, fontWeight:600, color: "#fff" }}>{a.name}</span>
                  </div>
                  <span style={{ fontSize:16, fontWeight:800, color: a.balance < 0 ? C.red : "#fff" }}>{fmt(a.balance)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader title={t.finGoals} icon={<MdEmojiEvents size={18}/>}/>
            {goals.length === 0 ? (
              <div style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: 20 }}>No active financial goals yet.</div>
            ) : goals.map(g => {
              const pct = Math.round(g.saved / g.target * 100);
              return (
                <div key={g.id}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{g.name}</span>
                    <span style={{ fontSize:13, color:C.muted }}>{fmt(g.saved)} / {fmt(g.target)}</span>
                  </div>
                  <ProgressBar pct={pct} color={C.green}/>
                </div>
              );
            })}
          </Card>
        </div>
      </div>

      {/* History */}
      <Card>
        <SectionHeader title="Recent Transactions" icon={<MdHistory size={18}/>}/>
        <div style={{ overflowX: "auto" }}>
          {expenses.length === 0 && incomes.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: C.muted }}>No recent activity to show.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <th style={{ textAlign: "left", padding: "12px", fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Transaction</th>
                  <th style={{ textAlign: "left", padding: "12px", fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Date</th>
                  <th style={{ textAlign: "right", padding: "12px", fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "16px 12px", fontSize: 14, fontWeight: 600, color: "#fff" }}>{e.name}</td>
                    <td style={{ padding: "16px 12px", fontSize: 13, color: "#64748b" }}>{e.date}</td>
                    <td style={{ padding: "16px 12px", textAlign: "right", fontSize: 15, fontWeight: 800, color: C.red }}>-{fmt(e.amount)}</td>
                  </tr>
                ))}
                {incomes.map(i => (
                  <tr key={i.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                    <td style={{ padding: "16px 12px", fontSize: 14, fontWeight: 600, color: "#fff" }}>{i.type}</td>
                    <td style={{ padding: "16px 12px", fontSize: 13, color: "#64748b" }}>{i.date}</td>
                    <td style={{ padding: "16px 12px", textAlign: "right", fontSize: 15, fontWeight: 800, color: C.green }}>+{fmt(i.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
