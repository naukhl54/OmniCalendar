/**
 * OmniCalendar - Kalender Meja Kartun Estetik (Bahasa Indonesia)
 * Logika Kalender Meja Duduk & Papan Urutan Prioritas Shortcut [P]
 */

// --- Kategori Estetik Netral ---
const DEFAULT_CATEGORIES = [
  { id: 'work', name: 'Pekerjaan & Proyek', color: '#6b8ea4' },
  { id: 'personal', name: 'Pribadi & Kehidupan', color: '#7fa988' },
  { id: 'health', name: 'Olahraga & Kesehatan', color: '#cf808b' },
  { id: 'study', name: 'Belajar & Studi', color: '#d69f64' },
  { id: 'urgent', name: 'Penting & Mendesak', color: '#c95a5a' },
  { id: 'family', name: 'Keluarga & Sosial', color: '#9885a8' }
];

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Ags", "Sep", "Okt", "Nov", "Des"
];

const DAY_NAMES = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
];

const DAY_NAMES_SHORT = [
  "Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"
];

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Contoh Jadwal Demo
function generateDemoEvents() {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  return [
    {
      id: 'demo-1',
      title: 'Perencanaan Desain Maskot Kartun 🚀',
      startDate: formatDateISO(new Date(y, m, d)),
      startTime: '09:30',
      endDate: formatDateISO(new Date(y, m, d)),
      endTime: '11:00',
      allDay: false,
      category: 'work',
      priority: 'high',
      recurrence: 'weekly',
      reminder: '15',
      description: 'Review sketsa ilustrasi karakter dan milestone sprint baru.'
    },
    {
      id: 'demo-2',
      title: 'Lari Pagi Keliling Taman 🏃‍♂️',
      startDate: formatDateISO(new Date(y, m, d)),
      startTime: '06:30',
      endDate: formatDateISO(new Date(y, m, d)),
      endTime: '07:30',
      allDay: false,
      category: 'health',
      priority: 'medium',
      recurrence: 'daily',
      reminder: '5',
      description: 'Lari santai 3 km dan peregangan tubuh.'
    },
    {
      id: 'demo-3',
      title: 'Makan Siang & Kopi Santai ☕',
      startDate: formatDateISO(new Date(y, m, d + 1)),
      startTime: '12:30',
      endDate: formatDateISO(new Date(y, m, d + 1)),
      endTime: '14:00',
      allDay: false,
      category: 'personal',
      priority: 'low',
      recurrence: 'none',
      reminder: '30',
      description: 'Bertemu di kafe dekat taman kota.'
    },
    {
      id: 'demo-4',
      title: 'Deadline Rilis Skema Database ⚡',
      startDate: formatDateISO(new Date(y, m, d + 2)),
      startTime: '15:00',
      endDate: formatDateISO(new Date(y, m, d + 2)),
      endTime: '16:30',
      allDay: false,
      category: 'urgent',
      priority: 'high',
      recurrence: 'none',
      reminder: '15',
      description: 'Finalisasi migrasi tabel dan verifikasi indeks database.'
    },
    {
      id: 'demo-5',
      title: 'Belajar Teori Warna & Ilustrasi 🎨',
      startDate: formatDateISO(new Date(y, m, d - 1)),
      startTime: '20:00',
      endDate: formatDateISO(new Date(y, m, d - 1)),
      endTime: '21:30',
      allDay: false,
      category: 'study',
      priority: 'medium',
      recurrence: 'weekly',
      reminder: '0',
      description: 'Mempelajari harmoni palet warna netral dan pencahayaan kartun.'
    },
    {
      id: 'demo-6',
      title: 'Makan Malam Ulang Tahun Keluarga 🎂',
      startDate: formatDateISO(new Date(y, m, d + 3)),
      startTime: '19:00',
      endDate: formatDateISO(new Date(y, m, d + 3)),
      endTime: '21:30',
      allDay: true,
      category: 'family',
      priority: 'high',
      recurrence: 'yearly',
      reminder: '1440',
      description: 'Makan malam perayaan ulang tahun di restoran keluarga.'
    }
  ];
}

// --- State Aplikasi ---
const state = {
  currentDate: new Date(),
  currentView: 'month', // 'month' | 'week' | 'day'
  events: [],
  categories: DEFAULT_CATEGORIES,
  activeCategories: new Set(DEFAULT_CATEGORIES.map(c => c.id)),
  searchQuery: '',
  firedReminders: new Set(),
  editingEventId: null
};

// --- LocalStorage ---
function loadData() {
  try {
    const saved = localStorage.getItem('omni_desk_calendar_events_v2');
    if (saved) {
      state.events = JSON.parse(saved);
    } else {
      state.events = generateDemoEvents();
      saveData();
    }
  } catch (e) {
    console.error('Gagal memuat penyimpanan, memakai demo', e);
    state.events = generateDemoEvents();
  }
}

