import { useEffect, useMemo, useState } from 'react';
import {
  Activity, Shield, LayoutDashboard, Siren, KeyRound, Plus, Search,
  RefreshCw, Trash2, CheckCircle2, AlertTriangle, X, LockKeyhole,
  ChevronRight, Radar, Terminal, Eye, Zap
} from 'lucide-react';

const API = 'http://localhost:8080/api/incidents';
const blankForm = { title: '', description: '', severity: 'MEDIUM', status: 'OPEN', sourceIp: '' };

function strengthFor(password) {
  const checks = [
    password.length >= 12,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ];
  const pool = (/[a-z]/.test(password) ? 26 : 0) +
    (/[A-Z]/.test(password) ? 26 : 0) +
    (/[0-9]/.test(password) ? 10 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 32 : 0);
  const entropy = password.length && pool ? Math.round(password.length * Math.log2(pool)) : 0;
  const score = checks.filter(Boolean).length;
  const label = !password ? 'WAITING FOR INPUT' : score <= 2 ? 'WEAK' : score <= 3 ? 'MODERATE' : score === 4 ? 'STRONG' : 'VERY STRONG';
  const suggestions = [];
  if (password.length < 12) suggestions.push('Use at least 12 characters.');
  if (!/[A-Z]/.test(password)) suggestions.push('Add an uppercase letter.');
  if (!/[a-z]/.test(password)) suggestions.push('Add a lowercase letter.');
  if (!/[0-9]/.test(password)) suggestions.push('Add a number.');
  if (!/[^A-Za-z0-9]/.test(password)) suggestions.push('Add a symbol.');
  return { checks, entropy, label, suggestions };
}

