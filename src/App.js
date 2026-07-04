import React, { useState, useEffect } from 'react';
import { Users, UserCircle, Stethoscope, Search, FileText, Trash2, Lock, Beaker, Pill, ShoppingBag, CheckCircle2 } from 'lucide-react';

const DEPARTMENTS = [
  { id: 'CARD', name: 'Cardiology' }, { id: 'GYN', name: 'Gynecology' },
  { id: 'OPH', name: 'Ophthalmology' }, { id: 'PED', name: 'Pediatrics' },
  { id: 'ORTHO', name: 'Orthopedics' }, { id: 'DERM', name: 'Dermatology' },
  { id: 'NEURO', name: 'Neurology' }, { id: 'ENT', name: 'ENT' },
  { id: 'DENT', name: 'Dental' }, { id: 'GEN', name: 'General Medicine' }
];

const PATIENT_STATUSES = {
  WAITING: 'WAITING',
  SERVING: 'SERVING',
  HOLD_LAB: 'HOLD_LAB',
  READY_FOR_REVIEW: 'READY_FOR_REVIEW',
  COMPLETED: 'COMPLETED'
};

const HERO_FEATURES = [
  { label: 'Secure Access', description: 'Your data is protected with advanced security.', icon: CheckCircle2 },
  { label: 'Easy Management', description: 'Manage patients, staff and appointments easily.', icon: Users },
  { label: 'Real-time Insights', description: 'Get the latest updates and analytics at a glance.', icon: FileText },
  { label: 'Better Care', description: 'Improve patient care and outcomes with smarter workflows.', icon: Stethoscope }
];

const LoginView = ({ handleLogin, loginForm, setLoginForm }) => (
  <div className="mx-auto w-full max-w-md">
    <div className="bg-white/95 p-8 rounded-[2.5rem] shadow-2xl border border-slate-200">
      <div className="flex justify-center mb-6 text-blue-600"><Lock size={48} /></div>
      <h2 className="text-2xl font-black text-center mb-6 uppercase tracking-tight">Hospital Management Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          required
          placeholder="Username"
          value={loginForm.username}
          className="w-full p-4 border rounded-2xl bg-slate-50 outline-none"
          onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={loginForm.password}
          className="w-full p-4 border rounded-2xl bg-slate-50 outline-none"
          onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
        />
        <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition">Access Dashboard</button>
      </form>
    </div>
  </div>
);

