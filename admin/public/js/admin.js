const API = '/api';
let state = { view: 'dashboard', categories: [], stories: [], videos: [], stats: {} };
let currentId = null;
let editingType = null;

// --- CONVERSATION HELPERS ---
function addConversation() {
  const speaker = $('#conv-speaker').value;
  const text = $('#conv-text').value.trim();
  if (!text) return;
  const list = $('#conv-list');
  const div = document.createElement('div');
  div.style.cssText = 'display:flex;gap:6px;align-items:center;background:var(--surface2);padding:8px 12px;border-radius:8px;border:1px solid var(--border);';
  div.innerHTML = `
    <span style="font-size:12px;color:${speaker === 'حكيم' ? '#4CAF50' : '#42A5F5'};font-weight:700;min-width:40px;">${speaker === 'حكيم' ? '📜' : '🌟'} ${speaker}</span>
    <span style="flex:1;font-size:13px;text-align:right;">${text}</span>
    <span style="cursor:pointer;color:var(--danger);font-size:16px;" onclick="this.parentElement.remove();">×</span>
    <input type="hidden" name="conv-speaker" value="${speaker}">
    <input type="hidden" name="conv-text" value="${escHtml(text)}">
  `;
  list.appendChild(div);
  $('#conv-text').value = '';
}

function getConversation() {
  const items = [];
  const list = $('#conv-list');
  if (!list) return items;
  list.querySelectorAll('div').forEach(div => {
    const speakerInput = div.querySelector('input[name="conv-speaker"]');
    const textInput = div.querySelector('input[name="conv-text"]');
    if (speakerInput && textInput && textInput.value.trim()) {
      items.push({ speaker: speakerInput.value, text: textInput.value });
    }
  });
  return items;
}

// --- UTILITIES ---
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function showToast(msg, type = 'success') {
  const container = $('.toast-container') || (() => {
    const d = document.createElement('div');
    d.className = 'toast-container';
    document.body.appendChild(d);
    return d;
  })();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
}

async function apiFetch(path, opts = {}) {
  try {
    const res = await fetch(API + path, {
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts,
    });
    const data = await res.json();
    if (!data.success && data.message && data.message.includes('ECONNREFUSED')) {
      showToast('⚠ قاعدة البيانات غير متصلة. تحقق من إعدادات MongoDB', 'error');
    }
    return data;
  } catch (e) {
    showToast('خطأ في الاتصال بالخادم', 'error');
    return { success: false, message: e.message };
  }
}

function loading(show) {
  let ld = $('.loading-overlay');
  if (show) {
    if (!ld) {
      ld = document.createElement('div');
      ld.className = 'loading-overlay';
      ld.innerHTML = '<div class="spinner"></div>';
      ld.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center';
      document.body.appendChild(ld);
    }
    ld.style.display = 'flex';
  } else if (ld) ld.style.display = 'none';
}

// --- NAVIGATION ---
function navigate(view, id = null) {
  state.view = view;
  currentId = id;
  editingType = null;
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));
  renderPage();
}

// --- RENDER ---
function renderPage() {
  const main = $('.main-content');
  if (!main) return;
  switch (state.view) {
    case 'dashboard': renderDashboard(main); break;
    case 'categories': renderCategories(main); break;
    case 'stories': renderStories(main); break;
    case 'videos': renderVideos(main); break;
    case 'search': renderSearch(main); break;
    default: renderDashboard(main);
  }
}

