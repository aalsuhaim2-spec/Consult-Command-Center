import { useState, useEffect, createContext, useContext } from "react";

const AMH = { green: "#1A5C38", light: "#D4EDE0", pale: "#F0F9F4", mid: "#2d7a50" };

const KFSH_SERVICES = [
  "Cardiology","Nephrology","Neurology","Hematology / Oncology",
  "Gastroenterology","Endocrinology","Rheumatology","Pulmonology",
  "Infectious Disease","Dermatology","Ophthalmology","ENT",
  "Orthopedic Surgery","Vascular Surgery","Neurosurgery","Plastic Surgery",
  "Urology","Psychiatry","Critical Care","Interventional Radiology",
  "Pathology","Other"
];

const NO_TRANSFER_REASONS = [
  "Patient clinically stable – phone guidance sufficient",
  "Patient / family declined transfer",
  "Transfer risk outweighs benefit",
  "Condition manageable locally with specialist input",
  "Awaiting further workup before transfer decision",
  "Insurance / administrative barrier",
  "Patient already improving on current management",
  "Other"
];

const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

const store = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

const SEED_USERS = [
  { id: "admin-1", email: "admin@almather.com", password: "Admin@123", fullName: "Abdullah Al-Harbi", department: "Internal Medicine", role: "admin", status: "approved" },
];

function initStorage() {
  if (!store.get("ccc_users")) store.set("ccc_users", SEED_USERS);
  if (!store.get("ccc_consults")) store.set("ccc_consults", []);
  if (!store.get("ccc_requests")) store.set("ccc_requests", []);
}

