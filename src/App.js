// import React, { useState, useEffect } from 'react';
// import { Users, UserCircle, Stethoscope, Search, ChevronRight, FileText, MapPin, Phone, MessageSquare, Clock, Trash2, Lock } from 'lucide-react';

// const DEPARTMENTS = [
//   { id: 'CARD', name: 'Cardiology' }, { id: 'GYN', name: 'Gynecology' },
//   { id: 'OPH', name: 'Ophthalmology' }, { id: 'PED', name: 'Pediatrics' },
//   { id: 'ORTHO', name: 'Orthopedics' }, { id: 'DERM', name: 'Dermatology' },
//   { id: 'NEURO', name: 'Neurology' }, { id: 'ENT', name: 'ENT' },
//   { id: 'DENT', name: 'Dental' }, { id: 'GEN', name: 'General Medicine' }
// ];

// const WAIT_PER_PATIENT = 20;

// const LoginView = ({ handleLogin, loginForm, setLoginForm, view }) => (
//   <div className="flex items-center justify-center mt-20">
//     <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
//       <div className="flex justify-center mb-6 text-blue-600"><Lock size={48} /></div>
//       <h2 className="text-2xl font-black text-center mb-6 uppercase tracking-tight">
//         {view === 'doctor' ? 'Doctor Login' : 'Staff Login'}
//       </h2>
//       <form onSubmit={handleLogin} className="space-y-4">
//         <input
//           required
//           placeholder="Username"
//           value={loginForm.username}
//           className="w-full p-4 border rounded-2xl bg-slate-50 outline-none"
//           onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
//         />
//         <input
//           required
//           type="password"
//           placeholder="Password"
//           value={loginForm.password}
//           className="w-full p-4 border rounded-2xl bg-slate-50 outline-none"
//           onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
//         />
//         <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition">Access Dashboard</button>
//       </form>
//     </div>
//   </div>
// );

// export default function SmartHospital() {
//   const [view, setView] = useState('patient');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loginForm, setLoginForm] = useState({ username: '', password: '' });

//   // States with LocalStorage support
//   const [patients, setPatients] = useState(() => JSON.parse(localStorage.getItem('hospital_patients')) || []);
//   const [serving, setServing] = useState(() => JSON.parse(localStorage.getItem('hospital_serving')) || DEPARTMENTS.reduce((a, d) => ({ ...a, [d.id]: 0 }), {}));
//   const [deptTokenCounters, setDeptTokenCounters] = useState(() => JSON.parse(localStorage.getItem('hospital_counters')) || DEPARTMENTS.reduce((a, d) => ({ ...a, [d.id]: 1 }), {}));

//   const [formData, setFormData] = useState({ name: '', phone: '', age: '', gender: 'Male', address: '', complaint: '', deptId: 'CARD' });
//   const [searchToken, setSearchToken] = useState('');

//   // --- NEW: AUTOMATIC DAILY RESET LOGIC ---
//   useEffect(() => {
//     const lastResetDate = localStorage.getItem('hospital_last_reset');
//     const today = new Date().toDateString();

//     if (lastResetDate !== today) {
//       setPatients([]);
//       setServing(DEPARTMENTS.reduce((a, d) => ({ ...a, [d.id]: 0 }), {}));
//       setDeptTokenCounters(DEPARTMENTS.reduce((a, d) => ({ ...a, [d.id]: 1 }), {}));
//       localStorage.setItem('hospital_last_reset', today);
//     }
//   }, []);

//   useEffect(() => { localStorage.setItem('hospital_patients', JSON.stringify(patients)); }, [patients]);
//   useEffect(() => { localStorage.setItem('hospital_serving', JSON.stringify(serving)); }, [serving]);
//   useEffect(() => { localStorage.setItem('hospital_counters', JSON.stringify(deptTokenCounters)); }, [deptTokenCounters]);

//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (loginForm.username === 'harisai' && loginForm.password === 'harisai@1234') {
//       setIsAuthenticated(true);
//     } else {
//       alert("Invalid Credentials, try again!");
//     }
//   };

//   const logout = () => {
//     setIsAuthenticated(false);
//     setView('patient');
//     setLoginForm({ username: '', password: '' });
//   };