function renderDashboard(main) {
  main.innerHTML = `
    <div class="page-header">
      <div class="page-title">لوحة التحكم <small>نظرة عامة</small></div>
      <div class="btn-group">
        <button class="btn btn-outline btn-sm" onclick="refreshAll()">🔄 تحديث</button>
        <button class="btn btn-outline btn-sm" onclick="exportData()">📥 تصدير JSON</button>
        <button class="btn btn-accent btn-sm" onclick="testConnection()">🔌 اختبار الاتصال</button>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background:#1A2A1A;color:#4CAF50;">📂</div>
        <div class="stat-info"><h3 id="stat-cats">0</h3><p>الأقسام</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#1A1A2A;color:#42A5F5;">📖</div>
        <div class="stat-info"><h3 id="stat-stories">0</h3><p>القصص</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#2A1A1A;color:#EF5350;">🎬</div>
        <div class="stat-info"><h3 id="stat-videos">0</h3><p>الفيديوهات</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#1A2A2A;color:#FFD54F;">📦</div>
        <div class="stat-info"><h3 id="stat-total">0</h3><p>إجمالي المحتوى</p></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;">
        <h3 style="margin-bottom:12px;font-size:14px;">🔌 حالة الاتصال</h3>
        <div id="dashboard-db-status" style="display:flex;align-items:center;gap:10px;">
          <span style="width:12px;height:12px;border-radius:50%;background:#F44336;" id="dash-db-dot"></span>
          <span style="color:var(--text2);font-size:13px;" id="dash-db-text">جاري الفحص...</span>
        </div>
        <div style="margin-top:8px;">
          <span style="font-size:11px;color:var(--text3);">API Version: 2.0.0</span>
          <span style="font-size:11px;color:var(--text3);margin-right:16px;">🕌 التاريخ الإسلامي</span>
        </div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;">
        <h3 style="margin-bottom:12px;font-size:14px;">⚡ إجراءات سريعة</h3>
        <div class="btn-group" style="flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm" onclick="openCategoryModal()">📂 إضافة قسم</button>
          <button class="btn btn-accent btn-sm" onclick="openStoryModal()">📖 إضافة قصة</button>
          <button class="btn btn-danger btn-sm" onclick="openVideoModal()">🎬 إضافة فيديو</button>
          <button class="btn btn-outline btn-sm" onclick="navigate('categories')">📋 عرض الأقسام</button>
        </div>
      </div>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;">
      <h3 style="margin-bottom:8px;font-size:14px;">📋 تعليمات سريعة</h3>
      <ul style="color:var(--text2);font-size:12px;line-height:2;list-style:none;padding-right:0;">
        <li>✅ استخدم <strong>الأقسام</strong> لإنشاء تصنيفات المحتوى (النبي، الصحابة...)</li>
        <li>✅ استخدم <strong>القصص</strong> لإضافة محتوى نصي مع وسوم ونقاط مضيئة</li>
        <li>✅ استخدم <strong>الفيديوهات</strong> لإضافة روابط يوتيوب مع معاينة تلقائية</li>
        <li>✅ استخدم <strong>بحث</strong> للبحث في كل المحتوى</li>
        <li>✅ استخدم <strong>تصدير JSON</strong> لتصدير كل البيانات</li>
      </ul>
    </div>
  `;
  loadStats();
  updateDashDbStatus();
}

function updateDashDbStatus() {
  fetch(API + '/app/status').then(r => r.json()).then(r => {
    const dot = $('#dash-db-dot');
    const text = $('#dash-db-text');
    if (r.success && r.data.dbConnected) {
      dot.style.background = '#4CAF50';
      text.textContent = '🟢 متصل بقاعدة البيانات';
      text.style.color = '#81C784';
    } else {
      dot.style.background = '#F44336';
      text.textContent = '🔴 غير متصل - قاعدة البيانات غير متاحة';
      text.style.color = '#EF9A9A';
    }
  }).catch(() => {});
}

function testConnection() {
  showToast('🔌 جاري اختبار الاتصال...');
  fetch(API + '/app/status').then(r => r.json()).then(r => {
    if (r.success) {
      const st = r.data;
      showToast(`✓ API يعمل | DB: ${st.dbConnected ? 'متصل' : 'غير متصل'}`, st.dbConnected ? 'success' : 'error');
      updateDashDbStatus();
      checkDbStatus();
    }
  }).catch(() => showToast('✗ فشل الاتصال بالخادم', 'error'));
}

function renderCategories(main) {
  main.innerHTML = `
    <div class="page-header">
      <div class="page-title">📂 الأقسام <small>إدارة أقسام المحتوى</small></div>
      <button class="btn btn-primary" onclick="openCategoryModal()">+ إضافة قسم</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>الأيقونة</th>
            <th>الاسم</th>
            <th>المعرف</th>
            <th>الوصف</th>
            <th>الترتيب</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody id="categories-tbody"></tbody>
      </table>
    </div>
  `;
  loadCategories();
}

