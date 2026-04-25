```react
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Home, Gamepad2, User, Settings, FileText, 
  Moon, Sun, Plus, Search, MessageCircle, Feather, PenTool, 
  BookMarked, Globe, Heart, Library, LogOut, Check, X, 
  Edit3, Shield, UserPlus, UsersRound, AlertCircle,
  CheckCircle2, Crown, Send, Loader2
} from 'lucide-react';

// --- FIREBASE SETUP ---
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  onAuthStateChanged, signOut, signInAnonymously 
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
  const [quiz, setQuiz] = useState(null);
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

  // Inisialisasi Auth & Profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Cek Admin atau User Biasa
        if (currentUser.email === 'admin@albud.com') {
          setUserData({ role: 'admin', fullName: 'Administrator', username: 'admin' });
          setRoute('admin');
          setLoading(false);
        } else {
          try {
            // Ambil data profil
            const userDoc = await getDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'info'));
            if (userDoc.exists()) {
              setUserData(userDoc.data());
              setRoute('home');
            } else {
              // Jika data belum ada, set profil default sementara
              setUserData({ role: 'author', fullName: 'User BSA' });
              setRoute('home');
            }
          } catch (e) {
            console.error("Error fetching profile", e);
            setRoute('home'); // Tetap masuk meskipun error profile
          }
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserData(null);
        setRoute('login');
        setLoading(false);
      }
    });
    
    // Timeout pengaman jika loading tertahan lebih dari 5 detik
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Data Realtime Listeners
  useEffect(() => {
    if (!user) return;
    const unsubWorks = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'works'), (snap) => {
      setWorks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.log("Works Error", err));

    const unsubUsers = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), (snap) => {
      setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.log("Users Error", err));

    return () => { unsubWorks(); unsubUsers(); };
  }, [user]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const themeClasses = theme === 'light' ? 'bg-[#FDF8F8] text-gray-900' : 'bg-[#120505] text-gray-100';

  // Tampilan Loading Awal (Mencegah Blank Putih)
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-[#FDF8F8]`}>
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <BookOpen className="text-red-600" size={60} />
          <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-red-600 tracking-widest">AL-BU'D AL-ILMI</h2>
            <div className="mt-4 flex gap-1 justify-center">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClasses}`}>
      {/* Overlay Transisi Antar Halaman */}
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
            <Home onClick={() => navigateTo('home')} size={20} className={`cursor-pointer ${route === 'home' ? 'text-red-600' : 'opacity-40'}`} />
            <Gamepad2 onClick={() => navigateTo('games')} size={20} className={`cursor-pointer ${route === 'games' ? 'text-red-600' : 'opacity-40'}`} />
            <UsersRound onClick={() => navigateTo('social')} size={20} className={`cursor-pointer ${route === 'social' ? 'text-red-600' : 'opacity-40'}`} />
            <User onClick={() => navigateTo('profile')} size={20} className={`cursor-pointer ${route === 'profile' ? 'text-red-600' : 'opacity-40'}`} />
            <button onClick={toggleTheme} className="ml-2 p-2">{theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}</button>
          </div>
        </nav>
      )}

      <main className="max-w-4xl mx-auto p-4 pb-24">
        {route === 'login' && <LoginView theme={theme} navigateTo={navigateTo} setUserData={setUserData} />}
        {route === 'home' && <HomeView setSelectedCategory={setSelectedCategory} navigateTo={navigateTo} />}
        {route === 'category' && <CategoryView category={selectedCategory} works={works} navigateTo={navigateTo} setSelectedWork={setSelectedWork} />}
        {route === 'work-detail' && <WorkDetailView work={selectedWork} user={userData} currentUid={user?.uid} />}
        {route === 'write' && <WriteWorkView user={userData} currentUid={user?.uid} navigateTo={navigateTo} />}
        {route === 'profile' && <ProfileView userData={userData} currentUid={user?.uid} navigateTo={navigateTo} />}
        {route === 'social' && <SocialView allUsers={allUsers} currentUid={user?.uid} userData={userData} />}
        {route === 'games' && <GamesView />}
        {route === 'admin' && <AdminView works={works} navigateTo={navigateTo} setSelectedWork={setSelectedWork} />}
      </main>

      {user && route === 'home' && userData?.role !== 'admin' && (
        <button onClick={() => navigateTo('write')} className="fixed bottom-8 right-8 w-16 h-16 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
          <Plus size={32} />
        </button>
      )}
    </div>
  );
}

// --- SUB-VIEWS ---

function LoginView({ theme, navigateTo, setUserData }) {
  const [mode, setMode] = useState('penulis');
  const [form, setForm] = useState({ email: '', password: '', fullName: '', username: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === 'admin') {
        if (form.username === 'admin' && form.password === 'admin123') {
          await signInWithEmailAndPassword(auth, 'admin@albud.com', 'admin123');
        } else {
           throw new Error("Admin login gagal");
        }
      } else if (mode === 'penulis') {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const newProfile = {
          uid: res.user.uid,
          fullName: form.fullName,
          username: form.username.toLowerCase().replace(/\s/g, ''),
          role: 'author',
          createdAt: Date.now()
        };
        await setDoc(doc(db, 'artifacts', appId, 'users', res.user.uid, 'profile', 'info'), newProfile);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', res.user.uid), newProfile);
      }
    } catch (err) {
      setError("Gagal masuk. Periksa email/password.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center pt-10 px-4 animate-fade-in">
      <div className="flex flex-col items-center mb-12">
        <BookOpen className="text-red-600 animate-bounce" size={60} />
        <h1 className="text-3xl font-black text-red-600 mt-6 tracking-widest font-serif">AL-BU'D AL-ILMI</h1>
      </div>

      <div className={`w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border ${theme === 'dark' ? 'bg-[#1a0808] border-red-900/30' : 'bg-white border-red-100'}`}>
        <div className="flex gap-2 mb-8 bg-gray-100/50 dark:bg-black/50 p-1 rounded-2xl">
          <button onClick={() => setMode('penulis')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition ${mode === 'penulis' ? 'bg-white text-red-600 shadow-sm' : 'opacity-40'}`}>MASUK</button>
          <button onClick={() => setMode('daftar')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition ${mode === 'daftar' ? 'bg-white text-red-600 shadow-sm' : 'opacity-40'}`}>DAFTAR</button>
          <button onClick={() => setMode('admin')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition ${mode === 'admin' ? 'bg-white text-red-600 shadow-sm' : 'opacity-40'}`}>ADMIN</button>
        </div>

        {error && <div className="mb-4 text-red-500 text-[10px] font-bold text-center">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'daftar' && (
            <>
              <input placeholder="Nama Lengkap" className="w-full p-4 rounded-xl border dark:bg-black dark:border-red-900/20" value={form.fullName} onChange={e=>setForm({...form, fullName: e.target.value})} required />
              <input placeholder="Username" className="w-full p-4 rounded-xl border dark:bg-black dark:border-red-900/20" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} required />
            </>
          )}
          {mode === 'admin' ? (
             <input placeholder="Username Admin" className="w-full p-4 rounded-xl border dark:bg-black dark:border-red-900/20" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} required />
          ) : (
             <input placeholder="Email" className="w-full p-4 rounded-xl border dark:bg-black dark:border-red-900/20" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required />
          )}
          <input type="password" placeholder="Password" className="w-full p-4 rounded-xl border dark:bg-black dark:border-red-900/20" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} required />
          
          <button disabled={loading} className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all mt-4 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : "GAS!"}
          </button>
        </form>
      </div>
    </div>
  );
}