//   const registerPatient = (e) => {
//     e.preventDefault();
//     const tokenNumber = deptTokenCounters[formData.deptId];
//     const displayToken = `${formData.deptId}-${tokenNumber}`;
//     const newToken = { displayToken, tokenNumber, ...formData, timeJoined: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
//     setPatients([...patients, newToken]);
//     setDeptTokenCounters(prev => ({ ...prev, [formData.deptId]: prev[formData.deptId] + 1 }));
//     setFormData({ name: '', phone: '', age: '', gender: 'Male', address: '', complaint: '', deptId: 'CARD' });
//     alert(`Token issued: ${displayToken}`);
//   };

//   const nextPatient = (dId) => {
//     const nextTokenNum = serving[dId] + 1;
//     if (patients.some(p => p.deptId === dId && p.tokenNumber === nextTokenNum)) {
//       setServing(prev => ({ ...prev, [dId]: nextTokenNum }));
//     } else {
//       alert(`Alert: Next patient (${dId}-${nextTokenNum}) is not registered yet.`);
//     }
//   };

//   // --- NEW: REMOVE INDIVIDUAL PATIENT ---
//   const removePatient = (tokenToRemove) => {
//     if (window.confirm(`Remove token ${tokenToRemove} from the list?`)) {
//       setPatients(patients.filter(p => p.displayToken !== tokenToRemove));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
//       <nav className="bg-white shadow-sm p-4 flex justify-center gap-6 border-b sticky top-0 z-10">
//         <button onClick={() => { setView('patient'); setIsAuthenticated(false); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${view === 'patient' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}><UserCircle size={18} /> Patient View</button>
//         <button onClick={() => { setView('manager'); setIsAuthenticated(false); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${view === 'manager' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}><Users size={18} /> Staff</button>
//         <button onClick={() => { setView('doctor'); setIsAuthenticated(false); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${view === 'doctor' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}><Stethoscope size={18} /> Doctors</button>
//         {isAuthenticated && <button onClick={logout} className="text-red-500 font-bold ml-4 border-l pl-4">Logout</button>}
//       </nav>

//       <main className="p-6 max-w-7xl mx-auto">
//         {(view === 'manager' || view === 'doctor') && !isAuthenticated ? (
//           <LoginView handleLogin={handleLogin} loginForm={loginForm} setLoginForm={setLoginForm} view={view} />
//         ) : (
//           <>
//             {view === 'manager' && (
//               <div className="grid lg:grid-cols-5 gap-8">
//                 <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-fit">
//                   <h2 className="text-2xl font-black mb-6">Patient Entry</h2>
//                   <form onSubmit={registerPatient} className="space-y-4">
//                     <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none" />
//                     <div className="grid grid-cols-2 gap-4">
//                       <input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none" />
//                       <input required value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} placeholder="Age" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none" />
//                     </div>
//                     <select value={formData.deptId} onChange={e => setFormData({ ...formData, deptId: e.target.value })} className="w-full p-4 border rounded-2xl bg-slate-50">
//                       {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
//                     </select>
//                     <textarea required value={formData.complaint} onChange={e => setFormData({ ...formData, complaint: e.target.value })} placeholder="Complaint" rows="2" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none"></textarea>
//                     <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">Issue Token</button>
//                   </form>
//                 </div>
//                 <div className="lg:col-span-3 space-y-4 max-h-[700px] overflow-y-auto pr-2">
//                   <h2 className="text-xl font-bold px-2 italic text-slate-400 uppercase tracking-tighter">Today's Series</h2>
//                   {/* FIXED: Removed .reverse() to show cards in 1, 2, 3... series order */}
//                   {patients.map(p => (
//                     <div key={p.displayToken} className="bg-white p-5 rounded-3xl border shadow-sm flex justify-between items-center group transition-all hover:border-blue-200">
//                       <div>
//                         <p className="text-2xl font-black text-blue-600">{p.displayToken}</p>
//                         <p className="font-bold text-slate-800">{p.name}</p>
//                         <p className="text-[10px] text-slate-400 font-bold">{p.timeJoined}</p>
//                       </div>
//                       <div className="flex items-center gap-3">
//                         <span className="bg-slate-100 px-4 py-2 rounded-full text-[10px] font-black uppercase text-slate-500">{p.deptId}</span>
//                         {/* TRASH BUTTON ADDED HERE */}
//                         <button
//                           onClick={() => removePatient(p.displayToken)}
//                           className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {view === 'doctor' && (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                 {DEPARTMENTS.map(d => (
//                   <div key={d.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm">
//                     <div className="flex justify-between items-center mb-6"><h3 className="font-black text-xl">{d.name}</h3><span className="text-xl font-black text-blue-600">{patients.filter(p => p.deptId === d.id && p.tokenNumber > serving[d.id]).length} Wait</span></div>
//                     <div className="text-center py-10 bg-slate-900 text-white rounded-[2rem] mb-6">
//                       <p className="text-[10px] opacity-50 uppercase font-black mb-1">Serving Now</p>
//                       <p className="text-6xl font-black tracking-tighter">{d.id}-{serving[d.id]}</p>
//                     </div>
//                     <button onClick={() => nextPatient(d.id)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition">Call Next</button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         )}