function saveData() {
  try {
    localStorage.setItem('omni_desk_calendar_events_v2', JSON.stringify(state.events));
  } catch (e) {
    console.error('Gagal menyimpan ke localStorage', e);
  }
}

// --- Audio Chime ---
function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.12);
    osc.frequency.setValueAtTime(783.99, now + 0.24);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.65);
  } catch (err) {
    console.warn('Suara tidak dapat berbunyi', err);
  }
}

// --- Toast Popup ---
function showToast(title, message, isAlert = false) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${isAlert ? 'toast-alert' : 'toast-success'}`;
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 6000);
}

// --- Recurrence & Event Calculation ---
function getEventsForDateRange(rangeStart, rangeEnd) {
  const matchingInstances = [];
  const rangeStartStr = formatDateISO(rangeStart);
  const rangeEndStr = formatDateISO(rangeEnd);

  state.events.forEach(event => {
    if (!state.activeCategories.has(event.category)) return;

    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const match = (event.title || '').toLowerCase().includes(q) ||
                    (event.description || '').toLowerCase().includes(q) ||
                    (event.category || '').toLowerCase().includes(q);
      if (!match) return;
    }

    const eventStartDate = new Date(event.startDate + 'T00:00:00');
    const recurrence = event.recurrence || 'none';

    if (recurrence === 'none') {
      if (event.startDate <= rangeEndStr && event.endDate >= rangeStartStr) {
        matchingInstances.push({
          ...event,
          instanceDate: event.startDate,
          originalEvent: event
        });
      }
    } else {
      let cur = new Date(rangeStart);
      while (cur <= rangeEnd) {
        const curStr = formatDateISO(cur);

        if (cur >= eventStartDate) {
          let matches = false;

          if (recurrence === 'daily') {
            matches = true;
          } else if (recurrence === 'weekly') {
            matches = cur.getDay() === eventStartDate.getDay();
          } else if (recurrence === 'monthly') {
            matches = cur.getDate() === eventStartDate.getDate();
          } else if (recurrence === 'yearly') {
            matches = cur.getMonth() === eventStartDate.getMonth() && cur.getDate() === eventStartDate.getDate();
          }

          if (matches) {
            matchingInstances.push({
              ...event,
              instanceDate: curStr,
              originalEvent: event
            });
          }
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
  });

  matchingInstances.sort((a, b) => {
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    return (a.startTime || '').localeCompare(b.startTime || '');
  });

  return matchingInstances;
}

// --- Reminders Engine ---
function checkReminders() {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todaysEvents = getEventsForDateRange(now, now);

  todaysEvents.forEach(inst => {
    if (!inst.reminder || inst.reminder === 'none' || inst.allDay) return;

    const [evHour, evMin] = (inst.startTime || '09:00').split(':').map(Number);
    const eventMinutes = evHour * 60 + evMin;
    const reminderOffsetMinutes = parseInt(inst.reminder, 10);
    const targetTriggerMinutes = eventMinutes - reminderOffsetMinutes;

    const fireKey = `${inst.id}_${inst.instanceDate}_${inst.reminder}`;
    if (state.firedReminders.has(fireKey)) return;

    if (nowMinutes >= targetTriggerMinutes && nowMinutes <= targetTriggerMinutes + 2) {
      state.firedReminders.add(fireKey);
      triggerReminderAlert(inst);
    }
  });

  updateUpcomingRemindersFeed();
}

function triggerReminderAlert(event) {
  playNotificationChime();
  const priorityIcon = event.priority === 'high' ? '🚨' : event.priority === 'medium' ? '⏰' : '📌';
  const reminderText = event.reminder === '0' ? 'dimulai sekarang!' : `dimulai dalam ${event.reminder} menit!`;

  showToast(
    `${priorityIcon} Pengingat: ${event.title}`,
    `Pukul ${event.startTime || ''} hari ini (${reminderText})`,
    true
  );

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`Pengingat: ${event.title}`, {
      body: `Dimulai pukul ${event.startTime} hari ini.`,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23d4a373"><rect width="24" height="24" rx="4"/></svg>'
    });
  }
}

function updateUpcomingRemindersFeed() {
  const feed = document.getElementById('reminder-feed');
  if (!feed) return;
  const now = new Date();
  const nextThreeDays = new Date(now);
  nextThreeDays.setDate(nextThreeDays.getDate() + 3);

  const upcoming = getEventsForDateRange(now, nextThreeDays)
    .filter(e => e.reminder && e.reminder !== 'none')
    .slice(0, 3);

  if (upcoming.length === 0) {
    feed.innerHTML = `<div class="empty-feed">Belum ada alarm dekat ✨</div>`;
    return;
  }

  feed.innerHTML = upcoming.map(e => {
    const cat = state.categories.find(c => c.id === e.category) || state.categories[0];
    const pIcon = e.priority === 'high' ? '🔴' : e.priority === 'medium' ? '🟡' : '🟢';
    return `
      <div class="reminder-item" style="border-left: 4px solid ${cat.color}">
        <div style="font-weight:700; color:var(--ink);">${escapeHtml(e.title)}</div>
        <div style="font-size:0.7rem; color:var(--ink-muted); margin-top:2px;">
          ${pIcon} ${e.instanceDate} • ${e.allDay ? 'Sepanjang Hari' : e.startTime}
        </div>
      </div>
    `;
  }).join('');
}

// ========================================================
// PAPAN URUTAN PRIORITAS SHORTCUT [P]
// ========================================================
function togglePriorityBoard(forceOpen = null) {
  const backdrop = document.getElementById('priority-board-backdrop');
  if (!backdrop) return;
  const isOpen = backdrop.classList.contains('active');
  const shouldOpen = forceOpen !== null ? forceOpen : !isOpen;

  if (shouldOpen) {
    renderPriorityBoard();
    backdrop.classList.add('active');
  } else {
    backdrop.classList.remove('active');
  }
}

function renderPriorityBoard() {
  const listHigh = document.getElementById('list-high');
  const listMedium = document.getElementById('list-medium');
  const listLow = document.getElementById('list-low');

  const countHigh = document.getElementById('count-high');
  const countMedium = document.getElementById('count-medium');
  const countLow = document.getElementById('count-low');

  if (!listHigh || !listMedium || !listLow) return;

  listHigh.innerHTML = '';
  listMedium.innerHTML = '';
  listLow.innerHTML = '';

  const allEvents = [...state.events].sort((a, b) => {
    const d1 = a.startDate + (a.startTime || '00:00');
    const d2 = b.startDate + (b.startTime || '00:00');
    return d1.localeCompare(d2);
  });

  const highEvents = allEvents.filter(e => e.priority === 'high');
  const mediumEvents = allEvents.filter(e => e.priority === 'medium');
  const lowEvents = allEvents.filter(e => e.priority === 'low' || !e.priority);

  if (countHigh) countHigh.textContent = highEvents.length;
  if (countMedium) countMedium.textContent = mediumEvents.length;
  if (countLow) countLow.textContent = lowEvents.length;

  const renderGroup = (items, container, emptyMsg) => {
    if (items.length === 0) {
      container.innerHTML = `<div class="empty-priority-list">${emptyMsg}</div>`;
      return;
    }

    items.forEach(ev => {
      const cat = state.categories.find(c => c.id === ev.category) || state.categories[0];
      const itemEl = document.createElement('div');
      itemEl.className = 'priority-event-item';
      itemEl.innerHTML = `
        <div class="priority-event-info">
          <span style="font-weight:700; font-size:0.88rem; color:var(--ink);">${escapeHtml(ev.title)}</span>
          <div style="font-size:0.75rem; color:var(--ink-muted); margin-top:2px;">
            <span>📅 ${ev.startDate}</span> •
            <span>⏰ ${ev.allDay ? 'Sepanjang Hari' : (ev.startTime || '--:--')}</span> •
            <span style="font-weight:700; color:${cat.color};">${escapeHtml(cat.name)}</span>
          </div>
        </div>
        <div style="font-size:0.85rem; font-weight:700; color:var(--ink-muted);">✎ Ubah</div>
      `;

      itemEl.addEventListener('click', () => {
        togglePriorityBoard(false);
        openEditEventModal(ev.id);
      });

      container.appendChild(itemEl);
    });
  };

  renderGroup(highEvents, listHigh, 'Tidak ada tugas prioritas tinggi. Santai!');
  renderGroup(mediumEvents, listMedium, 'Tidak ada tugas prioritas sedang.');
  renderGroup(lowEvents, listLow, 'Tidak ada tugas prioritas rendah.');
}

// --- Kalender Utama ---
function updateHeaderTitle() {
  const titleEl = document.getElementById('current-period-title');
  if (!titleEl) return;
  const d = state.currentDate;

  if (state.currentView === 'month') {
    titleEl.textContent = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  } else if (state.currentView === 'week') {
    const weekStart = getStartOfWeek(new Date(d));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      titleEl.textContent = `${weekStart.getDate()} - ${weekEnd.getDate()} ${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
    } else {
      titleEl.textContent = `${weekStart.getDate()} ${MONTH_NAMES_SHORT[weekStart.getMonth()]} - ${weekEnd.getDate()} ${MONTH_NAMES_SHORT[weekEnd.getMonth()]} ${weekStart.getFullYear()}`;
    }
  } else if (state.currentView === 'day') {
    titleEl.textContent = `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }
}

// Tampilan Bulan (Month Grid)
function renderMonthView() {
  const grid = document.getElementById('month-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const year = state.currentDate.getFullYear();
  const month = state.currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const gridStart = new Date(firstDayOfMonth);
  gridStart.setDate(firstDayOfMonth.getDate() - startDay);

  const totalCellsNeeded = (startDay + totalDays) > 35 ? 42 : 35;
  const gridEnd = new Date(gridStart);
  gridEnd.setDate(gridStart.getDate() + totalCellsNeeded - 1);

  const instances = getEventsForDateRange(gridStart, gridEnd);

  const eventsByDate = {};
  instances.forEach(inst => {
    if (!eventsByDate[inst.instanceDate]) eventsByDate[inst.instanceDate] = [];
    eventsByDate[inst.instanceDate].push(inst);
  });

  const todayStr = formatDateISO(new Date());

  let cellDate = new Date(gridStart);
  for (let i = 0; i < totalCellsNeeded; i++) {
    const dateStr = formatDateISO(cellDate);
    const isCurrentMonth = cellDate.getMonth() === month;
    const isToday = dateStr === todayStr;

    const cell = document.createElement('div');
    cell.className = `month-day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;
    cell.dataset.date = dateStr;

    const cellTop = document.createElement('div');
    cellTop.className = 'day-cell-top';
    cellTop.innerHTML = `<span class="day-number">${cellDate.getDate()}</span>`;
    cell.appendChild(cellTop);

    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'day-events-container';

    const dayEvents = eventsByDate[dateStr] || [];
    const maxVisible = 3;

    dayEvents.slice(0, maxVisible).forEach(event => {
      const chip = createEventChip(event);
      eventsContainer.appendChild(chip);
    });

    if (dayEvents.length > maxVisible) {
      const moreLink = document.createElement('div');
      moreLink.className = 'more-events-link';
      moreLink.textContent = `+${dayEvents.length - maxVisible} lagi`;
      moreLink.addEventListener('click', (e) => {
        e.stopPropagation();
        state.currentDate = new Date(dateStr + 'T00:00:00');
        switchView('day');
      });
      eventsContainer.appendChild(moreLink);
    }

    cell.appendChild(eventsContainer);

    cell.addEventListener('click', () => {
      openCreateEventModal(dateStr);
    });

    grid.appendChild(cell);
    cellDate.setDate(cellDate.getDate() + 1);
  }
}

