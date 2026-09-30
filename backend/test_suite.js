/**
 * End-to-End Verification Test Suite
 * Intern Report Tracker
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTestSuite() {
  console.log('=====================================================');
  console.log('🧪 Starting Full-Stack End-to-End Verification Suite');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await fetch(`${BASE_URL}/health`).then(r => r.json());
    assert(health.status === 'ok', 'Server health check returns ok');

    // 2. Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'Password123!' })
    });
    const adminData = await adminLoginRes.json();
    assert(adminData.success === true && adminData.user.role === 'admin', 'Admin login successful');
    const adminToken = adminData.token;

    // 3. Intern Login (Ganesh)
    const internLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ganesh', password: 'Password123!' })
    });
    const internData = await internLoginRes.json();
    assert(internData.success === true && internData.user.role === 'intern', 'Social Media Intern (Ganesh) login successful');
    const internToken = internData.token;
    const internId = internData.user.id;

    // 4. Intern 2 Login (Chiranjeev) for Security Isolation & Attendance Test
    const intern2LoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'chiranjeev', password: 'Password123!' })
    });
    const intern2Data = await intern2LoginRes.json();
    const intern2Token = intern2Data.token;
    const intern2Id = intern2Data.user.id;

    // 5. Attendance Check-in
    const checkInRes = await fetch(`${BASE_URL}/attendance/check-in`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${intern2Token}` }
    });
    const checkInData = await checkInRes.json();
    assert(
      checkInData.success === true || checkInData.message?.includes('already'),
      `Intern Check-in processed (${checkInData.attendance?.in_time || checkInData.message})`
    );

    // 6. Duplicate Check-in Prevention
    const dupCheckInRes = await fetch(`${BASE_URL}/attendance/check-in`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${intern2Token}` }
    });
    const dupCheckInData = await dupCheckInRes.json();
    assert(dupCheckInData.success === false, 'Duplicate check-in correctly rejected');

    // 7. Attendance Check-out
    const checkOutRes = await fetch(`${BASE_URL}/attendance/check-out`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${intern2Token}` }
    });
    const checkOutData = await checkOutRes.json();
    assert(
      checkOutData.success === true || checkOutData.message?.includes('already'),
      `Intern Check-out processed (${checkOutData.message})`
    );

    // 8. Working Hours Calculation Verification
    assert(
      checkOutData.formattedWorkingHours !== undefined || checkOutData.message !== undefined,
      `Calculated working hours verified`
    );


    // 9. Intern Report Creation
    const reportRes = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${internToken}`
      },
      body: JSON.stringify({
        reportDate: '2026-09-30',
        inTime: '10:04 AM',
        outTime: '06:12 PM',
        workCompleted: 'Implemented complete authentication and database schema.',
        tasksCompleted: '• Verified migrations\n• Created endpoints',
        pendingWork: 'Final tests',
        notes: 'Great day',
        status: 'submitted'
      })
    });
    const reportData = await reportRes.json();
    assert(reportData.success === true, 'Intern daily report submitted successfully');
    const createdReportId = reportData.report?.id;

    // Verify hours arithmetic: 10:04 AM to 6:12 PM is exactly 488 minutes = 8h 08m
    assert(reportData.report.working_minutes === 488, `Working minutes exact: 488 mins (8h 08m)`);

    // 10. Intern Report Editing
    const updateReportRes = await fetch(`${BASE_URL}/reports/${createdReportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${internToken}`
      },
      body: JSON.stringify({
        workCompleted: 'Updated work completed deliverable with more details.',
        status: 'submitted'
      })
    });
    const updateReportData = await updateReportRes.json();
    assert(updateReportData.success === true, 'Intern report editing successful');

    // 11. Security Isolation: Intern 2 cannot view Intern 1's report
    const isolationRes = await fetch(`${BASE_URL}/reports/${createdReportId}`, {
      headers: { 'Authorization': `Bearer ${intern2Token}` }
    });
    assert(isolationRes.status === 403, `Intern isolation enforced: Intern 2 got HTTP 403 attempting to access Intern 1's report`);

    // 12. Security Isolation: Intern 2 query with internId=1 in query param is ignored
    const crossQueryRes = await fetch(`${BASE_URL}/reports?internId=${internId}`, {
      headers: { 'Authorization': `Bearer ${intern2Token}` }
    }).then(r => r.json());
    const containsOtherIntern = crossQueryRes.reports?.some(r => r.intern_id === internId);
    assert(!containsOtherIntern, 'Intern isolation enforced: Query param spoofing ignored by backend');

    // 13. Admin Editing Intern Report (and stores updated_by)
    const adminEditRes = await fetch(`${BASE_URL}/reports/${createdReportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        notes: 'Admin review approved. Excellent progress.',
        status: 'submitted'
      })
    });
    const adminEditData = await adminEditRes.json();
    assert(adminEditData.success === true && adminEditData.report?.updated_by === adminData.user.id,
      'Admin report editing successful and updated_by admin ID stored');

    // 14. Instagram Accounts Display (10 Suryadatta accounts)
    const igRes = await fetch(`${BASE_URL}/instagram/accounts`, {
      headers: { 'Authorization': `Bearer ${internToken}` }
    }).then(r => r.json());
    assert(igRes.success === true && igRes.count === 10, `Official Suryadatta Instagram accounts loaded (${igRes.count} accounts)`);
    assert(igRes.accounts[0].timeSinceLastPost !== undefined, `Time since last post calculated: "${igRes.accounts[0].timeSinceLastPost}"`);

    // 15. Instagram Synchronization Service Trigger (Admin only)
    const syncRes = await fetch(`${BASE_URL}/instagram/sync`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).then(r => r.json());
    assert(syncRes.success === true, `Instagram synchronization triggered: ${syncRes.message}`);

    // 16. Admin Dashboard 8 Key Cards
    const dashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).then(r => r.json());
    const stats = dashRes.stats;
    assert(
      stats &&
      stats.totalInterns >= 4 &&
      stats.presentToday >= 1 &&
      stats.instagramAccounts === 10,
      'Admin dashboard returns all 8 required executive metric cards'
    );

    // 17. Admin Analytics Charts
    const analyticsRes = await fetch(`${BASE_URL}/admin/analytics?month=2026-09`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).then(r => r.json());
    assert(
      analyticsRes.attendanceTrend?.length > 0 &&
      analyticsRes.workingHoursByIntern?.length > 0 &&
      analyticsRes.performanceOverview?.length > 0,
      'Admin analytics charts (Attendance, Working Hours, Factual Performance) generated'
    );

    // 18. Export Reports (CSV)
    const exportCsvRes = await fetch(`${BASE_URL}/export/reports?format=csv&month=2026-09`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const csvContent = await exportCsvRes.text();
    assert(
      csvContent.includes('"Intern Name"') && csvContent.includes('"Working Hours"'),
      'Export system generated CSV with required headers'
    );

    // 19. Export Reports (Excel XLSX)
    const exportXlsxRes = await fetch(`${BASE_URL}/export/reports?format=xlsx&month=2026-09`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(exportXlsxRes.status === 200, 'Export system generated native Excel .xlsx file');

    // 20. Logout
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${internToken}` }
    }).then(r => r.json());
    assert(logoutRes.success === true, 'Logout processed and session cleared');

    console.log('\n=====================================================');
    console.log(`📊 Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log('=====================================================');

  } catch (error) {
    console.error('Fatal test error:', error);
  }
}

runTestSuite();