//         {view === 'patient' && (
//           <div className="max-w-xl mx-auto text-center mt-12 animate-in fade-in duration-700">
//             <h1 className="text-5xl font-black text-slate-900 mb-10 tracking-tighter italic">Queue Tracker</h1>
//             <div className="relative mb-12 group">
//               <input type="text" onChange={(e) => setSearchToken(e.target.value.toUpperCase())} placeholder="Example: CARD-1" className="w-full p-6 pl-16 border-2 border-slate-200 rounded-3xl text-3xl font-black focus:border-blue-500 outline-none uppercase shadow-sm" />
//               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={32} />
//             </div>
//             {searchToken && patients.find(p => p.displayToken === searchToken) ? (
//               (() => {
//                 const p = patients.find(p => p.displayToken === searchToken);
//                 const opsAhead = p.tokenNumber - serving[p.deptId];
//                 return opsAhead > 0 ? (
//                   <div className="bg-white p-10 rounded-[3rem] shadow-2xl border relative overflow-hidden">
//                     <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
//                     <p className="text-blue-600 uppercase tracking-widest text-xs font-black mb-4">{DEPARTMENTS.find(d => d.id === p.deptId).name}</p>
//                     <div className="flex justify-around items-center mb-8">
//                       <div className="text-left"><p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tight">Serving Now</p><p className="text-5xl font-black">{p.deptId}-{serving[p.deptId]}</p></div>
//                       <div className="text-right"><p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-tight">Your Token</p><p className="text-5xl font-black text-blue-600">{p.displayToken}</p></div>
//                     </div>
//                     <div className="grid grid-cols-2 gap-6 pt-8 border-t">
//                       <div className="bg-red-50 p-6 rounded-3xl text-red-600 font-black text-2xl">~{opsAhead * 20}m<p className="text-[10px] uppercase font-bold text-red-400">Wait Time</p></div>
//                       <div className="bg-slate-50 p-6 rounded-3xl font-black text-2xl">{opsAhead}<p className="text-[10px] uppercase font-bold text-slate-400">OPs Ahead</p></div>
//                     </div>
//                   </div>
//                 ) : <div className="bg-green-600 text-white p-12 rounded-[3rem] text-3xl font-black shadow-xl">PLEASE GO TO COUNTER!</div>;
//               })()
//             ) : null}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }



import React, { useState, useEffect } from 'react';
import { Users, UserCircle, Stethoscope, Search, FileText, Trash2, Lock, Beaker, Pill, ShoppingBag, CheckCircle2 } from 'lucide-react';

const DEPARTMENTS = [
  { id: 'CARD', name: 'Cardiology' }, { id: 'GYN', name: 'Gynecology' },
  { id: 'OPH', name: 'Ophthalmology' }, { id: 'PED', name: 'Pediatrics' },
  { id: 'ORTHO', name: 'Orthopedics' }, { id: 'DERM', name: 'Dermatology' },
  { id: 'NEURO', name: 'Neurology' }, { id: 'ENT', name: 'ENT' },
  { id: 'DENT', name: 'Dental' }, { id: 'GEN', name: 'General Medicine' }
];