function renderStories(main) {
  main.innerHTML = `
    <div class="page-header">
      <div class="page-title">📖 القصص <small>إدارة القصص والمقالات</small></div>
      <button class="btn btn-primary" onclick="openStoryModal()">+ إضافة قصة</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>القصة</th>
            <th>القسم</th>
            <th>التلخيص</th>
            <th>الوسوم</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody id="stories-tbody"></tbody>
      </table>
    </div>
  `;
  loadStories();
}

function renderVideos(main) {
  main.innerHTML = `
    <div class="page-header">
      <div class="page-title">🎬 الفيديوهات <small>إدارة فيديوهات يوتيوب</small></div>
      <button class="btn btn-primary" onclick="openVideoModal()">+ إضافة فيديو</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>الفيديو</th>
            <th>العنوان</th>
            <th>القسم</th>
            <th>الرابط</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody id="videos-tbody"></tbody>
      </table>
    </div>
  `;
  loadVideos();
}

function renderSearch(main) {
  main.innerHTML = `
    <div class="page-header">
      <div class="page-title">🔍 بحث <small>ابحث في كل المحتوى</small></div>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:20px;">
      <div style="display:flex;gap:10px;">
        <input class="form-input" id="search-input" placeholder="ابحث عن قصة، فيديو، صحابي..." style="flex:1;" onkeydown="if(event.key==='Enter') performSearch()">
        <button class="btn btn-accent" onclick="performSearch()">🔍 بحث</button>
      </div>
      <div style="margin-top:8px;display:flex;gap:8px;">
        <button class="btn btn-outline btn-xs" onclick="setSearchFilter('all')" id="sf-all">الكل</button>
        <button class="btn btn-outline btn-xs" onclick="setSearchFilter('stories')" id="sf-stories">📖 قصص</button>
        <button class="btn btn-outline btn-xs" onclick="setSearchFilter('videos')" id="sf-videos">🎬 فيديوهات</button>
      </div>
    </div>
    <div id="search-results"></div>
  `;
  state.searchFilter = 'all';
}

let searchFilter = 'all';
function setSearchFilter(f) {
  searchFilter = f;
  $$('.btn-outline.btn-xs').forEach(b => b.style.borderColor = 'var(--border)');
  const el = document.getElementById('sf-' + f);
  if (el) el.style.borderColor = 'var(--accent)';
}

async function performSearch() {
  const q = $('#search-input').value.trim();
  if (!q) { showToast('✗ أدخل كلمة للبحث', 'error'); return; }
  loading(true);
  const r = await apiFetch('/app/search?q=' + encodeURIComponent(q));
  loading(false);
  const results = $('#search-results');
  if (!r.success || (!r.data.stories?.length && !r.data.videos?.length)) {
    results.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>لا توجد نتائج لـ "' + q + '"</p></div>';
    return;
  }
  let html = '';
  if (r.data.stories?.length && (searchFilter === 'all' || searchFilter === 'stories')) {
    html += '<h3 style="margin-bottom:12px;font-size:15px;">📖 القصص (' + r.data.stories.length + ')</h3>';
    r.data.stories.forEach(s => {
      html += '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">' +
        '<div><strong>' + s.title + '</strong>' + (s.category ? '<span style="color:var(--text2);font-size:12px;margin-right:8px;">' + (s.category.icon || '') + ' ' + s.category.name + '</span>' : '') + '</div>' +
        '<button class="btn btn-accent btn-xs" onclick="openStoryModal(\'' + s._id + '\')">✎</button></div>';
    });
  }
  if (r.data.videos?.length && (searchFilter === 'all' || searchFilter === 'videos')) {
    html += '<h3 style="margin-bottom:12px;font-size:15px;margin-top:16px;">🎬 الفيديوهات (' + r.data.videos.length + ')</h3>';
    r.data.videos.forEach(v => {
      html += '<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">' +
        '<div><strong>' + v.title + '</strong>' + (v.category ? '<span style="color:var(--text2);font-size:12px;margin-right:8px;">' + (v.category.icon || '') + ' ' + v.category.name + '</span>' : '') + '</div>' +
        '<button class="btn btn-danger btn-xs" onclick="openVideoModal(\'' + v._id + '\')">✎</button></div>';
    });
  }
  results.innerHTML = html;
}

