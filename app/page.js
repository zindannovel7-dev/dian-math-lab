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
  KeyRound,
  Bell,
  CalendarPlus,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Upload,
  BookOpen,
  Info,
  Award,
  TrendingUp,
  ExternalLink,
  FileText
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

  // State Navigasi & UI
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeUtbkSubMenu, setActiveUtbkSubMenu] = useState('latihan'); // 'latihan', 'materi', 'informasi'
   
  // State Modal Interaktif
  const [modalConfig, setModalConfig] = useState({ show: false, title: '', message: '', type: 'info', onConfirm: null });

  // State Floating WhatsApp Menu
  const [showWaMenu, setShowWaMenu] = useState(false);

  // State Data Siswa
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
    role: 'client',
    utbk_access: false
  });
  const [allProfiles, setAllProfiles] = useState([]);
  const [tutorsList, setTutorsList] = useState([]);

  // State Presensi
  const [presenceRecords, setPresenceRecords] = useState([]);
  const [presencesList, setPresencesList] = useState([]);
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
  const [editingPresenceId, setEditingPresenceId] = useState(null);

  // --- STATE UTBK PK PM (BEBAS / TANPA BATAS DROPDOWN) ---
  const [utbkQuestions, setUtbkQuestions] = useState([]);
  const [utbkMaterials, setUtbkMaterials] = useState([]);
  const [utbkInfos, setUtbkInfos] = useState([]);
  const [utbkHistory, setUtbkHistory] = useState([]);
  
  // Filter / Pilihan Pengerjaan Siswa (Ketik Bebas)
  const [filterPackageInput, setFilterPackageInput] = useState('Paket 1');
  const [filterSubtestInput, setFilterSubtestInput] = useState('Penalaran Umum');
  
  // Form Kelola Soal (Admin/Tentor) - Menggunakan Input Ketik Bebas
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [qPackage, setQPackage] = useState('Paket 1');
  const [qSubtest, setQSubtest] = useState('Penalaran Umum');
  const [qText, setQText] = useState('');
  const [qImage, setQImage] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [optE, setOptE] = useState('');
  const [qAns, setQAns] = useState('A');
  const [qExp, setQExp] = useState('');
  const [examDurationMinutes, setExamDurationMinutes] = useState(45);

  // Form Kelola Materi (Admin/Tentor)
  const [matTitle, setMatTitle] = useState('');
  const [matCategory, setMatCategory] = useState('Penalaran Umum');
  const [matContent, setMatContent] = useState('');
  const [matLink, setMatLink] = useState('');

  // Form Kelola Informasi (Admin/Tentor)
  const [infoTitle, setInfoTitle] = useState('');
  const [infoType, setInfoType] = useState('Instagram TO');
  const [infoDesc, setInfoDesc] = useState('');
  const [infoUrl, setInfoUrl] = useState('');

  // Status Pengerjaan Ujian Siswa
  const [isExamActive, setIsExamActive] = useState(false);
  const [currentExamQuestions, setCurrentExamQuestions] = useState([]);
  const [currentExamIndex, setCurrentExamIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examResult, setExamResult] = useState(null);

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

  // Timer Ujian Real-Time
  useEffect(() => {
    let timer;
    if (isExamActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishExamAutomatically();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExamActive, timeLeft]);

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
        role: activeRole,
        utbk_access: profileData.utbk_access || false
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

    // Fetch Data UTBK PK PM
    const { data: utbkQData } = await supabase.from('utbk_questions').select('*');
    if (utbkQData) setUtbkQuestions(utbkQData);

    const { data: utbkMData } = await supabase.from('utbk_materials').select('*');
    if (utbkMData) setUtbkMaterials(utbkMData);

    const { data: utbkIData } = await supabase.from('utbk_infos').select('*');
    if (utbkIData) setUtbkInfos(utbkIData);

    let historyQuery = supabase.from('utbk_history').select('*');
    if (activeRole === 'client') {
      historyQuery = historyQuery.eq('user_id', currentUserId);
    }
    const { data: utbkHData } = await historyQuery;
    if (utbkHData) setUtbkHistory(utbkHData);
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
          full_name: email.split('@')[0],
          utbk_access: false
        }]);
      }
       
      showAlert('Pendaftaran Berhasil!', 'Link aktivasi telah dikirim ke email Anda. Silakan buka kotak masuk email untuk mengaktifkan akun.', 'success');
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

  // --- IZINKAN AKSES UTBK SISWA ---
  const handleToggleUtbkAccess = async (profileId, currentStatus) => {
    const newStatus = !currentStatus;
    const { error } = await supabase.from('profiles').update({ utbk_access: newStatus }).eq('id', profileId);
    if (!error) {
      fetchAppData(session);
      showAlert('Berhasil', `Akses UTBK PK PM berhasil ${newStatus ? 'DIBERIKAN' : 'DICABUT'}.`, 'success');
    } else {
      showAlert('Gagal', error.message, 'warning');
    }
  };

  // --- UPLOAD GAMBAR LOKAL / URL ---
  const handleImageUploadInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- KELOLA SOAL UTBK (INPUT KETIK BEBAS TANPA BATAS) ---
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!qText.trim()) {
      showAlert('Perhatian', 'Pertanyaan soal tidak boleh kosong!', 'warning');
      return;
    }

    const questionPayload = {
      package_name: qPackage.trim(),
      subtest: qSubtest.trim(),
      question_text: qText,
      image_url: qImage || null,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      option_e: optE,
      correct_answer: qAns,
      explanation: qExp,
      duration_minutes: parseInt(examDurationMinutes) || 45
    };

    if (editingQuestionId) {
      const { error } = await supabase.from('utbk_questions').update(questionPayload).eq('id', editingQuestionId);
      if (error) {
        showAlert('Gagal', error.message, 'warning');
      } else {
        setEditingQuestionId(null);
        resetQuestionForm();
        fetchAppData(session);
        showAlert('Berhasil', 'Soal UTBK berhasil diperbarui.', 'success');
      }
    } else {
      const { error } = await supabase.from('utbk_questions').insert([questionPayload]);
      if (error) {
        showAlert('Gagal', error.message, 'warning');
      } else {
        resetQuestionForm();
        fetchAppData(session);
        showAlert('Berhasil', 'Soal UTBK baru berhasil ditambahkan.', 'success');
      }
    }
  };

  const resetQuestionForm = () => {
    setQText(''); setQImage(''); setOptA(''); setOptB(''); setOptC(''); setOptD(''); setOptE(''); setQExp(''); setEditingQuestionId(null);
  };

  const handleEditQuestionClick = (q) => {
    setEditingQuestionId(q.id);
    setQPackage(q.package_name || 'Paket 1');
    setQSubtest(q.subtest || 'Penalaran Umum');
    setQText(q.question_text || '');
    setQImage(q.image_url || '');
    setOptA(q.option_a || '');
    setOptB(q.option_b || '');
    setOptC(q.option_c || '');
    setOptD(q.option_d || '');
    setOptE(q.option_e || '');
    setQAns(q.correct_answer || 'A');
    setQExp(q.explanation || '');
    setExamDurationMinutes(q.duration_minutes || 45);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuestion = (id) => {
    showAlert('Konfirmasi Hapus', 'Hapus soal ini dari database?', 'warning', async () => {
      const { error } = await supabase.from('utbk_questions').delete().eq('id', id);
      closeModal();
      if (!error) {
        fetchAppData(session);
        showAlert('Terhapus', 'Soal berhasil dihapus.', 'success');
      } else {
        showAlert('Gagal', error.message, 'warning');
      }
    });
  };

  // --- KELOLA MATERI ---
  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    if (!matTitle.trim() || !matContent.trim()) {
      showAlert('Perhatian', 'Judul dan isi materi wajib diisi!', 'warning');
      return;
    }
    const { error } = await supabase.from('utbk_materials').insert([{
      title: matTitle,
      category: matCategory.trim(),
      content: matContent,
      resource_link: matLink || null
    }]);

    if (!error) {
      setMatTitle(''); setMatContent(''); setMatLink('');
      fetchAppData(session);
      showAlert('Berhasil', 'Materi berhasil diunggah.', 'success');
    } else {
      showAlert('Gagal', error.message, 'warning');
    }
  };

  const handleDeleteMaterial = async (id) => {
    showAlert('Konfirmasi Hapus', 'Hapus materi ini?', 'warning', async () => {
      await supabase.from('utbk_materials').delete().eq('id', id);
      closeModal();
      fetchAppData(session);
      showAlert('Terhapus', 'Materi berhasil dihapus.', 'success');
    });
  };

  // --- KELOLA INFORMASI ---
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!infoTitle.trim() || !infoDesc.trim()) {
      showAlert('Perhatian', 'Judul dan deskripsi informasi wajib diisi!', 'warning');
      return;
    }
    const { error } = await supabase.from('utbk_infos').insert([{
      title: infoTitle,
      info_type: infoType,
      description: infoDesc,
      target_url: infoUrl || null
    }]);

    if (!error) {
      setInfoTitle(''); setInfoDesc(''); setInfoUrl('');
      fetchAppData(session);
      showAlert('Berhasil', 'Informasi berhasil dipublikasikan.', 'success');
    } else {
      showAlert('Gagal', error.message, 'warning');
    }
  };

  const handleDeleteInfo = async (id) => {
    showAlert('Konfirmasi Hapus', 'Hapus informasi ini?', 'warning', async () => {
      await supabase.from('utbk_infos').delete().eq('id', id);
      closeModal();
      fetchAppData(session);
      showAlert('Terhapus', 'Informasi berhasil dihapus.', 'success');
    });
  };

  // --- MULAI UJIAN KUIS SISWA (BERDASARKAN KETIKAN BEBAS) ---
  const startExam = () => {
    const filtered = utbkQuestions.filter(q => 
      q.package_name?.toLowerCase() === filterPackageInput.trim().toLowerCase() && 
      q.subtest?.toLowerCase() === filterSubtestInput.trim().toLowerCase()
    );
    if (filtered.length === 0) {
      showAlert('Perhatian', `Belum ada soal untuk Paket "${filterPackageInput}" dan Subtes "${filterSubtestInput}".`, 'warning');
      return;
    }
    const duration = filtered[0]?.duration_minutes || 45;
    setCurrentExamQuestions(filtered);
    setCurrentExamIndex(0);
    setStudentAnswers({});
    setTimeLeft(duration * 60);
    setIsExamActive(true);
    setExamResult(null);
  };

  const finishExamAutomatically = async () => {
    let correctCount = 0;
    currentExamQuestions.forEach((q, idx) => {
      if (studentAnswers[idx] === q.correct_answer) {
        correctCount++;
      }
    });
    const total = currentExamQuestions.length;
    const score = total > 0 ? Math.round((correctCount / total) * 1000) : 0;

    const resultData = {
      user_id: session.user.id,
      user_email: session.user.email,
      package_name: filterPackageInput,
      subtest: filterSubtestInput,
      total_questions: total,
      correct_answers: correctCount,
      score: score,
      date_taken: new Date().toISOString()
    };

    setExamResult(resultData);
    setIsExamActive(false);

    await supabase.from('utbk_history').insert([resultData]);
    fetchAppData(session);
    showAlert('Ujian Selesai', `Skor UTBK Anda: ${score}`, 'success');
  };

  // --- MANAJEMEN SISWA, JADWAL, PRESENSI ---
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
      showAlert('Berhasil', 'Siswa berhasil ditambahkan.', 'success');
    }
  };

  const handleTransferStudentTutor = async (studentId, newTutorId) => {
    const { error } = await supabase.from('students').update({ tutor_id: newTutorId }).eq('id', studentId);
    if (!error) {
      fetchAppData(session);
      showAlert('Berhasil', 'Siswa dipindahkan ke tutor baru.', 'success');
    } else {
      showAlert('Gagal', error.message, 'warning');
    }
  };

  const handleDeleteStudent = (id) => {
    showAlert('Konfirmasi Hapus', 'Hapus siswa ini?', 'warning', async () => {
      const { error } = await supabase.from('students').delete().eq('id', id);
      closeModal();
      if (!error) {
        fetchAppData(session);
        showAlert('Terhapus', 'Siswa dihapus.', 'success');
      } else {
        showAlert('Gagal', error.message, 'warning');
      }
    });
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!schedStudentId) {
      showAlert('Perhatian', 'Pilih siswa terlebih dahulu!', 'warning');
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
      showAlert('Berhasil', 'Jadwal ditambahkan.', 'success');
    }
  };

  const handleDeleteSchedule = (id) => {
    showAlert('Konfirmasi Hapus', 'Hapus jadwal ini?', 'warning', async () => {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      closeModal();
      if (!error) {
        fetchAppData(session);
        showAlert('Terhapus', 'Jadwal dihapus.', 'success');
      } else {
        showAlert('Gagal', error.message, 'warning');
      }
    });
  };

  const handleCreatePresence = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !presDate || !presObjective || !presMaterial) {
      showAlert('Perhatian', 'Lengkapi semua kolom presensi!', 'warning');
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
        showAlert('Berhasil', 'Presensi diperbarui!', 'success');
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
        showAlert('Berhasil', 'Presensi direkam!', 'success');
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
    showAlert('Konfirmasi Hapus', 'Hapus presensi ini?', 'warning', async () => {
      const { error } = await supabase.from('presence_records').delete().eq('id', id);
      closeModal();
      if (!error) {
        fetchAppData(session);
        showAlert('Terhapus', 'Presensi dihapus.', 'success');
      } else {
        showAlert('Gagal', error.message, 'warning');
      }
    });
  };

  const handleVerifyPresence = async (id) => {
    const { error } = await supabase.from('presence_records').update({ status: 'Terkonfirmasi' }).eq('id', id);
    if (!error) {
      fetchAppData(session);
      showAlert('Dikonfirmasi', 'Kehadiran dikonfirmasi.', 'success');
    } else {
      showAlert('Gagal', error.message, 'warning');
    }
  };

  const handleUpdateUserRole = async (targetUserId, newRoleVal) => {
    const { error } = await supabase.from('profiles').update({ role: newRoleVal }).eq('id', targetUserId);
    if (!error) {
      fetchAppData(session);
      showAlert('Berhasil', 'Role diperbarui.', 'success');
    } else {
      showAlert('Gagal', error.message, 'warning');
    }
  };

  const handleDeleteUserAccount = (targetUserId, userEmailTarget) => {
    showAlert('Konfirmasi Hapus', `Hapus akun ${userEmailTarget}?`, 'warning', async () => {
      closeModal();
      await supabase.from('profiles').delete().eq('id', targetUserId);
      await supabase.from('students').delete().ilike('email', userEmailTarget);
      fetchAppData(session);
      showAlert('Berhasil', 'Akun dihapus.', 'success');
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
      showAlert('Berhasil', 'Profil disimpan.', 'success');
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
        </div>

        <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl border border-sky-100 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-sky-500/10 border border-sky-200 rounded-2xl text-sky-600 mb-1">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-sky-900">Dian Math Lab</h1>
            <p className="text-xs text-sky-600 font-medium">Sistem Les Privat Matematika & UTBK PK PM • <strong>NZ Production © 2026</strong></p>
          </div>

          {authMessage && (
            <div className={`p-3.5 rounded-2xl text-xs font-medium ${authMessage.includes('berhasil') ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
              {authMessage}
            </div>
          )}

          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sky-900 mb-1.5">Email Terdaftar</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-sky-400" size={16} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full pl-10 pr-4 py-2.5 text-xs bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-500" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-sky-900 mb-1.5">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-sky-400" size={16} />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 text-xs bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800 focus:outline-none focus:border-sky-500" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-sky-500">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={() => { setAuthMode('forgot'); setAuthMessage(''); }} className="text-sky-600 font-semibold hover:underline">Lupa sandi?</button>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/30 transition-all">
                {isLoading ? 'Memproses...' : 'Masuk ke Dashboard'}
              </button>
              <div className="text-center pt-2">
                <p className="text-xs text-slate-600">Belum punya akun? <button type="button" onClick={() => { setAuthMode('register'); setAuthMessage(''); }} className="text-sky-600 font-bold hover:underline">Daftar di sini</button></p>
              </div>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sky-900 mb-1.5">Pilih Peran (Role)</label>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full px-4 py-2.5 text-xs bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800">
                  <option value="client">Klien / Siswa</option>
                  <option value="tutor">Tutor Matematika</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-sky-900 mb-1.5">Email Aktif</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full px-4 py-2.5 text-xs bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-sky-900 mb-1.5">Kata Sandi Baru</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full px-4 py-2.5 text-xs bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800" required />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg">
                {isLoading ? 'Memproses...' : 'Daftar Akun Baru'}
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => { setAuthMode('login'); setAuthMessage(''); }} className="text-xs text-sky-600 font-bold hover:underline">Kembali ke Login</button>
              </div>
            </form>
          )}

          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-600">Masukkan email terdaftar untuk pemulihan sandi.</p>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="w-full px-4 py-2.5 text-xs bg-sky-50/50 border border-sky-200 rounded-xl text-slate-800" required />
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold">Kirim Instruksi</button>
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
    <div className="flex h-screen bg-sky-50/50 text-slate-800 font-sans antialiased overflow-hidden relative">
      
      {/* SIDEBAR - NUANSA BIRU PROFESIONAL */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white text-slate-700 transform transition-all duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col justify-between border-r border-sky-100 shadow-xl`}>
        <div>
          <div className="px-6 py-6 border-b border-sky-100 flex items-center justify-between bg-sky-50/50">
            <div>
              <h1 className="text-base font-black text-sky-900 flex items-center gap-2"><Sparkles className="text-sky-500" size={16} /> Dian Math Lab</h1>
              <p className="text-[10px] text-sky-600 font-bold uppercase">NZ Production © 2026</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500"><X size={20} /></button>
          </div>

          <nav className="px-4 py-6 space-y-2">
            <button onClick={() => setActiveMenu('dashboard')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeMenu === 'dashboard' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-sky-50 text-slate-600'}`}>
              <div className="flex items-center gap-3"><Home size={18} /> Dashboard Utama</div>
            </button>
            
            {/* PORTAL UTBK PK PM (WARNA BIRU PROFESIONAL) */}
            {(userRole === 'admin' || userRole === 'tutor' || userProfile.utbk_access) && (
              <button onClick={() => setActiveMenu('utbk-portal')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeMenu === 'utbk-portal' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-sky-50 text-blue-700 bg-sky-50/60'}`}>
                <div className="flex items-center gap-3"><Award size={18} /> Portal UTBK PK PM ⭐</div>
              </button>
            )}

            {userRole === 'admin' && (
              <button onClick={() => setActiveMenu('admin-panel')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeMenu === 'admin-panel' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-sky-50 text-slate-600'}`}>
                <div className="flex items-center gap-3"><Shield size={18} /> Panel Super Admin & Tutor</div>
              </button>
            )}

            {(userRole === 'tutor' || userRole === 'admin') && (
              <>
                <button onClick={() => setActiveMenu('students')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeMenu === 'students' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-sky-50 text-slate-600'}`}>
                  <div className="flex items-center gap-3"><Users size={18} /> Data Siswa ({students.length})</div>
                </button>
                <button onClick={() => setActiveMenu('schedule')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeMenu === 'schedule' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-sky-50 text-slate-600'}`}>
                  <div className="flex items-center gap-3"><Calendar size={18} /> Manajemen Jadwal</div>
                </button>
              </>
            )}

            <button onClick={() => setActiveMenu('presence')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeMenu === 'presence' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-sky-50 text-slate-600'}`}>
              <div className="flex items-center gap-3">
                <CheckSquare size={18} /> {(userRole === 'tutor' || userRole === 'admin') ? 'Input Presensi' : 'Konfirmasi Kehadiran'}
              </div>
              {userRole === 'client' && pendingCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full">{pendingCount}</span>
              )}
            </button>

            <button onClick={() => setActiveMenu('profile')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeMenu === 'profile' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-sky-50 text-slate-600'}`}>
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
          <button onClick={confirmLogout} className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
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
            <span className="text-xs bg-sky-100 text-sky-800 px-3.5 py-1.5 rounded-xl font-bold border border-sky-200 flex items-center gap-1.5">
              <UserCheck size={14} /> {userRole.toUpperCase()}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
            
          {/* DASHBOARD */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-black mb-2">Selamat Datang di Dian Math Lab 🚀</h2>
                <p className="text-sky-100 text-xs md:text-sm">Sistem les privat matematika & persiapan UTBK PK PM profesional.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm"><span className="text-xs font-bold text-sky-600 uppercase">Siswa Terdaftar</span><div className="mt-2 text-3xl font-black">{students.length}</div></div>
                <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm"><span className="text-xs font-bold text-sky-600 uppercase">Jadwal Aktif</span><div className="mt-2 text-3xl font-black text-blue-600">{clientSchedules.length}</div></div>
                <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm"><span className="text-xs font-bold text-sky-600 uppercase">Presensi Pending</span><div className="mt-2 text-3xl font-black text-amber-500">{pendingCount}</div></div>
                <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm"><span className="text-xs font-bold text-sky-600 uppercase">Status Akses UTBK</span><div className="mt-2 text-base font-bold text-blue-600 flex items-center gap-1.5">{(userRole !== 'client' || userProfile.utbk_access) ? '✅ Aktif' : '🔒 Belum Diizinkan'}</div></div>
              </div>
            </div>
          )}

          {/* --- PORTAL UTBK PK PM (TANPA BATAS & NUANSA BIRU PROFESIONAL) --- */}
          {activeMenu === 'utbk-portal' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-2"><Award size={28} /> Portal Eksklusif UTBK PK PM</h2>
                  <p className="text-sky-100 text-xs mt-1">Latihan soal kuis fleksibel, materi lengkap, dan informasi try out/jalur mandiri.</p>
                </div>
                <div className="flex gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md">
                  <button onClick={() => setActiveUtbkSubMenu('latihan')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeUtbkSubMenu === 'latihan' ? 'bg-white text-blue-900 shadow-md' : 'text-white hover:bg-white/20'}`}>✍️ Latihan Soal</button>
                  <button onClick={() => setActiveUtbkSubMenu('materi')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeUtbkSubMenu === 'materi' ? 'bg-white text-blue-900 shadow-md' : 'text-white hover:bg-white/20'}`}>📚 Kumpulan Materi</button>
                  <button onClick={() => setActiveUtbkSubMenu('informasi')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeUtbkSubMenu === 'informasi' ? 'bg-white text-blue-900 shadow-md' : 'text-white hover:bg-white/20'}`}>📢 Informasi & TO IG</button>
                </div>
              </div>

              {/* 1. SUB-MENU: LATIHAN SOAL (TANPA BATAS PAKET/SUBTES - KETIK BEBAS) */}
              {activeUtbkSubMenu === 'latihan' && (
                <div className="space-y-6">
                  {/* PANEL KELOLA SOAL (ADMIN/TUTOR) */}
                  {(userRole === 'admin' || userRole === 'tutor') && (
                    <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                      <div className="flex justify-between items-center border-b border-sky-100 pb-4">
                        <div>
                          <h3 className="text-lg font-black text-sky-900 flex items-center gap-2">
                            <FileSpreadsheet className="text-sky-600" size={20} /> Panel Kelola Soal & Preview Ujian (Tentor/Admin)
                          </h3>
                          <p className="text-xs text-slate-500">Ketik nama paket & subtes secara bebas tanpa batasan, unggah gambar lokal/URL.</p>
                        </div>
                      </div>

                      {/* FORM TAMBAH / EDIT SOAL (INPUT KETIK BEBAS) */}
                      <form onSubmit={handleSaveQuestion} className="bg-sky-50/50 p-6 rounded-2xl border border-sky-200 space-y-4">
                        <h4 className="font-bold text-xs text-sky-950">{editingQuestionId ? '✏️ Edit Soal UTBK' : '➕ Tambah Soal Baru'}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Nama Paket (Ketik Bebas)</label>
                            <input type="text" placeholder="Contoh: Paket 1 / Try Out 1 / UTBK Akbar" value={qPackage} onChange={(e) => setQPackage(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white font-bold text-sky-900" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Nama Subtes (Ketik Bebas)</label>
                            <input type="text" placeholder="Contoh: Penalaran Umum / Mat Dasar / Lainnya" value={qSubtest} onChange={(e) => setQSubtest(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white font-bold text-sky-900" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Durasi Ujian (Menit)</label>
                            <input type="number" value={examDurationMinutes} onChange={(e) => setExamDurationMinutes(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white" required />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-sky-900 mb-1">Teks Pertanyaan Soal</label>
                          <textarea rows="3" placeholder="Ketik pertanyaan di sini..." value={qText} onChange={(e) => setQText(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white" required></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Upload Gambar (JPG, PNG, JPEG)</label>
                            <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleImageUploadInput} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Atau Masukkan Link Tautan Gambar</label>
                            <input type="text" placeholder="https://example.com/gambar.png" value={qImage} onChange={(e) => setQImage(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white" />
                          </div>
                        </div>

                        {qImage && (
                          <div className="p-3 bg-white border border-sky-200 rounded-xl flex items-center gap-4">
                            <img src={qImage} alt="Preview" className="h-16 rounded-lg object-contain" />
                            <span className="text-[11px] text-slate-500">Preview Gambar Soal Aktif</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input type="text" placeholder="Pilihan A" value={optA} onChange={(e) => setOptA(e.target.value)} className="px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white" required />
                          <input type="text" placeholder="Pilihan B" value={optB} onChange={(e) => setOptB(e.target.value)} className="px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white" required />
                          <input type="text" placeholder="Pilihan C" value={optC} onChange={(e) => setOptC(e.target.value)} className="px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white" required />
                          <input type="text" placeholder="Pilihan D" value={optD} onChange={(e) => setOptD(e.target.value)} className="px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white" required />
                          <input type="text" placeholder="Pilihan E" value={optE} onChange={(e) => setOptE(e.target.value)} className="px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white" required />
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Kunci Jawaban Benar</label>
                            <select value={qAns} onChange={(e) => setQAns(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white font-bold text-emerald-700">
                              <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-sky-900 mb-1">Pembahasan Soal</label>
                          <input type="text" placeholder="Penjelasan pembahasan..." value={qExp} onChange={(e) => setQExp(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white" />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          {editingQuestionId && <button type="button" onClick={resetQuestionForm} className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">Batal</button>}
                          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md">
                            {editingQuestionId ? 'Simpan Perubahan Soal' : 'Tambah Soal ke Database'}
                          </button>
                        </div>
                      </form>

                      {/* PREVIEW DAFTAR SOAL OLEH TENTOR/ADMIN */}
                      <div className="space-y-3 pt-2">
                        <h4 className="font-bold text-xs text-sky-950 flex items-center gap-1.5"><Eye size={16} /> Preview Soal di Database ({utbkQuestions.length})</h4>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                          {utbkQuestions.map((q) => (
                            <div key={q.id} className="p-4 bg-sky-50/40 border border-sky-200 rounded-2xl flex justify-between items-start text-xs shadow-xs">
                              <div className="space-y-1">
                                <span className="font-bold text-blue-900 bg-sky-100 px-2.5 py-0.5 rounded-md">Paket: {q.package_name} | Subtes: {q.subtest}</span>
                                <p className="font-medium text-slate-800 mt-1">{q.question_text}</p>
                                {q.image_url && <img src={q.image_url} alt="Soal" className="h-16 mt-2 rounded-lg border border-sky-200" />}
                                <p className="text-[11px] text-emerald-700 font-bold mt-1">Kunci: {q.correct_answer}</p>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleEditQuestionClick(q)} className="p-2 bg-amber-100 text-amber-800 rounded-xl" title="Edit Soal"><Edit3 size={14} /></button>
                                <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 bg-rose-100 text-rose-700 rounded-xl" title="Hapus Soal"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INTERFACE UJIAN KUIS KHUSUS SISWA (CLIENT) - KETIK BEBAS */}
                  {userRole === 'client' && !isExamActive && !examResult && (
                    <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm text-center">
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 bg-sky-100 text-blue-600 rounded-3xl mx-auto flex items-center justify-center">
                          <Award size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">Mulai Try Out & Latihan UTBK PK PM</h3>
                        <p className="text-xs text-slate-500">Ketik nama paket dan subtes latihan yang ingin Anda kerjakan secara bebas.</p>
                        
                        <div className="grid grid-cols-1 gap-3 text-left">
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Nama Paket Ujian (Ketik Bebas)</label>
                            <input type="text" placeholder="Contoh: Paket 1" value={filterPackageInput} onChange={(e) => setFilterPackageInput(e.target.value)} className="w-full px-3 py-2.5 text-xs border border-sky-200 rounded-xl bg-sky-50/50 font-bold" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Subtes (Ketik Bebas)</label>
                            <input type="text" placeholder="Contoh: Penalaran Umum" value={filterSubtestInput} onChange={(e) => setFilterSubtestInput(e.target.value)} className="w-full px-3 py-2.5 text-xs border border-sky-200 rounded-xl bg-sky-50/50 font-bold" required />
                          </div>
                        </div>

                        <button onClick={startExam} className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-sky-500/35 transition-all">
                          Mulai Mengerjakan Ujian 🚀
                        </button>
                      </div>
                    </div>
                  )}

                  {/* KETIKA UJIAN AKTIF DI SISWA */}
                  {isExamActive && currentExamQuestions.length > 0 && (
                    <div className="bg-white rounded-3xl border border-sky-200 p-8 space-y-6 shadow-xl">
                      <div className="flex justify-between items-center border-b border-sky-100 pb-4">
                        <div>
                          <h3 className="text-sm font-black text-sky-900">Paket: {filterPackageInput} • Subtes: {filterSubtestInput}</h3>
                          <p className="text-xs text-slate-500">Soal {currentExamIndex + 1} dari {currentExamQuestions.length}</p>
                        </div>
                        <div className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl text-xs font-black flex items-center gap-1.5 animate-pulse">
                          <Clock size={16} /> Sisa Waktu: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">
                          {currentExamQuestions[currentExamIndex].question_text}
                        </p>
                        {currentExamQuestions[currentExamIndex].image_url && (
                          <div className="my-3">
                            <img src={currentExamQuestions[currentExamIndex].image_url} alt="Gambar Soal" className="max-h-60 rounded-2xl border border-sky-100 shadow-xs" />
                          </div>
                        )}

                        <div className="space-y-2.5 pt-2">
                          {['A', 'B', 'C', 'D', 'E'].map((opt) => {
                            const optText = currentExamQuestions[currentExamIndex][`option_` + opt.toLowerCase()];
                            if (!optText) return null;
                            const isSelected = studentAnswers[currentExamIndex] === opt;
                            return (
                              <button key={opt} onClick={() => setStudentAnswers({...studentAnswers, [currentExamIndex]: opt})} className={`w-full text-left p-3.5 rounded-2xl border text-xs font-medium transition-all flex items-center gap-3 ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-sky-50/40 hover:bg-sky-100/50 border-sky-100 text-slate-800'}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-white text-blue-700' : 'bg-sky-200 text-sky-900'}`}>{opt}</span>
                                {optText}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-sky-100">
                        <button disabled={currentExamIndex === 0} onClick={() => setCurrentExamIndex(currentExamIndex - 1)} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-50">Sebelumnya</button>
                        
                        {currentExamIndex < currentExamQuestions.length - 1 ? (
                          <button onClick={() => setCurrentExamIndex(currentExamIndex + 1)} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md">Selanjutnya</button>
                        ) : (
                          <button onClick={finishExamAutomatically} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg">Selesai & Kumpulkan Ujian</button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* HASIL UJIAN SISWA */}
                  {examResult && (
                    <div className="bg-white rounded-3xl border border-sky-200 p-8 space-y-6 shadow-xl text-center max-w-lg mx-auto">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center">
                        <CheckCircle2 size={36} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Ujian Berhasil Diselesaikan!</h3>
                      <div className="p-6 bg-sky-50/60 rounded-3xl border border-sky-100 space-y-2">
                        <p className="text-xs text-slate-500">Paket: {examResult.package_name} | Subtes: {examResult.subtest}</p>
                        <div className="text-4xl font-black text-blue-700">{examResult.score} <span className="text-xs text-slate-400 font-normal">/ 1000 Skor UTBK</span></div>
                        <p className="text-xs font-bold text-slate-700">Benar: {examResult.correct_answers} dari {examResult.total_questions} soal</p>
                      </div>
                      <button onClick={() => { setExamResult(null); setIsExamActive(false); }} className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold">Kembali ke Menu Latihan</button>
                    </div>
                  )}

                  {/* DASHBOARD PROGRES & RIWAYAT LATIHAN SISWA DENGAN TANGGAL */}
                  <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-4 shadow-sm">
                    <h3 className="text-lg font-black text-sky-900 flex items-center gap-2">
                      <TrendingUp className="text-blue-600" size={20} /> Dashboard Progres & Riwayat Latihan Anda
                    </h3>
                    <p className="text-xs text-slate-500">Catatan perkembangan skor try out dari waktu ke waktu beserta tanggal pengerjaan.</p>
                    
                    <div className="space-y-3 pt-2">
                      {utbkHistory.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-6 text-center">Belum ada riwayat pengerjaan try out.</p>
                      ) : (
                        utbkHistory.map((h, i) => (
                          <div key={i} className="p-4 rounded-2xl border border-sky-100 bg-sky-50/30 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-sky-950">Paket: {h.package_name} | Subtes: {h.subtest}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">📅 Tanggal: {new Date(h.date_taken).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-black text-blue-700">{h.score} Poin</span>
                              <p className="text-[10px] text-slate-500">Benar {h.correct_answers}/{h.total_questions}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SUB-MENU: KUMPULAN MATERI */}
              {activeUtbkSubMenu === 'materi' && (
                <div className="space-y-6">
                  {(userRole === 'admin' || userRole === 'tutor') && (
                    <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                      <h3 className="text-lg font-black text-sky-900 flex items-center gap-2">
                        <BookOpen className="text-blue-600" size={20} /> Upload Materi Pembelajaran UTBK
                      </h3>
                      <form onSubmit={handleSaveMaterial} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Judul Materi</label>
                            <input type="text" placeholder="Contoh: Modul Rahasia Aljabar UTBK" value={matTitle} onChange={(e) => setMatTitle(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Kategori / Subtes (Ketik Bebas)</label>
                            <input type="text" placeholder="Contoh: Penalaran Umum" value={matCategory} onChange={(e) => setMatCategory(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white font-bold" required />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-sky-900 mb-1">Isi Ringkasan / Deskripsi Materi</label>
                          <textarea rows="4" placeholder="Tuliskan ringkasan materi atau rumus cepat..." value={matContent} onChange={(e) => setMatContent(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required></textarea>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-sky-900 mb-1">Link File / Modul (Opsional)</label>
                          <input type="text" placeholder="https://drive.google.com/..." value={matLink} onChange={(e) => setMatLink(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" />
                        </div>
                        <div className="flex justify-end">
                          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md">Publikasikan Materi</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                    <div>
                      <h3 className="text-lg font-black text-sky-900 flex items-center gap-2"><BookOpen className="text-blue-600" size={20} /> Kumpulan Materi UTBK PK PM</h3>
                      <p className="text-xs text-slate-500">Modul siap baca dan ringkasan rumus cepat.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {utbkMaterials.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-6 text-center col-span-3">Belum ada materi yang diunggah.</p>
                      ) : (
                        utbkMaterials.map((m) => (
                          <div key={m.id} className="p-5 bg-sky-50/50 border border-sky-200 rounded-2xl space-y-3 relative group">
                            <span className="text-[10px] bg-sky-200 text-sky-800 px-2.5 py-0.5 rounded-full font-bold">{m.category}</span>
                            <h4 className="font-black text-slate-900 text-sm">{m.title}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">{m.content}</p>
                            {m.resource_link && (
                              <a href={m.resource_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-bold hover:underline">
                                <ExternalLink size={14} /> Buka Modul / Dokumen ↗
                              </a>
                            )}
                            {(userRole === 'admin' || userRole === 'tutor') && (
                              <button onClick={() => handleDeleteMaterial(m.id)} className="absolute top-4 right-4 p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100" title="Hapus Materi"><Trash2 size={14} /></button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. SUB-MENU: INFORMASI TRY OUT & JALUR MANDIRI */}
              {activeUtbkSubMenu === 'informasi' && (
                <div className="space-y-6">
                  {(userRole === 'admin' || userRole === 'tutor') && (
                    <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                      <h3 className="text-lg font-black text-sky-900 flex items-center gap-2">
                        <Info className="text-blue-600" size={20} /> Upload Informasi Try Out & Jalur Mandiri
                      </h3>
                      <form onSubmit={handleSaveInfo} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Judul Informasi</label>
                            <input type="text" placeholder="Contoh: TO Akbar SNBT 2026 / Info Mandiri" value={infoTitle} onChange={(e) => setInfoTitle(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Kategori Informasi</label>
                            <select value={infoType} onChange={(e) => setInfoType(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white font-bold">
                              <option value="Instagram TO">Instagram Try Out (TO)</option>
                              <option value="Jalur Mandiri">Jalur Mandiri PTN</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-sky-900 mb-1">Deskripsi / Keterangan Lengkap</label>
                          <textarea rows="3" placeholder="Tuliskan detail jadwal, persyaratan, atau link pendaftaran..." value={infoDesc} onChange={(e) => setInfoDesc(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required></textarea>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-sky-900 mb-1">Link Tautan Medsos / Pendaftaran (URL)</label>
                          <input type="text" placeholder="https://instagram.com/..." value={infoUrl} onChange={(e) => setInfoUrl(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" />
                        </div>
                        <div className="flex justify-end">
                          <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md">Publikasikan Informasi</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                    <div>
                      <h3 className="text-lg font-black text-sky-900 flex items-center gap-2"><Info className="text-blue-600" size={20} /> Informasi Try Out (TO) IG & Jalur Mandiri</h3>
                      <p className="text-xs text-slate-500">Update berkala seputar jadwal try out nasional dan info seleksi mandiri kampus.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {utbkInfos.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-6 text-center col-span-2">Belum ada informasi yang diunggah.</p>
                      ) : (
                        utbkInfos.map((inf) => (
                          <div key={inf.id} className="p-6 bg-gradient-to-br from-sky-50 to-blue-50/50 border border-sky-200 rounded-3xl space-y-3 relative group">
                            <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-xl shadow-xs">{inf.info_type}</span>
                            <h4 className="font-black text-slate-900 text-base">{inf.title}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">{inf.description}</p>
                            {inf.target_url && (
                              <a href={inf.target_url} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md">Kunjungi Tautan ↗</a>
                            )}
                            {(userRole === 'admin' || userRole === 'tutor') && (
                              <button onClick={() => handleDeleteInfo(inf.id)} className="absolute top-4 right-4 p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100" title="Hapus Informasi"><Trash2 size={14} /></button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUPER ADMIN PANEL & HAK AKSES UTBK SISWA */}
          {activeMenu === 'admin-panel' && userRole === 'admin' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-sky-900 flex items-center gap-2">
                    <Shield className="text-sky-500" size={20} /> Kelola Hak Akses Siswa ke Portal UTBK PK PM
                  </h3>
                  <p className="text-xs text-slate-500">Berikan atau cabut izin akses bagi siswa agar bisa membuka menu latihan UTBK.</p>
                </div>

                <div className="divide-y divide-sky-100 border border-sky-100 rounded-2xl overflow-hidden">
                  {allProfiles.filter(p => p.role === 'client').map((clientUser) => (
                    <div key={clientUser.id} className="p-4 flex justify-between items-center hover:bg-sky-50/40">
                      <div>
                        <p className="font-bold text-xs text-slate-900">{clientUser.full_name || 'Siswa'} ({clientUser.email})</p>
                        <p className="text-[10px] text-blue-600 font-bold">Status UTBK: {clientUser.utbk_access ? '✅ Diberikan Akses' : '🔒 Terkunci'}</p>
                      </div>
                      <button onClick={() => handleToggleUtbkAccess(clientUser.id, clientUser.utbk_access)} className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs ${clientUser.utbk_access ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-blue-600 text-white'}`}>
                        {clientUser.utbk_access ? 'Cabut Akses UTBK' : 'Izinkan Akses UTBK'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MENU DATA SISWA */}
          {activeMenu === 'students' && (userRole === 'tutor' || userRole === 'admin') && (
            <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-sky-900">Manajemen Data Siswa</h3>
                  <p className="text-xs text-slate-500">Siswa yang didaftarkan di sini dapat diizinkan untuk mengakses menu UTBK.</p>
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
                    <div key={s.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-sky-50/40">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{s.full_name} <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">{s.grade}</span></h4>
                        <p className="text-xs text-slate-500 mt-1">Email: {s.email || '-'} • Tutor: <strong>{currentTutor?.full_name || 'Utama'}</strong></p>
                      </div>
                      <div className="flex items-center gap-2">
                        {userRole === 'admin' && (
                          <select value={s.tutor_id || ''} onChange={(e) => handleTransferStudentTutor(s.id, e.target.value)} className="px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white font-bold text-sky-900">
                            <option value="">-- Pindah Tutor --</option>
                            {tutorsList.map(t => <option key={t.id} value={t.id}>{t.full_name || t.email}</option>)}
                          </select>
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
            <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-sky-900">Manajemen Jadwal Les</h3>
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
                        {students.map((s) => (<option key={s.id} value={s.id}>{s.full_name}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-sky-900 mb-1">Hari Bimbel</label>
                      <select value={schedDay} onChange={(e) => setSchedDay(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white">
                        <option value="Senin">Senin</option><option value="Selasa">Selasa</option><option value="Rabu">Rabu</option><option value="Kamis">Kamis</option><option value="Jumat">Jumat</option><option value="Sabtu">Sabtu</option><option value="Minggu">Minggu</option>
                      </select>
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
                        <h4 className="font-bold text-slate-900 text-sm">{studentObj?.full_name || 'Siswa'} ({item.day_of_week})</h4>
                        <p className="text-xs text-slate-600 mt-1">Pukul {item.start_time} s.d {item.end_time}</p>
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
            <div className="space-y-6">
              {(userRole === 'tutor' || userRole === 'admin') && (
                <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm border-l-4 border-l-sky-500">
                  <h3 className="text-lg font-black text-sky-900">{editingPresenceId ? 'Edit Presensi' : 'Form Input Presensi'}</h3>
                  <form onSubmit={handleCreatePresence} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="w-full px-4 py-3 text-xs border border-sky-200 rounded-xl bg-white" required>
                        <option value="">-- Pilih Siswa --</option>
                        {students.map((s) => (<option key={s.id} value={s.full_name}>{s.full_name}</option>))}
                      </select>
                      <input type="date" value={presDate} onChange={(e) => setPresDate(e.target.value)} className="w-full px-4 py-3 text-xs border border-sky-200 rounded-xl bg-white" required />
                      <input type="text" placeholder="Materi" value={presMaterial} onChange={(e) => setPresMaterial(e.target.value)} className="w-full px-4 py-3 text-xs border border-sky-200 rounded-xl bg-white" required />
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="px-6 py-3 bg-sky-500 text-white rounded-xl text-xs font-bold">Simpan Presensi</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-5 shadow-sm">
                <h3 className="text-lg font-black text-sky-900">Rekapitulasi Presensi</h3>
                <div className="space-y-4">
                  {paginatedRecords.map((item) => (
                    <div key={item.id} className="p-5 rounded-2xl border border-sky-100 flex justify-between items-center bg-sky-50/30 text-xs">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.student_name} • {item.date}</p>
                        <p className="text-slate-600 mt-1">Materi: {item.material}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => addToCalendar(item)} className="px-3 py-2 bg-sky-100 text-sky-800 rounded-xl font-bold"><CalendarPlus size={14} /></button>
                        <span className={`px-3 py-1.5 rounded-xl font-bold ${item.status === 'Terkonfirmasi' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span>
                        {userRole === 'client' && item.status === 'Pending' && (
                          <button onClick={() => handleVerifyPresence(item.id)} className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold">Konfirmasi</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PROFIL */}
          {activeMenu === 'profile' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                <h3 className="text-lg font-black text-sky-900">Pengaturan Profil</h3>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <input type="text" value={userProfile.fullName} onChange={(e) => setUserProfile({...userProfile, fullName: e.target.value})} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
                  <input type="text" value={userProfile.phone} onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
                  <input type="text" value={userProfile.address} onChange={(e) => setUserProfile({...userProfile, address: e.target.value})} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
                  <div className="flex justify-end">
                    <button type="submit" className="px-6 py-3 bg-sky-500 text-white rounded-xl text-xs font-bold">Simpan Profil</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FLOATING WHATSAPP */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {showWaMenu && (
          <div className="mb-3 w-64 bg-white/95 backdrop-blur-md border border-sky-100 rounded-3xl shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <span className="text-xs font-black text-sky-900">💬 Hubungi Dian Math Lab</span>
                <button onClick={() => setShowWaMenu(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <div className="space-y-2">
                <a href="https://wa.me/6287730655553" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-emerald-950">👩‍💼 Founder Cantik</p>
                    <p className="text-[10px] text-emerald-600">0877-3065-5553</p>
                  </div>
                  <span className="text-xs bg-emerald-500 text-white px-2.5 py-1 rounded-xl">Chat</span>
                </a>
                <a href="https://wa.me/62882005679302" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-sky-950">👨‍💻 Admin Ganteng</p>
                    <p className="text-[10px] text-sky-600">0882-0056-79302</p>
                  </div>
                  <span className="text-xs bg-sky-500 text-white px-2.5 py-1 rounded-xl">Chat</span>
                </a>
            </div>
          </div>
        )}
        <button onClick={() => setShowWaMenu(!showWaMenu)} className="relative group flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-full shadow-2xl hover:scale-110 transition-all">
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </button>
      </div>

      {/* MODAL */}
      {modalConfig.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-sky-100 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center shadow-md bg-blue-600 text-white">
              {modalConfig.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <h3 className="text-lg font-black text-sky-900">{modalConfig.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{modalConfig.message}</p>
            <div className="flex gap-3 pt-3">
              {modalConfig.onConfirm ? (
                <>
                  <button onClick={closeModal} className="flex-1 py-3 bg-slate-100 rounded-xl text-xs font-bold">Batal</button>
                  <button onClick={modalConfig.onConfirm} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-xs font-bold">Ya, Lanjutkan</button>
                </>
              ) : (
                <button onClick={closeModal} className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold">Mengerti</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