function createEventChip(event) {
  const chip = document.createElement('div');
  chip.className = 'event-chip';
  const cat = state.categories.find(c => c.id === event.category) || state.categories[0];
  chip.style.backgroundColor = cat.color + '40'; // Pastel washi tint
  chip.style.borderLeft = `4px solid ${cat.color}`;

  const timeLabel = event.allDay ? 'Semua' : (event.startTime || '');
  const priorityIcon = event.priority === 'high' ? '🔥' : (event.priority === 'low' ? '•' : '');

  chip.innerHTML = `
    ${priorityIcon ? `<span>${priorityIcon}</span>` : ''}
    <span class="event-chip-time">${timeLabel}</span>
    <span class="event-chip-title">${escapeHtml(event.title)}</span>
  `;

  chip.addEventListener('click', (e) => {
    e.stopPropagation();
    openEditEventModal(event.id);
  });

  return chip;
}

// Tampilan Minggu
function renderWeekView() {
  const headerRow = document.getElementById('week-header-row');
  const columnsContainer = document.getElementById('week-days-columns');
  const sidebar = document.getElementById('time-sidebar');

  if (!headerRow || !columnsContainer || !sidebar) return;

  const existingCols = headerRow.querySelectorAll('.week-day-col-header');
  existingCols.forEach(c => c.remove());
  columnsContainer.innerHTML = '';
  sidebar.innerHTML = '';

  for (let h = 0; h < 24; h++) {
    const slot = document.createElement('div');
    slot.className = 'time-slot-label';
    slot.textContent = `${String(h).padStart(2, '0')}:00`;
    sidebar.appendChild(slot);
  }

  const weekStart = getStartOfWeek(new Date(state.currentDate));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const todayStr = formatDateISO(new Date());
  const instances = getEventsForDateRange(weekStart, weekEnd);

  for (let d = 0; d < 7; d++) {
    const colDate = new Date(weekStart);
    colDate.setDate(colDate.getDate() + d);
    const dateStr = formatDateISO(colDate);
    const isToday = dateStr === todayStr;

    const headerCol = document.createElement('div');
    headerCol.className = `week-day-col-header ${isToday ? 'today' : ''}`;
    headerCol.innerHTML = `
      <div class="week-day-name">${DAY_NAMES_SHORT[colDate.getDay()]}</div>
      <div class="week-day-num">${colDate.getDate()}</div>
    `;
    headerRow.appendChild(headerCol);

    const dayCol = document.createElement('div');
    dayCol.className = 'week-day-column';
    dayCol.dataset.date = dateStr;

    const dayEvents = instances.filter(inst => inst.instanceDate === dateStr);

    dayEvents.forEach(event => {
      const block = createTimedEventBlock(event);
      dayCol.appendChild(block);
    });

    dayCol.addEventListener('click', (e) => {
      if (e.target !== dayCol) return;
      const rect = dayCol.getBoundingClientRect();
      const clickY = e.clientY - rect.top + dayCol.parentElement.scrollTop;
      const clickedHour = Math.floor(clickY / 52);
      const timeStr = `${String(Math.min(23, Math.max(0, clickedHour))).padStart(2, '0')}:00`;
      openCreateEventModal(dateStr, timeStr);
    });

    columnsContainer.appendChild(dayCol);
  }
}