// --- DATA LOADING ---
async function loadStats() {
  const r = await apiFetch('/stats');
  if (r.success) {
    state.stats = r.data;
    $('#stat-cats').textContent = r.data.categories || 0;
    $('#stat-stories').textContent = r.data.stories || 0;
    $('#stat-videos').textContent = r.data.videos || 0;
    $('#stat-total').textContent = (r.data.categories || 0) + (r.data.stories || 0) + (r.data.videos || 0);
    updateBadges(r.data);
  }
}

async function loadCategories() {
  const r = await apiFetch('/categories');
  if (r.success) {
    state.categories = r.data;
    updateBadges(state.stats);
    const tbody = $('#categories-tbody');
    if (!tbody) return;
    tbody.innerHTML = r.data.length ? r.data.map((c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td style="font-size:22px;">${c.icon || '📖'}</td>
        <td><strong>${c.name}</strong></td>
        <td style="color:var(--text2);font-size:12px;direction:ltr;">${c.slug}</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text2);font-size:12px;">${c.description || '-'}</td>
        <td>${c.order || 0}</td>
        <td>${c.isActive !== false ? '<span style="color:#4CAF50;">● نشط</span>' : '<span style="color:var(--text3);">● غير نشط</span>'}</td>
        <td class="actions">
          <button class="btn btn-accent btn-xs" onclick="openCategoryModal('${c._id}')">✎</button>
          <button class="btn btn-danger btn-xs" onclick="deleteCategory('${c._id}')">✕</button>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📂</div><p>لا توجد أقسام بعد</p></div></td></tr>`;
  }
}

async function loadStories() {
  const r = await apiFetch('/stories');
  if (r.success) {
    state.stories = r.data;
    const tbody = $('#stories-tbody');
    if (!tbody) return;
    tbody.innerHTML = r.data.length ? r.data.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><span style="font-size:20px;">${s.icon || '📖'}</span> <strong>${s.title}</strong></td>
        <td>${s.category ? `<span class="cat-badge" style="background:${s.category.color || '#333'}22;color:${s.category.color || '#ccc'};">${s.category.icon || ''} ${s.category.name}</span>` : '-'}</td>
        <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text2);font-size:12px;">${s.summary || '-'}</td>
        <td>${s.tags && s.tags.length ? s.tags.map(t => `<span class="tag">${t}</span>`).join('') : '-'}</td>
        <td>${s.isActive !== false ? '<span style="color:#4CAF50;">● نشط</span>' : '<span style="color:var(--text3);">● غير نشط</span>'}</td>
        <td class="actions">
          <button class="btn btn-accent btn-xs" onclick="openStoryModal('${s._id}')">✎</button>
          <button class="btn btn-danger btn-xs" onclick="deleteStory('${s._id}')">✕</button>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📖</div><p>لا توجد قصص بعد</p></div></td></tr>`;
  }
}

async function loadVideos() {
  const r = await apiFetch('/videos');
  if (r.success) {
    state.videos = r.data;
    const tbody = $('#videos-tbody');
    if (!tbody) return;
    tbody.innerHTML = r.data.length ? r.data.map((v, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>
          <div class="video-thumb">
            <img src="https://img.youtube.com/vi/${v.videoId || 'default'}/mqdefault.jpg" alt="" onerror="this.style.display='none'">
            <div class="play-badge">▶</div>
          </div>
        </td>
        <td><strong>${v.title}</strong></td>
        <td>${v.category ? `<span class="cat-badge" style="background:${v.category.color || '#333'}22;color:${v.category.color || '#ccc'};">${v.category.icon || ''} ${v.category.name}</span>` : '-'}</td>
        <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;direction:ltr;font-size:11px;color:var(--accent);"><a href="${v.url}" target="_blank" style="color:var(--accent);">${v.url}</a></td>
        <td>${v.isActive !== false ? '<span style="color:#4CAF50;">● نشط</span>' : '<span style="color:var(--text3);">● غير نشط</span>'}</td>
        <td class="actions">
          <button class="btn btn-accent btn-xs" onclick="openVideoModal('${v._id}')">✎</button>
          <button class="btn btn-danger btn-xs" onclick="deleteVideo('${v._id}')">✕</button>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🎬</div><p>لا توجد فيديوهات بعد</p></div></td></tr>`;
  }
}

function updateBadges(stats) {
  const items = { categories: '📂', stories: '📖', videos: '🎬' };
  Object.entries(items).forEach(([key, icon]) => {
    const el = $(`.nav-item[data-view="${key}"] .nav-badge`);
    if (el) el.textContent = stats[key] || 0;
  });
}

async function refreshAll() {
  loadStats(); loadCategories(); loadStories(); loadVideos();
  checkDbStatus();
  showToast('✓ تم تحديث جميع البيانات');
}

async function checkDbStatus() {
  const r = await apiFetch('/stats');
  const dot = $('#db-dot');
  const text = $('#db-text');
  if (r.success && r.data) {
    dot.style.background = '#4CAF50';
    text.textContent = 'قاعدة البيانات: متصلة ✓';
    text.style.color = '#81C784';
  } else {
    dot.style.background = '#F44336';
    text.textContent = 'قاعدة البيانات: غير متصلة';
    text.style.color = '#EF9A9A';
  }
}

// --- CATEGORY CRUD ---
function openCategoryModal(id = null) {
  const c = id ? state.categories.find(x => x._id === id) : null;
  editingType = 'category';
  currentId = id;
  showModal(
    c ? '✎ تعديل قسم' : '➕ إضافة قسم',
    `
      <div class="form-group">
        <label>اسم القسم *</label>
        <input class="form-input" id="cat-name" value="${c ? escHtml(c.name) : ''}" placeholder="مثال: النبي محمد ﷺ">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>المعرف (slug) *</label>
          <input class="form-input" id="cat-slug" value="${c ? escHtml(c.slug) : ''}" placeholder="prophet">
          <div class="form-hint">للرابط: slug-القسم</div>
        </div>
        <div class="form-group">
          <label>الترتيب</label>
          <input class="form-input" id="cat-order" type="number" value="${c ? c.order || 0 : 0}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>الأيقونة</label>
          <input class="form-input" id="cat-icon" value="${c ? escHtml(c.icon) : '📖'}" placeholder="📖">
        </div>
        <div class="form-group">
          <label>اللون</label>
          <input class="form-input" id="cat-color" type="color" value="${c ? c.color : '#2E7D32'}">
        </div>
      </div>
      <div class="form-group">
        <label>الوصف</label>
        <textarea class="form-textarea" id="cat-desc" placeholder="وصف مختصر للقسم">${c ? escHtml(c.description || '') : ''}</textarea>
      </div>
      <div class="form-group">
        <label><input type="checkbox" id="cat-active" ${!c || c.isActive !== false ? 'checked' : ''}> القسم نشط</label>
      </div>
    `,
    async () => {
      const data = {
        name: $('#cat-name').value,
        slug: $('#cat-slug').value,
        icon: $('#cat-icon').value,
        color: $('#cat-color').value,
        description: $('#cat-desc').value,
        order: parseInt($('#cat-order').value) || 0,
        isActive: $('#cat-active').checked,
      };
      if (!data.name || !data.slug) { showToast('✗ الاسم والمعرف مطلوبان', 'error'); return; }
      const r = id ? await apiFetch('/categories/' + id, { method: 'PUT', body: JSON.stringify(data) })
                   : await apiFetch('/categories', { method: 'POST', body: JSON.stringify(data) });
      if (r.success) { closeModal(); showToast(r.message); loadCategories(); loadStats(); }
      else showToast(r.message, 'error');
    }
  );
}

async function deleteCategory(id) {
  if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
  const r = await apiFetch('/categories/' + id, { method: 'DELETE' });
  if (r.success) { showToast(r.message); loadCategories(); loadStats(); }
  else showToast(r.message, 'error');
}

// --- STORY CRUD ---
function openStoryModal(id = null) {
  const s = id ? state.stories.find(x => x._id === id) : null;
  editingType = 'story';
  currentId = id;
  showModal(
    s ? '✎ تعديل قصة' : '➕ إضافة قصة',
    `
      <div class="form-group">
        <label>عنوان القصة *</label>
        <input class="form-input" id="story-title" value="${s ? escHtml(s.title) : ''}" placeholder="مثال: قصة أبو بكر الصديق">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>القسم *</label>
          <select class="form-select" id="story-category">
            <option value="">اختر القسم</option>
            ${state.categories.map(c => `<option value="${c._id}" ${s && s.category && (s.category._id === c._id || s.category === c._id) ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>الأيقونة</label>
          <input class="form-input" id="story-icon" value="${s ? escHtml(s.icon) : '📖'}">
        </div>
      </div>
      <div class="form-group">
        <label>العنوان الفرعي</label>
        <input class="form-input" id="story-subtitle" value="${s ? escHtml(s.subtitle || '') : ''}">
      </div>
      <div class="form-group">
        <label>التلخيص</label>
        <textarea class="form-textarea" id="story-summary" rows="3">${s ? escHtml(s.summary || '') : ''}</textarea>
      </div>
      <div class="form-group">
        <label>المحتوى (نص كامل)</label>
        <textarea class="form-textarea" id="story-content" rows="6">${s ? escHtml(s.content || '') : ''}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>الصورة (رابط)</label>
          <input class="form-input" id="story-image" value="${s ? escHtml(s.imageUrl || '') : ''}" placeholder="https://...">
        </div>
        <div class="form-group">
          <label>الترتيب</label>
          <input class="form-input" id="story-order" type="number" value="${s ? s.order || 0 : 0}">
        </div>
      </div>
      <div class="form-group">
        <label>الوسوم (كلمة ثم Enter)</label>
        <input class="form-input" id="story-tag-input" placeholder="اكتب واضغط Enter" onkeydown="if(event.key==='Enter'){event.preventDefault();addTag('story')}">
        <div class="tag-list" id="story-tags">
          ${s && s.tags ? s.tags.map(t => `<span class="tag">${escHtml(t)} <span class="tag-remove" onclick="this.parentElement.remove()">×</span></span>`).join('') : ''}
        </div>
      </div>
      <div class="form-group">
        <label>النقاط المضيئة (سطر واحد لكل نقطة)</label>
        <textarea class="form-textarea" id="story-highlights" rows="4" placeholder="كل نقطة في سطر">${s && s.highlights ? s.highlights.join('\n') : ''}</textarea>
      </div>
      <div class="form-group">
        <label>حوار المحادثة (اختياري)</label>
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <select class="form-select" id="conv-speaker" style="width:100px;">
            <option value="حكيم">📜 حكيم</option>
            <option value="سائل">🌟 سائل</option>
          </select>
          <input class="form-input" id="conv-text" placeholder="نص الحوار..." style="flex:1;" onkeydown="if(event.key==='Enter'){event.preventDefault();addConversation()}">
          <button class="btn btn-accent btn-sm" onclick="addConversation()" style="white-space:nowrap;">+ إضافة</button>
        </div>
        <div id="conv-list" style="display:flex;flex-direction:column;gap:4px;">
          ${s && s.conversation ? s.conversation.map((c, i) =>
            `<div style="display:flex;gap:6px;align-items:center;background:var(--surface2);padding:8px 12px;border-radius:8px;border:1px solid var(--border);">
              <span style="font-size:12px;color:${c.speaker === 'حكيم' ? '#4CAF50' : '#42A5F5'};font-weight:700;min-width:40px;">${c.speaker === 'حكيم' ? '📜' : '🌟'} ${c.speaker}</span>
              <span style="flex:1;font-size:13px;text-align:right;">${c.text}</span>
              <span style="cursor:pointer;color:var(--danger);font-size:16px;" onclick="this.parentElement.remove();">×</span>
              <input type="hidden" name="conv-speaker-${i}" value="${c.speaker}">
              <input type="hidden" name="conv-text-${i}" value="${c.text.replace(/"/g, '&quot;')}">
            </div>`
          ).join('') : ''}
        </div>
        <div class="form-hint">أضف حوارات بين حكيم وسائل لتظهر في التطبيق</div>
      </div>
      <div class="form-group">
        <label>اقتباس</label>
        <textarea class="form-textarea" id="story-quote" rows="2">${s ? escHtml(s.quote || '') : ''}</textarea>
      </div>
      <div class="form-group">
        <label><input type="checkbox" id="story-active" ${!s || s.isActive !== false ? 'checked' : ''}> القصة نشطة</label>
      </div>
    `,
    async () => {
      const tags = [...$$('#story-tags .tag')].map(t => t.textContent.replace('×', '').trim()).filter(Boolean);
      const highlights = $('#story-highlights').value.split('\n').map(s => s.trim()).filter(Boolean);
      const data = {
        title: $('#story-title').value,
        subtitle: $('#story-subtitle').value,
        category: $('#story-category').value,
        icon: $('#story-icon').value,
        summary: $('#story-summary').value,
        content: $('#story-content').value,
        imageUrl: $('#story-image').value,
        order: parseInt($('#story-order').value) || 0,
        tags, highlights,
        quote: $('#story-quote').value,
        conversation: getConversation(),
        isActive: $('#story-active').checked,
      };
      if (!data.title || !data.category) { showToast('✗ العنوان والقسم مطلوبان', 'error'); return; }
      const r = id ? await apiFetch('/stories/' + id, { method: 'PUT', body: JSON.stringify(data) })
                   : await apiFetch('/stories', { method: 'POST', body: JSON.stringify(data) });
      if (r.success) { closeModal(); showToast(r.message); loadStories(); loadStats(); }
      else showToast(r.message, 'error');
    }
  );
}

async function deleteStory(id) {
  if (!confirm('هل أنت متأكد من حذف هذه القصة؟')) return;
  const r = await apiFetch('/stories/' + id, { method: 'DELETE' });
  if (r.success) { showToast(r.message); loadStories(); loadStats(); }
  else showToast(r.message, 'error');
}

// --- VIDEO CRUD ---
function openVideoModal(id = null) {
  const v = id ? state.videos.find(x => x._id === id) : null;
  editingType = 'video';
  currentId = id;

  const previewUrl = v && v.videoId ? `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg` : '';

  showModal(
    v ? '✎ تعديل فيديو' : '➕ إضافة فيديو',
    `
      <div class="form-group">
        <label>عنوان الفيديو *</label>
        <input class="form-input" id="video-title" value="${v ? escHtml(v.title) : ''}" placeholder="مثال: قصة غزوة بدر">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>القسم</label>
          <select class="form-select" id="video-category">
            <option value="">بدون قسم</option>
            ${state.categories.map(c => `<option value="${c._id}" ${v && v.category && (v.category._id === c._id || v.category === c._id) ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>المنصة</label>
          <select class="form-select" id="video-platform">
            <option value="youtube" ${v && v.platform === 'youtube' ? 'selected' : ''}>YouTube</option>
            <option value="facebook" ${v && v.platform === 'facebook' ? 'selected' : ''}>Facebook</option>
            <option value="other" ${v && v.platform === 'other' ? 'selected' : ''}>أخرى</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>رابط الفيديو *</label>
        <input class="form-input" id="video-url" value="${v ? escHtml(v.url) : ''}" placeholder="https://youtube.com/watch?v=..." oninput="previewVideo()">
      </div>
      <div id="video-preview" style="margin-bottom:12px;${previewUrl ? '' : 'display:none'}">
        <img id="video-preview-img" src="${previewUrl}" style="width:100%;max-width:320px;border-radius:12px;border:1px solid var(--border);">
      </div>
      <div class="form-group">
        <label>الوصف</label>
        <textarea class="form-textarea" id="video-desc" rows="3">${v ? escHtml(v.description || '') : ''}</textarea>
      </div>
      <div class="form-group">
        <label>المدة (اختياري)</label>
        <input class="form-input" id="video-duration" value="${v ? escHtml(v.duration || '') : ''}" placeholder="مثال: 10:30">
      </div>
      <div class="form-group">
        <label><input type="checkbox" id="video-active" ${!v || v.isActive !== false ? 'checked' : ''}> الفيديو نشط</label>
      </div>
    `,
    async () => {
      const data = {
        title: $('#video-title').value,
        category: $('#video-category').value || null,
        platform: $('#video-platform').value,
        url: $('#video-url').value,
        description: $('#video-desc').value,
        duration: $('#video-duration').value,
        isActive: $('#video-active').checked,
      };
      if (!data.title || !data.url) { showToast('✗ العنوان والرابط مطلوبان', 'error'); return; }
      const r = id ? await apiFetch('/videos/' + id, { method: 'PUT', body: JSON.stringify(data) })
                   : await apiFetch('/videos', { method: 'POST', body: JSON.stringify(data) });
      if (r.success) { closeModal(); showToast(r.message); loadVideos(); loadStats(); }
      else showToast(r.message, 'error');
    }
  );
}

async function deleteVideo(id) {
  if (!confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return;
  const r = await apiFetch('/videos/' + id, { method: 'DELETE' });
  if (r.success) { showToast(r.message); loadVideos(); loadStats(); }
  else showToast(r.message, 'error');
}

function previewVideo() {
  const url = $('#video-url').value;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  const preview = $('#video-preview');
  const img = $('#video-preview-img');
  if (match) {
    img.src = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }
}

function addTag(prefix) {
  const input = $(`#${prefix}-tag-input`);
  if (!input || !input.value.trim()) return;
  const list = $(`#${prefix}-tags`);
  const t = document.createElement('span');
  t.className = 'tag';
  t.innerHTML = `${escHtml(input.value.trim())} <span class="tag-remove" onclick="this.parentElement.remove()">×</span>`;
  list.appendChild(t);
  input.value = '';
}

// --- EXPORT ---
async function exportData() {
  loading(true);
  const r = await apiFetch('/export');
  loading(false);
  if (r.success) {
    const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `islamic-history-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('✓ تم تصدير البيانات بنجاح');
  } else showToast(r.message, 'error');
}

// --- MODAL ---
function showModal(title, body, onSave) {
  const overlay = $('.modal-overlay') || (() => {
    const d = document.createElement('div');
    d.className = 'modal-overlay';
    d.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body"></div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal()">إلغاء</button>
          <button class="btn btn-primary" id="modal-save-btn">💾 حفظ</button>
        </div>
      </div>
    `;
    document.body.appendChild(d);
    d.addEventListener('click', e => { if (e.target === d) closeModal(); });
    return d;
  })();

  overlay.classList.add('active');
  overlay.querySelector('.modal-title').textContent = title;
  overlay.querySelector('.modal-body').innerHTML = body;
  const saveBtn = overlay.querySelector('#modal-save-btn');
  const newBtn = saveBtn.cloneNode(true);
  saveBtn.parentNode.replaceChild(newBtn, saveBtn);
  newBtn.addEventListener('click', onSave);
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = $('.modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// --- LOGIN ---
function handleLogin() {
  const username = $('#login-user').value;
  const password = $('#login-pass').value;
  const err = $('.login-error');

  if (!username || !password) {
    err.textContent = '✗ الرجاء إدخال اسم المستخدم وكلمة المرور';
    err.style.display = 'block';
    return;
  }

  fetch(API + '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  .then(r => r.json())
  .then(r => {
    if (r.success) {
      $('.login-page').style.display = 'none';
      $('.app').classList.add('active');
      renderPage();
      refreshAll();
    } else {
      err.textContent = r.message;
      err.style.display = 'block';
    }
  })
  .catch(() => {
    err.textContent = '✗ خطأ في الاتصال بالخادم';
    err.style.display = 'block';
  });
}

function handleLogout() {
  $('.app').classList.remove('active');
  $('.login-page').style.display = 'flex';
  $('#login-user').value = '';
  $('#login-pass').value = '';
}

function escHtml(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// Keyboard support
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' && $('.login-page') && $('.login-page').style.display !== 'none') handleLogin();
});