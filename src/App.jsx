import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Home, Gamepad2, User, Settings, FileText, 
  Moon, Sun, Plus, Search, MessageCircle, Feather, PenTool, 
  BookMarked, Globe, Heart, Library, LogOut, Check, X, 
  Edit3, Shield, UserPlus, UsersRound, AlertCircle,
  CheckCircle2, Crown, Send, Loader2
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  onAuthStateChanged, signOut 
} from "firebase/auth";
import { 
  getFirestore, collection, doc, setDoc, getDoc, updateDoc, 
  onSnapshot, addDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJ0G2GQPMjtP8atxWDh8yX5kZdDV5UjDA",
  authDomain: "al-bud-b9af9.firebaseapp.com",
  projectId: "al-bud-b9af9",
  storageBucket: "al-bud-b9af9.firebasestorage.app",
  messagingSenderId: "414499709060",
  appId: "1:414499709060:web:1852782556776230b362d1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "al-bud-b9af9";

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [theme, setTheme] = useState('light');
  const [route, setRoute] = useState('login');
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [works, setWorks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);

  const navigateTo = (target) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setRoute(target);
      setIsTransitioning(false);
      window.scrollTo(0, 0);
    }, 300);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.email === 'admin@albud.com') {
          setUserData({ role: 'admin', fullName: 'Administrator', username: 'admin' });
          setRoute('admin');
        } else {
          try {
            const userDoc = await getDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'info'));
            if (userDoc.exists()) {
              setUserData(userDoc.data());
              setRoute('home');
            } else {
              setUserData({ role: 'author', fullName: 'User BSA' });
              setRoute('home');
            }
          } catch (e) {
            setRoute('home');
          }
        }
      } else {
        setUser(null);
        setUserData(null);
        setRoute('login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubWorks = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'works'), (snap) => {
      setWorks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubUsers = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), (snap) => {
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubWorks(); unsubUsers(); };
  }, [user]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const themeClasses = theme === 'light' ? 'bg-[#FDF8F8] text-gray-900' : 'bg-[#120505] text-gray-100';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F8]">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <BookOpen className="text-red-600" size={60} />
          <h2 className="text-2xl font-serif font-bold text-red-600 tracking-widest">AL-BU'D AL-ILMI</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClasses}`}>
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] bg-white/40 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="text-red-600 animate-spin" size={40} />
        </div>
      )}

      {user && route !== 'login' && (
        <nav className="sticky top-0 z-50 backdrop-blur-xl border-b dark:border-red-900/20 px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-black/80">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('home')}>
            <BookOpen size={20} className="text-red-600" />
            <span className="font-black text-xs tracking-tighter text-red-600">BSA DIGITAL</span>
          </div>
          <div className="flex items-center gap-4">
            <Home onClick={() => navigateTo('home')} size={20} className={route === 'home' ? 'text-red-600' : 'opacity-40'} />
            <Gamepad2 onClick={() => navigateTo('games')} size={20} className={route === 'games' ? 'text-red-600' : 'opacity-40'} />
            <UsersRound onClick={() => navigateTo('social')} size={20} className={route === 'social' ? 'text-red-600' : 'opacity-40'} />
            <User onClick={() => navigateTo('profile')} size={20} className={route === 'profile' ? 'text-red-600' : 'opacity-40'} />
            <button onClick={toggleTheme} className="ml-2">{theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}</button>
          </div>
        </nav>
      )}

      <main className="max-w-4xl mx-auto p-4 pb-24">
        {route === 'login' && <LoginView theme={theme} navigateTo={navigateTo} />}
        {route === 'home' && <HomeView setSelectedCategory={setSelectedCategory} navigateTo={navigateTo} />}
        {route === 'category' && <CategoryView category={selectedCategory} works={works} navigateTo={navigateTo} setSelectedWork={setSelectedWork} />}
        {route === 'work-detail' && <WorkDetailView work={selectedWork} />}
        {route === 'write' && <WriteWorkView user={userData} currentUid={user?.uid} navigateTo={navigateTo} />}
        {route === 'profile' && <ProfileView userData={userData} />}
        {route === 'social' && <SocialView allUsers={allUsers} />}
        {route === 'games' && <GamesView />}
        {route === 'admin' && <AdminView works={works} navigateTo={navigateTo} setSelectedWork={setSelectedWork} />}
      </main>

      {user && route === 'home' && userData?.role !== 'admin' && (
        <button onClick={() => navigateTo('write')} className="fixed bottom-8 right-8 w-16 h-16 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50">
          <Plus size={32} />
        </button>
      )}
    </div>
  );
}