export default function App() {
  useEffect(() => initStorage(), []);
  const [currentUser, setCurrentUser] = useState(() => store.get("ccc_session"));
  const [page, setPage] = useState("landing");

  useEffect(() => {
    if (currentUser) {
      store.set("ccc_session", currentUser);
      setPage(currentUser.role === "admin" ? "admin_dashboard" : "doctor_dashboard");
    } else {
      store.set("ccc_session", null);
    }
  }, [currentUser]);

  function logout() { setCurrentUser(null); setPage("landing"); }

  return (
    <AuthCtx.Provider value={{ currentUser, setCurrentUser, logout }}>
      <GlobalStyles />
      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "login" && <LoginPage setPage={setPage} />}
      {page === "register" && <RegisterPage setPage={setPage} />}
      {page === "request_access" && <RequestAccessPage setPage={setPage} />}
      {page === "pending" && <PendingPage logout={logout} />}
      {page === "doctor_dashboard" && currentUser && <DoctorDashboard setPage={setPage} />}
      {page === "admin_dashboard" && currentUser && <AdminDashboard setPage={setPage} />}
    </AuthCtx.Provider>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'DM Sans', sans-serif; background: ${AMH.pale}; color: #1a1a1a; }
      input, select, textarea, button { font-family: 'DM Sans', sans-serif; }
      ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${AMH.light}; border-radius: 4px; }
      input, select, textarea {
        width: 100%; padding: 10px 14px; border: 1.5px solid #c8ddd4;
        border-radius: 8px; background: #fff; font-size: 14px; color: #1a1a1a;
        outline: none; transition: border 0.2s, box-shadow 0.2s;
      }
      input:focus, select:focus, textarea:focus {
        border-color: ${AMH.green}; box-shadow: 0 0 0 3px ${AMH.light};
      }
      textarea { resize: vertical; }
      a { color: ${AMH.green}; text-decoration: none; }
      @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      .fade-up { animation: fadeUp 0.4s ease both; }
      .fade-up-1 { animation: fadeUp 0.4s 0.1s ease both; }
      .fade-up-2 { animation: fadeUp 0.4s 0.2s ease both; }
      .fade-up-3 { animation: fadeUp 0.4s 0.3s ease both; }
      .hover-row:hover { background: ${AMH.pale} !important; cursor: pointer; }
      .btn-primary {
        background: ${AMH.green}; color: #fff; border: none; padding: 11px 28px;
        border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
        transition: background 0.2s, transform 0.1s; letter-spacing: 0.02em;
      }
      .btn-primary:hover { background: ${AMH.mid}; }
      .btn-primary:active { transform: scale(0.98); }
      .btn-ghost {
        background: transparent; color: ${AMH.green}; border: 1.5px solid ${AMH.green};
        padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;
        cursor: pointer; transition: all 0.2s;
      }
      .btn-ghost:hover { background: ${AMH.pale}; }
      .btn-danger {
        background: #fee2e2; color: #dc2626; border: none; padding: 8px 18px;
        border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s;
      }
      .btn-danger:hover { background: #fecaca; }
      .btn-success {
        background: #dcfce7; color: #16a34a; border: none; padding: 8px 18px;
        border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s;
      }
      .btn-success:hover { background: #bbf7d0; }
      .card { background: #fff; border-radius: 14px; border: 1px solid ${AMH.light}; }
      .mono { font-family: 'DM Mono', monospace; }
      .label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #888; margin-bottom: 5px; }
      .pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-family: 'DM Mono', monospace; font-weight: 500; }
      .section-title { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: ${AMH.green}; padding-bottom: 8px; border-bottom: 1px solid ${AMH.light}; margin-bottom: 16px; }
    `}</style>
  );
}

function TopBar({ tabs, activeTab, setActiveTab }) {
  const { currentUser, logout } = useAuth();
  return (
    <div style={{ background: AMH.green, boxShadow: "0 2px 20px rgba(26,92,56,0.3)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 38, height: 38, background: "rgba(255,255,255,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚕</div>
            <div>
              <div style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 800, lineHeight: 1.1 }}>Consult Command Center</div>
              <div style={{ color: AMH.light, fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>AL-MAATHAR HOSPITAL · AMH→KFSH-R</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{currentUser?.fullName}</div>
              <div style={{ color: AMH.light, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                <RoleBadge role={currentUser?.role} small />
              </div>
            </div>
            <button onClick={logout} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em" }}>
              SIGN OUT
            </button>
          </div>
        </div>
        {tabs && (
          <div style={{ display: "flex", gap: 2 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                background: "none", border: "none", cursor: "pointer", padding: "12px 20px",
                color: activeTab === t.id ? "#fff" : "rgba(255,255,255,0.6)",
                fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.08em",
                borderBottom: activeTab === t.id ? "2.5px solid #fff" : "2.5px solid transparent",
                fontWeight: activeTab === t.id ? 600 : 400, transition: "all 0.15s",
              }}>{t.label}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LandingPage({ setPage }) {
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${AMH.green} 0%, #0f3d23 60%, #071f12 100%)`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px 40px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 42, height: 42, background: "rgba(255,255,255,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚕</div>
        <div>
          <div style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800 }}>Consult Command Center</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em" }}>AL-MAATHAR HOSPITAL</div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 600 }}>
          <div className="fade-up" style={{ color: AMH.light, fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.18em", marginBottom: 20 }}>
            AMH → KFSH-R RIYADH · TELECONSULTATION REGISTRY
          </div>
          <h1 className="fade-up-1" style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>
            Every Consult.<br />Tracked. Justified.<br />Analyzed.
          </h1>
          <p className="fade-up-2" style={{ color: "rgba(255,255,255,0.65)", fontSize: 17, lineHeight: 1.7, marginBottom: 44 }}>
            A secure platform for Al-Maathar Hospital physicians to log outbound consultations to King Faisal Specialist Hospital, track outcomes, and generate strategic hiring insights.
          </p>
          <div className="fade-up-3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => setPage("login")} style={{ padding: "14px 40px", fontSize: 15 }}>Sign In →</button>
            <button className="btn-ghost" onClick={() => setPage("request_access")} style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff", padding: "14px 40px", fontSize: 15 }}>Request Access</button>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "32px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {[
            ["🔐", "Role-Based Access", "Doctors submit. Admins oversee. Viewers analyze."],
            ["📋", "Full Consult Audit", "Capture reason, justification, no-transfer rationale, and response quality."],
            ["📊", "Strategic Analytics", "Identify which services are consulted most — build the case to hire in-house."],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{title}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginPage({ setPage }) {
  const { setCurrentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    setError(""); setLoading(true);
    setTimeout(() => {
      const users = store.get("ccc_users") || [];
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) { setError("Invalid email or password."); setLoading(false); return; }
      if (user.status === "pending") { setCurrentUser(user); setPage("pending"); setLoading(false); return; }
      if (user.status === "rejected") { setError("Your access request was not approved."); setLoading(false); return; }
      setCurrentUser(user);
      setLoading(false);
    }, 600);
  }

  return (
    <AuthFormShell title="Welcome back" subtitle="Sign in to Consult Command Center" setPage={setPage} showBack>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormField label="Email Address">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@almather.com" onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </FormField>
        <FormField label="Password">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </FormField>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <button className="btn-primary" onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "13px", marginTop: 4 }}>
          {loading ? "Signing in…" : "Sign In →"}
        </button>
        <div style={{ textAlign: "center", fontSize: 13, color: "#888", marginTop: 4 }}>
          Don't have access?{" "}
          <span style={{ color: AMH.green, cursor: "pointer", fontWeight: 600 }} onClick={() => setPage("request_access")}>Request Access</span>
        </div>
      </div>
    </AuthFormShell>
  );
}

function RequestAccessPage({ setPage }) {
  const [form, setForm] = useState({ fullName: "", email: "", department: "", reason: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!form.fullName || !form.email || !form.department) { setError("Please fill all required fields."); return; }
    const requests = store.get("ccc_requests") || [];
    if (requests.find(r => r.email === form.email)) { setError("A request with this email already exists."); return; }
    const newReq = { id: `req-${Date.now()}`, ...form, status: "pending", createdAt: new Date().toISOString() };
    store.set("ccc_requests", [newReq, ...requests]);
    setDone(true);
  }

  if (done) return (
    <AuthFormShell title="Request Submitted" subtitle="The administrator will review your request" setPage={setPage} showBack>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <p style={{ color: "#555", lineHeight: 1.7 }}>Your request has been sent. You will be contacted once approved.</p>
        <button className="btn-primary" onClick={() => setPage("landing")} style={{ marginTop: 24, width: "100%" }}>Back to Home</button>
      </div>
    </AuthFormShell>
  );

  return (
    <AuthFormShell title="Request Access" subtitle="Submit your details — admin approval required" setPage={setPage} showBack>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormField label="Full Name *"><input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Dr. Name Al-Surname" /></FormField>
        <FormField label="Email Address *"><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@almather.com" /></FormField>
        <FormField label="Department *">
          <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
            <option value="">— Select Department —</option>
            {["Internal Medicine","ICU","Surgery","Pediatrics","OB & Gynecology","Emergency","Cardiology","Orthopedics","Other"].map(d => <option key={d}>{d}</option>)}
          </select>
        </FormField>
        <FormField label="Why do you need access?">
          <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3} placeholder="Brief reason…" />
        </FormField>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <button className="btn-primary" onClick={handleSubmit} style={{ width: "100%", padding: "13px" }}>Submit Request →</button>
        <div style={{ textAlign: "center", fontSize: 13, color: "#888" }}>
          Already have an account?{" "}
          <span style={{ color: AMH.green, cursor: "pointer", fontWeight: 600 }} onClick={() => setPage("login")}>Sign In</span>
        </div>
      </div>
    </AuthFormShell>
  );
}

