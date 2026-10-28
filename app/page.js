'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Home,
  Users, 
  Calendar, 
  CheckSquare, 
  X, 
  Plus, 
  Trash2, 
  Edit3,
  Clock, 
  CheckCircle2,
  Mail,
  Lock,
  Shield,
  Sparkles,
  UserCheck,
  Eye,
  EyeOff,
  LogOut,
  Settings,
  Filter,
  KeyRound,
  Bell,
  CalendarPlus,
  AlertCircle
} from 'lucide-react';

export default function DianMathLabApp() {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('login'); 
   
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('client'); 
  const [authMessage, setAuthMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State Navigasi & UI dengan transisi halus
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
   
  // State Modal Interaktif Custom yang Dipercantik
  const [modalConfig, setModalConfig] = useState({ show: false, title: '', message: '', type: 'info', onConfirm: null });

  // State Data Siswa (Dilengkapi kembali dengan input grade dari SD sampai SMA)
  const [students, setStudents] = useState([]);
  const [inputName, setInputName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputSubject, setInputSubject] = useState('');
  const [inputGrade, setInputGrade] = useState('Kelas 10 SMA');
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // State Jadwal
  const [schedules, setSchedules] = useState([]);
  const [schedStudentId, setSchedStudentId] = useState('');
  const [schedDay, setSchedDay] = useState('Senin');
  const [schedStartTime, setSchedStartTime] = useState('15:00');
  const [schedEndTime, setSchedEndTime] = useState('17:00');
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);

  // State Profil Pengguna & Daftar Profiles untuk Admin
  const [userProfile, setUserProfile] = useState({
    fullName: 'Pengguna Dian Math Lab',
    phone: '081234567890',
    address: 'Kabupaten Tegal, Jawa Tengah',
    bio: 'Semangat belajar matematika bersama Dian Math Lab.',
    role: 'client'
  });
  const [allProfiles, setAllProfiles] = useState([]);
  const [tutorsList, setTutorsList] = useState([]);

  // State Presensi
  const [presenceRecords, setPresenceRecords] = useState([]);
  const [presencesList, setPresencesList] = useState([]);

  // State Filter & Pagination Riwayat Presensi
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedStudent, setSelectedStudent] = useState('');
  const [presDate, setPresDate] = useState('');
  const [presObjective, setPresObjective] = useState('');
  const [presMaterial, setPresMaterial] = useState('');
  const [presDuration, setPresDuration] = useState('2');

  // State Edit Presensi
  const [editingPresenceId, setEditingPresenceId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchAppData(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchAppData(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAppData = async (currentSession) => {
    const userEmail = currentSession.user.email;
    const defaultMetaRole = currentSession.user.user_metadata?.role || 'client';
    const currentUserId = currentSession.user.id;

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUserId).single();
    
    let activeRole = defaultMetaRole;
    if (profileData) {
      activeRole = profileData.role || defaultMetaRole;
      setUserProfile({
        fullName: profileData.full_name || 'Pengguna Dian Math Lab',
        phone: profileData.phone || '',
        address: profileData.address || '',
        bio: profileData.bio || '',
        role: activeRole
      });
    } else {
      setUserProfile(prev => ({ ...prev, role: defaultMetaRole }));
    }

    const { data: profilesList } = await supabase.from('profiles').select('*');
    if (profilesList) {
      setAllProfiles(profilesList);
      setTutorsList(profilesList.filter(p => p.role === 'tutor' || p.role === 'admin'));
    }
      
    let studentQuery = supabase.from('students').select('*');
    if (activeRole === 'tutor') {
      studentQuery = studentQuery.eq('tutor_id', currentUserId);
    }
    const { data: studentData } = await studentQuery;
    if (studentData) setStudents(studentData);

    let schedQuery = supabase.from('schedules').select('*');
    if (activeRole === 'tutor') {
      schedQuery = schedQuery.eq('tutor_id', currentUserId);
    }
    const { data: schedData } = await schedQuery;
    if (schedData) setSchedules(schedData);

    let presenceQuery = supabase.from('presence_records').select('*');
    if (activeRole === 'tutor') {
      presenceQuery = presenceQuery.eq('tutor_id', currentUserId);
    }
    const { data: presenceData } = await presenceQuery;
    
    if (presenceData) {
      if (activeRole === 'client') {
        const currentStudent = studentData?.find(s => s.email?.toLowerCase() === userEmail.toLowerCase());
        if (currentStudent) {
          const filtered = presenceData.filter(p => 
            p.student_name?.toLowerCase() === currentStudent.full_name?.toLowerCase() ||
            p.student_email?.toLowerCase() === userEmail.toLowerCase()
          );
          setPresenceRecords(filtered);
        } else {
          setPresenceRecords([]);
        }
      } else {
        setPresenceRecords(presenceData);
      }
    }

    const { data: presList } = await supabase.from('presences').select('*');
    if (presList) setPresencesList(presList);
  };

  const showAlert = (title, message, type = 'info', onConfirm = null) => {
    setModalConfig({ show: true, title, message, type, onConfirm });
  };

  const closeModal = () => {
    setModalConfig({ show: false, title: '', message: '', type: 'info', onConfirm: null });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthMessage('');

    try {
      if (selectedRole === 'client') {
        const { data: studentCheck } = await supabase.from('students').select('*').ilike('email', email.trim());
        if (!studentCheck || studentCheck.length === 0) {
          setAuthMessage('Gagal mendaftar: Email Anda belum didaftarkan oleh tutor di menu Data Siswa.');
          setIsLoading(false);
          return;
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { data: { role: selectedRole }, emailRedirectTo: window.location.origin }
      });
      if (error) throw error;

      if (data?.user) {
        await supabase.from('profiles').upsert([{
          id: data.user.id,
          email: email,
          role: selectedRole,
          full_name: email.split('@')[0]
        }]);
      }
      
      showAlert('Pendaftaran Berhasil!', 'Link aktivasi telah dikirim ke email Anda. Silakan buka kotak masuk atau folder spam email Anda untuk mengaktifkan akun sebelum melakukan login.', 'success');
      setAuthMode('login');
    } catch (error) {
      setAuthMessage('Gagal mendaftar: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session);
      fetchAppData(data.session);
    } catch (error) {
      setAuthMessage('Login gagal: Periksa kembali email dan sandi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      if (error) throw error;
      showAlert('Email Pemulihan Terkirim', 'Instruksi reset sandi telah dikirim ke email Anda.', 'success');
      setAuthMode('login');
    } catch (error) {
      setAuthMessage('Gagal memproses: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showAlert('Perhatian', 'Kata sandi baru minimal harus 6 karakter!', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      showAlert('Berhasil!', 'Kata sandi akun Anda berhasil diperbarui.', 'success');
    } catch (error) {
      showAlert('Gagal', 'Gagal memperbarui sandi: ' + error.message, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmLogout = () => {
    showAlert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari sesi akun Dian Math Lab?', 'warning', async () => {
      await supabase.auth.signOut();
      setSession(null);
      closeModal();
    });
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    const { error } = await supabase.from('students').insert([{
      tutor_id: session.user.id,
      full_name: inputName,
      email: inputEmail || '',
      grade: inputGrade,
      subject: inputSubject || 'Matematika Umum'
    }]);

    if (error) {
      showAlert('Gagal', error.message, 'warning');
    } else {
      setInputName(''); setInputEmail(''); setInputSubject(''); setInputGrade('Kelas 10 SMA'); setIsAddingStudent(false);
      fetchAppData(session);
      showAlert('Berhasil', 'Data siswa baru beserta grade dan fokus pembelajarannya berhasil ditambahkan.', 'success');
    }
  };

  const handleTransferStudentTutor = async (studentId, newTutorId) => {
    const { error } = await supabase.from('students').update({ tutor_id: newTutorId }).eq('id', studentId);
    if (!error) {
      fetchAppData(session);
      showAlert('Berhasil', 'Siswa berhasil dipindahkan ke tutor penanggung jawab yang baru secara real-time.', 'success');
    } else {
      showAlert('Gagal', error.message, 'warning');
    }
  };

  const handleDeleteStudent = (id) => {
    showAlert('Konfirmasi Hapus', 'Hapus siswa ini dari database?', 'warning', async () => {
      const { error } = await supabase.from('students').delete().eq('id', id);
      closeModal();
      if (!error) {
        fetchAppData(session);
        showAlert('Terhapus', 'Data siswa berhasil dihapus.', 'success');
      } else {
        showAlert('Gagal', error.message, 'warning');
      }
    });
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!schedStudentId) {
      showAlert('Perhatian', 'Silakan pilih siswa terlebih dahulu!', 'warning');
      return;
    }

    const { error } = await supabase.from('schedules').insert([{
      tutor_id: session.user.id,
      student_id: schedStudentId,
      day_of_week: schedDay,
      start_time: schedStartTime,
      end_time: schedEndTime
    }]);

    if (error) {
      showAlert('Gagal', error.message, 'warning');
    } else {
      setIsAddingSchedule(false);
      fetchAppData(session);
      showAlert('Berhasil', 'Jadwal les baru berhasil ditambahkan.', 'success');
    }
  };

  const handleDeleteSchedule = (id) => {
    showAlert('Konfirmasi Hapus', 'Hapus jadwal ini?', 'warning', async () => {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      closeModal();
      if (!error) {
        fetchAppData(session);
        showAlert('Terhapus', 'Jadwal berhasil dihapus.', 'success');
      } else {
        showAlert('Gagal', error.message, 'warning');
      }
    });
  };

  const handleCreatePresence = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !presDate || !presObjective || !presMaterial) {
      showAlert('Perhatian', 'Mohon lengkapi semua kolom form presensi!', 'warning');
      return;
    }

    const foundStudent = students.find(s => (s.full_name || s.name) === selectedStudent);

    if (editingPresenceId) {
      const { error: errEdit } = await supabase.from('presence_records').update({
        student_name: selectedStudent,
        date: presDate,
        objective: presObjective,
        material: presMaterial
      }).eq('id', editingPresenceId);

      if (errEdit) {
        showAlert('Gagal', errEdit.message, 'warning');
      } else {
        setEditingPresenceId(null);
        setSelectedStudent(''); setPresDate(''); setPresObjective(''); setPresMaterial('');
        fetchAppData(session);
        showAlert('Berhasil', 'Data presensi berhasil diperbarui!', 'success');
      }
    } else {
      const { error: err1 } = await supabase.from('presence_records').insert([{
        tutor_id: session.user.id,
        student_name: selectedStudent,
        date: presDate,
        objective: presObjective,
        material: presMaterial,
        status: 'Pending'
      }]);

      if (foundStudent) {
        await supabase.from('presences').insert([{
          tutor_id: session.user.id,
          student_id: foundStudent.id,
          presence_date: presDate,
          duration_hours: parseFloat(presDuration) || 2,
          material: presMaterial,
          learning_objectives: presObjective,
          status: 'Pending'
        }]);
      }

      if (err1) {
        showAlert('Gagal', err1.message, 'warning');
      } else {
        setSelectedStudent(''); setPresDate(''); setPresObjective(''); setPresMaterial('');
        fetchAppData(session);
        showAlert('Berhasil', 'Data presensi berhasil direkam dan dipublikasikan!', 'success');
      }
    }
  };

  const handleEditPresenceClick = (item) => {
    setEditingPresenceId(item.id);
    setSelectedStudent(item.student_name || '');
    setPresDate(item.date || '');
    setPresObjective(item.objective || '');
    setPresMaterial(item.material || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePresence = (id) => {
    showAlert('Konfirmasi Hapus', 'Hapus data presensi ini?', 'warning', async () => {
      const { error } = await supabase.from('presence_records').delete().eq('id', id);
      closeModal();
      if (!error) {
        fetchAppData(session);
        showAlert('Terhapus', 'Data presensi berhasil dihapus.', 'success');
      } else {
        showAlert('Gagal', error.message, 'warning');
      }
    });
  };

  const handleVerifyPresence = async (id) => {
    const { error } = await supabase.from('presence_records').update({ status: 'Terkonfirmasi' }).eq('id', id);
    if (!error) {
      fetchAppData(session);
      showAlert('Dikonfirmasi', 'Kehadiran sesi les berhasil dikonfirmasi.', 'success');
    } else {
      showAlert('Gagal', error.message, 'warning');
    }
  };

  const handleUpdateUserRole = async (targetUserId, newRoleVal) => {
    const { error } = await supabase.from('profiles').update({ role: newRoleVal }).eq('id', targetUserId);
    if (!error) {
      fetchAppData(session);
      showAlert('Berhasil', 'Role pengguna berhasil diperbarui di database.', 'success');
    } else {
      showAlert('Gagal', error.message, 'warning');
    }
  };

  const handleDeleteUserAccount = (targetUserId, userEmailTarget) => {
    showAlert('Konfirmasi Hapus Akun', `Hapus akun ${userEmailTarget} dari sistem?`, 'warning', async () => {
      closeModal();
      await supabase.from('profiles').delete().eq('id', targetUserId);
      await supabase.from('students').delete().ilike('email', userEmailTarget);
      fetchAppData(session);
      showAlert('Berhasil', 'Akun berhasil dihapus.', 'success');
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('profiles').update({
      full_name: userProfile.fullName,
      phone: userProfile.phone,
      address: userProfile.address,
      bio: userProfile.bio
    }).eq('id', session.user.id);

    if (!error) {
      showAlert('Profil Diperbarui', 'Data diri dan informasi akun Anda berhasil disimpan ke database.', 'success');
    } else {
      showAlert('Gagal', error.message, 'warning');
    }
  };

  const addToCalendar = (item) => {
    const title = encodeURIComponent(`Les Privat Matematika - ${item.student_name}`);
    const details = encodeURIComponent(`Tujuan: ${item.objective}\nMateri: ${item.material}\nDian Math Lab © 2026`);
    const dateFormatted = item.date ? item.date.replace(/-/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, '');
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dateFormatted}/${dateFormatted}`, '_blank');
  };

  const pendingCount = presenceRecords.filter(p => p.status === 'Pending').length;

  if (!session) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-400 via-sky-300 to-blue-500 text-slate-800 font-sans p-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-sky-200/30 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '8s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-blue-300/20 rounded-full blur-2xl animate-ping" style={{ animationDuration: '6s' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl border border-sky-100 rounded-3xl p-8 shadow-2xl space-y-6 transition-all duration-700 ease-in-out transform hover:scale-[1.01]">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-sky-500/10 border border-sky-200 rounded-2xl text-sky-600 mb-1 animate-pulse">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-sky-900">Dian Math Lab</h1>
            <p className="text-xs text-sky-600 font-medium">Sistem Les Privat Matematika • <strong>NZ Production © 2026</strong></p>
          </div>

          {authMessage && (
            <div className={`p-3.5 rounded-2xl text-xs font-medium transition-all duration-500 ease-in-out ${authMessage.includes('berhasil') ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
              {authMessage}
            </div>
          )}

          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 transition-all duration-500 ease-in-out">
              <div>
                <label className="block text-xs font-bold text-sky-900 mb-1.5">Email Terdaftar</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-sky-400" size={16} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full pl-10 pr-4 py-2.5 text-xs bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-500 transition-all duration-500" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-sky-900 mb-1.5">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-sky-400" size={16} />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 text-xs bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-500 transition-all duration-500" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-sky-500 hover:text-sky-700">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={() => { setAuthMode('forgot'); setAuthMessage(''); }} className="text-sky-600 font-semibold hover:underline">Lupa sandi?</button>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/30 transition-all duration-500 transform active:scale-95">
                {isLoading ? 'Memproses...' : 'Masuk ke Dashboard'}
              </button>
              <div className="text-center pt-2">
                <p className="text-xs text-slate-600">Belum punya akun? <button type="button" onClick={() => { setAuthMode('register'); setAuthMessage(''); }} className="text-sky-600 font-bold hover:underline">Daftar di sini</button></p>
              </div>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 transition-all duration-500 ease-in-out">
              <div className="bg-sky-50 p-3 rounded-2xl border border-sky-200 text-xs text-sky-900 space-y-1">
                <p className="font-bold flex items-center gap-1"><Sparkles size={14} className="text-sky-600" /> Informasi Aktivasi Email:</p>
                <p className="text-[11px] text-slate-600">Setelah mendaftar, sistem akan mengirimkan <strong>tautan aktivasi</strong> ke email Anda. Pastikan untuk membuka email dan klik tautan tersebut agar akun dapat digunakan untuk login.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-sky-900 mb-1.5">Pilih Peran (Role)</label>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full px-4 py-2.5 text-xs bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 transition-all duration-500">
                  <option value="client">Klien / Siswa</option>
                  <option value="tutor">Tutor Matematika</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-sky-900 mb-1.5">Email Aktif</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full px-4 py-2.5 text-xs bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 transition-all duration-500" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-sky-900 mb-1.5">Kata Sandi Baru</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full px-4 py-2.5 text-xs bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 transition-all duration-500" required />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg transition-all duration-500">
                {isLoading ? 'Memeriksa & Mengirim...' : 'Daftar Akun Baru & Kirim Email Aktivasi'}
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setAuthMode('login'); setAuthMessage(''); }} className="text-xs text-sky-600 font-bold hover:underline">Kembali ke Login</button>
              </div>
            </form>
          )}

          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 transition-all duration-500 ease-in-out">
              <p className="text-xs text-slate-600">Masukkan email terdaftar. Kami akan mengirimkan tautan pemulihan sandi resmi.</p>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full px-4 py-2.5 text-xs bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 transition-all duration-500" required />
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all duration-500">Kirim Instruksi</button>
              <button type="button" onClick={() => { setAuthMode('login'); setAuthMessage(''); }} className="w-full text-xs text-sky-600 underline">Kembali ke Login</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const userRole = userProfile.role || session.user.user_metadata?.role || 'client';
  const userEmail = session.user.email;
  const currentClientStudentObj = students.find(s => s.email?.toLowerCase() === userEmail.toLowerCase());
  const clientSchedules = userRole === 'client' && currentClientStudentObj ? schedules.filter(s => s.student_id === currentClientStudentObj.id) : schedules;

  const filteredRecords = presenceRecords.filter(item => {
    const matchDate = filterDate ? item.date === filterDate : true;
    const matchMonth = filterMonth ? item.date?.split('-')[1] === filterMonth : true;
    const matchYear = filterYear ? item.date?.split('-')[0] === filterYear : true;
    return matchDate && matchMonth && matchYear;
  });

  const limitNum = parseInt(rowsPerPage);
  const paginatedRecords = limitNum === 0 ? filteredRecords : filteredRecords.slice((currentPage - 1) * limitNum, currentPage * limitNum);

  return (
    <div className="flex h-screen bg-sky-50/50 text-slate-800 font-sans antialiased overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white text-slate-700 transform transition-all duration-500 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col justify-between border-r border-sky-100 shadow-xl`}>
        <div>
          <div className="px-6 py-6 border-b border-sky-100 flex items-center justify-between bg-sky-50/50">
            <div>
              <h1 className="text-base font-black text-sky-900 flex items-center gap-2"><Sparkles size={16} className="text-sky-500" /> Dian Math Lab</h1>
              <p className="text-[10px] text-sky-600 font-bold uppercase">NZ Production © 2026</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-slate-800"><X size={20} /></button>
          </div>

          <nav className="px-4 py-6 space-y-2">
            <button onClick={() => setActiveMenu('dashboard')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-500 ease-in-out ${activeMenu === 'dashboard' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30' : 'hover:bg-sky-50 text-slate-600'}`}>
              <div className="flex items-center gap-3"><Home size={18} /> Dashboard Utama</div>
            </button>
            
            {userRole === 'admin' && (
              <button onClick={() => setActiveMenu('admin-panel')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-500 ease-in-out ${activeMenu === 'admin-panel' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30' : 'hover:bg-sky-50 text-slate-600'}`}>
                <div className="flex items-center gap-3"><Shield size={18} /> Panel Super Admin & Tutor ({allProfiles.length})</div>
              </button>
            )}

            {(userRole === 'tutor' || userRole === 'admin') && (
              <>
                <button onClick={() => setActiveMenu('students')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-500 ease-in-out ${activeMenu === 'students' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30' : 'hover:bg-sky-50 text-slate-600'}`}>
                  <div className="flex items-center gap-3"><Users size={18} /> Data Siswa ({students.length})</div>
                </button>
                <button onClick={() => setActiveMenu('schedule')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-500 ease-in-out ${activeMenu === 'schedule' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30' : 'hover:bg-sky-50 text-slate-600'}`}>
                  <div className="flex items-center gap-3"><Calendar size={18} /> Manajemen Jadwal ({schedules.length})</div>
                </button>
              </>
            )}

            <button onClick={() => setActiveMenu('presence')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-500 ease-in-out ${activeMenu === 'presence' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30' : 'hover:bg-sky-50 text-slate-600'}`}>
              <div className="flex items-center gap-3">
                <CheckSquare size={18} /> {(userRole === 'tutor' || userRole === 'admin') ? 'Input Presensi Tentor' : 'Konfirmasi Kehadiran'}
              </div>
              {userRole === 'client' && pendingCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full animate-bounce">
                  {pendingCount}
                </span>
              )}
            </button>

            <button onClick={() => setActiveMenu('profile')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-500 ease-in-out ${activeMenu === 'profile' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30' : 'hover:bg-sky-50 text-slate-600'}`}>
              <div className="flex items-center gap-3"><Settings size={18} /> Profil & Ubah Sandi</div>
            </button>
          </nav>
        </div>

        <div className="px-6 py-5 border-t border-sky-100 bg-sky-50/30 text-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold">{session.user.email.charAt(0).toUpperCase()}</div>
            <div className="overflow-hidden">
              <p className="font-bold text-slate-800 truncate text-xs">{session.user.email}</p>
              <p className="text-sky-600 uppercase font-bold text-[9px]">Role: {userRole}</p>
            </div>
          </div>
          <button onClick={confirmLogout} className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-500">
            <LogOut size={14} /> Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col md:ml-72 overflow-hidden bg-sky-50/30">
        <header className="h-16 bg-white border-b border-sky-100 px-8 flex items-center justify-between shadow-xs z-15">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-600">☰</button>
            <span className="font-black text-sky-900 text-sm md:text-base">
              {userRole === 'admin' ? 'Panel Super Administrator' : userRole === 'tutor' ? 'Panel Kontrol Tutor Privat' : 'Panel Akses Siswa'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {userRole === 'client' && pendingCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1.5 rounded-xl font-bold border border-amber-200 flex items-center gap-1.5 animate-pulse">
                <Bell size={14} className="text-amber-600" /> Ada {pendingCount} Jadwal Perlu Dikonfirmasi!
              </span>
            )}
            <span className="text-xs bg-sky-100 text-sky-800 px-3.5 py-1.5 rounded-xl font-bold border border-sky-200 flex items-center gap-1.5">
              <UserCheck size={14} /> {userRole.toUpperCase()}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6 transition-all duration-700 ease-in-out">
            
          {/* DASHBOARD */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 transition-all duration-500 ease-in-out">
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-black mb-2">Selamat Datang di Dian Math Lab 🚀</h2>
                <p className="text-sky-100 text-xs md:text-sm">Sistem operasional les privat matematika terpadu dengan privasi data mandiri per tutor.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm"><span className="text-xs font-bold text-sky-600 uppercase">Siswa Terdaftar</span><div className="mt-2 text-3xl font-black">{students.length}</div></div>
                <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm"><span className="text-xs font-bold text-sky-600 uppercase">Jadwal Aktif</span><div className="mt-2 text-3xl font-black text-blue-600">{clientSchedules.length}</div></div>
                <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm"><span className="text-xs font-bold text-sky-600 uppercase">Presensi Pending</span><div className="mt-2 text-3xl font-black text-amber-500">{pendingCount}</div></div>
                <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm"><span className="text-xs font-bold text-sky-600 uppercase">Status Akun</span><div className="mt-2 text-base font-bold text-emerald-600 flex items-center gap-1.5"><CheckCircle2 size={18} /> Terisolasi Aman</div></div>
              </div>
            </div>
          )}

          {/* SUPER ADMIN PANEL */}
          {activeMenu === 'admin-panel' && userRole === 'admin' && (
            <div className="space-y-6 transition-all duration-500 ease-in-out">
              <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-sky-900 flex items-center gap-2">
                    <Shield size={20} className="text-sky-500" /> Rekapitulasi Per Tutor & Kontrol Super Admin
                  </h3>
                  <p className="text-xs text-slate-500">Melihat rincian siswa, jadwal, dan aktivitas yang dikelola oleh masing-masing tutor secara terpisah.</p>
                </div>

                <div className="space-y-6">
                  {tutorsList.map((tutor) => {
                    const tutorStudents = students.filter(s => s.tutor_id === tutor.id);
                    const tutorSchedules = schedules.filter(sc => sc.tutor_id === tutor.id);
                    const tutorPresences = presenceRecords.filter(pr => pr.tutor_id === tutor.id);

                    return (
                      <div key={tutor.id} className="p-6 rounded-3xl border border-sky-200 bg-sky-50/40 space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-sky-200 pb-3">
                          <div>
                            <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                              👨‍🏫 {tutor.full_name || tutor.email}
                              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md uppercase font-bold">Tutor</span>
                            </h4>
                            <p className="text-xs text-slate-500">Email: {tutor.email} • ID: {tutor.id.slice(0, 8)}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-white border border-sky-200 rounded-xl text-xs font-bold text-sky-900">Siswa: {tutorStudents.length}</span>
                            <span className="px-3 py-1 bg-white border border-sky-200 rounded-xl text-xs font-bold text-sky-900">Jadwal: {tutorSchedules.length}</span>
                            <span className="px-3 py-1 bg-white border border-sky-200 rounded-xl text-xs font-bold text-sky-900">Presensi: {tutorPresences.length}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-bold text-sky-900">Daftar Siswa Binaan:</p>
                        {tutorStudents.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Belum ada siswa yang didaftarkan oleh tutor ini.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {tutorStudents.map(st => (
                              <div key={st.id} className="p-3 bg-white rounded-2xl border border-sky-100 text-xs shadow-xs flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-slate-800">{st.full_name}</p>
                                  <p className="text-[10px] text-slate-500">{st.grade} • {st.subject}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                        )}
                    </div>
                  </div>
                );
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
              <div>
                <h3 className="text-lg font-black text-sky-900">Manajemen Semua Akun & Hak Akses</h3>
                <p className="text-xs text-slate-500">Ubah role atau hapus akun pengguna di database.</p>
              </div>
              <div className="divide-y divide-sky-100 border border-sky-100 rounded-2xl overflow-hidden">
                {allProfiles.map((p) => (
                  <div key={p.id} className="p-4 flex justify-between items-center hover:bg-sky-50/40">
                    <div>
                      <p className="font-bold text-xs text-slate-900">{p.full_name || 'Tanpa Nama'} ({p.email})</p>
                      <p className="text-[10px] text-sky-600 font-bold uppercase">Role: {p.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={p.role || 'client'} onChange={(e) => handleUpdateUserRole(p.id, e.target.value)} className="px-3 py-1.5 text-xs border border-sky-200 rounded-xl bg-white font-bold text-sky-900">
                        <option value="client">Klien</option>
                        <option value="tutor">Tutor</option>
                        <option value="admin">Admin</option>
                      </select>
                      {p.id !== session.user.id && (
                        <button onClick={() => handleDeleteUserAccount(p.id, p.email)} className="p-2 bg-rose-50 text-rose-600 rounded-xl" title="Hapus Akun"><Trash2 size={14} /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* MENU DATA SISWA & PINDAH TUTOR */}
          {activeMenu === 'students' && (userRole === 'tutor' || userRole === 'admin') && (
            <div className="space-y-6 transition-all duration-500 ease-in-out">
            <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-sky-900">Manajemen Data Siswa & Pindah Tutor</h3>
                  <p className="text-xs text-slate-500">
                    {userRole === 'admin' ? 'Super Admin dapat melihat dan memindahkan siswa antar tutor.' : 'Siswa yang Anda daftarkan hanya dapat diakses dan dikelola oleh akun Anda sendiri.'}
                  </p>
                </div>
                <button onClick={() => setIsAddingStudent(true)} className="px-5 py-2.5 bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"><Plus size={16} /> Tambah Siswa</button>
              </div>

              {isAddingStudent && (
                <form onSubmit={handleAddStudent} className="bg-sky-50/50 p-6 rounded-2xl border border-sky-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-sky-900 mb-1">Nama Lengkap Siswa</label>
                      <input type="text" placeholder="Contoh: Budi Santoso" value={inputName} onChange={(e) => setInputName(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-sky-900 mb-1">Email Siswa (Akun Login)</label>
                      <input type="email" placeholder="budi@email.com" value={inputEmail} onChange={(e) => setInputEmail(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-sky-900 mb-1">Jenjang / Grade Siswa</label>
                      <select value={inputGrade} onChange={(e) => setInputGrade(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white">
                        <optgroup label="Sekolah Dasar (SD)">
                          <option value="Kelas 1 SD">Kelas 1 SD</option>
                          <option value="Kelas 2 SD">Kelas 2 SD</option>
                          <option value="Kelas 3 SD">Kelas 3 SD</option>
                          <option value="Kelas 4 SD">Kelas 4 SD</option>
                          <option value="Kelas 5 SD">Kelas 5 SD</option>
                          <option value="Kelas 6 SD">Kelas 6 SD</option>
                        </optgroup>
                        <optgroup label="Sekolah Menengah Pertama (SMP)">
                          <option value="Kelas 7 SMP">Kelas 7 SMP</option>
                          <option value="Kelas 8 SMP">Kelas 8 SMP</option>
                          <option value="Kelas 9 SMP">Kelas 9 SMP</option>
                        </optgroup>
                        <optgroup label="Sekolah Menengah Atas/Kejuruan (SMA/SMK)">
                          <option value="Kelas 10 SMA">Kelas 10 SMA</option>
                          <option value="Kelas 11 SMA">Kelas 11 SMA</option>
                          <option value="Kelas 12 SMA">Kelas 12 SMA</option>
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-sky-900 mb-1">Fokus Pembelajaran / Materi</label>
                      <input type="text" placeholder="Contoh: Aritmatika / Aljabar Dasar" value={inputSubject} onChange={(e) => setInputSubject(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsAddingStudent(false)} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">Batal</button>
                    <button type="submit" className="px-5 py-2 bg-sky-500 text-white text-xs font-bold rounded-xl">Simpan Siswa</button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-sky-100 border border-sky-100 rounded-2xl overflow-hidden">
                {students.map((s) => {
                  const currentTutor = tutorsList.find(t => t.id === s.tutor_id);
                  return (
                    <div key={s.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-sky-50/40">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          {s.full_name} <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">{s.grade}</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><Mail size={12} className="text-sky-400" /> {s.email || 'Email belum diatur'} • Fokus: <strong>{s.subject || 'Matematika Umum'}</strong> • Tutor: <strong>{currentTutor?.full_name || 'Tutor Utama'}</strong></p>
                      </div>

                      <div className="flex items-center gap-2">
                        {userRole === 'admin' && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-600">Pindah Tutor:</span>
                            <select value={s.tutor_id || ''} onChange={(e) => handleTransferStudentTutor(s.id, e.target.value)} className="px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white font-bold text-sky-900">
                              <option value="">-- Pilih Tutor --</option>
                              {tutorsList.map(t => <option key={t.id} value={t.id}>{t.full_name || t.email}</option>)}
                            </select>
                          </div>
                        )}
                        <button onClick={() => handleDeleteStudent(s.id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          )}

          {/* MENU JADWAL */}
          {activeMenu === 'schedule' && (userRole === 'tutor' || userRole === 'admin') && (
            <div className="space-y-6 transition-all duration-500 ease-in-out">
            <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-sky-900 mb-1">Manajemen Jadwal Les</h3>
                  <p className="text-xs text-slate-500">Jadwal bimbingan belajar khusus privat Anda.</p>
                </div>
                <button onClick={() => setIsAddingSchedule(true)} className="px-5 py-2.5 bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"><Plus size={16} /> Tambah Jadwal</button>
              </div>

              {isAddingSchedule && (
                <form onSubmit={handleAddSchedule} className="bg-sky-50/50 p-6 rounded-2xl border border-sky-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-sky-900 mb-1">Pilih Siswa</label>
                      <select value={schedStudentId} onChange={(e) => setSchedStudentId(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required>
                        <option value="">-- Pilih Siswa --</option>
                        {students.map((s) => (<option key={s.id} value={s.id}>{s.full_name} ({s.grade})</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-sky-900 mb-1">Hari Bimbel</label>
                      <select value={schedDay} onChange={(e) => setSchedDay(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white">
                        <option value="Senin">Senin</option><option value="Selasa">Selasa</option><option value="Rabu">Rabu</option><option value="Kamis">Kamis</option><option value="Jumat">Jumat</option><option value="Sabtu">Sabtu</option><option value="Minggu">Minggu</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-sky-900 mb-1">Waktu Mulai</label>
                      <input type="time" value={schedStartTime} onChange={(e) => setSchedStartTime(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-sky-900 mb-1">Waktu Selesai</label>
                      <input type="time" value={schedEndTime} onChange={(e) => setSchedEndTime(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsAddingSchedule(false)} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl">Batal</button>
                    <button type="submit" className="px-5 py-2 bg-sky-500 text-white text-xs font-bold rounded-xl">Simpan Jadwal</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedules.map((item) => {
                  const studentObj = students.find(s => s.id === item.student_id);
                  return (
                    <div key={item.id} className="p-5 rounded-2xl border border-sky-100 flex justify-between items-center bg-sky-50/30">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{studentObj?.full_name || 'Siswa Umum'}</h4>
                          <span className="text-[11px] font-bold text-sky-700 bg-white px-2.5 py-0.5 rounded-full border border-sky-200">{item.day_of_week}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 flex items-center gap-1.5">
                          <Clock size={14} className="text-sky-500" /> Pukul <strong>{item.start_time}</strong> s.d <strong>{item.end_time}</strong>
                        </p>
                    </div>
                    <button onClick={() => handleDeleteSchedule(item.id)} className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Trash2 size={16} /></button>
                  </div>
                );
                })}
            </div>
          </div>
          </div>
          )}

          {/* MENU PRESENSI */}
          {activeMenu === 'presence' && (
            <div className="space-y-6 transition-all duration-500 ease-in-out">
              {(userRole === 'tutor' || userRole === 'admin') && (
                <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm border-l-4 border-l-sky-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black text-sky-900">{editingPresenceId ? 'Edit Data Presensi Sesi' : 'Form Input Presensi Oleh Tentor'}</h3>
                      <p className="text-xs text-slate-500">Rekam kehadiran dan materi bimbingan.</p>
                    </div>
                    {editingPresenceId && <button onClick={() => setEditingPresenceId(null)} className="px-3 py-1.5 bg-slate-200 text-xs font-bold rounded-xl">Batal</button>}
                  </div>

                  <form onSubmit={handleCreatePresence} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-sky-900 mb-1.5">Pilih Siswa</label>
                        <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="w-full px-4 py-3 text-xs border border-sky-200 rounded-xl bg-white" required>
                          <option value="">-- Pilih Siswa --</option>
                          {students.map((s) => (<option key={s.id} value={s.full_name}>{s.full_name} ({s.grade})</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-sky-900 mb-1.5">Tanggal Sesi Les</label>
                        <input type="date" value={presDate} onChange={(e) => setPresDate(e.target.value)} className="w-full px-4 py-3 text-xs border border-sky-200 rounded-xl bg-white" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-sky-900 mb-1.5">Durasi (Jam)</label>
                        <input type="number" step="0.5" value={presDuration} onChange={(e) => setPresDuration(e.target.value)} className="w-full px-4 py-3 text-xs border border-sky-200 rounded-xl bg-white" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-sky-900 mb-1.5">Tujuan Pembelajaran</label>
                        <input type="text" placeholder="Contoh: Memahami rumus turunan" value={presObjective} onChange={(e) => setPresObjective(e.target.value)} className="w-full px-4 py-3 text-xs border border-sky-200 rounded-xl bg-white" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-sky-900 mb-1.5">Materi</label>
                        <input type="text" placeholder="Contoh: Kalkulus Bab 3" value={presMaterial} onChange={(e) => setPresMaterial(e.target.value)} className="w-full px-4 py-3 text-xs border border-sky-200 rounded-xl bg-white" required />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button type="submit" className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-2">
                        <CheckSquare size={16} /> {editingPresenceId ? 'Simpan Perubahan' : 'Publikasikan Presensi'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-5 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-black text-sky-900">{(userRole === 'tutor' || userRole === 'admin') ? 'Rekapitulasi Presensi' : 'Konfirmasi Kehadiran & Sesi Anda'}</h3>
                    <p className="text-xs text-slate-500">Filter berdasarkan tanggal.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-600">Tampilkan:</span>
                    <select value={rowsPerPage} onChange={(e) => setRowsPerPage(e.target.value)} className="px-3 py-2 border border-sky-200 rounded-xl bg-white font-bold text-sky-900">
                      <option value="5">5</option><option value="10">10</option><option value="25">25</option><option value="0">Semua</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {paginatedRecords.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-500 bg-sky-50/30 rounded-2xl border border-sky-100">Tidak ada data presensi.</div>
                  ) : (
                    paginatedRecords.map((item) => (
                      <div key={item.id} className="p-5 rounded-2xl border border-sky-100 flex flex-col md:flex-row justify-between gap-4 bg-sky-50/30 items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{item.student_name}</h4>
                            <span className="text-[11px] font-bold text-sky-700 bg-white px-2.5 py-0.5 rounded-full border border-sky-200">{item.date}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1"><strong>Tujuan:</strong> {item.objective}</p>
                          <p className="text-xs text-slate-600"><strong>Materi:</strong> {item.material}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <button onClick={() => addToCalendar(item)} className="px-3 py-2 bg-sky-100 text-sky-800 rounded-xl text-xs font-bold flex items-center gap-1.5"><CalendarPlus size={14} /> Kalender</button>
                          
                          {(userRole === 'tutor' || userRole === 'admin') && (
                            <>
                              <button onClick={() => handleEditPresenceClick(item)} className="px-3 py-2 bg-amber-100 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5"><Edit3 size={14} /> Edit</button>
                              <button onClick={() => handleDeletePresence(item.id)} className="px-3 py-2 bg-rose-100 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5"><Trash2 size={14} /> Hapus</button>
                            </>
                          )}

                          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${item.status === 'Terkonfirmasi' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {item.status === 'Terkonfirmasi' ? <CheckCircle2 size={14} /> : <Clock size={14} />} {item.status}
                          </span>
                          {userRole === 'client' && item.status === 'Pending' && (
                            <button onClick={() => handleVerifyPresence(item.id)} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold">Konfirmasi Kehadiran</button>
                          )}
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>
          </div>
          )}

          {/* PROFIL */}
          {activeMenu === 'profile' && (
            <div className="space-y-6 max-w-2xl transition-all duration-500 ease-in-out">
              <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-sky-900">Pengaturan Profil & Data Diri</h3>
                  <p className="text-xs text-slate-500">Kelola informasi pribadi akun Anda.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-sky-900 mb-1.5">Nama Lengkap</label>
                    <input type="text" value={userProfile.fullName} onChange={(e) => setUserProfile({...userProfile, fullName: e.target.value})} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sky-900 mb-1.5">Nomor Telepon</label>
                    <input type="text" value={userProfile.phone} onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sky-900 mb-1.5">Alamat Domisili</label>
                    <input type="text" value={userProfile.address} onChange={(e) => setUserProfile({...userProfile, address: e.target.value})} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sky-900 mb-1.5">Bio Singkat</label>
                    <textarea rows="3" value={userProfile.bio} onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white"></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-6 py-3 bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md">Simpan Profil ke DB</button>
                  </div>
                </form>
              </div>

              {/* UBAH SANDI */}
              <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-sky-900 flex items-center gap-2"><KeyRound size={20} className="text-sky-500" /> Keamanan: Ubah Kata Sandi</h3>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-sky-900 mb-1.5">Kata Sandi Baru</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={isLoading} className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold">Simpan Kata Sandi Baru</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL */}
      {modalConfig.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-500 ease-in-out">
          <div className="bg-white/95 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-sky-100 text-center space-y-4 transform transition-all duration-500 ease-in-out scale-100">
            <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center shadow-md mb-2 bg-gradient-to-tr from-sky-500 to-blue-600 text-white">
              {modalConfig.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <h3 className="text-lg font-black text-sky-900">{modalConfig.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{modalConfig.message}</p>
            <div className="flex gap-3 pt-3">
              {modalConfig.onConfirm ? (
                <>
                  <button onClick={closeModal} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all duration-300">Batal</button>
                  <button onClick={modalConfig.onConfirm} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-xs font-bold transition-all duration-300">Ya, Lanjutkan</button>
                </>
              ) : (
                <button onClick={closeModal} className="w-full py-3 bg-sky-600 text-white rounded-xl text-xs font-bold transition-all duration-300">Mengerti</button>
              )}
            </div>
          </div>
        </div>
      )}
  </div>
  );
}