export default function SmartHospital() {
  const [view, setView] = useState('patient');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const [patients, setPatients] = useState(() => JSON.parse(localStorage.getItem('hospital_patients')) || []);
  const [serving, setServing] = useState(() => JSON.parse(localStorage.getItem('hospital_serving')) || DEPARTMENTS.reduce((a, d) => ({ ...a, [d.id]: 0 }), {}));
  const [deptTokenCounters, setDeptTokenCounters] = useState(() => JSON.parse(localStorage.getItem('hospital_counters')) || DEPARTMENTS.reduce((a, d) => ({ ...a, [d.id]: 1 }), {}));
  const [labRequests, setLabRequests] = useState(() => JSON.parse(localStorage.getItem('hospital_lab')) || []);
  const [prescriptions, setPrescriptions] = useState(() => JSON.parse(localStorage.getItem('hospital_prescriptions')) || []);

  const [formData, setFormData] = useState({ name: '', phone: '', age: '', gender: 'Male', address: '', complaint: '', deptId: 'CARD' });
  const [searchToken, setSearchToken] = useState('');
  const [labInputs, setLabInputs] = useState({});
  const [medInputs, setMedInputs] = useState({});
  const [selectedReviewToken, setSelectedReviewToken] = useState('');

  useEffect(() => { localStorage.setItem('hospital_patients', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('hospital_serving', JSON.stringify(serving)); }, [serving]);
  useEffect(() => { localStorage.setItem('hospital_counters', JSON.stringify(deptTokenCounters)); }, [deptTokenCounters]);
  useEffect(() => { localStorage.setItem('hospital_lab', JSON.stringify(labRequests)); }, [labRequests]);
  useEffect(() => { localStorage.setItem('hospital_prescriptions', JSON.stringify(prescriptions)); }, [prescriptions]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'harisai' && loginForm.password === 'harisai@1234') {
      setIsAuthenticated(true);
    } else {
      alert("Invalid Credentials!");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setView('patient');
    setLoginForm({ username: '', password: '' });
  };

  const registerPatient = (e) => {
    e.preventDefault();
    const tokenNumber = deptTokenCounters[formData.deptId];
    const displayToken = `${formData.deptId}-${tokenNumber}`;
    const newToken = {
      displayToken,
      tokenNumber,
      status: PATIENT_STATUSES.WAITING,
      ...formData,
      timeJoined: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setPatients([...patients, newToken]);
    setDeptTokenCounters(prev => ({ ...prev, [formData.deptId]: prev[formData.deptId] + 1 }));
    setFormData({ name: '', phone: '', age: '', gender: 'Male', address: '', complaint: '', deptId: 'CARD' });
    alert(`Token issued: ${displayToken}`);
  };

  const normalizeStatus = (patient) => patient.status || PATIENT_STATUSES.WAITING;

  const getNextWaitingPatient = (dId) => {
    return patients
      .filter(p => p.deptId === dId && normalizeStatus(p) === PATIENT_STATUSES.WAITING)
      .sort((a, b) => a.tokenNumber - b.tokenNumber)[0];
  };

  const getCurrentServingPatient = (dId) => {
    return patients.find(p => p.deptId === dId && normalizeStatus(p) === PATIENT_STATUSES.SERVING);
  };

  const nextPatient = (dId) => {
    const currentServing = getCurrentServingPatient(dId);
    if (currentServing) {
      alert('Finish or place the current patient on hold before calling the next one.');
      return;
    }

    const nextWaiting = getNextWaitingPatient(dId);
    if (!nextWaiting) {
      alert(`No waiting patient available for ${dId}.`);
      setServing(prev => ({ ...prev, [dId]: 0 }));
      return;
    }

    setPatients(prev => prev.map(p => p.displayToken === nextWaiting.displayToken ? { ...p, status: PATIENT_STATUSES.SERVING } : p));
    setServing(prev => ({ ...prev, [dId]: nextWaiting.tokenNumber }));
    setLabInputs(prev => ({ ...prev, [dId]: '' }));
    setMedInputs(prev => ({ ...prev, [nextWaiting.displayToken]: '' }));
  };

  const sendToLab = (dId) => {
    const currentPatient = getCurrentServingPatient(dId);
    if (!currentPatient) {
      alert('No patient is currently being served in this department.');
      return;
    }

    const tests = labInputs[dId]?.trim();
    if (!tests) {
      alert('Please select or specify laboratory tests.');
      return;
    }

    setPatients(prev => prev.map(p => p.displayToken === currentPatient.displayToken ? {
      ...p,
      status: PATIENT_STATUSES.HOLD_LAB,
      labTests: tests,
      labRequestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } : p));

    setLabRequests(prev => [{ id: Date.now(), token: currentPatient.displayToken, deptId: dId, tests, status: 'Pending', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev]);
    setLabInputs(prev => ({ ...prev, [dId]: '' }));
    setServing(prev => ({ ...prev, [dId]: 0 }));
  };

  const completeLabRequest = (id) => {
    const request = labRequests.find(r => r.id === id);
    if (!request) return;

    setLabRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Completed' } : r));
    setPatients(prev => prev.map(p => p.displayToken === request.token ? {
      ...p,
      status: PATIENT_STATUSES.READY_FOR_REVIEW,
      labCompletedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      labResults: `Results logged for ${request.tests}`
    } : p));
  };

  const selectReviewPatient = (displayToken) => {
    setSelectedReviewToken(displayToken);
  };

  const completeVisit = (dId, activeToken) => {
    const medicines = medInputs[activeToken]?.trim();
    if (!medicines) {
      alert('Please select or write prescribed medicines before completion.');
      return;
    }

    setPatients(prev => prev.map(p => p.displayToken === activeToken ? { ...p, status: PATIENT_STATUSES.COMPLETED } : p));
    setPrescriptions(prev => [{ id: Date.now(), token: activeToken, medicines, status: 'Pending', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev]);
    setMedInputs(prev => ({ ...prev, [activeToken]: '' }));

    if (selectedReviewToken === activeToken) {
      setSelectedReviewToken('');
    }
    alert(`Visit Complete! Prescription forwarded to Pharmacy for ${activeToken}`);
  };

  const resetSystemForNewDay = () => {
    if (window.confirm("Reset all data? This clears out history completely.")) {
      setPatients([]); setServing(DEPARTMENTS.reduce((a, d) => ({ ...a, [d.id]: 0 }), {}));
      setDeptTokenCounters(DEPARTMENTS.reduce((a, d) => ({ ...a, [d.id]: 1 }), {}));
      setLabRequests([]); setPrescriptions([]);
      setSelectedReviewToken('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {isAuthenticated && (
        <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl shadow-sm p-4 flex justify-center gap-4 border-b border-slate-200 flex-wrap">
          <button onClick={() => setView('doctor')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${view === 'doctor' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><Stethoscope size={18} /> Doctors</button>
          <button onClick={() => setView('manager')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${view === 'manager' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><Users size={18} /> Staff</button>
          <button onClick={() => setView('lab')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${view === 'lab' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><Beaker size={18} /> Lab</button>
          <button onClick={() => setView('pharmacy')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${view === 'pharmacy' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><Pill size={18} /> Pharmacy</button>
          <button onClick={() => setView('patient')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${view === 'patient' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><UserCircle size={18} /> Patients</button>
          <button onClick={logout} className="text-red-500 font-bold ml-4 border-l pl-4 hover:text-red-700">Logout</button>
        </nav>
      )}

      <main className="relative p-6 max-w-7xl mx-auto">
        {!isAuthenticated ? (
          <div className="relative overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.12),_transparent_30%)] px-6 py-10">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -left-28 top-8 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"></div>
              <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-slate-200/30 blur-3xl"></div>
              <div className="absolute left-10 bottom-10 h-72 w-72 rounded-full bg-white/80 blur-3xl"></div>
            </div>
            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.9fr] items-center">
              <div className="space-y-8 max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">Smart Hospital Management</span>
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900">Smart Care<br />Better Health</h1>
                  <p className="text-lg text-slate-600 max-w-xl">Streamline operations, enhance patient care, and manage your hospital efficiently.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {HERO_FEATURES.map((item) => (
                    <div key={item.label} className="flex gap-4 rounded-3xl bg-white/90 p-5 shadow-sm border border-slate-200">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mx-auto w-full max-w-md">
                <LoginView handleLogin={handleLogin} loginForm={loginForm} setLoginForm={setLoginForm} />
              </div>
            </div>
          </div>
        ) : (
          <>
            {view === 'doctor' && (
              <div className="space-y-8">
                <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Doctor Dashboard</p>
                      <h2 className="text-3xl font-black text-slate-900">Department Queue Management</h2>
                    </div>
                    <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Patients Active</p>
                      <p className="text-2xl font-black">{patients.filter(p => normalizeStatus(p) !== PATIENT_STATUSES.COMPLETED).length}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-8">
                  <div className="space-y-8">
                    {DEPARTMENTS.map((d) => {
                      const servingPatient = getCurrentServingPatient(d.id);
                      const waitingCount = patients.filter(p => p.deptId === d.id && normalizeStatus(p) === PATIENT_STATUSES.WAITING).length;
                      const holdCount = patients.filter(p => p.deptId === d.id && normalizeStatus(p) === PATIENT_STATUSES.HOLD_LAB).length;

                      const activeReviewPatient = patients.find(p => p.displayToken === selectedReviewToken && p.deptId === d.id);
                      const activePatient = servingPatient || activeReviewPatient;
                      const isReviewStage = !!activeReviewPatient;

                      return (
                        <div key={d.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div>
                              <h3 className="text-2xl font-black text-slate-900">{d.name}</h3>
                              <p className="text-sm text-slate-500">{waitingCount} waiting | {holdCount} on hold</p>
                            </div>
                            <button onClick={() => nextPatient(d.id)} className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition">Call Next</button>
                          </div>

                          <div className="rounded-[2rem] bg-slate-950 p-6 text-center text-white">
                            <p className="text-[10px] uppercase tracking-[0.3em] opacity-60">Serving Now</p>
                            <p className="mt-4 text-5xl font-black tracking-tight">
                              {activePatient ? activePatient.displayToken : `${d.id}-0`}
                            </p>
                            <p className="mt-2 text-sm uppercase text-slate-400">
                              {activePatient ? `${activePatient.name} ${isReviewStage ? '(Lab Review Recall)' : '(Primary Check)'}` : 'No active patient'}
                            </p>
                          </div>

                          <div className="mt-6 space-y-4">
                            {activePatient ? (
                              <div className="space-y-4">
                                <div className="rounded-2xl bg-slate-50 p-4">
                                  <p className="text-sm font-semibold text-slate-900">Active Workflow Mode</p>
                                  <p className="mt-1 text-base font-bold text-blue-600">
                                    {isReviewStage ? "👉 RETURNING LAB DATA VERIFICATION" : "👉 INITIAL TRIAGE & ANALYSIS ALLOCATION"}
                                  </p>
                                  {isReviewStage && (
                                    <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg p-2 mt-2 border border-emerald-100 font-medium">
                                      {activePatient.labResults}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-4">
                                  {/* Diagnostic Pipeline Module */}
                                  <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">1. Diagnostics / Diagnostics Routing</label>
                                    <div className="flex items-center gap-2">
                                      <select
                                        disabled={isReviewStage}
                                        value={isReviewStage ? (activePatient.labTests || '') : (labInputs[d.id] || '')}
                                        onChange={(e) => setLabInputs(prev => ({ ...prev, [d.id]: e.target.value }))}
                                        className={`w-full p-4 border rounded-2xl outline-none text-sm transition ${isReviewStage ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-slate-50 text-slate-800 focus:border-blue-500'
                                          }`}
                                      >
                                        <option value="">Select Lab Diagnostic Test...</option>
                                        <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                                        <option value="Chest X-Ray / Radiography">Chest X-Ray / Radiography</option>
                                        <option value="Thyroid Profile (T3 T4 TSH)">Thyroid Profile (T3 T4 TSH)</option>
                                        <option value="Urinalysis Assessment">Urinalysis Assessment</option>
                                      </select>
                                      <button
                                        onClick={() => sendToLab(d.id)}
                                        disabled={isReviewStage}
                                        className={`p-4 rounded-2xl transition border flex items-center justify-center ${isReviewStage
                                          ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                                          : 'bg-blue-600 border-blue-700 text-white hover:bg-blue-700 shadow-sm'
                                          }`}
                                        title="Send to Lab & Hold Token"
                                      >
                                        <Beaker size={20} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Clinical Prescriptions Processing Block */}
                                  <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">2. Pharmacy Processing & Dismissal</label>
                                    <div className="flex items-center gap-2">
                                      <select
                                        disabled={!isReviewStage}
                                        value={medInputs[activePatient.displayToken] || ''}
                                        onChange={(e) => setMedInputs(prev => ({ ...prev, [activePatient.displayToken]: e.target.value }))}
                                        className={`w-full p-4 border rounded-2xl outline-none text-sm transition ${!isReviewStage ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-slate-50 text-slate-800 focus:border-emerald-500'
                                          }`}
                                      >
                                        <option value="">Select Clinical Formula...</option>
                                        <option value="Paracetamol 500mg (TID - 5 Days)">Paracetamol 500mg (TID - 5 Days)</option>
                                        <option value="Amoxicillin 500mg (BD - 3 Days)">Amoxicillin 500mg (BD - 3 Days)</option>
                                        <option value="Cetirizine 10mg (OD - 10 Days)">Cetirizine 10mg (OD - 10 Days)</option>
                                        <option value="Ibuprofen 400mg (PRN - Post Meals)">Ibuprofen 400mg (PRN - Post Meals)</option>
                                      </select>
                                      <button
                                        onClick={() => completeVisit(d.id, activePatient.displayToken)}
                                        disabled={!isReviewStage}
                                        className={`p-4 rounded-2xl transition border flex items-center justify-center ${!isReviewStage
                                          ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                                          : 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700 shadow-sm'
                                          }`}
                                        title="Finalize Prescriptions & Release Token"
                                      >
                                        <CheckCircle2 size={20} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">No patient currently loaded in workspace.</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sidebar Workflow Dashboards */}
                  <aside className="space-y-8">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Hold / Labs Pending</p>
                          <h3 className="text-2xl font-black text-slate-900">Patients Awaiting Labs</h3>
                        </div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{patients.filter(p => normalizeStatus(p) === PATIENT_STATUSES.HOLD_LAB).length}</span>
                      </div>
                      <div className="space-y-3">
                        {patients.filter(p => normalizeStatus(p) === PATIENT_STATUSES.HOLD_LAB).map((p) => (
                          <div key={p.displayToken} className="w-full text-left rounded-2xl border px-4 py-4 border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-lg font-black text-slate-900">{p.displayToken}</p>
                                <p className="text-sm text-slate-500">{p.name}</p>
                              </div>
                              <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold uppercase text-amber-700">In Lab</span>
                            </div>
                            <p className="mt-2 text-xs font-medium text-slate-400">Routed Test: <span className="text-slate-600">{p.labTests}</span></p>
                          </div>
                        ))}
                        {patients.filter(p => normalizeStatus(p) === PATIENT_STATUSES.HOLD_LAB).length === 0 && (
                          <p className="text-sm text-slate-500">No tokens currently awaiting lab processing.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Ready for Review</p>
                          <h3 className="text-2xl font-black text-slate-900">Doctor Recall</h3>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{patients.filter(p => normalizeStatus(p) === PATIENT_STATUSES.READY_FOR_REVIEW).length}</span>
                      </div>
                      <div className="space-y-3">
                        {patients.filter(p => normalizeStatus(p) === PATIENT_STATUSES.READY_FOR_REVIEW).map((p) => (
                          <button key={p.displayToken} onClick={() => selectReviewPatient(p.displayToken)} className={`w-full text-left rounded-2xl border px-4 py-4 transition ${selectedReviewToken === p.displayToken ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'} ${p.labResults && selectedReviewToken !== p.displayToken ? 'animate-pulse border-emerald-300' : ''}`}>
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-lg font-black text-slate-900">{p.displayToken}</p>
                                <p className="text-sm text-slate-500">{p.name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">{p.deptId}</span>
                                {selectedReviewToken !== p.displayToken && <span className="rounded-full bg-emerald-500 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider animate-bounce">Recall</span>}
                              </div>
                            </div>
                            <p className="mt-2 text-xs text-slate-400 font-medium">Lab verified at {p.labCompletedAt || '—'}</p>
                          </button>
                        ))}
                        {patients.filter(p => normalizeStatus(p) === PATIENT_STATUSES.READY_FOR_REVIEW).length === 0 && (
                          <p className="text-sm text-slate-500">No results ready for re-evaluation.</p>
                        )}
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {view === 'pharmacy' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <div className="flex items-center gap-4 mb-8 border-b pb-6">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><ShoppingBag size={32} /></div>
                    <div>
                      <h2 className="text-3xl font-black">Medical Store</h2>
                      <p className="text-slate-500 font-bold">Pending Prescriptions</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {prescriptions.length === 0 ? <p className="text-center py-10 text-slate-400 italic">No prescriptions logged.</p> :
                      prescriptions.map(p => (
                        <div key={p.id} className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-center gap-4 ${p.status === 'Dispensed' ? 'bg-slate-50 opacity-60' : 'bg-emerald-50/30 border-emerald-100'}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-2xl font-black text-emerald-700">{p.token}</span>
                              <span className="text-xs font-bold text-slate-400">{p.timestamp}</span>
                            </div>
                            <p className="font-bold text-slate-700">Rx Formulary: <span className="font-medium text-slate-900">{p.medicines}</span></p>
                          </div>
                          {p.status === 'Pending' ? (
                            <button onClick={() => setPrescriptions(prescriptions.map(pre => pre.id === p.id ? { ...pre, status: 'Dispensed' } : pre))} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-sm">Mark Dispensed</button>
                          ) : <span className="text-emerald-600 font-black flex items-center gap-1"><CheckCircle2 size={18} /> Dispensed & Closed</span>}
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}

            {view === 'manager' && (
              <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-fit">
                  <h2 className="text-2xl font-black mb-6">Patient Entry</h2>
                  <form onSubmit={registerPatient} className="space-y-4">
                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none" />
                    <div className="grid grid-cols-2 gap-4">
                      <input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none" />
                      <input required value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} placeholder="Age" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none" />
                    </div>
                    <select value={formData.deptId} onChange={e => setFormData({ ...formData, deptId: e.target.value })} className="w-full p-4 border rounded-2xl bg-slate-50 outline-none cursor-pointer">
                      {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <textarea required value={formData.complaint} onChange={e => setFormData({ ...formData, complaint: e.target.value })} placeholder="Complaint Details" rows="2" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none"></textarea>
                    <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition">Issue Token</button>
                  </form>
                </div>
                <div className="lg:col-span-3 space-y-4 max-h-[700px] overflow-y-auto pr-2">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <h2 className="text-xl font-bold italic text-slate-400">Registrations</h2>
                    <button onClick={resetSystemForNewDay} className="flex items-center gap-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition font-bold text-sm shadow-sm">
                      <Trash2 size={16} /> Reset Day
                    </button>
                  </div>
                  {patients.slice().reverse().map(p => (
                    <div key={p.displayToken} className="bg-white p-5 rounded-3xl border shadow-sm flex justify-between items-center">
                      <div><p className="text-2xl font-black text-blue-600">{p.displayToken}</p><p className="font-bold text-slate-800">{p.name}</p></div>
                      <span className="bg-slate-100 px-4 py-2 rounded-full text-[10px] font-black uppercase text-slate-500">{p.deptId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === 'lab' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[500px]">
                  <div className="flex items-center gap-4 mb-8 border-b pb-6">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Beaker size={32} /></div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">Laboratory Requests</h2>
                      <p className="text-slate-500 font-bold">Manage patient tests</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {labRequests.length === 0 ? <p className="text-center py-20 text-slate-400 italic">No diagnostic requests pending.</p> :
                      labRequests.map(req => (
                        <div key={req.id} className={`p-6 rounded-3xl border flex justify-between items-center ${req.status === 'Completed' ? 'bg-green-50/50 border-green-200' : 'bg-slate-50'}`}>
                          <div>
                            <span className="text-2xl font-black text-blue-600">{req.token}</span>
                            <p className="font-bold text-slate-700">Test Required: <span className="font-medium text-slate-900">{req.tests}</span></p>
                          </div>
                          {req.status === 'Pending' ? (
                            <button onClick={() => completeLabRequest(req.id)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-sm transition">Transmit Results</button>
                          ) : <span className="text-green-600 font-bold flex items-center gap-1">✓ Transmitted</span>}
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}

            {view === 'patient' && (
              <div className="max-w-xl mx-auto text-center mt-12">
                <h1 className="text-5xl font-black text-slate-900 mb-10 tracking-tighter italic">Queue Tracker</h1>
                <div className="relative mb-12 group">
                  {/* Public queue interface code goes here */}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