function RegisterPage({ setPage }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", department: "", role: "doctor" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  if (!currentUser || currentUser.role !== "admin") return null;

  function handleCreate() {
    if (!form.fullName || !form.email || !form.password) { setError("All fields required."); return; }
    const users = store.get("ccc_users") || [];
    if (users.find(u => u.email === form.email)) { setError("Email already exists."); return; }
    const newUser = { id: `user-${Date.now()}`, ...form, status: "approved", createdAt: new Date().toISOString() };
    store.set("ccc_users", [...users, newUser]);
    setDone(true);
  }

  if (done) return (
    <AuthFormShell title="Account Created" subtitle="" setPage={setPage} showBack>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <p style={{ color: "#555" }}>Account for <strong>{form.fullName}</strong> created successfully.</p>
        <button className="btn-primary" onClick={() => setPage("admin_dashboard")} style={{ marginTop: 24, width: "100%" }}>Back to Dashboard</button>
      </div>
    </AuthFormShell>
  );

  return (
    <AuthFormShell title="Create Account" subtitle="Add a new user to the platform" setPage={setPage} showBack>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormField label="Full Name *"><input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Dr. Name Al-Surname" /></FormField>
        <FormField label="Email *"><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@almather.com" /></FormField>
        <FormField label="Temporary Password *"><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Set a strong password" /></FormField>
        <FormField label="Department">
          <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
            <option value="">— Select —</option>
            {["Internal Medicine","ICU","Surgery","Pediatrics","OB & Gynecology","Emergency","Cardiology","Other"].map(d => <option key={d}>{d}</option>)}
          </select>
        </FormField>
        <FormField label="Role">
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="doctor">Doctor</option>
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <button className="btn-primary" onClick={handleCreate} style={{ width: "100%", padding: "13px" }}>Create Account →</button>
      </div>
    </AuthFormShell>
  );
}

function PendingPage({ logout }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: AMH.pale }}>
      <div className="card fade-up" style={{ padding: 40, maxWidth: 420, width: "90%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: AMH.green, marginBottom: 12 }}>Access Pending</h2>
        <p style={{ color: "#666", lineHeight: 1.7 }}>Your account is awaiting administrator approval.</p>
        <button className="btn-ghost" onClick={logout} style={{ marginTop: 24, width: "100%" }}>Sign Out</button>
      </div>
    </div>
  );
}

function DoctorDashboard({ setPage }) {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState("new");
  const [consults, setConsults] = useState(() => {
    const all = store.get("ccc_consults") || [];
    return all.filter(c => c.doctorId === currentUser?.id);
  });
  const [viewConsult, setViewConsult] = useState(null);

  const refresh = () => {
    const all = store.get("ccc_consults") || [];
    setConsults(all.filter(c => c.doctorId === currentUser?.id));
  };

  const TABS = [
    { id: "new", label: "NEW CONSULT" },
    { id: "my_consults", label: `MY CONSULTS (${consults.length})` },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <TopBar tabs={TABS} activeTab={tab} setActiveTab={setTab} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "new" && <ConsultForm currentUser={currentUser} onSaved={() => { refresh(); setTab("my_consults"); }} />}
        {tab === "my_consults" && <ConsultLog consults={consults} onView={setViewConsult} onStatusChange={(id, status) => {
          const all = store.get("ccc_consults") || [];
          store.set("ccc_consults", all.map(c => c.id === id ? { ...c, status } : c));
          refresh();
        }} />}
      </div>
      {viewConsult && <ConsultDetailOverlay consult={viewConsult} onClose={() => setViewConsult(null)} onStatusChange={(id, status) => {
        const all = store.get("ccc_consults") || [];
        store.set("ccc_consults", all.map(c => c.id === id ? { ...c, status } : c));
        refresh();
        setViewConsult(v => ({ ...v, status }));
      }} />}
    </div>
  );
}

