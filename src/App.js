import React, { useState, useEffect } from 'react';
import { Users, UserCircle, Stethoscope, Search, FileText, Trash2, Lock, Beaker, Pill, ShoppingBag, CheckCircle2 } from 'lucide-react';

// API base URL - explicitly pointing to the production Render backend for the mobile app
const API_BASE = 'https://smart-hospital-management-cp9n.onrender.com';

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

  // Connected backend live states
  const [patients, setPatients] = useState([]);
  const [labRequests, setLabRequests] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [formData, setFormData] = useState({ name: '', phone: '', age: '', gender: 'Male', address: '', complaint: '', deptId: 'CARD' });
  const [labInputs, setLabInputs] = useState({});
  const [medInputs, setMedInputs] = useState({});
  const [selectedReviewToken, setSelectedReviewToken] = useState('');
  const [searchToken, setSearchToken] = useState('');

  // Fetch initial data and establish polling
  useEffect(() => {
    // Initialize database
    fetch(`${API_BASE}/api/init-counters`).catch(err => console.error('Failed to initialize counters:', err));

    fetchData();

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [ptRes, lbRes, rxRes] = await Promise.all([
        fetch(`${API_BASE}/api/patients`),
        fetch(`${API_BASE}/api/lab`),
        fetch(`${API_BASE}/api/pharmacy`)
      ]);

      if (ptRes.ok) setPatients(await ptRes.json());
      if (lbRes.ok) setLabRequests(await lbRes.json());
      if (rxRes.ok) setPrescriptions(await rxRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'harisai' && loginForm.password === 'harisai@1234') {
      setIsAuthenticated(true);
      setView('doctor'); // Forward to primary working screen post auth
    } else {
      alert("Invalid Credentials!");
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setView('patient');
    setLoginForm({ username: '', password: '' });
  };

  const registerPatient = async (e) => {
    e.preventDefault();

    try {
      // Get current counter for department
      const counterRes = await fetch(`${API_BASE}/api/dept-counter/${formData.deptId}`);
      const counterData = await counterRes.json();
      const tokenNumber = counterData.current_count;
      const displayToken = `${formData.deptId}-${tokenNumber}`;

      // Insert patient
      const insertRes = await fetch(`${API_BASE}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayToken,
          tokenNumber,
          name: formData.name,
          phone: formData.phone,
          age: parseInt(formData.age),
          gender: formData.gender,
          address: formData.address,
          complaint: formData.complaint,
          deptId: formData.deptId,
          status: PATIENT_STATUSES.WAITING,
          time_joined: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      });

      if (!insertRes.ok) throw new Error('Failed to register patient');

      // Increment counter
      await fetch(`${API_BASE}/api/dept-counter/${formData.deptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentCount: tokenNumber + 1 })
      });

      setFormData({ name: '', phone: '', age: '', gender: 'Male', address: '', complaint: '', deptId: 'CARD' });
      alert(`Token issued successfully: ${displayToken}`);
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const normalizeStatus = (p) => p.status || PATIENT_STATUSES.WAITING;

  const getNextWaitingPatient = (dId) => {
    return patients
      .filter(p => p.dept_id === dId && normalizeStatus(p) === PATIENT_STATUSES.WAITING)
      .sort((a, b) => a.token_number - b.token_number)[0];
  };

  const getCurrentServingPatient = (dId) => {
    return patients.find(p => p.dept_id === dId && normalizeStatus(p) === PATIENT_STATUSES.SERVING);
  };

  const nextPatient = async (dId) => {
    try {
      if (getCurrentServingPatient(dId)) {
        return alert('Finish or place the current patient on hold before calling the next one.');
      }

      const nextWaiting = getNextWaitingPatient(dId);
      if (!nextWaiting) return alert(`No waiting patient available for ${dId}.`);

      await fetch(`${API_BASE}/api/patients/token/${nextWaiting.display_token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: PATIENT_STATUSES.SERVING })
      });

      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const sendToLab = async (dId) => {
    try {
      const currentPatient = getCurrentServingPatient(dId);
      if (!currentPatient) return alert('No active workspace loaded.');

      const tests = labInputs[dId]?.trim();
      if (!tests) return alert('Please select or specify laboratory tests.');

      await fetch(`${API_BASE}/api/patients/token/${currentPatient.display_token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: PATIENT_STATUSES.HOLD_LAB,
          lab_tests: tests,
          lab_requested_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      });

      await fetch(`${API_BASE}/api/lab`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: currentPatient.display_token,
          tests,
          dept_id: dId
        })
      });

      setLabInputs(prev => ({ ...prev, [dId]: '' }));
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const completeLabRequest = async (id, token, tests) => {
    try {
      await fetch(`${API_BASE}/api/lab/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' })
      });

      await fetch(`${API_BASE}/api/patients/token/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: PATIENT_STATUSES.READY_FOR_REVIEW,
          lab_completed_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          lab_results: `Results logged for ${tests}`
        })
      });

      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const completeVisit = async (dId, activeToken) => {
    try {
      const medicines = medInputs[activeToken]?.trim();
      if (!medicines) return alert('Please select or write prescribed medicines before completion.');

      await fetch(`${API_BASE}/api/patients/token/${activeToken}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: PATIENT_STATUSES.COMPLETED })
      });

      await fetch(`${API_BASE}/api/pharmacy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: activeToken,
          medicines
        })
      });

      setMedInputs(prev => ({ ...prev, [activeToken]: '' }));
      if (selectedReviewToken === activeToken) setSelectedReviewToken('');
      alert(`Visit Complete! Prescription forwarded to Pharmacy for ${activeToken}`);
      fetchData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const resetSystemForNewDay = async () => {
    if (window.confirm("Reset all database values? This drops tracking rows entirely.")) {
      try {
        await fetch(`${API_BASE}/api/reset`, {
          method: 'DELETE'
        });
        setSelectedReviewToken('');
        fetchData();
      } catch (err) {
        alert('Error: ' + err.message);
      }
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

          <button onClick={logout} className="text-red-500 font-bold ml-4 border-l pl-4 hover:text-red-700">Logout</button>
        </nav>
      )}

      <main className="relative p-6 max-w-7xl mx-auto">
        {!isAuthenticated && view !== 'patient' ? (
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
                      <div className="text-left">
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
            {view === 'patient' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-3xl font-black">Live Department Queue Monitor</h2>
                    <p className="text-slate-500 font-semibold mt-1">Real-time room operational token states</p>
                  </div>
                  {!isAuthenticated && (
                    <button onClick={() => setView('doctor')} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"><Lock size={16} /> Control Desk</button>
                  )}
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm mt-8">
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-slate-900 italic">Queue Tracker</h2>
                    <p className="text-slate-400 font-medium mt-2">Hospital token monitoring system</p>
                  </div>
                  
                  <div className="max-w-xl mx-auto">
                    <div className="relative">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={28} />
                      <input 
                        type="text" 
                        placeholder="E.G. CARD-1" 
                        value={searchToken}
                        onChange={(e) => setSearchToken(e.target.value.toUpperCase())}
                        className="w-full text-2xl font-black text-slate-600 pl-16 pr-6 py-6 rounded-[2rem] border-2 border-blue-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition placeholder:font-bold placeholder:text-slate-300"
                      />
                    </div>

                    {searchToken && (
                      <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        {(() => {
                          const patient = patients.find(p => p.display_token === searchToken);
                          if (!patient) return <p className="text-center text-slate-400 font-bold">Token not found. Please check your token number.</p>;
                          
                          const dept = DEPARTMENTS.find(d => d.id === patient.dept_id);
                          const activeP = getCurrentServingPatient(patient.dept_id);
                          const status = normalizeStatus(patient);
                          
                          if (status === PATIENT_STATUSES.SERVING) {
                            return <p className="text-center text-emerald-600 font-black text-2xl">You are currently being served in {dept?.name}!</p>;
                          }
                          if (status === PATIENT_STATUSES.HOLD_LAB) {
                            return <p className="text-center text-amber-600 font-black text-xl">You are on hold waiting for lab results.</p>;
                          }
                          if (status === PATIENT_STATUSES.COMPLETED) {
                            return <p className="text-center text-blue-600 font-black text-xl">Your visit is complete.</p>;
                          }
                          if (status === PATIENT_STATUSES.READY_FOR_REVIEW) {
                            return <p className="text-center text-blue-600 font-black text-xl">Your lab results are ready. The doctor will review them shortly.</p>;
                          }
                          
                          // Waiting
                          const waitList = patients.filter(p => p.dept_id === patient.dept_id && normalizeStatus(p) === PATIENT_STATUSES.WAITING);
                          const myIndex = waitList.findIndex(p => p.id === patient.id);
                          
                          if (myIndex === -1) return null;
                          
                          const estimatedMins = (myIndex + 1) * 20;
                          
                          return (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <span className="text-slate-500 font-bold">Currently Serving</span>
                                <span className="font-black text-xl text-slate-900">{activeP ? activeP.display_token : 'None'}</span>
                              </div>
                              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <span className="text-slate-500 font-bold">Tokens Ahead</span>
                                <span className="font-black text-xl text-blue-600">{myIndex}</span>
                              </div>
                              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <span className="text-slate-500 font-bold">Estimated Wait Time</span>
                                <span className="font-black text-xl text-amber-600">~{estimatedMins} mins</span>
                              </div>
                              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-amber-400">
                                <span className="text-slate-500 font-bold">Expected Time</span>
                                <span className="font-black text-xl text-amber-600">
                                  {new Date(Date.now() + estimatedMins * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {DEPARTMENTS.map(d => {
                    const activeP = getCurrentServingPatient(d.id);
                    const waitList = patients.filter(p => p.dept_id === d.id && normalizeStatus(p) === PATIENT_STATUSES.WAITING);
                    return (
                      <div key={d.id} className="bg-white border rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start border-b pb-3 mb-4">
                            <h3 className="font-black text-lg text-slate-800">{d.name}</h3>
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold">{waitList.length} Waiting</span>
                          </div>
                          <div className="bg-slate-900 text-center py-4 rounded-2xl text-white font-black text-3xl tracking-wide mb-4">
                            {activeP ? activeP.display_token : `${d.id}-0`}
                          </div>
                        </div>
                        <p className="text-xs text-center text-slate-400 font-medium">Next: {waitList[0]?.display_token || 'None'}</p>
                      </div>
                    );
                  })}
                </div>


              </div>
            )}

            {view === 'doctor' && (
              <div className="space-y-8">
                <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Doctor Dashboard</p>
                    <h2 className="text-3xl font-black text-slate-900">Queue & Workstations</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-8">
                  <div className="space-y-8">
                    {DEPARTMENTS.map((d) => {
                      const servingPatient = getCurrentServingPatient(d.id);
                      const waitingCount = patients.filter(p => p.dept_id === d.id && normalizeStatus(p) === PATIENT_STATUSES.WAITING).length;
                      const holdCount = patients.filter(p => p.dept_id === d.id && normalizeStatus(p) === PATIENT_STATUSES.HOLD_LAB).length;

                      const activeReviewPatient = patients.find(p => p.display_token === selectedReviewToken && p.dept_id === d.id);
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
                            <p className="mt-4 text-5xl font-black tracking-tight">{activePatient ? activePatient.display_token : `${d.id}-0`}</p>
                            <p className="mt-2 text-sm uppercase text-slate-400">
                              {activePatient ? `${activePatient.name} ${isReviewStage ? '(Lab Review Recall)' : '(Primary Check)'}` : 'No active patient'}
                            </p>
                          </div>

                          {activePatient && (
                            <div className="mt-6 space-y-4">
                              <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold">
                                <p className="text-slate-900">Workflow Mode: <span className="text-blue-600">{isReviewStage ? "RETURNING LAB DATA VERIFICATION" : "INITIAL TRIAGE ALLOCATION"}</span></p>
                                {isReviewStage && <p className="text-xs text-emerald-600 mt-2 bg-emerald-50 p-2 rounded-lg">{activePatient.lab_results}</p>}
                              </div>

                              <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">1. Diagnostics Routing</label>
                                <div className="flex gap-2">
                                  <input type="text" placeholder="Type lab diagnostic tests..." disabled={isReviewStage} value={isReviewStage ? (activePatient.lab_tests || '') : (labInputs[d.id] || '')} onChange={(e) => setLabInputs(prev => ({ ...prev, [d.id]: e.target.value }))} className="w-full p-4 border rounded-2xl bg-slate-50 text-sm outline-none" />
                                  <button onClick={() => sendToLab(d.id)} disabled={isReviewStage} className={`p-4 rounded-2xl border ${isReviewStage ? 'bg-slate-100 text-slate-300' : 'bg-blue-600 text-white'}`}><Beaker size={20} /></button>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">2. Pharmacy Processing & Dismissal</label>
                                <div className="flex gap-2">
                                  <input type="text" placeholder="Type prescribed medicines..." disabled={!isReviewStage} value={medInputs[activePatient.display_token] || ''} onChange={(e) => setMedInputs(prev => ({ ...prev, [activePatient.display_token]: e.target.value }))} className="w-full p-4 border rounded-2xl bg-slate-50 text-sm outline-none" />
                                  <button onClick={() => completeVisit(d.id, activePatient.display_token)} disabled={!isReviewStage} className={`p-4 rounded-2xl border ${!isReviewStage ? 'bg-slate-100 text-slate-300' : 'bg-emerald-600 text-white'}`}><CheckCircle2 size={20} /></button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <aside className="space-y-8">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-xl font-black text-slate-900 mb-4">Patients Awaiting Labs</h3>
                      <div className="space-y-3">
                        {patients.filter(p => normalizeStatus(p) === PATIENT_STATUSES.HOLD_LAB).map(p => (
                          <div key={p.display_token} className="p-4 border rounded-2xl bg-white shadow-sm flex justify-between items-center">
                            <div>
                              <p className="font-black text-slate-900">{p.display_token}</p>
                              <p className="text-xs text-slate-500">{p.name} ({p.lab_tests})</p>
                            </div>
                            <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-1 rounded-full border border-amber-200 font-bold">IN LAB</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="text-xl font-black text-slate-900 mb-4">Doctor Recall Queue</h3>
                      <div className="space-y-3">
                        {patients.filter(p => normalizeStatus(p) === PATIENT_STATUSES.READY_FOR_REVIEW).map(p => (
                          <button key={p.display_token} onClick={() => setSelectedReviewToken(p.display_token)} className={`w-full text-left p-4 border rounded-2xl transition ${selectedReviewToken === p.display_token ? 'border-emerald-600 bg-emerald-50' : 'bg-white'}`}>
                            <p className="font-black text-slate-900">{p.display_token}</p>
                            <p className="text-xs text-slate-500">{p.name} ({p.dept_id})</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {view === 'manager' && (
              <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-fit">
                  <h2 className="text-2xl font-black mb-6">Patient Entry Desk</h2>
                  <form onSubmit={registerPatient} className="space-y-4">
                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none text-sm" />
                    <div className="grid grid-cols-2 gap-4">
                      <input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none text-sm" />
                      <input required type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} placeholder="Age" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none text-sm" />
                    </div>
                    <select value={formData.deptId} onChange={e => setFormData({ ...formData, deptId: e.target.value })} className="w-full p-4 border rounded-2xl bg-slate-50 font-semibold outline-none text-sm">
                      {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <textarea value={formData.complaint} onChange={e => setFormData({ ...formData, complaint: e.target.value })} placeholder="Chief Complaint Details..." rows="3" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none text-sm resize-none" />
                    <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-sm">Generate Queue Token</button>
                  </form>
                  <button onClick={resetSystemForNewDay} className="w-full mt-6 border border-red-200 text-red-500 p-3 rounded-2xl text-xs font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"><Trash2 size={14} /> Reset System Database</button>
                </div>

                <div className="lg:col-span-3 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                  <h2 className="text-2xl font-black mb-6">Master Patient Registry</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b uppercase text-xs text-slate-400 font-bold">
                          <th className="pb-3">Token</th>
                          <th className="pb-3">Patient</th>
                          <th className="pb-3">Department</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {patients.map(p => (
                          <tr key={p.display_token}>
                            <td className="py-3 font-black text-blue-600">{p.display_token}</td>
                            <td className="py-3 font-medium">{p.name} <span className="text-xs text-slate-400">({p.age})</span></td>
                            <td className="py-3 font-bold text-slate-500">{p.dept_id}</td>
                            <td className="py-3"><span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100">{p.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {view === 'lab' && (
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 max-w-2xl mx-auto shadow-sm">
                <h2 className="text-2xl font-black mb-6">Diagnostics Desk</h2>
                <div className="space-y-4">
                  {labRequests.length === 0 ? <p className="text-center py-6 text-slate-400 italic">No lab requests logged.</p> :
                    labRequests.map(r => (
                      <div key={r.id} className={`p-5 border rounded-2xl flex justify-between items-center ${r.status === 'Completed' ? 'bg-slate-50 opacity-60' : 'bg-blue-50/30 border-blue-100'}`}>
                        <div>
                          <p className="font-black text-blue-600 text-lg">{r.token}</p>
                          <p className="text-sm text-slate-700 mt-1 font-medium">Test: <span className="font-medium text-slate-900">{r.tests}</span></p>
                        </div>
                        {r.status === 'Pending' ? (
                          <button onClick={() => completeLabRequest(r.id, r.token, r.tests)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm">Release Findings</button>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-xl">Completed</span>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {view === 'pharmacy' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <div className="flex items-center gap-4 mb-8 border-b pb-6">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><ShoppingBag size={32} /></div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900">Medical Store</h2>
                      <p className="text-slate-500 font-bold">Pending Prescriptions</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {prescriptions.length === 0 ? <p className="text-center py-10 text-slate-400 italic">No prescriptions logged.</p> :
                      prescriptions.map(p => (
                        <div key={p.id} className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-center gap-4 ${p.status === 'Dispensed' ? 'bg-slate-50 opacity-60' : 'bg-emerald-50/30 border-emerald-100'}`}>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-2xl font-black text-emerald-700">{p.token}</span>
                              <span className="text-xs font-bold text-slate-400">{p.timestamp}</span>
                            </div>
                            <p className="font-bold text-slate-700">Rx Formulary: <span className="font-medium text-slate-900">{p.medicines}</span></p>
                          </div>
                          {p.status === 'Pending' ? (
                            <button
                              onClick={async () => {
                                try {
                                  await fetch(`${API_BASE}/api/pharmacy/${p.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'Dispensed' })
                                  });
                                  fetchData();
                                } catch (err) {
                                  alert('Error: ' + err.message);
                                }
                              }}
                              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-sm"
                            >
                              Dispense Medicines
                            </button>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-xl">Dispensed</span>
                          )}
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}