function HomeView({ setSelectedCategory, navigateTo }) {
  const cats = [
    { name: "Linguistik", icon: MessageCircle, color: "text-blue-500" },
    { name: "Sastra", icon: Feather, color: "text-purple-500" },
    { name: "Opini & Esai", icon: PenTool, color: "text-orange-500" },
    { name: "Resensi", icon: BookMarked, color: "text-emerald-500" },
    { name: "Sospol", icon: Globe, color: "text-indigo-500" },
    { name: "Kebudayaan", icon: Library, color: "text-amber-500" }
  ];

  return (
    <div className="pt-6 animate-slide-up">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black tracking-tight text-red-600">BERANDA KARYA</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cats.map(c => (
          <div 
            key={c.name} 
            onClick={() => {setSelectedCategory(c.name); navigateTo('category')}}
            className="p-8 bg-white dark:bg-[#1a0a0a] rounded-[2.5rem] border dark:border-red-900/20 shadow-sm flex flex-col items-center cursor-pointer hover:border-red-500 transition-all"
          >
            <div className={`${c.color} mb-4`}><c.icon size={32} /></div>
            <p className="font-bold text-xs text-center uppercase tracking-tighter">{c.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryView({ category, works, navigateTo, setSelectedWork }) {
  const filtered = works.filter(w => w.category === category && w.status === 'approved');
  return (
    <div className="pt-4 animate-fade-in">
      <h2 className="text-2xl font-black mb-8 uppercase">{category}</h2>
      <div className="space-y-4">
        {filtered.map(w => (
          <div key={w.id} onClick={() => {setSelectedWork(w); navigateTo('work-detail')}} className="p-6 bg-white dark:bg-[#1a0a0a] rounded-3xl border dark:border-red-900/20 cursor-pointer">
            <h3 className="font-bold text-lg">{w.title}</h3>
            <p className="text-[10px] font-bold text-red-600">OLEH: {w.authorName}</p>
          </div>
        ))}
        {filtered.length === 0 && <p className="opacity-40 italic text-center py-20">Belum ada karya.</p>}
      </div>
    </div>
  );
}

function WorkDetailView({ work }) {
  return (
    <div className="pt-4 animate-fade-in">
      <div className="bg-white dark:bg-[#1a0a0a] p-8 rounded-[3rem] border dark:border-red-900/10">
        <h1 className="text-3xl font-serif font-bold mb-4">{work.title}</h1>
        <p className="text-sm font-bold opacity-60 mb-8">Karya: {work.authorName}</p>
        <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed text-justify" dangerouslySetInnerHTML={{ __html: work.content.replace(/\n/g, '<br/>') }} />
      </div>
    </div>
  );
}

function WriteWorkView({ user, currentUid, navigateTo }) {
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("Linguistik");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!title || !content || loading) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'works'), {
        authorId: currentUid,
        authorName: user?.fullName || "Anonim",
        title,
        category: cat,
        content,
        status: 'pending',
        createdAt: Date.now()
      });
      navigateTo('home');
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  return (
    <div className="pt-4 animate-fade-in space-y-6">
       <h2 className="text-2xl font-black">TULIS GAGASAN</h2>
       <input placeholder="Judul" className="w-full p-4 rounded-2xl border dark:bg-black" value={title} onChange={e=>setTitle(e.target.value)} />
       <select value={cat} onChange={e=>setCat(e.target.value)} className="w-full p-4 rounded-2xl border dark:bg-black">
          {["Linguistik", "Sastra", "Opini & Esai", "Resensi", "Sospol", "Kebudayaan"].map(c => <option key={c} value={c}>{c}</option>)}
       </select>
       <textarea placeholder="Isi tulisan..." className="w-full p-6 rounded-2xl border dark:bg-black min-h-[300px]" value={content} onChange={e=>setContent(e.target.value)} />
       <button onClick={handlePublish} disabled={loading} className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2">
          {loading && <Loader2 className="animate-spin" />} PUBLIKASIKAN
       </button>
    </div>
  );
}

