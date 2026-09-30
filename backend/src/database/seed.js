const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

async function seedDatabase() {
  console.log('[Seed] Checking database seeding...');

  // Purge any demo reports and attendance so no fake data remains
  console.log('[Seed] Purging demo attendance and reports...');
  await query('DELETE FROM daily_reports');
  await query('DELETE FROM attendance');

  // Purge any old demo interns if present
  const existingInterns = await query("SELECT id, username FROM users WHERE role = 'intern'");
  const validUsernames = ['ganesh', 'shravan', 'sakshi', 'chinmay', 'chiranjeev', 'anushka', 'neel', 'hena', 'harshali', 'harshad'];
  for (const internUser of existingInterns.rows) {
    if (!validUsernames.includes(internUser.username)) {
      await query("DELETE FROM users WHERE id = $1", [internUser.id]);
    }
  }

  console.log('[Seed] Seeding Admin and 10 Social Media Interns with clean data...');

  const defaultPassword = 'Password123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 1. Ensure Admin exists
  let adminId;
  const adminCheck = await query("SELECT id FROM users WHERE email = 'admin@example.com'");
  if (adminCheck.rows.length > 0) {
    adminId = adminCheck.rows[0].id;
  } else {
    const adminRes = await query(
      `INSERT INTO users (name, email, username, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['System Administrator', 'admin@example.com', 'admin', passwordHash, 'admin', 'active']
    );
    adminId = adminRes.rows[0].id;
  }

  // 2. The 10 Social Media Interns requested by User
  const socialMediaInterns = [
    {
      name: 'Ganesh',
      username: 'ganesh',
      email: 'ganesh@intern.tracker',
      department: 'SIHS',
      phone: '+91 98201 10001',
      profile_photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces',
    },
    {
      name: 'Shravan',
      username: 'shravan',
      email: 'shravan@intern.tracker',
      department: 'MBA/SIFT',
      phone: '+91 98201 10002',
      profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    },
    {
      name: 'Sakshi',
      username: 'sakshi',
      email: 'sakshi@intern.tracker',
      department: 'SCMIRT',
      phone: '+91 98201 10003',
      profile_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    },
    {
      name: 'Chinmay',
      username: 'chinmay',
      email: 'chinmay@intern.tracker',
      department: 'SGI/SLC',
      phone: '+91 98201 10004',
      profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    },
    {
      name: 'Chiranjeev',
      username: 'chiranjeev',
      email: 'chiranjeev@intern.tracker',
      department: 'SNS',
      phone: '+91 98201 10005',
      profile_photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces',
    },
    {
      name: 'Anushka',
      username: 'anushka',
      email: 'anushka@intern.tracker',
      department: 'SCHMTT',
      phone: '+91 98201 10006',
      profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    },
    {
      name: 'Neel Rathod',
      username: 'neel',
      email: 'neel@intern.tracker',
      department: 'SCPHR',
      phone: '+91 98201 10007',
      profile_photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=faces',
    },
    {
      name: 'Hena',
      username: 'hena',
      email: 'hena@intern.tracker',
      department: 'MCA/BCA',
      phone: '+91 98201 10008',
      profile_photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
    },
    {
      name: 'Harshali',
      username: 'harshali',
      email: 'harshali@intern.tracker',
      department: 'SJC/SPS',
      phone: '+91 98201 10009',
      profile_photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
    },
    {
      name: 'Harshad',
      username: 'harshad',
      email: 'harshad@intern.tracker',
      department: 'SCNPST/SIICS',
      phone: '+91 98201 10010',
      profile_photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces',
    },
  ];

  const createdInternIds = [];

  for (const intern of socialMediaInterns) {
    // Specifically set Harshad's password to '123321' as requested by user
    const internPassword = intern.username.toLowerCase() === 'harshad' ? '123321' : defaultPassword;
    const internPasswordHash = await bcrypt.hash(internPassword, 10);

    const userRes = await query(
      `INSERT INTO users (name, email, username, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name,
           username = EXCLUDED.username,
           password_hash = EXCLUDED.password_hash,
           role = 'intern',
           status = 'active'
       RETURNING id`,
      [intern.name, intern.email, intern.username, internPasswordHash, 'intern', 'active']
    );
    const userId = userRes.rows[0].id;
    createdInternIds.push(userId);

    await query(
      `INSERT INTO intern_profiles (user_id, department, joining_date, phone, profile_photo)
       VALUES ($1, $2, '2026-09-01', $3, $4)
       ON CONFLICT (user_id) DO UPDATE
       SET department = EXCLUDED.department,
           phone = EXCLUDED.phone,
           profile_photo = EXCLUDED.profile_photo,
           updated_at = CURRENT_TIMESTAMP`,
      [userId, intern.department, intern.phone, intern.profile_photo]
    );
  }

  // 3. Keep daily_reports and attendance clean for real user operations (0 fake demo entries)
  console.log('[Seed] Daily reports & attendance are completely clean for real intern reporting.');

  // 4. Seed Official Suryadatta Instagram Accounts
  await query('DELETE FROM instagram_posts');
  await query('DELETE FROM instagram_accounts');

  const instagramAccounts = [
    {
      account_name: 'Suryadatta Group of Institutes',
      username: 'suryadatta_group',
      profile_image: '/logos/suryadatta_crest.png',
      instagram_account_id: 'ig_suryadatta_group',
      followers_count: 4169,
      total_posts: 6248,
      last_post_id: 'post_suryadatta_group_1',
      last_post_date: '2026-09-30T16:00:00Z',
      last_post_url: 'https://www.instagram.com/suryadatta_group?stkn=MWJ2dGZ2ZHpxcXU1Yw==',
      last_post_thumbnail: null,
      last_post_caption: 'Admissions Open 2026-27 across all Suryadatta Institutes! Empowering youth through holistic education #Suryadatta #PuneEducation',
    },
    {
      account_name: 'Suryadatta SCMIRT',
      username: 'suryadatta_scmirt',
      profile_image: '/logos/suryadatta_crest.png',
      instagram_account_id: 'ig_suryadatta_scmirt',
      followers_count: 565,
      total_posts: 426,
      last_post_id: 'post_suryadatta_scmirt_1',
      last_post_date: '2026-09-29T17:30:00Z',
      last_post_url: 'https://www.instagram.com/suryadatta_scmirt?stkn=MXc2ZTh3Ym4zN3dwaw==',
      last_post_thumbnail: null,
      last_post_caption: 'SCMIRT Academic Symposium 2026: Inspiring research paper presentations and student seminars #SCMIRT #Management',
    },
    {
      account_name: 'SPS SGI (Suryadatta Public School)',
      username: 'sps.sgi',
      profile_image: '/logos/suryadatta_crest.png',
      instagram_account_id: 'ig_sps_sgi',
      followers_count: 191,
      total_posts: 205,
      last_post_id: 'post_sps_sgi_1',
      last_post_date: '2026-09-28T14:15:00Z',
      last_post_url: 'https://www.instagram.com/sps.sgi?stkn=NHFoOTRyY3UycnNj',
      last_post_thumbnail: null,
      last_post_caption: 'Celebrating academic and extracurricular achievements at SPS SGI Campus! Fostering leadership #SPS #SGI',
    },
    {
      account_name: 'Suryadatta Physiotherapy (SIHS)',
      username: 'suryadatta_physiotherapy',
      profile_image: '/logos/suryadatta_crest.png',
      instagram_account_id: 'ig_suryadatta_physiotherapy',
      followers_count: 482,
      total_posts: 406,
      last_post_id: 'post_suryadatta_physio_1',
      last_post_date: '2026-09-29T11:00:00Z',
      last_post_url: 'https://www.instagram.com/suryadatta_physiotherapy?stkn=eWh2bnNnYTRxcjYy',
      last_post_thumbnail: null,
      last_post_caption: 'SIHS Department of Physiotherapy hosting hands-on clinical rehabilitation workshop for students #Physiotherapy #SIHS',
    },
    {
      account_name: 'Suryadatta SCHMTT Pune',
      username: 'schmttpune',
      profile_image: '/logos/suryadatta_crest.png',
      instagram_account_id: 'ig_schmttpune',
      followers_count: 963,
      total_posts: 1007,
      last_post_id: 'post_schmttpune_1',
      last_post_date: '2026-09-30T09:30:00Z',
      last_post_url: 'https://www.instagram.com/schmttpune?stkn=MTFmOTYydDZib25pdA==',
      last_post_thumbnail: null,
      last_post_caption: 'Culinary artistry in action! Masterclass training by visiting Executive Chefs at SCHMTT Pune #Hospitality #SCHMTT',
    },
    {
      account_name: 'Suryadatta MCA',
      username: 'suryadatta_mca',
      profile_image: '/logos/suryadatta_crest.png',
      instagram_account_id: 'ig_suryadatta_mca',
      followers_count: 862,
      total_posts: 638,
      last_post_id: 'post_suryadatta_mca_1',
      last_post_date: '2026-09-29T15:45:00Z',
      last_post_url: 'https://www.instagram.com/suryadatta_mca?stkn=am9vOThidno1bGox',
      last_post_thumbnail: null,
      last_post_caption: 'Tech Hackathon 2026: MCA students building AI-powered web applications and cloud pipelines #MCA #TechInnovation',
    },
    {
      account_name: 'Suryadatta MBA (SIMMC)',
      username: 'suryadatta_mba',
      profile_image: '/logos/suryadatta_crest.png',
      instagram_account_id: 'ig_suryadatta_mba',
      followers_count: 631,
      total_posts: 477,
      last_post_id: 'post_suryadatta_mba_1',
      last_post_date: '2026-09-30T14:15:00Z',
      last_post_url: 'https://www.instagram.com/suryadatta_mba?stkn=YmJsbzg0dmxqbmRh',
      last_post_thumbnail: null,
      last_post_caption: 'Corporate Leadership Conclave: Global business CXOs interact with our MBA cohort #SIMMC #MBA #Leadership',
    },
    {
      account_name: 'Suryadatta BBA',
      username: 'suryadatta_bba',
      profile_image: '/logos/suryadatta_crest.png',
      instagram_account_id: 'ig_suryadatta_bba',
      followers_count: 90,
      total_posts: 137,
      last_post_id: 'post_suryadatta_bba_1',
      last_post_date: '2026-09-27T18:00:00Z',
      last_post_url: 'https://www.instagram.com/suryadatta_bba?stkn=MTU1OTIzdG40Ymp1Yg==',
      last_post_thumbnail: null,
      last_post_caption: 'Young Entrepreneurs Incubation Cell: BBA students pitching innovative startup models #BBA #FutureLeaders',
    },
    {
      account_name: 'Suryadatta SIICS / SCNPST',
      username: 'suryadatta_siics',
      profile_image: '/logos/suryadatta_crest.png',
      instagram_account_id: 'ig_suryadatta_siics',
      followers_count: 237,
      total_posts: 180,
      last_post_id: 'post_suryadatta_siics_1',
      last_post_date: '2026-09-28T16:20:00Z',
      last_post_url: 'https://www.instagram.com/suryadatta_siics?stkn=a283anEwcTVrNXVx',
      last_post_thumbnail: null,
      last_post_caption: 'National Cyber Security Awareness & Cloud Computing Seminar at SIICS #SIICS #CyberSecurity #SCNPST',
    },
    {
      account_name: 'Suryadatta SIVA / SIFT',
      username: 'suryadatta_sivasift',
      profile_image: '/logos/suryadatta_crest.png',
      instagram_account_id: 'ig_suryadatta_sivasift',
      followers_count: 1090,
      total_posts: 2092,
      last_post_id: 'post_suryadatta_sivasift_1',
      last_post_date: '2026-09-30T12:30:00Z',
      last_post_url: 'https://www.instagram.com/suryadatta_sivasift?stkn=MWd3N3ZtdWl0aGVydA==',
      last_post_thumbnail: null,
      last_post_caption: 'Fashion & Interior Design Graduation Showcase: Exceptional creativity by SIVA SIFT designers #SIVA #SIFT #FashionDesign',
    },
  ];

  const now = new Date('2026-09-30T18:15:00Z');

  for (const acc of instagramAccounts) {
    const accRes = await query(
      `INSERT INTO instagram_accounts (
        account_name, username, profile_image, instagram_account_id, followers_count,
        total_posts, last_post_id, last_post_date, last_post_url, last_post_thumbnail,
        last_synced_at, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [
        acc.account_name,
        acc.username,
        acc.profile_image,
        acc.instagram_account_id,
        acc.followers_count,
        acc.total_posts || 0,
        acc.last_post_id,
        acc.last_post_date,
        acc.last_post_url,
        acc.last_post_thumbnail,
        now,
        'active',
      ]
    );
    const accId = accRes.rows[0].id;
    await query(
      `INSERT INTO instagram_posts (
        instagram_account_id, instagram_post_id, post_url, thumbnail_url, caption, posted_at
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        accId,
        acc.last_post_id,
        acc.last_post_url,
        acc.last_post_thumbnail,
        acc.last_post_caption,
        acc.last_post_date,
      ]
    );
  }

  console.log(`[Seed] 10 Social Media Interns and ${instagramAccounts.length} Official Suryadatta Instagram Accounts successfully seeded.`);
}

module.exports = { seedDatabase };


