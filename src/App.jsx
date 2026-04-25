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
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F8]">
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

      <div className={`w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border ${theme === 'dark'