// Tampilan Hari
function renderDayView() {
  const header = document.getElementById('day-view-header');
  const dayCol = document.getElementById('day-single-column');
  const sidebar = document.getElementById('day-time-sidebar');

  if (!header || !dayCol || !sidebar) return;

  sidebar.innerHTML = '';
  dayCol.innerHTML = '';

  for (let h = 0; h < 24; h++) {
    const slot = document.createElement('div');
    slot.className = 'time-slot-label';
    slot.textContent = `${String(h).padStart(2, '0')}:00`;
    sidebar.appendChild(slot);
  }

  const d = state.currentDate;
  const dateStr = formatDateISO(d);
  const dayEvents = getEventsForDateRange(d, d);

  header.innerHTML = `
    <h2 style="font-size:1.35rem; font-family:'Fredoka',sans-serif;">${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}</h2>
    <span style="font-size:0.8rem; font-weight:700; background:#ffffff; border:1.5px solid var(--ink); padding:2px 8px; border-radius:99px;">🎈 ${dayEvents.length} acara</span>
  `;

  dayEvents.forEach(event => {
    const block = createTimedEventBlock(event, true);
    dayCol.appendChild(block);
  });

  dayCol.addEventListener('click', (e) => {
    if (e.target !== dayCol) return;
    const rect = dayCol.getBoundingClientRect();
    const clickY = e.clientY - rect.top + dayCol.parentElement.scrollTop;
    const clickedHour = Math.floor(clickY / 52);
    const timeStr = `${String(Math.min(23, Math.max(0, clickedHour))).padStart(2, '0')}:00`;
    openCreateEventModal(dateStr, timeStr);
  });
}

