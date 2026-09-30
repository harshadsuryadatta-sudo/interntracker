/**
 * Time and date calculation utilities
 */

function formatCurrentTime(date = new Date()) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  return `${hoursStr}:${minutesStr} ${ampm}`;
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().toUpperCase();
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridian = match12[3];
    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // Handle 24-hour format: "18:12" or "18:12:00"
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return 0;
}

function calculateWorkingMinutes(inTime, outTime) {
  if (!inTime || !outTime) return 0;
  const inMins = parseTimeToMinutes(inTime);
  const outMins = parseTimeToMinutes(outTime);
  if (outMins < inMins) {
    // Overnight or invalid
    return Math.max(0, 1440 - inMins + outMins);
  }
  return outMins - inMins;
}

function formatMinutesToHours(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return '0h 00m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

function timeAgo(dateInput) {
  if (!dateInput) return 'Never';
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
}

module.exports = {
  formatCurrentTime,
  parseTimeToMinutes,
  calculateWorkingMinutes,
  formatMinutesToHours,
  timeAgo,
};
