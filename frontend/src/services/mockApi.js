/**
 * In-browser mock service for standalone Netlify static preview
 * Allows instant login (Harshad: 123321, Admin: Password123!) when no backend server is connected
 */

const defaultInterns = [
  {
    id: 'u_1',
    name: 'Ganesh',
    username: 'ganesh',
    email: 'ganesh@intern.tracker',
    department: 'SIHS',
    phone: '+91 98201 10001',
    profile_photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces',
    role: 'intern',
    status: 'active',
    password: 'Password123!',
  },
  {
    id: 'u_2',
    name: 'Shravan',
    username: 'shravan',
    email: 'shravan@intern.tracker',
    department: 'MBA/SIFT',
    phone: '+91 98201 10002',
    profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    role: 'intern',
    status: 'active',
    password: 'Password123!',
  },
  {
    id: 'u_3',
    name: 'Sakshi',
    username: 'sakshi',
    email: 'sakshi@intern.tracker',
    department: 'SCMIRT',
    phone: '+91 98201 10003',
    profile_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    role: 'intern',
    status: 'active',
    password: 'Password123!',
  },
  {
    id: 'u_4',
    name: 'Chinmay',
    username: 'chinmay',
    email: 'chinmay@intern.tracker',
    department: 'SGI/SLC',
    phone: '+91 98201 10004',
    profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    role: 'intern',
    status: 'active',
    password: 'Password123!',
  },
  {
    id: 'u_5',
    name: 'Chiranjeev',
    username: 'chiranjeev',
    email: 'chiranjeev@intern.tracker',
    department: 'SNS',
    phone: '+91 98201 10005',
    profile_photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces',
    role: 'intern',
    status: 'active',
    password: 'Password123!',
  },
  {
    id: 'u_6',
    name: 'Anushka',
    username: 'anushka',
    email: 'anushka@intern.tracker',
    department: 'SCHMTT',
    phone: '+91 98201 10006',
    profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    role: 'intern',
    status: 'active',
    password: 'Password123!',
  },
  {
    id: 'u_7',
    name: 'Neel Rathod',
    username: 'neel',
    email: 'neel@intern.tracker',
    department: 'SCPHR',
    phone: '+91 98201 10007',
    profile_photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&crop=faces',
    role: 'intern',
    status: 'active',
    password: 'Password123!',
  },
  {
    id: 'u_8',
    name: 'Hena',
    username: 'hena',
    email: 'hena@intern.tracker',
    department: 'MCA/BCA',
    phone: '+91 98201 10008',
    profile_photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
    role: 'intern',
    status: 'active',
    password: 'Password123!',
  },
  {
    id: 'u_9',
    name: 'Harshali',
    username: 'harshali',
    email: 'harshali@intern.tracker',
    department: 'SJC/SPS',
    phone: '+91 98201 10009',
    profile_photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
    role: 'intern',
    status: 'active',
    password: 'Password123!',
  },
  {
    id: 'u_10',
    name: 'Harshad',
    username: 'harshad',
    email: 'harshad@intern.tracker',
    department: 'SCNPST/SIICS',
    phone: '+91 98201 10010',
    profile_photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces',
    role: 'intern',
    status: 'active',
    password: '123321', // Harshad specific password
  },
];

const adminUser = {
  id: 'admin_1',
  name: 'System Administrator',
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin',
  status: 'active',
  department: 'Administration',
  password: 'Password123!',
};