function createTimedEventBlock(event, isDayView = false) {
  const block = document.createElement('div');
  block.className = 'timed-event-block';
  const cat = state.categories.find(c => c.id === event.category) || state.categories[0];
  block.style.backgroundColor = cat.color + '50';
  block.style.borderLeft = `5px solid ${cat.color}`;

  let startMinutes = 9 * 60;
  let durationMinutes = 60;

  if (event.allDay) {
    startMinutes = 0;
    durationMinutes = 120;
    block.style.opacity = '0.9';
  } else if (event.startTime) {
    const [h, m] = event.startTime.split(':').map(Number);
    startMinutes = h * 60 + m;

    if (event.endTime) {
      const [eh, em] = event.endTime.split(':').map(Number);
      const endTotal = eh * 60 + em;
      durationMinutes = Math.max(30, endTotal - startMinutes);
    }
  }

  const topPx = (startMinutes / 60) * 52;
  const heightPx = Math.max(28, (durationMinutes / 60) * 52 - 2);

  block.style.top = `${topPx}px`;
  block.style.height = `${heightPx}px`;

  const priorityTag = event.priority === 'high' ? ' [TINGGI]' : '';
  const recurrenceTag = event.recurrence && event.recurrence !== 'none' ? ' ↻' : '';

  block.innerHTML = `
    <div style="font-weight:700;">${escapeHtml(event.title)}${priorityTag}${recurrenceTag}</div>
    <div style="font-size:0.7rem; opacity:0.9;">${event.allDay ? 'Sepanjang hari' : `${event.startTime} - ${event.endTime || ''}`}</div>
    ${isDayView && event.description ? `<div style="font-size:0.75rem; margin-top:4px;">${escapeHtml(event.description)}</div>` : ''}
  `;

  block.addEventListener('click', (e) => {
    e.stopPropagation();
    openEditEventModal(event.id);
  });

  return block;
}

// Filter Kategori di Memo Pad
function renderCategoryFilters() {
  const container = document.getElementById('category-filter-list');
  if (!container) return;
  container.innerHTML = '';

  state.categories.forEach(cat => {
    const count = state.events.filter(e => e.category === cat.id).length;
    const isActive = state.activeCategories.has(cat.id);

    const item = document.createElement('div');
    item.className = `category-filter-item ${!isActive ? 'inactive' : ''}`;
    item.innerHTML = `
      <div class="cat-label-wrap">
        <span class="cat-dot" style="background-color: ${cat.color}"></span>
        <span>${escapeHtml(cat.name)}</span>
      </div>
      <span class="cat-count">${count}</span>
    `;

    item.addEventListener('click', () => {
      if (state.activeCategories.has(cat.id)) {
        if (state.activeCategories.size > 1) {
          state.activeCategories.delete(cat.id);
        }
      } else {
        state.activeCategories.add(cat.id);
      }
      renderCategoryFilters();
      renderCurrentView();
    });

    container.appendChild(item);
  });
}