function AdminDashboard({ setPage }) {
  const [tab, setTab] = useState("overview");
  const [viewConsult, setViewConsult] = useState(null);
  const [tick, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);

  const allConsults = store.get("ccc_consults") || [];
  const allRequests = (store.get("ccc_requests") || []).filter(r => r.status === "pending");

  const TABS = [
    { id: "overview", label: "OVERVIEW" },
    { id: "all_consults", label: `ALL CONSULTS (${allConsults.length})` },
    { id: "analytics", label: "ANALYTICS" },
    { id: "requests", label: `ACCESS REQUESTS${allRequests.length > 0 ? ` (${allRequests.length})` : ""}` },
    { id: "users", label: "USERS" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <TopBar tabs={TABS} activeTab={tab} setActiveTab={t => { setTab(t); refresh(); }} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {tab === "overview" && <AdminOverview consults={allConsults} requests={allRequests} setTab={setTab} />}
        {tab === "all_consults" && <ConsultLog consults={allConsults} onView={setViewConsult} admin onStatusChange={(id, status) => {
          const all = store.get("ccc_consults") || [];
          store.set("ccc_consults", all.map(c => c.id === id ? { ...c, status } : c));
          refresh();
        }} />}
        {tab === "analytics" && <Analytics consults={allConsults} />}
        {tab === "requests" && <AccessRequests refresh={refresh} />}
        {tab === "users" && <UserManager refresh={refresh} />}
      </div>
      {viewConsult && <ConsultDetailOverlay consult={viewConsult} onClose={() => setViewConsult(null)} admin onStatusChange={(id, status) => {
        const all = store.get("ccc_consults") || [];
        store.set("ccc_consults", all.map(c => c.id === id ? { ...c, status } : c));
        refresh();
        setViewConsult(v => ({ ...v, status }));
      }} />}
    </div>
  );
}

function AdminOverview({ consults, requests, setTab }) {
  const open = consults.filter(c => c.status === "Open").length;
  const inProg = consults.filter(c => c.status === "In Progress").length;
  const closed = consults.filter(c => c.status === "Closed").length;
  const topService = (() => {
    const counts = {};
    consults.forEach(c => { counts[c.consultedService] = (counts[c.consultedService] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0] : "—";
  })();

  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: AMH.green, marginBottom: 6 }}>Command Overview</h2>
      <p style={{ color: "#888", marginBottom: 28, fontSize: 14 }}>Real-time summary of all teleconsultation activity at AMH.</p>
      {requests.length > 0 && (
        <div onClick={() => setTab("requests")} style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "14px 20px", marginBottom: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔔</span>
            <span style={{ fontWeight: 600, color: "#92400e" }}>{requests.length} pending access request{requests.length > 1 ? "s" : ""} awaiting your review</span>
          </div>
          <span style={{ color: "#92400e", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>REVIEW →</span>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Consults", value: consults.length, color: AMH.green },
          { label: "Open", value: open, color: "#3b82f6" },
          { label: "In Progress", value: inProg, color: "#f59e0b" },
          { label: "Closed", value: closed, color: "#22c55e" },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: "20px", borderTop: `3px solid ${k.color}` }}>
            <div className="label">{k.label}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: k.color, lineHeight: 1, marginTop: 4 }}>{k.value}</div>
          </div>
        ))}
      </div>
      {consults.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <div className="section-title">Top Consulted Service</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: AMH.green }}>{topService}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Consider in-house recruitment</div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div className="section-title">Consult Closure Rate</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: AMH.green }}>{consults.length ? Math.round((closed / consults.length) * 100) : 0}%</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{closed} of {consults.length} consults closed</div>
          </div>
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = {
  mrn: "", patientName: "", age: "", gender: "Male",
  consultedService: "", kfshReceiver: "", reasonForConsult: "", clinicalJustification: "",
  noTransferReason: "", noTransferJustification: "",
  responseType: "Phone", responseAdequate: "Yes", followUpRequired: "No", followUpNotes: "",
  subConsultRequired: "No", subConsultService: "", subConsultJustification: "",
  status: "Open", date: new Date().toISOString().split("T")[0]
};