const defaultInstagramAccounts = [
  {
    id: 'ig_1',
    account_name: 'Suryadatta Group of Institutes',
    username: 'suryadatta_group',
    profile_image: '/logos/suryadatta_crest.png',
    followers_count: 4169,
    total_posts: 6248,
    last_post_date: '2026-09-30T16:00:00Z',
    last_post_url: 'https://www.instagram.com/suryadatta_group?stkn=MWJ2dGZ2ZHpxcXU1Yw==',
    last_post_thumbnail: null,
    last_post_caption: 'Admissions Open 2026-27 across all Suryadatta Institutes! Empowering youth through holistic education #Suryadatta',
    last_synced_at: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'ig_2',
    account_name: 'Suryadatta SCMIRT',
    username: 'suryadatta_scmirt',
    profile_image: '/logos/suryadatta_crest.png',
    followers_count: 565,
    total_posts: 426,
    last_post_date: '2026-09-29T17:30:00Z',
    last_post_url: 'https://www.instagram.com/suryadatta_scmirt?stkn=MXc2ZTh3Ym4zN3dwaw==',
    last_post_thumbnail: null,
    last_post_caption: 'SCMIRT Academic Symposium 2026: Inspiring research paper presentations #SCMIRT',
    last_synced_at: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'ig_3',
    account_name: 'SPS SGI (Suryadatta Public School)',
    username: 'sps.sgi',
    profile_image: '/logos/suryadatta_crest.png',
    followers_count: 191,
    total_posts: 205,
    last_post_date: '2026-09-28T14:15:00Z',
    last_post_url: 'https://www.instagram.com/sps.sgi?stkn=NHFoOTRyY3UycnNj',
    last_post_thumbnail: null,
    last_post_caption: 'Celebrating academic achievements at SPS SGI Campus #SPS #SGI',
    last_synced_at: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'ig_4',
    account_name: 'Suryadatta Physiotherapy (SIHS)',
    username: 'suryadatta_physiotherapy',
    profile_image: '/logos/suryadatta_crest.png',
    followers_count: 482,
    total_posts: 406,
    last_post_date: '2026-09-29T11:00:00Z',
    last_post_url: 'https://www.instagram.com/suryadatta_physiotherapy?stkn=eWh2bnNnYTRxcjYy',
    last_post_thumbnail: null,
    last_post_caption: 'SIHS Department of Physiotherapy hosting hands-on clinical workshop #Physiotherapy',
    last_synced_at: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'ig_5',
    account_name: 'Suryadatta SCHMTT Pune',
    username: 'schmttpune',
    profile_image: '/logos/suryadatta_crest.png',
    followers_count: 963,
    total_posts: 1007,
    last_post_date: '2026-09-30T09:30:00Z',
    last_post_url: 'https://www.instagram.com/schmttpune?stkn=MTFmOTYydDZib25pdA==',
    last_post_thumbnail: null,
    last_post_caption: 'Culinary artistry in action! Masterclass training at SCHMTT Pune #Hospitality',
    last_synced_at: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'ig_6',
    account_name: 'Suryadatta MCA',
    username: 'suryadatta_mca',
    profile_image: '/logos/suryadatta_crest.png',
    followers_count: 862,
    total_posts: 638,
    last_post_date: '2026-09-29T15:45:00Z',
    last_post_url: 'https://www.instagram.com/suryadatta_mca?stkn=am9vOThidno1bGox',
    last_post_thumbnail: null,
    last_post_caption: 'Tech Hackathon 2026: MCA students building AI web applications #MCA',
    last_synced_at: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'ig_7',
    account_name: 'Suryadatta MBA (SIMMC)',
    username: 'suryadatta_mba',
    profile_image: '/logos/suryadatta_crest.png',
    followers_count: 631,
    total_posts: 477,
    last_post_date: '2026-09-30T14:15:00Z',
    last_post_url: 'https://www.instagram.com/suryadatta_mba?stkn=YmJsbzg0dmxqbmRh',
    last_post_thumbnail: null,
    last_post_caption: 'Corporate Leadership Conclave: Global business CXOs interact with our MBA cohort #SIMMC',
    last_synced_at: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'ig_8',
    account_name: 'Suryadatta BBA',
    username: 'suryadatta_bba',
    profile_image: '/logos/suryadatta_crest.png',
    followers_count: 90,
    total_posts: 137,
    last_post_date: '2026-09-27T18:00:00Z',
    last_post_url: 'https://www.instagram.com/suryadatta_bba?stkn=MTU1OTIzdG40Ymp1Yg==',
    last_post_thumbnail: null,
    last_post_caption: 'Young Entrepreneurs Incubation Cell: BBA students pitching startup models #BBA',
    last_synced_at: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'ig_9',
    account_name: 'Suryadatta SIICS / SCNPST',
    username: 'suryadatta_siics',
    profile_image: '/logos/suryadatta_crest.png',
    followers_count: 237,
    total_posts: 180,
    last_post_date: '2026-09-28T16:20:00Z',
    last_post_url: 'https://www.instagram.com/suryadatta_siics?stkn=a283anEwcTVrNXVx',
    last_post_thumbnail: null,
    last_post_caption: 'National Cyber Security Awareness Seminar at SIICS #SIICS #SCNPST',
    last_synced_at: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'ig_10',
    account_name: 'Suryadatta SIVA / SIFT',
    username: 'suryadatta_sivasift',
    profile_image: '/logos/suryadatta_crest.png',
    followers_count: 1090,
    total_posts: 2092,
    last_post_date: '2026-09-30T12:30:00Z',
    last_post_url: 'https://www.instagram.com/suryadatta_sivasift?stkn=MWd3N3ZtdWl0aGVydA==',
    last_post_thumbnail: null,
    last_post_caption: 'Fashion & Interior Design Graduation Showcase by SIVA SIFT designers #SIVA #SIFT',
    last_synced_at: new Date().toISOString(),
    status: 'active',
  },
];