function populateCategorySelect() {
  const select = document.getElementById('event-category');
  if (!select) return;
  select.innerHTML = state.categories.map(cat => `
    <option value="${cat.id}">${cat.name}</option>
  `).join('');
}

function renderCurrentView() {
  updateHeaderTitle();
  const monthView = document.getElementById('month-view');
  const weekView = document.getElementById('week-view');
  const dayView = document.getElementById('day-view');

  if (state.currentView === 'month') {
    if (monthView) monthView.style.display = 'flex';
    if (weekView) weekView.style.display = 'none';
    if (dayView) dayView.style.display = 'none';
    renderMonthView();
  } else if (state.currentView === 'week') {
    if (monthView) monthView.style.display = 'none';
    if (weekView) weekView.style.display = 'flex';
    if (dayView) dayView.style.display = 'none';
    renderWeekView();
  } else if (state.currentView === 'day') {
    if (monthView) monthView.style.display = 'none';
    if (weekView) weekView.style.display = 'none';
    if (dayView) dayView.style.display = 'flex';
    renderDayView();
  }

  updateUpcomingRemindersFeed();
}

function switchView(newView) {
  state.currentView = newView;
  document.querySelectorAll('.index-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === newView);
  });
  renderCurrentView();
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function navigatePeriod(direction) {
  const d = state.currentDate;
  if (state.currentView === 'month') {
    d.setMonth(d.getMonth() + direction);
  } else if (state.currentView === 'week') {
    d.setDate(d.getDate() + direction * 7);
  } else if (state.currentView === 'day') {
    d.setDate(d.getDate() + direction);
  }
  renderCurrentView();
}

// Modal Acara
function openCreateEventModal(prefillDate = null, prefillTime = null) {
  state.editingEventId = null;
  const form = document.getElementById('event-form');
  if (form) form.reset();

  const titleEl = document.getElementById('modal-title');
  if (titleEl) titleEl.textContent = '✏️ Tambah Acara Baru';
  const deleteBtn = document.getElementById('delete-event-btn');
  if (deleteBtn) deleteBtn.style.display = 'none';
  const idEl = document.getElementById('event-id');
  if (idEl) idEl.value = '';

  const defaultDate = prefillDate || formatDateISO(state.currentDate);
  const startDateInput = document.getElementById('event-start-date');
  const endDateInput = document.getElementById('event-end-date');
  if (startDateInput) startDateInput.value = defaultDate;
  if (endDateInput) endDateInput.value = defaultDate;

  const startTimeInput = document.getElementById('event-start-time');
  const endTimeInput = document.getElementById('event-end-time');
  if (prefillTime) {
    if (startTimeInput) startTimeInput.value = prefillTime;
    const [h, m] = prefillTime.split(':').map(Number);
    const endH = String(Math.min(23, h + 1)).padStart(2, '0');
    if (endTimeInput) endTimeInput.value = `${endH}:${String(m).padStart(2, '0')}`;
  } else {
    if (startTimeInput) startTimeInput.value = '09:00';
    if (endTimeInput) endTimeInput.value = '10:00';
  }

  const allDayCheck = document.getElementById('event-all-day');
  if (allDayCheck) allDayCheck.checked = false;
  toggleTimeInputs(false);

  const backdrop = document.getElementById('event-modal-backdrop');
  if (backdrop) backdrop.classList.add('active');
  const titleInput = document.getElementById('event-title');
  if (titleInput) titleInput.focus();
}

function openEditEventModal(eventId) {
  const event = state.events.find(e => e.id === eventId);
  if (!event) return;

  state.editingEventId = event.id;
  const titleEl = document.getElementById('modal-title');
  if (titleEl) titleEl.textContent = '✏️ Edit Acara';
  const deleteBtn = document.getElementById('delete-event-btn');
  if (deleteBtn) deleteBtn.style.display = 'inline-flex';
  const idEl = document.getElementById('event-id');
  if (idEl) idEl.value = event.id;

  const titleInput = document.getElementById('event-title');
  if (titleInput) titleInput.value = event.title || '';
  const allDayCheck = document.getElementById('event-all-day');
  if (allDayCheck) allDayCheck.checked = !!event.allDay;
  const startDateInput = document.getElementById('event-start-date');
  if (startDateInput) startDateInput.value = event.startDate;
  const startTimeInput = document.getElementById('event-start-time');
  if (startTimeInput) startTimeInput.value = event.startTime || '09:00';
  const endDateInput = document.getElementById('event-end-date');
  if (endDateInput) endDateInput.value = event.endDate || event.startDate;
  const endTimeInput = document.getElementById('event-end-time');
  if (endTimeInput) endTimeInput.value = event.endTime || '10:00';
  const catInput = document.getElementById('event-category');
  if (catInput) catInput.value = event.category || state.categories[0].id;
  const priorityInput = document.getElementById('event-priority');
  if (priorityInput) priorityInput.value = event.priority || 'medium';
  const recurrenceInput = document.getElementById('event-recurrence');
  if (recurrenceInput) recurrenceInput.value = event.recurrence || 'none';
  const reminderInput = document.getElementById('event-reminder');
  if (reminderInput) reminderInput.value = event.reminder !== undefined ? event.reminder : '5';
  const descInput = document.getElementById('event-description');
  if (descInput) descInput.value = event.description || '';

  toggleTimeInputs(event.allDay);

  const backdrop = document.getElementById('event-modal-backdrop');
  if (backdrop) backdrop.classList.add('active');
}