function ConsultForm({ currentUser, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function handleSave() {
    if (!form.mrn || !form.consultedService || !form.reasonForConsult) {
      setError("Please fill required fields: MRN, Consulted Service, and Reason."); return;
    }
    const record = { id: `c-${Date.now()}`, ...form, doctorId: currentUser.id, doctorName: currentUser.fullName, doctorDept: currentUser.department, createdAt: new Date().toISOString() };
    const all = store.get("ccc_consults") || [];
    store.set("ccc_consults", [record, ...all]);
    setSaved(true);
    setTimeout(() => { setSaved(false); setForm(EMPTY_FORM); onSaved(); }, 1000);
  }

  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: AMH.green, marginBottom: 4 }}>New Teleconsultation</h2>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 28 }}>AMH → KFSH-R Riyadh · Fields marked * are required</p>
      {saved && <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#15803d", fontWeight: 600 }}>✓ Consult saved successfully.</div>}
      {error && <ErrorMsg onClose={() => setError("")}>{error}</ErrorMsg>}
      <FormSection title="Patient & Requesting Physician">
        <Grid2>
          <FormField label="MRN *"><input value={form.mrn} onChange={e => set("mrn", e.target.value)} placeholder="e.g. 123456" /></FormField>
          <FormField label="Patient Name"><input value={form.patientName} onChange={e => set("patientName", e.target.value)} placeholder="Optional" /></FormField>
          <FormField label="Age"><input value={form.age} onChange={e => set("age", e.target.value)} placeholder="Years" /></FormField>
          <FormField label="Gender"><select value={form.gender} onChange={e => set("gender", e.target.value)}><option>Male</option><option>Female</option></select></FormField>
          <FormField label="Consult Date *"><input type="date" value={form.date} onChange={e => set("date", e.target.value)} /></FormField>
          <FormField label="Submitting Physician"><input value={currentUser.fullName} disabled style={{ background: AMH.pale, color: "#555" }} /></FormField>
        </Grid2>
      </FormSection>
      <FormSection title="Consult Details">
        <Grid2>
          <FormField label="KFSH-R Service Consulted *">
            <select value={form.consultedService} onChange={e => set("consultedService", e.target.value)}>
              <option value="">— Select Service —</option>
              {KFSH_SERVICES.map(s => <option key={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="KFSH-R Receiver"><input value={form.kfshReceiver} onChange={e => set("kfshReceiver", e.target.value)} placeholder="Who received the consult" /></FormField>
        </Grid2>
        <FormField label="Reason for Consult *"><textarea value={form.reasonForConsult} onChange={e => set("reasonForConsult", e.target.value)} rows={3} placeholder="Primary clinical question…" /></FormField>
        <FormField label="Clinical Justification"><textarea value={form.clinicalJustification} onChange={e => set("clinicalJustification", e.target.value)} rows={3} placeholder="Relevant history, findings, investigations…" /></FormField>
      </FormSection>
      <FormSection title="Why Patient Was NOT Transferred">
        <FormField label="Primary Reason">
          <select value={form.noTransferReason} onChange={e => set("noTransferReason", e.target.value)}>
            <option value="">— Select Reason —</option>
            {NO_TRANSFER_REASONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </FormField>
        <FormField label="Additional Justification"><textarea value={form.noTransferJustification} onChange={e => set("noTransferJustification", e.target.value)} rows={2} placeholder="Elaborate…" /></FormField>
      </FormSection>
      <FormSection title="Consult Response & Outcome">
        <Grid2>
          <FormField label="Response Type">
            <select value={form.responseType} onChange={e => set("responseType", e.target.value)}>
              {["Phone","Video Call","Written Report","In-Person Visit","Pending"].map(o => <option key={o}>{o}</option>)}
            </select>
          </FormField>
          <FormField label="Phone Consult Adequate?">
            <select value={form.responseAdequate} onChange={e => set("responseAdequate", e.target.value)}><option>Yes</option><option>No</option><option>N/A</option></select>
          </FormField>
          <FormField label="Follow-Up Required?">
            <select value={form.followUpRequired} onChange={e => set("followUpRequired", e.target.value)}><option>No</option><option>Yes</option></select>
          </FormField>
          <FormField label="Consult Status">
            <select value={form.status} onChange={e => set("status", e.target.value)}><option>Open</option><option>In Progress</option><option>Closed</option></select>
          </FormField>
        </Grid2>
        {form.followUpRequired === "Yes" && <FormField label="Follow-Up Notes"><textarea value={form.followUpNotes} onChange={e => set("followUpNotes", e.target.value)} rows={2} /></FormField>}
      </FormSection>
      <FormSection title="Sub-Consult (if applicable)">
        <FormField label="Requires consulting another KFSH-R service?">
          <select value={form.subConsultRequired} onChange={e => set("subConsultRequired", e.target.value)}><option value="No">No</option><option value="Yes">Yes</option></select>
        </FormField>
        {form.subConsultRequired === "Yes" && (
          <Grid2>
            <FormField label="Sub-Consult Service">
              <select value={form.subConsultService} onChange={e => set("subConsultService", e.target.value)}>
                <option value="">— Select —</option>
                {KFSH_SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
            <div />
            <div style={{ gridColumn: "1/-1" }}>
              <FormField label="Sub-Consult Justification"><textarea value={form.subConsultJustification} onChange={e => set("subConsultJustification", e.target.value)} rows={2} /></FormField>
            </div>
          </Grid2>
        )}
      </FormSection>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button className="btn-primary" onClick={handleSave} style={{ padding: "13px 40px", fontSize: 15 }}>Submit Consult →</button>
      </div>
    </div>
  );
}

function ConsultLog({ consults, onView, onStatusChange, admin }) {
  const [filterService, setFilterService] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = consults.filter(c =>
    (filterService === "All" || c.consultedService === filterService) &&
    (filterStatus === "All" || c.status === filterStatus) &&
    (!search || c.mrn.includes(search) || c.doctorName?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fade-up">
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="label">Search MRN / Doctor</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" />
        </div>
        <div style={{ minWidth: 180 }}>
          <div className="label">Filter by Service</div>
          <select value={filterService} onChange={e => setFilterService(e.target.value)}>
            <option>All</option>{KFSH_SERVICES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ minWidth: 150 }}>
          <div className="label">Filter by Status</div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option>All</option><option>Open</option><option>In Progress</option><option>Closed</option>
          </select>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#888", paddingBottom: 10 }}>{filtered.length} records</div>
      </div>
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center", color: "#aaa", fontStyle: "italic" }}>No consults found.</div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: admin ? "90px 100px 1fr 1fr 110px 100px 90px" : "90px 100px 1fr 110px 100px 90px", padding: "10px 16px", background: AMH.green, color: AMH.light, fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", gap: 8 }}>
            <div>DATE</div><div>MRN</div>{admin && <div>DOCTOR</div>}<div>SERVICE</div><div>RESPONSE</div><div>STATUS</div><div></div>
          </div>
          {filtered.map((c, i) => (
            <div key={c.id} className="hover-row" style={{ display: "grid", gridTemplateColumns: admin ? "90px 100px 1fr 1fr 110px 100px 90px" : "90px 100px 1fr 110px 100px 90px", padding: "13px 16px", borderBottom: `1px solid ${AMH.light}`, background: i % 2 === 0 ? "#fff" : AMH.pale, alignItems: "center", gap: 8 }} onClick={() => onView(c)}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#888" }}>{c.date}</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{c.mrn}</div>
              {admin && <div style={{ fontSize: 12, color: "#555" }}>{c.doctorName}</div>}
              <div style={{ fontSize: 13, color: AMH.green, fontWeight: 500 }}>{c.consultedService}</div>
              <div><span className="pill" style={{ background: "#dbeafe", color: "#1e40af" }}>{c.responseType}</span></div>
              <div><StatusPill status={c.status} /></div>
              <div onClick={e => e.stopPropagation()}>
                <select value={c.status} onChange={e => onStatusChange(c.id, e.target.value)} style={{ padding: "4px 8px", fontSize: 11, fontFamily: "'DM Mono', monospace", width: "auto", border: `1px solid ${AMH.light}` }}>
                  <option>Open</option><option>In Progress</option><option>Closed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Analytics({ consults }) {
  const serviceCounts = (() => { const c = {}; consults.forEach(r => { c[r.consultedService] = (c[r.consultedService] || 0) + 1; }); return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 10); })();
  const noTransferCounts = (() => { const c = {}; consults.forEach(r => { if (r.noTransferReason) c[r.noTransferReason] = (c[r.noTransferReason] || 0) + 1; }); return Object.entries(c).sort((a, b) => b[1] - a[1]); })();
  const doctorCounts = (() => { const c = {}; consults.forEach(r => { c[r.doctorName] = (c[r.doctorName] || 0) + 1; }); return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 6); })();
  const closed = consults.filter(c => c.status === "Closed").length;

  if (consults.length === 0) return <div className="card fade-up" style={{ padding: 60, textAlign: "center", color: "#aaa", fontStyle: "italic" }}>No data yet.</div>;

  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: AMH.green, marginBottom: 4 }}>Strategic Analytics</h2>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 28 }}>Use these insights to identify in-house hiring opportunities.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total", value: consults.length, color: AMH.green },
          { label: "Open", value: consults.filter(c => c.status === "Open").length, color: "#3b82f6" },
          { label: "In Progress", value: consults.filter(c => c.status === "In Progress").length, color: "#f59e0b" },
          { label: "Closed", value: closed, color: "#22c55e" },
          { label: "Sub-Consults", value: consults.filter(c => c.subConsultRequired === "Yes").length, color: "#f87171" },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: "16px", borderTop: `3px solid ${k.color}` }}>
            <div className="label">{k.label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="section-title">Most Consulted Services ⚑ Hiring Signal</div>
          <p style={{ fontSize: 12, color: "#888", marginBottom: 16, fontStyle: "italic" }}>High volume = candidate for in-house recruitment.</p>
          {serviceCounts.map(([svc, count], i) => (
            <div key={svc} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 13 }}>
                <span style={{ fontWeight: i === 0 ? 700 : 500, color: i === 0 ? AMH.green : "#333" }}>{i === 0 ? "⚑ " : `${i + 1}. `}{svc}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: AMH.green }}>{count}</span>
              </div>
              <div style={{ background: AMH.light, borderRadius: 4, height: 7, overflow: "hidden" }}>
                <div style={{ height: "100%", background: i === 0 ? AMH.green : "#86c3a2", width: `${(count / serviceCounts[0][1]) * 100}%`, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div className="section-title">No-Transfer Reasons</div>
          {noTransferCounts.map(([reason, count]) => (
            <div key={reason} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${AMH.pale}`, fontSize: 12 }}>
              <span style={{ color: "#555", flex: 1, paddingRight: 12, lineHeight: 1.4 }}>{reason}</span>
              <span className="pill" style={{ background: AMH.light, color: AMH.green }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="section-title">Consults by Doctor</div>
          {doctorCounts.map(([doc, count]) => (
            <div key={doc} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${AMH.pale}`, fontSize: 13 }}>
              <span>{doc}</span>
              <span className="pill" style={{ background: AMH.light, color: AMH.green }}>{count}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div className="section-title">Response Quality</div>
          {[
            ["Phone consults", consults.filter(c => c.responseType === "Phone").length, consults.length],
            ["Phone adequate", consults.filter(c => c.responseAdequate === "Yes").length, consults.filter(c => c.responseType === "Phone").length],
            ["Follow-up required", consults.filter(c => c.followUpRequired === "Yes").length, consults.length],
            ["Sub-consult triggered", consults.filter(c => c.subConsultRequired === "Yes").length, consults.length],
          ].map(([label, num, denom]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span>{label}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", color: AMH.green }}>{num} / {denom}</span>
              </div>
              <div style={{ background: AMH.light, borderRadius: 4, height: 7 }}>
                <div style={{ height: "100%", background: AMH.green, width: denom ? `${(num / denom) * 100}%` : "0%", borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AccessRequests({ refresh }) {
  const [requests, setRequests] = useState(() => store.get("ccc_requests") || []);
  const [creating, setCreating] = useState(null);

  function refreshRequests() { setRequests(store.get("ccc_requests") || []); refresh(); }

  function handleReject(reqId) {
    const all = store.get("ccc_requests") || [];
    store.set("ccc_requests", all.map(r => r.id === reqId ? { ...r, status: "rejected" } : r));
    refreshRequests();
  }

  function handleCreateAccount(req, role, password) {
    const users = store.get("ccc_users") || [];
    if (users.find(u => u.email === req.email)) { alert("User already exists."); return; }
    store.set("ccc_users", [...users, { id: `user-${Date.now()}`, fullName: req.fullName, email: req.email, password, department: req.department, role, status: "approved", createdAt: new Date().toISOString() }]);
    const all = store.get("ccc_requests") || [];
    store.set("ccc_requests", all.map(r => r.id === req.id ? { ...r, status: "approved" } : r));
    setCreating(null);
    refreshRequests();
  }

  const pending = requests.filter(r => r.status === "pending");
  const handled = requests.filter(r => r.status !== "pending");

  if (creating) return <CreateAccountFromRequest req={creating} onSave={handleCreateAccount} onCancel={() => setCreating(null)} />;

  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: AMH.green, marginBottom: 24 }}>Access Requests</h2>
      <div className="section-title">Pending Review ({pending.length})</div>
      {pending.length === 0 ? <div className="card" style={{ padding: 32, textAlign: "center", color: "#aaa", marginBottom: 24 }}>No pending requests.</div>
        : pending.map(req => (
          <div key={req.id} className="card" style={{ padding: 20, marginBottom: 12, display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{req.fullName}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#888", marginBottom: 4 }}>{req.email} · {req.department}</div>
              {req.reason && <div style={{ fontSize: 13, color: "#666", background: AMH.pale, padding: "6px 10px", borderRadius: 6 }}>"{req.reason}"</div>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-success" onClick={() => setCreating(req)}>✓ Approve</button>
              <button className="btn-danger" onClick={() => handleReject(req.id)}>✗ Reject</button>
            </div>
          </div>
        ))}
      {handled.length > 0 && <>
        <div className="section-title" style={{ marginTop: 28 }}>Previously Handled</div>
        {handled.map(req => (
          <div key={req.id} style={{ padding: "10px 16px", borderBottom: `1px solid ${AMH.light}`, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span>{req.fullName} <span style={{ color: "#888" }}>— {req.email}</span></span>
            <StatusPill status={req.status === "approved" ? "Closed" : "Open"} label={req.status === "approved" ? "Approved" : "Rejected"} />
          </div>
        ))}
      </>}
    </div>
  );
}

function CreateAccountFromRequest({ req, onSave, onCancel }) {
  const [role, setRole] = useState("doctor");
  const [password, setPassword] = useState("");
  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: AMH.green, marginBottom: 6 }}>Approve & Create Account</h2>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>For: <strong>{req.fullName}</strong> ({req.email})</p>
      <div className="card" style={{ padding: 24, maxWidth: 500 }}>
        <FormField label="Assign Role">
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="doctor">Doctor — submit consults, view own records</option>
            <option value="viewer">Viewer — read-only, analytics access</option>
            <option value="admin">Admin — full access</option>
          </select>
        </FormField>
        <div style={{ marginTop: 16 }}>
          <FormField label="Set Temporary Password *">
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="They will use this to sign in" />
          </FormField>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button className="btn-primary" onClick={() => { if (!password) { alert("Set a password."); return; } onSave(req, role, password); }} style={{ flex: 1 }}>Create Account →</button>
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function UserManager({ refresh }) {
  const [users, setUsers] = useState(() => (store.get("ccc_users") || []).filter(u => u.role !== "admin"));

  function changeRole(id, newRole) {
    const all = store.get("ccc_users") || [];
    store.set("ccc_users", all.map(u => u.id === id ? { ...u, role: newRole } : u));
    setUsers((store.get("ccc_users") || []).filter(u => u.role !== "admin"));
    refresh();
  }

  function removeUser(id) {
    if (!window.confirm("Remove this user?")) return;
    const all = store.get("ccc_users") || [];
    store.set("ccc_users", all.filter(u => u.id !== id));
    setUsers((store.get("ccc_users") || []).filter(u => u.role !== "admin"));
    refresh();
  }

  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: AMH.green, marginBottom: 24 }}>User Management</h2>
      {users.length === 0 ? <div className="card" style={{ padding: 48, textAlign: "center", color: "#aaa" }}>No users yet.</div> : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 120px 80px", padding: "10px 16px", background: AMH.green, color: AMH.light, fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", gap: 12 }}>
            <div>NAME</div><div>EMAIL</div><div>DEPT</div><div>ROLE</div><div></div>
          </div>
          {users.map((u, i) => (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 120px 80px", padding: "13px 16px", borderBottom: `1px solid ${AMH.light}`, background: i % 2 === 0 ? "#fff" : AMH.pale, alignItems: "center", gap: 12 }}>
              <div style={{ fontWeight: 600 }}>{u.fullName}</div>
              <div style={{ fontSize: 12, color: "#888", fontFamily: "'DM Mono', monospace" }}>{u.email}</div>
              <div style={{ fontSize: 12 }}>{u.department || "—"}</div>
              <div>
                <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} style={{ padding: "4px 8px", fontSize: 12, width: "auto" }}>
                  <option value="doctor">Doctor</option>
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div><button className="btn-danger" onClick={() => removeUser(u.id)} style={{ padding: "5px 12px", fontSize: 12 }}>Remove</button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConsultDetailOverlay({ consult: c, onClose, onStatusChange }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 700, width: "100%", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div className="label">Consult Record</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: AMH.green }}>MRN: {c.mrn}</div>
            <div style={{ fontSize: 12, color: "#aaa", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{c.date} · {c.doctorName}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select value={c.status} onChange={e => onStatusChange(c.id, e.target.value)} style={{ width: "auto", padding: "6px 10px", fontSize: 12, fontFamily: "'DM Mono', monospace", border: `1.5px solid ${AMH.light}`, borderRadius: 8 }}>
              <option>Open</option><option>In Progress</option><option>Closed</option>
            </select>
            <button onClick={onClose} style={{ background: AMH.pale, border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", color: AMH.green, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>✕</button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[["Patient", c.patientName || "—"], ["Age / Gender", `${c.age || "—"} / ${c.gender}`], ["Department", c.doctorDept || "—"]].map(([l, v]) => (
            <div key={l} style={{ background: AMH.pale, borderRadius: 8, padding: "12px 14px" }}>
              <div className="label">{l}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
        {[["KFSH-R Service", c.consultedService], ["KFSH-R Receiver", c.kfshReceiver || "—"]].map(([l, v]) => <DetailRow key={l} label={l} value={v} />)}
        <DetailBlock label="Reason for Consult" value={c.reasonForConsult} />
        <DetailBlock label="Clinical Justification" value={c.clinicalJustification} />
        <DetailBlock label="No-Transfer Reason" value={c.noTransferReason} />
        {c.noTransferJustification && <DetailBlock label="Transfer Justification" value={c.noTransferJustification} />}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "16px 0" }}>
          {[["Response", c.responseType], ["Phone Adequate", c.responseAdequate], ["Follow-Up", c.followUpRequired]].map(([l, v]) => (
            <div key={l} style={{ background: AMH.pale, borderRadius: 8, padding: "10px 14px" }}>
              <div className="label">{l}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: AMH.green }}>{v}</div>
            </div>
          ))}
        </div>
        {c.followUpNotes && <DetailBlock label="Follow-Up Notes" value={c.followUpNotes} />}
        {c.subConsultRequired === "Yes" && <>
          <DetailRow label="Sub-Consult Service" value={c.subConsultService} />
          <DetailBlock label="Sub-Consult Justification" value={c.subConsultJustification} />
        </>}
      </div>
    </div>
  );
}

function AuthFormShell({ title, subtitle, children, setPage, showBack }) {
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${AMH.green} 0%, #0f3d23 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="fade-up" style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⚕</div>
          <div style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800 }}>{title}</div>
          {subtitle && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 6 }}>{subtitle}</div>}
        </div>
        <div className="card" style={{ padding: 32 }}>{children}</div>
        {showBack && <div style={{ textAlign: "center", marginTop: 16 }}><span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer" }} onClick={() => setPage("landing")}>← Back to home</span></div>}
      </div>
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="section-title">{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );
}

function Grid2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}

function FormField({ label, children }) {
  return <div><div className="label">{label}</div>{children}</div>;
}

function ErrorMsg({ children, onClose }) {
  return (
    <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", color: "#dc2626", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span>{children}</span>
      {onClose && <span style={{ cursor: "pointer", marginLeft: 12 }} onClick={onClose}>✕</span>}
    </div>
  );
}

function StatusPill({ status, label }) {
  const colors = { Open: ["#dbeafe", "#1d4ed8"], "In Progress": ["#fef3c7", "#92400e"], Closed: ["#dcfce7", "#15803d"] };
  const [bg, fg] = colors[status] || ["#f3f4f6", "#374151"];
  return <span className="pill" style={{ background: bg, color: fg }}>{label || status}</span>;
}

function RoleBadge({ role }) {
  const map = { admin: "ADMIN", doctor: "DOCTOR", viewer: "VIEWER", pending: "PENDING" };
  return <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>{map[role] || role?.toUpperCase()}</span>;
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: `1px solid ${AMH.pale}`, alignItems: "baseline" }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#aaa", minWidth: 160, letterSpacing: "0.08em" }}>{label.toUpperCase()}</span>
      <span style={{ fontSize: 14 }}>{value}</span>
    </div>
  );
}

function DetailBlock({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ margin: "12px 0" }}>
      <div className="label">{label}</div>
      <div style={{ background: AMH.pale, borderRadius: 8, padding: "10px 14px", fontSize: 14, lineHeight: 1.65, color: "#333" }}>{value}</div>
    </div>
  );
}