// In-memory runtime state
let internsStore = [...defaultInterns];
let instagramStore = [...defaultInstagramAccounts];
let reportsStore = [];
let attendanceStore = [];
let currentUser = null;

export const mockApi = {
  // Auth
  login: async (credentials) => {
    const ident = (credentials.identifier || '').trim().toLowerCase();
    const pass = credentials.password || '';

    let user = null;
    if (ident === 'admin' || ident === 'admin@example.com') {
      if (pass === 'Password123!') {
        user = { ...adminUser };
      }
    } else {
      const match = internsStore.find(
        (i) => i.username.toLowerCase() === ident || i.email.toLowerCase() === ident
      );
      if (match && match.password === pass) {
        user = { ...match };
      }
    }

    if (!user) {
      const err = new Error('Invalid username or password.');
      err.status = 401;
      throw err;
    }

    currentUser = user;
    const token = 'mock_jwt_' + user.id + '_' + Date.now();
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));

    return {
      success: true,
      message: 'Login successful (Demo Mode).',
      token,
      user,
    };
  },

  logout: async () => {
    currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return { success: true };
  },

  getMe: async () => {
    if (!currentUser) {
      const stored = localStorage.getItem('auth_user');
      if (stored) currentUser = JSON.parse(stored);
    }
    if (!currentUser) {
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }
    return { success: true, user: currentUser };
  },

  updateProfile: async (data) => {
    if (currentUser) {
      currentUser = { ...currentUser, ...data };
      localStorage.setItem('auth_user', JSON.stringify(currentUser));
    }
    return { success: true, user: currentUser };
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    if (!currentUser) throw new Error('Not logged in.');
    if (currentUser.password && currentUser.password !== currentPassword) {
      throw new Error('Current password is incorrect.');
    }
    currentUser.password = newPassword;
    return { success: true, message: 'Password changed successfully.' };
  },

  // Interns Management
  getInterns: async (params = {}) => {
    let list = [...internsStore];
    if (params.search) {
      const s = params.search.toLowerCase();
      list = list.filter(
        (i) => i.name.toLowerCase().includes(s) || i.email.toLowerCase().includes(s) || i.department.toLowerCase().includes(s)
      );
    }
    if (params.department) {
      list = list.filter((i) => i.department === params.department);
    }
    return { success: true, interns: list };
  },

  getInternById: async (id) => {
    const intern = internsStore.find((i) => i.id === id);
    if (!intern) throw new Error('Intern not found.');
    return { success: true, intern };
  },

  createIntern: async (data) => {
    const newIntern = {
      id: 'u_' + Date.now(),
      name: data.name,
      username: data.username || data.name.toLowerCase().replace(/\s+/g, '.'),
      email: data.email,
      department: data.department || 'Social Media',
      phone: data.phone || '',
      profile_photo: data.profilePhoto || '',
      role: 'intern',
      status: 'active',
      password: data.password || 'Password123!',
    };
    internsStore.push(newIntern);
    return { success: true, intern: newIntern };
  },

  updateIntern: async (id, data) => {
    const idx = internsStore.findIndex((i) => i.id === id);
    if (idx !== -1) {
      internsStore[idx] = {
        ...internsStore[idx],
        ...data,
        ...(data.password ? { password: data.password } : {}),
      };
      return { success: true, intern: internsStore[idx] };
    }
    throw new Error('Intern not found.');
  },

  deleteIntern: async (id) => {
    internsStore = internsStore.filter((i) => i.id !== id);
    return { success: true };
  },

  resetPassword: async (id, newPassword) => {
    const idx = internsStore.findIndex((i) => i.id === id);
    if (idx !== -1) {
      internsStore[idx].password = newPassword;
      return { success: true, message: `Password reset successfully for ${internsStore[idx].name}.` };
    }
    throw new Error('Intern not found.');
  },

  // Attendance
  getTodayAttendance: async (params = {}) => {
    const today = new Date().toISOString().split('T')[0];
    const targetInternId = params.internId || currentUser?.id;
    const record = attendanceStore.find(
      (a) => a.intern_id === targetInternId && a.attendance_date === today
    );
    return { success: true, attendance: record || null };
  },

  checkIn: async () => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    let record = attendanceStore.find(
      (a) => a.intern_id === currentUser.id && a.attendance_date === today
    );

    if (record) {
      throw new Error('Already checked in today.');
    }

    record = {
      id: 'att_' + Date.now(),
      intern_id: currentUser.id,
      intern_name: currentUser.name,
      attendance_date: today,
      in_time: nowTime,
      out_time: null,
      working_minutes: 0,
      status: 'present',
    };
    attendanceStore.unshift(record);

    return { success: true, message: 'Checked in successfully at ' + nowTime, attendance: record };
  },

  checkOut: async () => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const record = attendanceStore.find(
      (a) => a.intern_id === currentUser.id && a.attendance_date === today
    );

    if (!record) {
      throw new Error('Please check in before checking out.');
    }

    record.out_time = nowTime;
    record.working_minutes = 480; // Standard shift demo 8h

    return { success: true, message: 'Checked out successfully at ' + nowTime, attendance: record };
  },

  getAttendance: async (params = {}) => {
    let list = [...attendanceStore];
    if (params.internId) {
      list = list.filter((a) => a.intern_id === params.internId);
    }
    return { success: true, attendance: list };
  },

  updateAttendance: async (id, data) => {
    const idx = attendanceStore.findIndex((a) => a.id === id);
    if (idx !== -1) {
      attendanceStore[idx] = { ...attendanceStore[idx], ...data };
      return { success: true, attendance: attendanceStore[idx] };
    }
    throw new Error('Attendance not found.');
  },

  // Reports
  getReports: async (params = {}) => {
    let list = [...reportsStore];
    if (params.internId) {
      list = list.filter((r) => r.intern_id === params.internId);
    }
    return { success: true, reports: list };
  },

  getReportById: async (id) => {
    const report = reportsStore.find((r) => r.id === id);
    if (!report) throw new Error('Report not found.');
    return { success: true, report };
  },

  saveReport: async (data) => {
    const newReport = {
      id: 'rep_' + Date.now(),
      intern_id: currentUser.id,
      intern_name: currentUser.name,
      report_date: data.reportDate,
      in_time: data.inTime || '09:30 AM',
      out_time: data.outTime || '06:00 PM',
      working_minutes: data.workingMinutes || 510,
      work_completed: data.workCompleted || '',
      tasks_completed: data.tasksCompleted || '',
      pending_work: data.pendingWork || '',
      notes: data.notes || '',
      status: data.status || 'submitted',
      created_at: new Date().toISOString(),
    };
    reportsStore.unshift(newReport);
    return { success: true, report: newReport };
  },

  updateReport: async (id, data) => {
    const idx = reportsStore.findIndex((r) => r.id === id);
    if (idx !== -1) {
      reportsStore[idx] = { ...reportsStore[idx], ...data, updated_at: new Date().toISOString() };
      return { success: true, report: reportsStore[idx] };
    }
    throw new Error('Report not found.');
  },

  deleteReport: async (id) => {
    reportsStore = reportsStore.filter((r) => r.id !== id);
    return { success: true };
  },

  getCalendar: async (params = {}) => {
    const month = params.month || new Date().toISOString().substring(0, 7);
    const reports = reportsStore.filter((r) => r.report_date.startsWith(month));
    const calendarDays = {};
    reports.forEach((r) => {
      calendarDays[r.report_date] = {
        hasReport: true,
        status: r.status,
        reportId: r.id,
      };
    });
    return { success: true, calendarDays, month };
  },

  // Instagram
  getInstagramAccounts: async () => {
    return { success: true, accounts: instagramStore };
  },

  getInstagramAccountById: async (id) => {
    const acc = instagramStore.find((a) => a.id === id);
    return { success: true, account: acc };
  },

  syncInstagram: async () => {
    const now = new Date().toISOString();
    instagramStore = instagramStore.map((a) => ({
      ...a,
      last_synced_at: now,
    }));
    return { success: true, message: 'All 10 Instagram accounts synchronized.', accounts: instagramStore };
  },

  addInstagramAccount: async (data) => {
    const newAcc = {
      id: 'ig_' + Date.now(),
      profile_image: '/logos/suryadatta_crest.png',
      followers_count: 0,
      total_posts: 0,
      last_synced_at: new Date().toISOString(),
      status: 'active',
      ...data,
    };
    instagramStore.push(newAcc);
    return { success: true, account: newAcc };
  },

  updateInstagramAccount: async (id, data) => {
    const idx = instagramStore.findIndex((a) => a.id === id);
    if (idx !== -1) {
      instagramStore[idx] = { ...instagramStore[idx], ...data };
      return { success: true, account: instagramStore[idx] };
    }
    throw new Error('Account not found.');
  },

  deleteInstagramAccount: async (id) => {
    instagramStore = instagramStore.filter((a) => a.id !== id);
    return { success: true };
  },

  // Admin Dashboard
  getAdminStats: async () => {
    const today = new Date().toISOString().split('T')[0];
    const presentToday = attendanceStore.filter((a) => a.attendance_date === today).length;
    const reportsToday = reportsStore.filter((r) => r.report_date === today && r.status === 'submitted').length;

    return {
      success: true,
      stats: {
        totalInterns: internsStore.length,
        presentToday,
        absentToday: Math.max(0, internsStore.length - presentToday),
        reportsSubmittedToday: reportsToday,
        reportsPendingToday: Math.max(0, internsStore.length - reportsToday),
        totalWorkingHoursThisMonth: '0h 00m',
        instagramAccounts: instagramStore.length,
        instagramPostsThisMonth: 12,
      },
    };
  },

  getAdminAnalytics: async () => {
    return {
      success: true,
      attendanceTrend: [
        { date: '2026-09-24', presentCount: 0 },
        { date: '2026-09-25', presentCount: 0 },
        { date: '2026-09-28', presentCount: 0 },
        { date: '2026-09-29', presentCount: 0 },
        { date: '2026-09-30', presentCount: 0 },
      ],
      reportsChart: [
        { date: '2026-09-24', submitted: 0, draft: 0 },
        { date: '2026-09-25', submitted: 0, draft: 0 },
        { date: '2026-09-28', submitted: 0, draft: 0 },
        { date: '2026-09-29', submitted: 0, draft: 0 },
        { date: '2026-09-30', submitted: 0, draft: 0 },
      ],
      workingHoursByIntern: internsStore.map((i) => ({
        internName: i.name,
        hours: 0,
        department: i.department,
      })),
    };
  },

  getAuditLogs: async () => {
    return { success: true, logs: [] };
  },

  exportReports: async () => {
    const csvContent = 'Intern Name,Email,Date,In Time,Out Time,Hours,Status\n';
    return new Blob([csvContent], { type: 'text/csv' });
  },
};