const WAIT_PER_PATIENT = 20;

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
  const [medInputs, setMedInputs] = useState({}); // New: Store medicine inputs for doctors

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
    const newToken = { displayToken, tokenNumber, ...formData, timeJoined: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setPatients([...patients, newToken]);
    setDeptTokenCounters(prev => ({ ...prev, [formData.deptId]: prev[formData.deptId] + 1 }));
    setFormData({ name: '', phone: '', age: '', gender: 'Male', address: '', complaint: '', deptId: 'CARD' });
    alert(`Token issued: ${displayToken}`);
  };

  const nextPatient = (dId) => {
    const nextTokenNum = serving[dId] + 1;
    if (patients.some(p => p.deptId === dId && p.tokenNumber === nextTokenNum)) {
      setServing(prev => ({ ...prev, [dId]: nextTokenNum }));
      setLabInputs(prev => ({ ...prev, [dId]: '' }));
      setMedInputs(prev => ({ ...prev, [dId]: '' }));
    } else {
      alert(`Alert: Next patient (${dId}-${nextTokenNum}) is not registered yet.`);
    }
  };

  const sendToLab = (dId) => {
    const currentNum = serving[dId];
    if (currentNum === 0) return alert("Call a patient first.");
    if (!labInputs[dId]?.trim()) return alert("Enter tests.");

    const newRequest = { id: Date.now(), token: `${dId}-${currentNum}`, tests: labInputs[dId], status: 'Pending', timestamp: new Date().toLocaleTimeString() };
    setLabRequests([newRequest, ...labRequests]);
    setLabInputs({ ...labInputs, [dId]: '' });
    alert("Sent to Lab!");
  };

  const sendToPharmacy = (dId) => {
    const currentNum = serving[dId];
    if (currentNum === 0) return alert("Call a patient first.");
    if (!medInputs[dId]?.trim()) return alert("Enter medicines.");

    const newPrescription = {
      id: Date.now(), 
      token: `${dId}-${currentNum}`,
      medicines: medInputs[dId],
      status: 'Pending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setPrescriptions([newPrescription, ...prescriptions]);
    setMedInputs({ ...medInputs, [dId]: '' });
    alert("Prescription sent to Medical Store!");
  };

  const resetSystemForNewDay = () => {
    if (window.confirm("Reset all data?")) {
      setPatients([]); setServing(DEPARTMENTS.reduce((a, d) => ({ ...a, [d.id]: 0 }), {}));
      setDeptTokenCounters(DEPARTMENTS.reduce((a, d) => ({ ...a, [d.id]: 1 }), {}));
      setLabRequests([]); setPrescriptions([]);
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
            {/* MANAGER & DOCTOR VIEWS REMAIN SIMILAR BUT DOCTOR GETS NEW PHARMACY BUTTON */}
            {view === 'doctor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {DEPARTMENTS.map(d => (
                  <div key={d.id} className="bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-black text-xl">{d.name}</h3>
                      <span className="text-blue-600 font-bold">{patients.filter(p => p.deptId === d.id && p.tokenNumber > serving[d.id]).length} waiting</span>
                    </div>
                    <div className="text-center py-6 bg-slate-900 text-white rounded-[2rem] mb-6">
                      <p className="text-[10px] opacity-50 uppercase font-black">Serving Now</p>
                      <p className="text-5xl font-black">{d.id}-{serving[d.id]}</p>
                    </div>

                    {serving[d.id] > 0 && (
                      <div className="space-y-3 mb-6">
                        <div className="flex gap-2">
                          <input placeholder="Tests..." value={labInputs[d.id] || ''} onChange={e => setLabInputs({ ...labInputs, [d.id]: e.target.value })} className="flex-1 border rounded-xl px-3 py-2 bg-slate-50 text-sm outline-none" />
                          <button onClick={() => sendToLab(d.id)} className="bg-blue-100 text-blue-600 p-3 rounded-xl hover:bg-blue-200"><Beaker size={18} /></button>
                        </div>
                        <div className="flex gap-2">
                          <input placeholder="Medicines..." value={medInputs[d.id] || ''} onChange={e => setMedInputs({ ...medInputs, [d.id]: e.target.value })} className="flex-1 border rounded-xl px-3 py-2 bg-slate-50 text-sm outline-none" />
                          <button onClick={() => sendToPharmacy(d.id)} className="bg-emerald-100 text-emerald-600 p-3 rounded-xl hover:bg-emerald-200"><Pill size={18} /></button>
                        </div>
                      </div>
                    )}
                    <button onClick={() => nextPatient(d.id)} className="w-full mt-auto bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition">Call Next</button>
                  </div>
                ))}
              </div>
            )}

            {/* PHARMACY DASHBOARD */}
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
                    {prescriptions.length === 0 ? <p className="text-center py-10 text-slate-400 italic">No prescriptions yet.</p> :
                      prescriptions.map(p => (
                        <div key={p.id} className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-center gap-4 ${p.status === 'Dispensed' ? 'bg-slate-50 opacity-60' : 'bg-emerald-50/30 border-emerald-100'}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-2xl font-black text-emerald-700">{p.token}</span>
                              <span className="text-xs font-bold text-slate-400">{p.timestamp}</span>
                            </div>
                            <p className="font-bold text-slate-700">Rx: <span className="font-medium">{p.medicines}</span></p>
                          </div>
                          {p.status === 'Pending' ? (
                            <button onClick={() => setPrescriptions(prescriptions.map(pre => pre.id === p.id ? { ...pre, status: 'Dispensed' } : pre))} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition">Mark Dispensed</button>
                          ) : <span className="text-emerald-600 font-black flex items-center gap-1"><CheckCircle2 size={18} /> Completed</span>}
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}

            {/* KEEP EXISTING MANAGER, LAB, AND PATIENT VIEWS BELOW */}
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
                    <textarea required value={formData.complaint} onChange={e => setFormData({ ...formData, complaint: e.target.value })} placeholder="Complaint" rows="2" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none"></textarea>
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
                    {labRequests.length === 0 ? <p className="text-center py-20 text-slate-400 italic">No lab requests.</p> :
                      labRequests.map(req => (
                        <div key={req.id} className={`p-6 rounded-3xl border flex justify-between items-center ${req.status === 'Completed' ? 'bg-green-50/50' : 'bg-slate-50'}`}>
                          <div>
                            <span className="text-2xl font-black text-blue-600">{req.token}</span>
                            <p className="font-bold text-slate-700">Test: <span className="font-medium">{req.tests}</span></p>
                          </div>
                          {req.status === 'Pending' ? (
                            <button onClick={() => setLabRequests(labRequests.map(r => r.id === req.id ? { ...r, status: 'Completed' } : r))} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold">Done</button>
                          ) : <span className="text-green-600 font-bold">✓ Done</span>}
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
                  <input type="text" onChange={(e) => setSearchToken(e.target.value.toUpperCase())} placeholder="Example: CARD-1" className="w-full p-6 pl-16 border-2 border-slate-200 rounded-3xl text-3xl font-black focus:border-blue-500 outline-none uppercase shadow-sm" />
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={32} />
                </div>
                {searchToken && patients.find(p => p.displayToken === searchToken) ? (
                  (() => {
                    const p = patients.find(p => p.displayToken === searchToken);
                    const opsAhead = p.tokenNumber - serving[p.deptId];
                    const waitTimeMins = opsAhead * WAIT_PER_PATIENT;
                    return opsAhead > 0 ? (
                      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border">
                        <p className="text-blue-600 uppercase font-black mb-4">{DEPARTMENTS.find(d => d.id === p.deptId).name}</p>
                        <div className="flex justify-around items-center mb-8">
                          <div><p className="text-xs text-slate-400 font-bold mb-1">SERVING</p><p className="text-5xl font-black">{p.deptId}-{serving[p.deptId]}</p></div>
                          <div><p className="text-xs text-slate-400 font-bold mb-1">YOUR TOKEN</p><p className="text-5xl font-black text-blue-600">{p.displayToken}</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                          <div className="bg-red-50 p-4 rounded-2xl"><p className="font-black text-xl">~{waitTimeMins}m</p><p className="text-[10px] text-red-400">WAIT TIME</p></div>
                          <div className="bg-slate-50 p-4 rounded-2xl"><p className="font-black text-xl">{opsAhead}</p><p className="text-[10px] text-slate-400">AHEAD</p></div>
                        </div>
                      </div>
                    ) : <div className="bg-green-600 text-white p-12 rounded-[3rem] text-3xl font-black shadow-xl">YOUR TURN! GO TO COUNTER</div>;
                  })()
                ) : null}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