function ProfileView({ userData, navigateTo }) {
  return (
    <div className="pt-10 max-w-md mx-auto animate-fade-in text-center">
      <div className="w-32 h-32 bg-red-600 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-black mb-6">
        {userData?.fullName?.[0]}
      </div>
      <h2 className="text-2xl font-black">{userData?.fullName}</h2>
      <p className="text-red-600 font-bold">@{userData?.username || 'user'}</p>
      <button onClick={() => signOut(auth)} className="mt-10 text-red-600 font-bold flex items-center gap-2 mx-auto"><LogOut size={18}/> KELUAR</button>
    </div>
  );
}

function SocialView({ allUsers }) {
  return (
    <div className="pt-4 animate-fade-in">
       <h2 className="text-2xl font-black mb-8">LINGKAR BSA</h2>
       <div className="grid gap-3">
         {allUsers.map(u => (
           <div key={u.id} className="p-4 bg-white dark:bg-[#1a0a0a] rounded-2xl border flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center font-bold">{u.fullName[0]}</div>
              <div>
                <p className="font-bold">{u.fullName}</p>
                <p className="text-xs opacity-40">@{u.username}</p>
              </div>
           </div>
         ))}
       </div>
    </div>
  );
}

function GamesView() {
  return (
    <div className="pt-20 text-center opacity-20">
      <Gamepad2 size={60} className="mx-auto mb-4" />
      <p className="font-black">MODUL GAMES SEGERA HADIR</p>
    </div>
  );
}

function AdminView({ works, navigateTo, setSelectedWork }) {
  const [processing, setProcessing] = useState(null);
  const pending = works.filter(w => w.status === 'pending');

  const handleAction = async (id, status) => {
    setProcessing(id);
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'works', id), { status });
    setProcessing(null);
  };

  return (
    <div className="pt-4 animate-fade-in">
      <h2 className="text-2xl font-black mb-8 text-amber-500 flex items-center gap-2"><Shield /> KONSOL MODERASI</h2>
      <div className="grid gap-4">
        {pending.map(w => (
          <div key={w.id} className="p-6 bg-white dark:bg-[#1a0a0a] rounded-2xl border border-amber-200">
             <h3 className="font-bold">{w.title}</h3>
             <p className="text-xs font-bold text-red-600 mb-4">Penulis: {w.authorName}</p>
             <div className="flex gap-2">
                <button onClick={() => {setSelectedWork(w); navigateTo('work-detail')}} className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold">BACA</button>
                <button onClick={() => handleAction(w.id, 'approved')} disabled={processing === w.id} className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold">TERIMA</button>
                <button onClick={() => handleAction(w.id, 'rejected')} disabled={processing === w.id} className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold">TOLAK</button>
             </div>
          </div>
        ))}
        {pending.length === 0 && <p className="text-center py-20 opacity-30">Tidak ada antrean.</p>}
      </div>
    </div>
  );
}

const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
  .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
`;
document.head.appendChild(style);

```
