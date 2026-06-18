// Mobile-first interactions, smooth scroll, gallery filtering, dashboard interactions, form validation
document.addEventListener('DOMContentLoaded', function () {
  // util
  const $ = (sel, root = document) => root ? root.querySelector(sel) : document.querySelector(sel);
  const $$ = (sel, root = document) => Array.from((root || document).querySelectorAll(sel));

  // cache common selectors
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // MOBILE NAV
  const menuBtn = $('#mobile-menu-btn');
  const primaryNav = $('#primary-nav');
  // ensure desktop shows nav on initial load (in case the class persisted)
  if (primaryNav) {
    if (window.innerWidth >= 720) {
      primaryNav.classList.remove('hidden');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      // ensure page scroll isn't locked
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  }
  if (menuBtn && primaryNav) {
    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      const willOpen = !expanded;
      menuBtn.setAttribute('aria-expanded', String(willOpen));
      if (willOpen) {
        primaryNav.classList.remove('hidden');
        // lock background scroll when nav is open
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      } else {
        primaryNav.classList.add('hidden');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
    });

    // close nav on link click (mobile)
    $$('.primary-nav a, .primary-nav button').forEach(el => {
      el.addEventListener('click', () => {
        if (window.innerWidth < 720) {
          primaryNav.classList.add('hidden');
          menuBtn.setAttribute('aria-expanded', 'false');
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
        }
      });
    });
  }

  // close mobile nav with Escape and clicking outside the panel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && primaryNav && !primaryNav.classList.contains('hidden')) {
      primaryNav.classList.add('hidden');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('click', (e) => {
    // if nav is open and click happened outside nav and outside the button, close it
    if (!primaryNav || primaryNav.classList.contains('hidden')) return;
    const target = e.target;
    if (menuBtn && (menuBtn.contains(target) || primaryNav.contains(target))) return;
    // clicked outside
    primaryNav.classList.add('hidden');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  });

  // SMOOTH SCROLL (keyboard accessible)
  // smooth scroll for internal anchors
  $$('a[href^="#"]').forEach(a => {
    const targetId = a.getAttribute('href');
    if (targetId && targetId.length > 1) {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const t = document.querySelector(targetId);
        if (t) {
          t.scrollIntoView({behavior: 'smooth', block: 'start'});
          // move focus for accessibility
          setTimeout(() => t.focus({preventScroll:true}), 400);
        }
      });
    }
  });

  // GALLERY FILTERING
  // Gallery filtering with keyboard support
  const filterBtns = $$('.filter-btn');
  const galleryItems = $$('.gallery-item');
  function applyFilter(filter) {
    galleryItems.forEach(item => {
      const cat = item.dataset.category;
      if (!cat) return;
      if (filter === 'all' || filter === cat) {
        item.style.display = '';
        // small reveal animation (guard if animate exists)
        if (item.animate) item.animate([{opacity:0, transform:'translateY(6px)'},{opacity:1, transform:'translateY(0)'}],{duration:260,easing:'ease'});
      } else {
        item.style.display = 'none';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
    // keyboard (Enter / Space)
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // CONTACT FORM VALIDATION (simple)
  const form = $('#contact-form');
  const fields = ['name','email','event-date','guests','message'];
  function showError(el, msg){
    const err = el.parentElement.querySelector('.field-error');
    err.textContent = msg || '';
    if (msg) el.setAttribute('aria-invalid','true'); else el.removeAttribute('aria-invalid');
  }
  function validateField(id){
    const el = document.getElementById(id);
    if (!el) return true;
    const val = el.value.trim();
    if (el.required && !val) {
      showError(el, 'Required');
      return false;
    }
    if (el.type === 'email') {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      showError(el, ok ? '' : 'Invalid email');
      return ok;
    }
    if (el.type === 'number') {
      const num = Number(val);
      const ok = !isNaN(num) && num > 0;
      showError(el, ok ? '' : 'Enter a valid number');
      return ok;
    }
    showError(el, '');
    return true;
  }
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', ()=> validateField(id));
  });
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      fields.forEach(id => { if (!validateField(id)) ok = false; });
      if (!ok) {
        const fs = form.querySelector('.form-success'); if (fs) fs.textContent = '';
        return;
      }
      // fake send
      const fs = form.querySelector('.form-success'); if (fs) fs.textContent = 'Request sent — we will contact you soon.';
      form.reset();
      fields.forEach(id => { const el = document.getElementById(id); if (el) showError(el,''); });
    });
  }

  // DASHBOARD - sample data and interactions
  const dashboard = $('#dashboard');
  const dashboardOpenBtn = $('#dashboard-open');
  const dashboardCloseBtn = $('#dashboard-close');
  const dashboardTitle = $('#dashboard-title');
  const dashboardViews = $$('.view');
  const sidebarLinks = $$('.sidebar-link');

  // sample data
  const data = {
    revenue: 12450,
    bookings: [
      {client:'Emma R.', date:'2026-06-18', guests:120, pkg:'Wedding Deluxe', revenue:7500},
      {client:'Marcus P.', date:'2026-07-02', guests:80, pkg:'Corporate Gala', revenue:3200},
      {client:'Lina S.', date:'2026-06-28', guests:14, pkg:'Private Dining', revenue:750}
    ],
    inquiries: [
      {id:1,name:'Olivia',email:'olivia@example.com',msg:'Interested in August wedding',status:'new'},
      {id:2,name:'Daniel',email:'dan@example.com',msg:'Corporate lunch options',status:'new'},
      {id:3,name:'Priya',email:'priya@example.com',msg:'Vegan-only menu quote',status:'new'}
    ]
  };

  function openDashboard(){
    dashboard.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    // populate initial overview
    $('#stat-revenue').textContent = `$${data.revenue.toLocaleString()}`;
    $('#stat-bookings').textContent = data.bookings.length;
    $('#stat-events').textContent = 6;
    $('#stat-inquiries').textContent = data.inquiries.filter(i=>i.status!=='resolved').length;

    // mini lists
    const miniUpcoming = $('#mini-upcoming');
    miniUpcoming.innerHTML = '';
    data.bookings.slice(0,4).forEach(b => {
      const li = document.createElement('li');
      li.textContent = `${b.date} — ${b.client} (${b.guests} guests)`;
      miniUpcoming.appendChild(li);
    });
    const miniInq = $('#mini-inquiries');
    miniInq.innerHTML = '';
    data.inquiries.slice(0,4).forEach(i => {
      const li = document.createElement('li');
      li.textContent = `${i.name} — ${i.msg.substring(0,40)}${i.msg.length>40?'…':''}`;
      miniInq.appendChild(li);
    });

    // bookings table
  const tbody = $('#bookings-tbody');
    tbody.innerHTML = '';
    data.bookings.forEach(b=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${b.client}</td><td>${b.date}</td><td>${b.guests}</td><td>${b.pkg}</td><td>$${b.revenue.toLocaleString()}</td>`;
      tbody.appendChild(tr);
    });

    // inquiries list
  const inqList = $('#inquiries-list');
    inqList.innerHTML = '';
    data.inquiries.forEach(i=>{
      const li = document.createElement('li');
      li.className = 'inquiry';
      li.innerHTML = `<div><strong>${i.name}</strong> <span class="muted">${i.email}</span><p>${i.msg}</p></div>`;
      const actions = document.createElement('div');
      const mark = document.createElement('button');
      mark.textContent = i.status === 'resolved' ? 'Resolved' : 'Mark Resolved';
      mark.disabled = i.status === 'resolved';
      mark.className = 'btn-ghost';
      mark.addEventListener('click', () => {
        i.status = 'resolved';
        mark.textContent = 'Resolved';
        mark.disabled = true;
        $('#stat-inquiries').textContent = data.inquiries.filter(ii=>ii.status!=='resolved').length;
      });
      actions.appendChild(mark);
      li.appendChild(actions);
      inqList.appendChild(li);
    });

    // events list
  const eventsList = $('#events-list');
    eventsList.innerHTML = '';
    data.bookings.forEach(b=>{
      const li = document.createElement('li');
      li.textContent = `${b.date} — ${b.client} — ${b.pkg}`;
      eventsList.appendChild(li);
    });
  }

  function closeDashboard(){
    dashboard.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  if (dashboardOpenBtn) {
    dashboardOpenBtn.addEventListener('click', () => {
      openDashboard();
      // focus to first interactive control
      setTimeout(()=> { const dc = $('#dashboard-close'); if (dc) dc.focus(); }, 120);
    });
  }
  if (dashboardCloseBtn) dashboardCloseBtn.addEventListener('click', closeDashboard);
  const logoutBtn = $('#logout');
  const refreshBtn = $('#refresh-data');
  if (logoutBtn) logoutBtn.addEventListener('click', () => { alert('Signed out (demo).'); closeDashboard(); });
  if (refreshBtn) refreshBtn.addEventListener('click', () => {
    // in a real app you'd fetch. Here we just animate
    refreshBtn.textContent = 'Refreshing…';
    setTimeout(()=> refreshBtn.textContent = 'Refresh', 800);
  });

  // sidebar view switching
  sidebarLinks.forEach(btn => btn.addEventListener('click', () => {
    sidebarLinks.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    if (dashboardTitle) dashboardTitle.textContent = btn.textContent;
    dashboardViews.forEach(v => { v.hidden = v.dataset.view !== view; });
  }));

  // close dashboard with ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dashboard && dashboard.getAttribute('aria-hidden') === 'false') {
      closeDashboard();
    }
  });

  // adjust nav initial visibility on resize
  // debounce helper
  function debounce(fn, wait=120){
    let t; return function(...args){ clearTimeout(t); t = setTimeout(()=> fn.apply(this,args), wait); };
  }

  window.addEventListener('resize', debounce(() => {
    if (!primaryNav || !menuBtn) return;
    if (window.innerWidth >= 720) {
      primaryNav.classList.remove('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
    } else {
      primaryNav.classList.add('hidden');
    }
  }));
});