function closeEventModal() {
  const backdrop = document.getElementById('event-modal-backdrop');
  if (backdrop) backdrop.classList.remove('active');
}

function toggleTimeInputs(isAllDay) {
  const startG = document.getElementById('start-time-group');
  const endG = document.getElementById('end-time-group');
  if (startG) startG.style.display = isAllDay ? 'none' : 'flex';
  if (endG) endG.style.display = isAllDay ? 'none' : 'flex';
}

function safeBind(id, event, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, handler);
}

// Penyiapan Event Listener yang Sangat Aman
function setupEventListeners() {
  safeBind('prev-period-btn', 'click', () => navigatePeriod(-1));
  safeBind('next-period-btn', 'click', () => navigatePeriod(1));
  safeBind('today-btn', 'click', () => {
    state.currentDate = new Date();
    renderCurrentView();
  });

  document.querySelectorAll('.index-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchView(tab.dataset.view);
    });
  });

  safeBind('shortcut-priority-btn', 'click', () => togglePriorityBoard(true));
  safeBind('sidebar-priority-card', 'click', () => togglePriorityBoard(true));
  safeBind('priority-close-btn', 'click', () => togglePriorityBoard(false));
  safeBind('priority-dismiss-btn', 'click', () => togglePriorityBoard(false));
  safeBind('priority-board-backdrop', 'click', (e) => {
    if (e.target === document.getElementById('priority-board-backdrop')) {
      togglePriorityBoard(false);
    }
  });

  safeBind('select-all-cats', 'click', () => {
    state.activeCategories = new Set(state.categories.map(c => c.id));
    renderCategoryFilters();
    renderCurrentView();
  });

  const searchInput = document.getElementById('event-search-input');
  const searchClear = document.getElementById('search-clear-btn');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (searchClear) searchClear.style.display = state.searchQuery ? 'block' : 'none';
      renderCurrentView();
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      state.searchQuery = '';
      searchClear.style.display = 'none';
      renderCurrentView();
    });
  }

  safeBind('open-create-modal-btn', 'click', () => openCreateEventModal());
  safeBind('modal-close-btn', 'click', closeEventModal);
  safeBind('modal-cancel-btn', 'click', closeEventModal);
  safeBind('event-modal-backdrop', 'click', (e) => {
    if (e.target === document.getElementById('event-modal-backdrop')) {
      closeEventModal();
    }
  });

  safeBind('event-all-day', 'change', (e) => toggleTimeInputs(e.target.checked));

  const eventForm = document.getElementById('event-form');
  if (eventForm) {
    eventForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const titleInput = document.getElementById('event-title');
      const title = titleInput ? titleInput.value.trim() : '';
      if (!title) return;

      const allDayCheck = document.getElementById('event-all-day');
      const allDay = allDayCheck ? allDayCheck.checked : false;

      const startDateInput = document.getElementById('event-start-date');
      const startDate = startDateInput ? startDateInput.value : formatDateISO(new Date());

      const startTimeInput = document.getElementById('event-start-time');
      const startTime = allDay ? '00:00' : (startTimeInput ? startTimeInput.value : '09:00');

      const endDateInput = document.getElementById('event-end-date');
      const endDate = (endDateInput && endDateInput.value) ? endDateInput.value : startDate;

      const endTimeInput = document.getElementById('event-end-time');
      const endTime = allDay ? '23:59' : (endTimeInput ? endTimeInput.value : '10:00');

      const catSelect = document.getElementById('event-category');
      const category = catSelect ? catSelect.value : state.categories[0].id;

      const prioritySelect = document.getElementById('event-priority');
      const priority = prioritySelect ? prioritySelect.value : 'medium';

      const recurrenceSelect = document.getElementById('event-recurrence');
      const recurrence = recurrenceSelect ? recurrenceSelect.value : 'none';

      const reminderSelect = document.getElementById('event-reminder');
      const reminder = reminderSelect ? reminderSelect.value : '5';

      const descInput = document.getElementById('event-description');
      const description = descInput ? descInput.value.trim() : '';

      if (state.editingEventId) {
        const idx = state.events.findIndex(ev => ev.id === state.editingEventId);
        if (idx !== -1) {
          state.events[idx] = {
            ...state.events[idx],
            title,
            allDay,
            startDate,
            startTime,
            endDate,
            endTime,
            category,
            priority,
            recurrence,
            reminder,
            description
          };
          showToast('Acara Diperbarui ✨', `"${title}" telah berhasil disimpan.`);
        }
      } else {
        const newEvent = {
          id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          title,
          allDay,
          startDate,
          startTime,
          endDate,
          endTime,
          category,
          priority,
          recurrence,
          reminder,
          description,
          createdAt: new Date().toISOString()
        };
        state.events.push(newEvent);
        showToast('Acara Ditambahkan 🎈', `"${title}" dijadwalkan pada ${startDate}.`);
      }

      saveData();
      closeEventModal();
      renderCurrentView();
      renderCategoryFilters();
    });
  }

  safeBind('delete-event-btn', 'click', () => {
    if (!state.editingEventId) return;
    if (confirm('Apakah Anda yakin ingin menghapus acara ini dari kalender?')) {
      state.events = state.events.filter(e => e.id !== state.editingEventId);
      saveData();
      closeEventModal();
      renderCurrentView();
      renderCategoryFilters();
      showToast('Acara Dihapus 🗑️', 'Acara telah dihapus dari jadwal.');
    }
  });

  safeBind('notification-permission-btn', 'click', () => {
    if (!('Notification' in window)) {
      alert('Notifikasi desktop tidak didukung di browser ini.');
      return;
    }
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showToast('Notifikasi Aktif 🔔', 'Pemberitahuan desktop untuk pengingat aktif.');
        const dot = document.getElementById('notification-dot');
        if (dot) dot.style.display = 'block';
      } else {
        showToast('Notifikasi Nonaktif', 'Pengingat dalam aplikasi tetap aktif.');
      }
    });
  });

  const dataModal = document.getElementById('data-modal-backdrop');
  safeBind('export-import-btn', 'click', () => {
    if (dataModal) dataModal.classList.add('active');
  });
  safeBind('data-modal-close-btn', 'click', () => {
    if (dataModal) dataModal.classList.remove('active');
  });
  if (dataModal) {
    dataModal.addEventListener('click', (e) => {
      if (e.target === dataModal) dataModal.classList.remove('active');
    });
  }

  safeBind('download-backup-btn', 'click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `OmniCalendar_Meja_${formatDateISO(new Date())}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Cadangan Disimpan 💾', 'Berkas kalender berhasil diunduh.');
  });

  const importInput = document.getElementById('import-json-input');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            state.events = imported;
            saveData();
            renderCurrentView();
            renderCategoryFilters();
            if (dataModal) dataModal.classList.remove('active');
            showToast('Impor Sukses ✨', `Berhasil memuat ${imported.length} acara.`);
          } else {
            alert('Format berkas tidak valid: berkas harus berupa array JSON.');
          }
        } catch (err) {
          alert('Gagal membaca berkas JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  safeBind('load-sample-btn', 'click', () => {
    state.events = generateDemoEvents();
    saveData();
    renderCurrentView();
    renderCategoryFilters();
    if (dataModal) dataModal.classList.remove('active');
    showToast('Data Demo Dimuat 🎨', 'Acara contoh berhasil ditambahkan.');
  });

  safeBind('wipe-data-btn', 'click', () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua acara kalender?')) {
      state.events = [];
      saveData();
      renderCurrentView();
      renderCategoryFilters();
      if (dataModal) dataModal.classList.remove('active');
      showToast('Kalender Dikosongkan', 'Semua acara telah dihapus.');
    }
  });

  // Shortcut P untuk Urutan Prioritas
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      if (e.key === 'Escape') {
        closeEventModal();
        togglePriorityBoard(false);
      }
      return;
    }

    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      togglePriorityBoard();
      return;
    }

    if (e.key === 'Escape') {
      closeEventModal();
      togglePriorityBoard(false);
    } else if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      openCreateEventModal();
    } else if (e.key === 't' || e.key === 'T') {
      state.currentDate = new Date();
      renderCurrentView();
    } else if (e.key === 'm' || e.key === 'M') {
      switchView('month');
    } else if (e.key === 'w' || e.key === 'W') {
      switchView('week');
    } else if (e.key === 'd' || e.key === 'D') {
      switchView('day');
    } else if (e.key === 'ArrowLeft') {
      navigatePeriod(-1);
    } else if (e.key === 'ArrowRight') {
      navigatePeriod(1);
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Inisialisasi Aman
function runInit() {
  loadData();
  populateCategorySelect();
  renderCategoryFilters();
  renderCurrentView();
  setupEventListeners();

  setInterval(checkReminders, 10000);
  checkReminders();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInit);
} else {
  runInit();
}
