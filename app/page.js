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
  Image as ImageIcon
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
  const [activeUtbkSubMenu, setActiveUtbkSubMenu] = useState('latihan'); 
   
  // State Modal Interaktif Custom yang Dipercantik
  const [modalConfig, setModalConfig] = useState({ show: false, title: '', message: '', type: 'info', onConfirm: null });

  // State Floating WhatsApp Menu (Diatur false agar tertutup dulu di awal)
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

  // State Presensi & Filter Lengkap Sesuai Kode Asli
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

  // --- STATE KHUSUS UTBK PK PM ---
  const [utbkQuestions, setUtbkQuestions] = useState([]);
  const [utbkMaterials, setUtbkMaterials] = useState([]);
  const [utbkInfos, setUtbkInfos] = useState([]);
  const [utbkHistory, setUtbkHistory] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('Paket 1');
  const [selectedSubtest, setSelectedSubtest] = useState('Penalaran Umum');
  
  // Form Kelola Soal (Admin/Tentor)
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

  // Form Kelola Materi & Informasi (Admin/Tentor)
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matCategory, setMatCategory] = useState('Modul Utama');
  const [infoTitle, setInfoTitle] = useState('');
  const [infoLink, setInfoLink] = useState('');
  const [infoCategory, setInfoCategory] = useState('Try Out Instagram');

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

    // Fetch Soal, Materi, Informasi, & Riwayat UTBK
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

  const handleToggleUtbkAccess = async (profileId, currentStatus) => {
    const newStatus = !currentStatus;
    const { error } = await supabase.from('profiles').update({ utbk_access: newStatus }).eq('id', profileId);
    if (!error) {
      fetchAppData(session);
      showAlert('Berhasil', `Akses UTBK PK PM untuk siswa tersebut berhasil ${newStatus ? 'DIBERIKAN' : 'DICABUT'}.`, 'success');
    } else {
      showAlert('Gagal', error.message, 'warning');
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!qText.trim()) {
      showAlert('Perhatian', 'Pertanyaan soal tidak boleh kosong!', 'warning');
      return;
    }

    const questionPayload = {
      package_name: qPackage,
      subtest: qSubtest,
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
        showAlert('Berhasil', 'Soal UTBK baru berhasil ditambahkan ke database.', 'success');
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
    showAlert('Konfirmasi Hapus', 'Hapus soal ini dari paket latihan?', 'warning', async () => {
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

  const downloadQuestionTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,package_name,subtest,question_text,image_url,option_a,option_b,option_c,option_d,option_e,correct_answer,explanation,duration_minutes\nPaket 1,Penalaran Umum,Contoh Pertanyaan Soal Disini?,https://example.com/gambar.png,Pilihan A,Pilihan B,Pilihan C,Pilihan D,Pilihan E,A,Pembahasan soal disini,45";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_soal_utbk_dian_math_lab.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUploadQuestions = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n');
      let successCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].trim();
        if (!row) continue;
        const cols = row.split(',');
        if (cols.length >= 11) {
          const payload = {
            package_name: cols[0]?.trim() || 'Paket 1',
            subtest: cols[1]?.trim() || 'Penalaran Umum',
            question_text: cols[2]?.trim() || '',
            image_url: cols[3]?.trim() !== 'none' ? cols[3]?.trim() : null,
            option_a: cols[4]?.trim() || '',
            option_b: cols[5]?.trim() || '',
            option_c: cols[6]?.trim() || '',
            option_d: cols[7]?.trim() || '',
            option_e: cols[8]?.trim() || '',
            correct_answer: cols[9]?.trim() || 'A',
            explanation: cols[10]?.trim() || '',
            duration_minutes: parseInt(cols[11]) || 45
          };
          const { error } = await supabase.from('utbk_questions').insert([payload]);
          if (!error) successCount++;
        }
      }
      fetchAppData(session);
      showAlert('Impor Selesai', `Berhasil mengimpor ${successCount} soal baru secara otomatis ke database!`, 'success');
    };
    reader.readAsText(file);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setQImage(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    if (!matTitle.trim()) return;
    const { error } = await supabase.from('utbk_materials').insert([{
      title: matTitle,
      description: matDesc,
      category: matCategory
    }]);
    if (!error) {
      setMatTitle(''); setMatDesc('');
      fetchAppData(session);
      showAlert('Berhasil', 'Materi belajar baru berhasil diunggah.', 'success');
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

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!infoTitle.trim()) return;
    const { error } = await supabase.from('utbk_infos').insert([{
      title: infoTitle,
      link_url: infoLink,
      category: infoCategory
    }]);
    if (!error) {
      setInfoTitle(''); setInfoLink('');
      fetchAppData(session);
      showAlert('Berhasil', 'Informasi baru berhasil dipublikasikan.', 'success');
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

  const startExam = () => {
    const filtered = utbkQuestions.filter(q => q.package_name === selectedPackage && q.subtest === selectedSubtest);
    if (filtered.length === 0) {
      showAlert('Perhatian', `Belum ada soal untuk ${selectedPackage} - ${selectedSubtest}. Silakan hubungi tentor.`, 'warning');
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
      package_name: selectedPackage,
      subtest: selectedSubtest,
      total_questions: total,
      correct_answers: correctCount,
      score: score,
      date_taken: new Date().toISOString()
    };

    setExamResult(resultData);
    setIsExamActive(false);

    await supabase.from('utbk_history').insert([resultData]);
    fetchAppData(session);
    showAlert('Ujian Selesai', `Hasil ujian Anda telah disimpan. Skor UTBK Anda: ${score}`, 'success');
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
            <p className="text-xs text-sky-600 font-medium">Sistem Les Privat Matematika & UTBK PK PM • <strong>NZ Production © 2026</strong></p>
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
                <p className="font-bold flex items-center gap-1"><Sparkles className="text-sky-600" size={14} /> Informasi Aktivasi Email:</p>
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

        {/* FLOATING WHATSAPP DI HALAMAN LOGIN */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {showWaMenu && (
            <div className="mb-3 w-64 bg-white/95 backdrop-blur-md border border-sky-100 rounded-3xl shadow-2xl p-4 space-y-3 transform transition-all duration-300">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                  <span className="text-xs font-black text-sky-900">💬 Hubungi Dian Math Lab</span>
                  <button onClick={() => setShowWaMenu(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕</button>
              </div>
              <div className="space-y-2">
                  <a href="https://wa.me/6287730655553?text=Halo%20Founder%20Cantik%20Dian%20Math%20Lab,%20saya%20ingin%20berkonsultasi%20mengenai%20les%20privat." target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-all duration-300 group">
                    <div>
                      <p className="text-xs font-bold text-emerald-950">👩‍💼 Founder Cantik</p>
                      <p className="text-[10px] text-emerald-600">0877-3065-5553</p>
                    </div>
                    <span className="text-xs bg-emerald-500 text-white px-2.5 py-1 rounded-xl font-bold shadow-sm">Chat</span>
                  </a>
                  <a href="https://wa.me/62882005679302?text=Halo%20Admin%20Ganteng%20Dian%20Math%20Lab,%20saya%20ingin%20menanyakan%20jadwal%20dan%20pendaftaran%20les." target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-2xl transition-all duration-300 group">
                    <div>
                      <p className="text-xs font-bold text-sky-950">👨‍💻 Admin Ganteng</p>
                      <p className="text-[10px] text-sky-600">0882-0056-79302</p>
                    </div>
                    <span className="text-xs bg-sky-500 text-white px-2.5 py-1 rounded-xl font-bold shadow-sm">Chat</span>
                  </a>
              </div>
            </div>
          )}
          <button onClick={() => setShowWaMenu(!showWaMenu)} className="relative group flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white rounded-full shadow-2xl shadow-emerald-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95" title="Butuh Bantuan? Hubungi Kami">
            <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping pointer-events-none" style={{ animationDuration: '3s' }}></span>
            <svg className="w-7 h-7 relative z-10 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </button>
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

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white text-slate-700 transform transition-all duration-500 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col justify-between border-r border-sky-100 shadow-xl`}>
        <div>
          <div className="px-6 py-6 border-b border-sky-100 flex items-center justify-between bg-sky-50/50">
            <div>
              <h1 className="text-base font-black text-sky-900 flex items-center gap-2"><Sparkles className="text-sky-500" size={16} /> Dian Math Lab</h1>
              <p className="text-[10px] text-sky-600 font-bold uppercase">NZ Production © 2026</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-slate-800"><X size={20} /></button>
          </div>

          <nav className="px-4 py-6 space-y-2">
            <button onClick={() => setActiveMenu('dashboard')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-500 ease-in-out ${activeMenu === 'dashboard' ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30' : 'hover:bg-sky-50 text-slate-600'}`}>
              <div className="flex items-center gap-3"><Home size={18} /> Dashboard Utama</div>
            </button>

            {(userRole === 'admin' || userRole === 'tutor' || userProfile.utbk_access) && (
              <button onClick={() => setActiveMenu('utbk-portal')} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-500 ease-in-out ${activeMenu === 'utbk-portal' ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/30' : 'hover:bg-sky-50 text-sky-700 bg-sky-50/50'}`}>
                <div className="flex items-center gap-3"><Award size={18} /> Portal UTBK PK PM ⭐</div>
              </button>
            )}

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
                <Bell className="text-amber-600" size={14} /> Ada {pendingCount} Jadwal Perlu Dikonfirmasi!
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
                <p className="text-sky-100 text-xs md:text-sm">Sistem operasional les privat matematika terpadu & portal persiapan UTBK PK PM.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm"><span className="text-xs font-bold text-sky-600 uppercase">Siswa Terdaftar</span><div className="mt-2 text-3xl font-black">{students.length}</div></div>
                <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm"><span className="text-xs font-bold text-sky-600 uppercase">Jadwal Aktif</span><div className="mt-2 text-3xl font-black text-blue-600">{clientSchedules.length}</div></div>
                <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm"><span className="text-xs font-bold text-sky-600 uppercase">Presensi Pending</span><div className="mt-2 text-3xl font-black text-amber-500">{pendingCount}</div></div>
                <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm"><span className="text-xs font-bold text-sky-600 uppercase">Akses UTBK</span><div className="mt-2 text-base font-bold text-sky-600 flex items-center gap-1.5">{(userRole !== 'client' || userProfile.utbk_access) ? '✅ Aktif' : '🔒 Belum Diizinkan'}</div></div>
              </div>
            </div>
          )}

          {/* PORTAL UTBK PK PM */}
          {activeMenu === 'utbk-portal' && (
            <div className="space-y-6 transition-all duration-500 ease-in-out">
              <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-2"><Award size={28} /> Portal Eksklusif UTBK PK PM</h2>
                  <p className="text-sky-100 text-xs mt-1">Latihan soal kuis berstandar UTBK, kumpulan materi lengkap, dan info try out terbaru.</p>
                </div>
                <div className="flex gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md">
                  <button onClick={() => setActiveUtbkSubMenu('latihan')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeUtbkSubMenu === 'latihan' ? 'bg-white text-sky-900 shadow-md' : 'text-white hover:bg-white/20'}`}>✍️ Latihan Soal</button>
                  <button onClick={() => setActiveUtbkSubMenu('materi')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeUtbkSubMenu === 'materi' ? 'bg-white text-sky-900 shadow-md' : 'text-white hover:bg-white/20'}`}>📚 Kumpulan Materi</button>
                  <button onClick={() => setActiveUtbkSubMenu('informasi')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeUtbkSubMenu === 'informasi' ? 'bg-white text-sky-900 shadow-md' : 'text-white hover:bg-white/20'}`}>📢 Informasi & TO IG</button>
                </div>
              </div>

              {activeUtbkSubMenu === 'latihan' && (
                <div className="space-y-6">
                  {(userRole === 'admin' || userRole === 'tutor') && (
                    <div className="bg-white rounded-3xl border border-sky-200 p-8 space-y-6 shadow-sm">
                      <div className="flex justify-between items-center border-b border-sky-100 pb-4">
                        <div>
                          <h3 className="text-lg font-black text-sky-900 flex items-center gap-2">
                            <FileSpreadsheet className="text-sky-600" size={20} /> Panel Kelola & Impor Soal UTBK
                          </h3>
                          <p className="text-xs text-slate-500">Tambah, Edit, Hapus, Upload gambar (JPG, PNG, JPEG/Link), atau Impor massal via Excel/CSV.</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={downloadQuestionTemplate} className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100">
                            <Download size={14} /> Template Excel
                          </button>
                          <label className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-sky-700 shadow-md">
                            <Upload size={14} /> Upload CSV
                            <input type="file" accept=".csv" onChange={handleFileUploadQuestions} className="hidden" />
                          </label>
                        </div>
                      </div>

                      <form onSubmit={handleSaveQuestion} className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100 space-y-4">
                        <h4 className="font-bold text-xs text-sky-950">{editingQuestionId ? '✏️ Edit Soal UTBK' : '➕ Tambah Soal Baru Manual'}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Pilih Paket</label>
                            <select value={qPackage} onChange={(e) => setQPackage(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white font-bold">
                              <option value="Paket 1">Paket 1</option>
                              <option value="Paket 2">Paket 2</option>
                              <option value="Paket 3">Paket 3</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Subtes</label>
                            <select value={qSubtest} onChange={(e) => setQSubtest(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white font-bold">
                              <option value="Penalaran Umum">Penalaran Umum</option>
                              <option value="Pengetahuan Kuantitatif">Pengetahuan Kuantitatif</option>
                              <option value="PBM & PPU">PBM & PPU</option>
                            </select>
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
                            <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleImageFileChange} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Atau Masukkan Tautan / Link Gambar</label>
                            <input type="text" placeholder="https://..." value={qImage} onChange={(e) => setQImage(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white" />
                          </div>
                        </div>

                        {qImage && (
                          <div className="p-3 bg-white rounded-2xl border border-sky-200 inline-block">
                            <p className="text-[10px] font-bold text-sky-900 mb-1">Preview Gambar Soal:</p>
                            <img src={qImage} alt="Preview" className="h-24 object-contain rounded-xl" />
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
                          <button type="submit" className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md">
                            {editingQuestionId ? 'Simpan Perubahan Soal' : 'Tambah Soal ke Database'}
                          </button>
                        </div>
                      </form>

                      <div className="space-y-3 pt-2">
                        <h4 className="font-bold text-xs text-sky-900">Preview & Daftar Soal di Database ({utbkQuestions.length})</h4>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                          {utbkQuestions.map((q) => (
                            <div key={q.id} className="p-4 bg-sky-50/40 border border-sky-100 rounded-2xl flex justify-between items-center text-xs shadow-xs">
                              <div className="space-y-1">
                                <span className="font-bold text-sky-800 bg-white px-2 py-0.5 rounded border border-sky-200">[{q.package_name} - {q.subtest}]</span>
                                <p className="font-medium text-slate-800">{q.question_text}</p>
                                {q.image_url && <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><ImageIcon size={12} /> Ada Gambar Pendukung</span>}
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleEditQuestionClick(q)} className="p-2 bg-amber-50 text-amber-700 rounded-xl"><Edit3 size={14} /></button>
                                <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {userRole === 'client' && !isExamActive && !examResult && (
                    <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm text-center">
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-3xl mx-auto flex items-center justify-center">
                          <Award size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">Mulai Try Out & Latihan UTBK PK PM</h3>
                        <p className="text-xs text-slate-500">Pilih paket soal dan subtes yang ingin dikerjakan. Sistem penilaian menggunakan bobot ala UTBK asli (skor maksimal 1000).</p>
                        
                        <div className="grid grid-cols-2 gap-3 text-left">
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Pilih Paket</label>
                            <select value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value)} className="w-full px-3 py-2.5 text-xs border border-sky-200 rounded-xl bg-sky-50/50 font-bold">
                              <option value="Paket 1">Paket 1</option>
                              <option value="Paket 2">Paket 2</option>
                              <option value="Paket 3">Paket 3</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Subtes</label>
                            <select value={selectedSubtest} onChange={(e) => setSelectedSubtest(e.target.value)} className="w-full px-3 py-2.5 text-xs border border-sky-200 rounded-xl bg-sky-50/50 font-bold">
                              <option value="Penalaran Umum">Penalaran Umum</option>
                              <option value="Pengetahuan Kuantitatif">Pengetahuan Kuantitatif</option>
                              <option value="PBM & PPU">PBM & PPU</option>
                            </select>
                          </div>
                        </div>

                        <button onClick={startExam} className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-sky-500/30 transition-all">
                          Mulai Kerjakan Soal Sekarang 🚀
                        </button>
                      </div>
                    </div>
                  )}

                  {isExamActive && currentExamQuestions.length > 0 && (
                    <div className="bg-white rounded-3xl border border-sky-200 p-8 space-y-6 shadow-xl">
                      <div className="flex justify-between items-center border-b border-sky-100 pb-4">
                        <div>
                          <h3 className="text-sm font-black text-sky-900">{selectedPackage} • {selectedSubtest}</h3>
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
                              <button key={opt} onClick={() => setStudentAnswers({...studentAnswers, [currentExamIndex]: opt})} className={`w-full text-left p-3.5 rounded-2xl border text-xs font-medium transition-all flex items-center gap-3 ${isSelected ? 'bg-sky-600 text-white border-sky-600 shadow-md' : 'bg-sky-50/40 hover:bg-sky-100/50 border-sky-100 text-slate-800'}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-white text-sky-700' : 'bg-sky-200 text-sky-900'}`}>{opt}</span>
                                {optText}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-sky-100">
                        <button disabled={currentExamIndex === 0} onClick={() => setCurrentExamIndex(currentExamIndex - 1)} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-50">Sebelumnya</button>
                        
                        {currentExamIndex < currentExamQuestions.length - 1 ? (
                          <button onClick={() => setCurrentExamIndex(currentExamIndex + 1)} className="px-6 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md">Selanjutnya</button>
                        ) : (
                          <button onClick={finishExamAutomatically} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg">Selesai & Kumpulkan Ujian</button>
                        )}
                      </div>
                    </div>
                  )}

                  {examResult && (
                    <div className="bg-white rounded-3xl border border-sky-200 p-8 space-y-6 shadow-xl text-center max-w-lg mx-auto">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center">
                        <CheckCircle2 size={36} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Ujian Berhasil Diselesaikan!</h3>
                      <div className="p-6 bg-sky-50/60 rounded-3xl border border-sky-100 space-y-2">
                        <p className="text-xs text-slate-500">{examResult.package_name} • {examResult.subtest}</p>
                        <div className="text-4xl font-black text-sky-700">{examResult.score} <span className="text-xs text-slate-400 font-normal">/ 1000 Skor UTBK</span></div>
                        <p className="text-xs font-bold text-slate-700">Benar: {examResult.correct_answers} dari {examResult.total_questions} soal</p>
                      </div>
                      <button onClick={() => { setExamResult(null); setIsExamActive(false); }} className="w-full py-3 bg-sky-600 text-white rounded-xl text-xs font-bold">Kembali ke Menu Latihan</button>
                    </div>
                  )}

                  <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-4 shadow-sm">
                    <h3 className="text-lg font-black text-sky-900 flex items-center gap-2">
                      <TrendingUp className="text-sky-600" size={20} /> Dashboard Progres & Riwayat Latihan Anda
                    </h3>
                    <p className="text-xs text-slate-500">Catatan perkembangan skor try out dari waktu ke waktu beserta tanggal pengerjaan.</p>
                    
                    <div className="space-y-3 pt-2">
                      {utbkHistory.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-6 text-center">Belum ada riwayat pengerjaan try out.</p>
                      ) : (
                        utbkHistory.map((h, i) => (
                          <div key={i} className="p-4 rounded-2xl border border-sky-100 bg-sky-50/30 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-sky-950">{h.package_name} • {h.subtest}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">📅 Tanggal: {new Date(h.date_taken).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-black text-sky-700">{h.score} Poin</span>
                              <p className="text-[10px] text-slate-500">Benar {h.correct_answers}/{h.total_questions}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeUtbkSubMenu === 'materi' && (
                <div className="space-y-6">
                  {(userRole === 'admin' || userRole === 'tutor') && (
                    <div className="bg-white rounded-3xl border border-sky-200 p-8 space-y-6 shadow-sm">
                      <h3 className="text-lg font-black text-sky-900">Upload & Kelola Materi Pembelajaran UTBK</h3>
                      <form onSubmit={handleSaveMaterial} className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Judul Materi</label>
                            <input type="text" placeholder="Contoh: Modul Rahasia Aljabar" value={matTitle} onChange={(e) => setMatTitle(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Kategori</label>
                            <select value={matCategory} onChange={(e) => setMatCategory(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white font-bold">
                              <option value="Modul Utama">Modul Utama</option>
                              <option value="Rumus Cepat">Rumus Cepat</option>
                              <option value="Tips & Trik">Tips & Trik</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-sky-900 mb-1">Deskripsi / Ringkasan / Link Materi</label>
                          <textarea rows="3" placeholder="Ketik ringkasan atau tautan dokumen materi..." value={matDesc} onChange={(e) => setMatDesc(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white" required></textarea>
                        </div>
                        <div className="flex justify-end">
                          <button type="submit" className="px-6 py-2.5 bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md">Publikasikan Materi</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                    <div>
                      <h3 className="text-lg font-black text-sky-900 flex items-center gap-2"><BookOpen className="text-sky-600" size={20} /> Kumpulan Materi UTBK PK PM</h3>
                      <p className="text-xs text-slate-500">Modul ringkas dan panduan belajar dari tentor.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {utbkMaterials.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-6">Belum ada materi yang diunggah.</p>
                      ) : (
                        utbkMaterials.map((m) => (
                          <div key={m.id} className="p-5 bg-sky-50/50 border border-sky-200 rounded-3xl space-y-3 relative group shadow-xs">
                            <span className="text-[10px] bg-sky-200 text-sky-800 px-2.5 py-0.5 rounded-full font-bold">{m.category}</span>
                            <h4 className="font-black text-slate-900 text-sm">{m.title}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>
                            {(userRole === 'admin' || userRole === 'tutor') && (
                              <button onClick={() => handleDeleteMaterial(m.id)} className="absolute top-4 right-4 p-1.5 bg-rose-50 text-rose-600 rounded-lg"><Trash2 size={12} /></button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeUtbkSubMenu === 'informasi' && (
                <div className="space-y-6">
                  {(userRole === 'admin' || userRole === 'tutor') && (
                    <div className="bg-white rounded-3xl border border-sky-200 p-8 space-y-6 shadow-sm">
                      <h3 className="text-lg font-black text-sky-900">Upload & Kelola Informasi Try Out / Jalur Mandiri</h3>
                      <form onSubmit={handleSaveInfo} className="bg-sky-50/50 p-6 rounded-2xl border border-sky-100 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Judul Informasi</label>
                            <input type="text" placeholder="Contoh: TO Akbar SNBT 2026" value={infoTitle} onChange={(e) => setInfoTitle(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Kategori</label>
                            <select value={infoCategory} onChange={(e) => setInfoCategory(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white font-bold">
                              <option value="Try Out Instagram">Try Out Instagram</option>
                              <option value="Jalur Mandiri PTN">Jalur Mandiri PTN</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-sky-900 mb-1">Tautan / Link Medsos / Pendaftaran</label>
                            <input type="text" placeholder="https://instagram.com/..." value={infoLink} onChange={(e) => setInfoLink(e.target.value)} className="w-full px-3 py-2 text-xs border border-sky-200 rounded-xl bg-white" required />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button type="submit" className="px-6 py-2.5 bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md">Publikasikan Informasi</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                    <div>
                      <h3 className="text-lg font-black text-sky-900 flex items-center gap-2"><Info className="text-sky-600" size={20} /> Informasi Try Out (TO) IG & Jalur Mandiri</h3>
                      <p className="text-xs text-slate-500">Update berkala seputar jadwal try out nasional & info pendaftaran kampus.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {utbkInfos.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-6">Belum ada informasi yang diunggah.</p>
                      ) : (
                        utbkInfos.map((inf) => (
                          <div key={inf.id} className="p-6 bg-gradient-to-br from-sky-50 to-blue-500/10 border border-sky-200 rounded-3xl space-y-3 relative shadow-xs">
                            <span className="px-3 py-1 bg-sky-600 text-white text-[10px] font-bold rounded-xl shadow-xs">{inf.category}</span>
                            <h4 className="font-black text-slate-900 text-base">{inf.title}</h4>
                            {inf.link_url && (
                              <a href={inf.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition-all">
                                <ExternalLink size={14} /> Kunjungi Tautan / Link ↗
                              </a>
                            )}
                            {(userRole === 'admin' || userRole === 'tutor') && (
                              <button onClick={() => handleDeleteInfo(inf.id)} className="absolute top-4 right-4 p-1.5 bg-rose-50 text-rose-600 rounded-lg"><Trash2 size={12} /></button>
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

          {/* SUPER ADMIN PANEL */}
          {activeMenu === 'admin-panel' && userRole === 'admin' && (
            <div className="space-y-6 transition-all duration-500 ease-in-out">
              <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-sky-900 flex items-center gap-2">
                    <Shield className="text-sky-500" size={20} /> Rekapitulasi Per Tutor & Kontrol Super Admin
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
                  })}
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-sky-900">Manajemen Hak Akses & Portal UTBK Siswa</h3>
                  <p className="text-xs text-slate-500">Berikan atau cabut izin akses UTBK serta ubah role akun di database.</p>
                </div>
                <div className="divide-y divide-sky-100 border border-sky-100 rounded-2xl overflow-hidden">
                  {allProfiles.map((p) => (
                    <div key={p.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:bg-sky-50/40">
                      <div>
                        <p className="font-bold text-xs text-slate-900">{p.full_name || 'Tanpa Nama'} ({p.email})</p>
                        <p className="text-[10px] text-sky-600 font-bold uppercase">Role: {p.role} {p.role === 'client' && `• UTBK: ${p.utbk_access ? '✅ Diberikan' : '🔒 Terkunci'}`}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.role === 'client' && (
                          <button onClick={() => handleToggleUtbkAccess(p.id, p.utbk_access)} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${p.utbk_access ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-sky-600 text-white'}`}>
                            {p.utbk_access ? 'Cabut Akses UTBK' : 'Beri Akses UTBK'}
                          </button>
                        )}
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

          {/* MENU DATA SISWA */}
          {activeMenu === 'students' && (userRole === 'tutor' || userRole === 'admin') && (
            <div className="space-y-6 transition-all duration-500 ease-in-out">
            <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-sky-900">Manajemen Data Siswa & Pindah Tutor</h3>
                  <p className="text-xs text-slate-500">Siswa yang Anda daftarkan dapat diizinkan untuk mengakses menu UTBK.</p>
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
                        <option value="Kelas 10 SMA">Kelas 10 SMA</option>
                        <option value="Kelas 11 SMA">Kelas 11 SMA</option>
                        <option value="Kelas 12 SMA">Kelas 12 SMA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-sky-900 mb-1">Fokus Pembelajaran / Materi</label>
                      <input type="text" placeholder="Contoh: Aritmatika / UTBK" value={inputSubject} onChange={(e) => setInputSubject(e.target.value)} className="w-full px-4 py-2.5 text-xs border border-sky-200 rounded-xl bg-white" required />
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
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><Mail className="text-sky-400" size={12} /> {s.email || 'Email belum diatur'} • Fokus: <strong>{s.subject || 'Matematika Umum'}</strong> • Tutor: <strong>{currentTutor?.full_name || 'Tutor Utama'}</strong></p>
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
                          <Clock className="text-sky-500" size={14} /> Pukul <strong>{item.start_time}</strong> s.d <strong>{item.end_time}</strong>
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

          {/* MENU PRESENSI LENGKAP DENGAN FILTER & PAGINATION */}
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
                    <p className="text-xs text-slate-500">Filter berdasarkan tanggal, bulan, atau tahun.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="px-3 py-2 border border-sky-200 rounded-xl bg-white" placeholder="Filter Tanggal" />
                    <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-3 py-2 border border-sky-200 rounded-xl bg-white font-bold text-sky-900">
                      <option value="">Semua Bulan</option>
                      <option value="01">Januari</option><option value="02">Februari</option><option value="03">Maret</option><option value="04">April</option>
                      <option value="05">Mei</option><option value="06">Juni</option><option value="07">Juli</option><option value="08">Agustus</option>
                      <option value="09">September</option><option value="10">Oktober</option><option value="11">November</option><option value="12">Desember</option>
                    </select>
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

              <div className="bg-white rounded-3xl border border-sky-100 p-8 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-sky-900 flex items-center gap-2"><KeyRound className="text-sky-500" size={20} /> Keamanan: Ubah Kata Sandi</h3>
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

      {/* FLOATING WHATSAPP */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {showWaMenu && (
          <div className="mb-3 w-64 bg-white/95 backdrop-blur-md border border-sky-100 rounded-3xl shadow-2xl p-4 space-y-3 transform transition-all duration-300">
            <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <span className="text-xs font-black text-sky-900">💬 Hubungi Dian Math Lab</span>
                <button onClick={() => setShowWaMenu(false)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">✕</button>
            </div>
            <div className="space-y-2">
                <a href="https://wa.me/6287730655553?text=Halo%20Founder%20Cantik%20Dian%20Math%20Lab" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-emerald-950">👩‍💼 Founder Cantik</p>
                    <p className="text-[10px] text-emerald-600">0877-3065-5553</p>
                  </div>
                  <span className="text-xs bg-emerald-500 text-white px-2.5 py-1 rounded-xl">Chat</span>
                </a>
                <a href="https://wa.me/62882005679302?text=Halo%20Admin%20Ganteng%20Dian%20Math%20Lab" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-sky-950">👨‍💻 Admin Ganteng</p>
                    <p className="text-[10px] text-sky-600">0882-0056-79302</p>
                  </div>
                  <span className="text-xs bg-sky-500 text-white px-2.5 py-1 rounded-xl">Chat</span>
                </a>
            </div>
          </div>
        )}
        <button onClick={() => setShowWaMenu(!showWaMenu)} className="relative group flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white rounded-full shadow-2xl shadow-emerald-500/50 transition-all duration-300 transform hover:scale-110 active:scale-95">
          <svg className="w-7 h-7 relative z-10 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.124-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </button>
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