function App() {
  const [page, setPage] = useState('overview');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState('');

  async function loadIncidents() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error(`Backend returned ${response.status}`);
      setIncidents(await response.json());
    } catch {
      setError('Cannot connect to the Java API. Start Spring Boot and confirm MySQL settings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadIncidents(); }, []);

  const stats = useMemo(() => ({
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length,
    open: incidents.filter(i => i.status === 'OPEN').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length
  }), [incidents]);

  const visibleIncidents = incidents.filter(i =>
    (severityFilter === 'ALL' || i.severity === severityFilter) &&
    `${i.title} ${i.description} ${i.sourceIp || ''}`.toLowerCase().includes(query.toLowerCase())
  );

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  async function submitIncident(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error('Could not save incident');
      setForm(blankForm);
      setShowForm(false);
      await loadIncidents();
      notify('Incident added to the database.');
    } catch {
      notify('Save failed. Check that the backend and database are running.');
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(incident, status) {
    try {
      const response = await fetch(`${API}/${incident.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...incident, status })
      });
      if (!response.ok) throw new Error();
      await loadIncidents();
      notify(`Incident marked ${status.toLowerCase()}.`);
    } catch {
      notify('Update failed. Check the backend.');
    }
  }

  async function deleteIncident(id) {
    if (!window.confirm('Delete this incident permanently?')) return;
    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      await loadIncidents();
      notify('Incident deleted.');
    } catch {
      notify('Delete failed. Check the backend.');
    }
  }

  const passwordResult = strengthFor(password);
  const navItems = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'incidents', label: 'Threat Incidents', icon: Siren },
    { id: 'password', label: 'Password Lab', icon: KeyRound }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Shield size={22} /></div>
          <div><strong>CYBER<span>VAULT</span></strong><small>SECURITY INTELLIGENCE</small></div>
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav>
          {navItems.map(item => {
            const Icon = item.icon;
            return <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
              <Icon size={18} /><span>{item.label}</span>{page === item.id && <ChevronRight size={15} className="nav-chevron" />}
            </button>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="status-line"><span className="pulse-dot" /> LOCAL ENVIRONMENT</div>
          <div className="mini-terminal"><Terminal size={15} /><span>cybervault@localhost</span><span className="terminal-cursor">_</span></div>
          <p>Educational simulation only.<br/>No live network monitoring.</p>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>CYBERVAULT</span><ChevronRight size={14}/><b>{navItems.find(n => n.id === page)?.label.toUpperCase()}</b></div>
          <div className="top-right"><span className="system-status"><span className="pulse-dot"/> SYSTEM ONLINE*</span><div className="avatar">CV</div></div>
        </header>

        <div className="content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line"/> SECURITY OPERATIONS / 01</div>
              <h1>{page === 'overview' ? 'Command Center' : page === 'incidents' ? 'Threat Incidents' : 'Password Lab'}<span className="title-dot">.</span></h1>
              <p className="subheading">{page === 'overview' ? 'Your simulated security environment, at a glance.' : page === 'incidents' ? 'Investigate, track, and resolve security events.' : 'Evaluate password composition without sending it to a server.'}</p>
            </div>
            {page !== 'password' && <button className="primary-btn" onClick={() => { setForm(blankForm); setShowForm(true); }}><Plus size={17}/> New Incident</button>}
          </section>

          {error && <div className="error-banner"><AlertTriangle size={18}/><span>{error}</span><button onClick={loadIncidents}><RefreshCw size={15}/> Retry</button></div>}

          {page === 'overview' && <>
            <div className="hero-panel">
              <div className="hero-copy">
                <div className="live-tag"><span className="pulse-dot"/> SIMULATION ACTIVE</div>
                <h2>Stay ahead of<br/><span>the threat.</span></h2>
                <p>One workspace to review alerts, manage incident response, and test password hygiene.</p>
                <button className="hero-btn" onClick={() => setPage('incidents')}>Review incidents <ChevronRight size={16}/></button>
              </div>
              <div className="radar-art"><div className="radar-ring ring-one"/><div className="radar-ring ring-two"/><div className="radar-ring ring-three"/><div className="radar-cross cross-x"/><div className="radar-cross cross-y"/><div className="radar-sweep"/><div className="radar-center"><Shield size={32}/></div><span className="radar-point point-one"/><span className="radar-point point-two"/><span className="radar-point point-three"/></div>
              <div className="hero-index">CV / 001</div>
            </div>
            <div className="section-heading"><div><span className="section-kicker">REAL-TIME OVERVIEW*</span><h3>Security metrics</h3></div><button className="icon-btn" title="Refresh" onClick={loadIncidents}><RefreshCw size={16}/></button></div>
            <div className="stats-grid">
              <StatCard icon={Activity} label="TOTAL INCIDENTS" value={stats.total} note="All recorded events" color="blue"/>
              <StatCard icon={Siren} label="ACTIVE CRITICAL" value={stats.critical} note="Unresolved critical severity" color="red"/>
              <StatCard icon={Radar} label="OPEN CASES" value={stats.open} note="Awaiting investigation" color="amber"/>
              <StatCard icon={CheckCircle2} label="RESOLVED" value={stats.resolved} note="Closed incident records" color="green"/>
            </div>
            <div className="lower-grid">
              <section className="panel recent-panel">
                <div className="panel-heading"><div><span className="section-kicker">LATEST ACTIVITY</span><h3>Recent incidents</h3></div><button className="text-btn" onClick={() => setPage('incidents')}>View all <ChevronRight size={15}/></button></div>
                <IncidentList incidents={incidents.slice(0, 4)} loading={loading} onStatus={changeStatus} onDelete={deleteIncident}/>
              </section>
              <section className="panel posture-panel">
                <div className="panel-heading"><div><span className="section-kicker">ENVIRONMENT</span><h3>System posture</h3></div><Shield size={18} className="muted-icon"/></div>
                <div className="posture-score"><div className="score-ring"><span>{Math.max(0, 100 - stats.critical * 15 - stats.open * 3)}<small>/100</small></span></div><div><b>Simulation score</b><p>Illustrative score based on open incident count, not a real security assessment.</p></div></div>
                <div className="posture-row"><span><i className="tiny-dot green-bg"/> API connection</span><b>{error ? 'Disconnected' : loading ? 'Checking…' : 'Connected'}</b></div>
                <div className="posture-row"><span><i className="tiny-dot blue-bg"/> Data source</span><b>MySQL / Local</b></div>
                <div className="posture-row"><span><i className="tiny-dot amber-bg"/> Threat feed</span><b>Simulated</b></div>
              </section>
            </div>
            <p className="footnote">*Dashboard values are calculated from this project's local database. It does not represent a real SOC or live threat intelligence.</p>
          </>}

          {page === 'incidents' && <section className="panel incidents-panel">
            <div className="toolbar"><div><span className="section-kicker">INCIDENT REGISTER</span><h3>All incidents <span className="count-pill">{incidents.length}</span></h3></div><div className="toolbar-controls"><div className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search incidents..."/></div><select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}><option value="ALL">All severities</option><option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></div></div>
            <IncidentList incidents={visibleIncidents} loading={loading} onStatus={changeStatus} onDelete={deleteIncident} detailed/>
            {!loading && visibleIncidents.length === 0 && <div className="empty-state"><Shield size={28}/><b>No incidents found</b><p>Add a new incident or adjust your search filters.</p></div>}
          </section>}

          {page === 'password' && <div className="password-layout">
            <section className="panel password-panel">
              <div className="panel-heading"><div><span className="section-kicker">LOCAL ANALYSIS ENGINE</span><h3>Password composition</h3></div><LockKeyhole size={19} className="muted-icon"/></div>
              <label className="field-label" htmlFor="password">ENTER A TEST PASSWORD</label>
              <div className="password-input"><input id="password" type="password" autoComplete="off" value={password} onChange={e => setPassword(e.target.value)} placeholder="Type a sample password..."/><Eye size={17}/></div>
              <p className="privacy-note"><LockKeyhole size={14}/> Analysis runs in your browser. Do not enter a real or reused password.</p>
              <div className="strength-header"><span>ESTIMATED STRENGTH</span><b className={`strength-${passwordResult.label.replaceAll(' ', '-')}`}>{passwordResult.label}</b></div>
              <div className="strength-track">{[1,2,3,4,5].map(n => <span key={n} className={password && n <= passwordResult.checks.filter(Boolean).length ? `filled level-${passwordResult.checks.filter(Boolean).length}` : ''}/>)}</div>
              <div className="check-list">{[
                ['At least 12 characters', password.length >= 12],
                ['Uppercase letter (A–Z)', /[A-Z]/.test(password)],
                ['Lowercase letter (a–z)', /[a-z]/.test(password)],
                ['Number (0–9)', /[0-9]/.test(password)],
                ['Special character', /[^A-Za-z0-9]/.test(password)]
              ].map(([label, ok]) => <div className="check-row" key={label}><span className={ok ? 'check-mark ok' : 'check-mark'}>{ok ? '✓' : '–'}</span>{label}<span className={`check-state ${ok ? 'good' : ''}`}>{ok ? 'PASS' : 'MISSING'}</span></div>)}</div>
            </section>
            <div className="password-side">
              <section className="panel entropy-panel"><span className="section-kicker">COMPLEXITY ESTIMATE</span><h3>Password entropy</h3><div className="entropy-number">{passwordResult.entropy}<span> bits</span></div><p>Rough estimate based on length and character categories. It assumes random selection and cannot reliably predict cracking time for human-chosen passwords.</p><div className="entropy-bar"><span style={{width: `${Math.min(100, passwordResult.entropy / 1.28)}%`}}/></div></section>
              <section className="panel suggestions-panel"><div className="panel-heading"><div><span className="section-kicker">RECOMMENDATIONS</span><h3>Improve your score</h3></div><Zap size={18} className="muted-icon"/></div>{!password ? <p className="muted-text">Enter a sample password to see suggestions.</p> : passwordResult.suggestions.length === 0 ? <div className="success-note"><CheckCircle2 size={17}/> All basic composition checks passed. Prefer a long, unique passphrase generated by a password manager.</div> : <ul className="suggestions">{passwordResult.suggestions.map(s => <li key={s}><AlertTriangle size={15}/>{s}</li>)}</ul>}</section>
            </div>
          </div>}
        </div>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowForm(false); }}><form className="modal" onSubmit={submitIncident}>
        <div className="modal-heading"><div><span className="section-kicker">NEW RECORD / DATABASE</span><h2>Create incident</h2></div><button type="button" className="icon-btn" onClick={() => setShowForm(false)}><X size={18}/></button></div>
        <label>Incident title<input required maxLength="120" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Suspicious login attempts"/></label>
        <label>Description<textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the simulated event..." rows="3"/></label>
        <div className="form-two"><label>Severity<select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select></label><label>Status<select value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option>OPEN</option><option>INVESTIGATING</option><option>RESOLVED</option></select></label></div>
        <label>Source IP (optional)<input value={form.sourceIp} onChange={e => setForm({...form, sourceIp: e.target.value})} placeholder="e.g. 192.0.2.10"/></label>
        <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-btn" disabled={saving} type="submit"><Plus size={16}/>{saving ? 'Saving...' : 'Save incident'}</button></div>
      </form></div>}
      {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, note, color }) {
  return <div className="stat-card"><div className={`stat-icon ${color}`}><Icon size={19}/></div><span className="stat-label">{label}</span><div className="stat-value">{value}</div><span className="stat-note">{note}</span><div className={`stat-accent ${color}`}/></div>;
}

function IncidentList({ incidents, loading, onStatus, onDelete, detailed = false }) {
  if (loading) return <div className="loading-state"><RefreshCw size={17} className="spin"/> Loading incident records…</div>;
  if (!incidents.length) return <div className="empty-state compact"><Activity size={25}/><b>No records yet</b><p>Create your first simulated incident.</p></div>;
  return <div className="incident-list">{incidents.map(item => <article className="incident-row" key={item.id}>
    <div className={`severity-marker ${item.severity?.toLowerCase()}`}/>
    <div className="incident-main"><div className="incident-title-line"><b>{item.title}</b><span className={`severity-badge ${item.severity?.toLowerCase()}`}>{item.severity}</span></div><p>{item.description}</p><div className="incident-meta"><span>#{item.id}</span>{item.sourceIp && <span>{item.sourceIp}</span>}<span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just created'}</span></div></div>
    <div className="incident-actions"><select aria-label={`Status for ${item.title}`} value={item.status} onChange={e => onStatus(item, e.target.value)}><option>OPEN</option><option>INVESTIGATING</option><option>RESOLVED</option></select>{detailed && <button className="delete-btn" title="Delete incident" onClick={() => onDelete(item.id)}><Trash2 size={16}/></button>}</div>
  </article>)}</div>;
}

export default App;