function LoginView({ theme, navigateTo }) {
  const [mode, setMode] = useState('penulis');
  const [form, setForm] = useState({ email: '', password: '', fullName: '', username: '' });
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'admin') {
        if (form.username === 'admin' && form.password === 'admin123') {
          await signInWithEmailAndPassword(auth, 'admin@albud.com', 'admin123');
        }
      } else if (mode === 'penulis') {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const profile = { uid: res.user.uid, fullName: form.fullName, username: form.username.toLowerCase(), role: 'author' };
        await setDoc(doc(db, 'artifacts', appId, 'users', res.user.uid, 'profile', 'info'), profile);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', res.user.uid), profile);
      }
    } catch (err) { alert("Gagal Login"); }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center pt-10">
      <h1 className="text-3xl font-black text-red-600 mb-8 font-serif">AL-BU'D AL-ILMI</h1>
      <div className={`w-full max-w-md p-8 rounded-3xl shadow-xl border ${theme === 'dark' ? 'bg-[#1a0808] border-red-900/30' : 'bg-white'}`}>
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setMode('penulis')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${mode === 'penulis' ? 'bg-white text-red-600' : 'opacity-40'}`}>MASUK</button>
          <button onClick={() => setMode('daftar')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${mode === 'daftar' ? 'bg-white text-red-600' : 'opacity-40'}`}>DAFTAR</button>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'daftar' && <input placeholder="Nama" className="w-full p-3 rounded-lg border dark:bg-black" onChange={e=>setForm({...form, fullName: e.target.value})} />}
          <input placeholder="Email/User" className="w-full p-3 rounded-lg border dark:bg-black" onChange={e=>setForm({...form, email: e.target.value, username: e.target.value})} />
          <input type="password" placeholder="Password" className="w-full p-3 rounded-lg border dark:bg-black" onChange={e=>setForm({...form, password: e.target.value})} />
          <button className="w-full bg-red-600 text-white font-bold py-3 rounded-lg">{loading ? '...' : 'GAS!'}</button>
        </form>
      </div>
    </div>
  );
}

function HomeView({ setSelectedCategory, navigateTo }) {
  const cats = ["Linguistik", "Sastra", "Opini & Esai", "Resensi", "Sospol", "Kebudayaan"];
  return (
    <div className="grid grid-cols-2 gap-4 pt-6">
      {cats.map(c => (
        <div key={c} onClick={() => {setSelectedCategory(c); navigateTo('category')}} className="p-8 bg-white dark:bg-[#1a0a0a] rounded-3xl border text-center cursor-pointer font-bold text-xs uppercase">{c}</div>
      ))}
    </div>
  );
}

function CategoryView({ category, works, navigateTo, setSelectedWork }) {
  const filtered = works.filter(w => w.category === category && w.status === 'approved');
  return (
    <div className="space-y-4 pt-4">
      <h2 className="text-2xl font-black uppercase">{category}</h2>
      {filtered.map(w => (
        <div key={w.id} onClick={() => {setSelectedWork(w); navigateTo('work-detail')}} className="p-4 bg-white dark:bg-[#1a0a0a] rounded-2xl border cursor-pointer">
          <h3 className="font-bold">{w.title}</h3>
          <p className="text-[10px] text-red-600 font-bold">OLEH: {w.authorName}</p>
        </div>
      ))}
    </div>
  );
}

function WorkDetailView({ work }) {
  return (
    <div className="pt-4">
      <h1 className="text-3xl font-bold mb-2">{work?.title}</h1>
      <p className="opacity-60 mb-6">Penulis: {work?.authorName}</p>
      <div className="leading-relaxed whitespace-pre-wrap">{work?.content}</div>
    </div>
  );
}

function WriteWorkView({ user, currentUid, navigateTo }) {
  const [form, setForm] = useState({ title: '', cat: 'Linguistik', content: '' });
  const handlePublish = async () => {
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'works'), {
      ...form, authorId: currentUid, authorName: user.fullName, status: 'pending', createdAt: Date.now()
    });
    navigateTo('home');
  };
  return (
    <div className="space-y-4 pt-4">
      <input placeholder="Judul" className="w-full p-3 rounded-lg border dark:bg-black" onChange={e=>setForm({...form, title: e.target.value})} />
      <textarea placeholder="Isi..." className="w-full p-3 rounded-lg border dark:bg-black min-h-[200px]" onChange={e=>setForm({...form, content: e.target.value})} />
      <button onClick={handlePublish} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg">KIRIM</button>
    </div>
  );
}

function ProfileView({ userData }) {
  return (
    <div className="text-center pt-10">
      <h2 className="text-2xl font-black">{userData?.fullName}</h2>
      <button onClick={() => signOut(auth)} className="mt-6 text-red-600 font-bold">KELUAR</button>
    </div>
  );
}

function SocialView({ allUsers }) {
  return (
    <div className="space-y-3 pt-4">
      {allUsers.map(u => (
        <div key={u.id} className="p-4 bg-white dark:bg-[#1a0a0a] rounded-xl border flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center font-bold">{u.fullName?.[0]}</div>
          <p className="font-bold">{u.fullName}</p>
        </div>
      ))}
    </div>
  );
}

function GamesView() { return <div className="pt-20 text-center opacity-20 font-black">SEGERA HADIR</div>; }

function AdminView({ works }) {
  const pending = works.filter(w => w.status === 'pending');
  const updateStatus = async (id, status) => await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'works', id), { status });
  return (
    <div className="space-y-4 pt-4">
      <h2 className="text-xl font-bold">MODERASI</h2>
      {pending.map(w => (
        <div key={w.id} className="p-4 border rounded-xl bg-white dark:bg-black">
          <p className="font-bold">{w.title}</p>
          <div className="flex gap-2 mt-2">
            <button onClick={()=>updateStatus(w.id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded text-xs">TERIMA</button>
            <button onClick={()=>updateStatus(w.id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-xs">TOLAK</button>
          </div>
        </div>
      ))}
    </div>
  );
}
