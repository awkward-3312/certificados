import { renderTablaCertificados } from './certificados.js';
const supa = window.supa;

function isAuthorized(email) {
  return (window.ALLOWED_EMAILS || []).includes((email || '').toLowerCase());
}

async function loadSession() {
  const { data } = await supa.auth.getSession();
  const session = data.session;
  if (!session || !isAuthorized(session.user.email)) {
    window.location.href = 'certificados-login.html';
    return null;
  }
  return session;
}

async function loadCertificados() {
  const { data, error } = await supa
    .from('dataBase')
    .select('*');
  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

function calcularEstados(certificados) {
  const hoy = new Date();
  const limite = new Date(hoy.getTime() + 90 * 24 * 60 * 60 * 1000);
  let vigentes = 0, porVencer = 0, vencidos = 0;
  certificados.forEach(c => {
    if (!c.fecha_vencimiento) return;
    const fecha = new Date(c.fecha_vencimiento);
    if (fecha < hoy) vencidos++;
    else if (fecha <= limite) porVencer++;
    else vigentes++;
  });
  return { vigentes, porVencer, vencidos };
}

let certChart;
function renderChart(estados) {
  const ctx = document.getElementById('certChart');
  if (!ctx) return;
  if (certChart) certChart.destroy();

  certChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Vencidos', 'Por vencer', 'Vigentes'],
      datasets: [{
        data: [estados.vencidos, estados.porVencer, estados.vigentes],
        backgroundColor: ['#ef4444', '#facc15', '#22c55e']
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      maintainAspectRatio: false
    }
  });
}

async function loadWeather() {
  const locations = [
    { id: 'weatherTempSPS', lat: 15.5, lon: -88.033 },
    { id: 'weatherTempCholoma', lat: 15.6144, lon: -87.953 } // Choloma
  ];

  for (const loc of locations) {
    try {
      const resp = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true`
      );
      const data = await resp.json();
      const temp = data.current_weather?.temperature;
      const el = document.getElementById(loc.id);
      if (el && typeof temp === 'number') {
        el.textContent = `${Math.round(temp)}°C`;
      }
    } catch (e) {
      console.error('Weather error', loc.id, e);
    }
  }
}

function verificarVencimientos(certificados) {
  const hoy = new Date();
  const limite = new Date(hoy.getTime() + 90 * 24 * 60 * 60 * 1000);
  const proximos = certificados.filter(c => {
    if (!c.fecha_vencimiento) return false;
    const fecha = new Date(c.fecha_vencimiento);
    return fecha >= hoy && fecha <= limite;
  }).length;
  if (proximos > 0) {
    const mensaje = `\u26A0\uFE0F Atención: Hay ${proximos} certificado(s) próximos a vencer en los próximos 3 meses.`;
    if (window.Swal) {
      Swal.fire({ icon: 'warning', text: mensaje });
    } else {
      alert(mensaje);
    }
  }
}

function mostrarTab(tabId) {
  document.querySelectorAll('.tab-section').forEach(sec => sec.classList.add('hidden'));
  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.remove('hidden');
}

function setupSidebarNavigation() {
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', async e => {
      e.preventDefault();
      const tab = link.getAttribute('data-tab');
      mostrarTab(tab);

      // Carga dinámica según el tab seleccionado
      if (tab === 'dashboard') {
        const certificados = await loadCertificados();
        const estados = calcularEstados(certificados);
        renderChart(estados);
        document.getElementById('totalCert').textContent = certificados.length;
        loadWeather();
      }

      if (tab === 'labs') {
        const certificados = await loadCertificados();
        const laboratorios = [...new Set(certificados.map(c => c.laboratorio).filter(Boolean))];
        const list = document.getElementById('labList');
        list.innerHTML = '';
        laboratorios.forEach(lab => {
          const li = document.createElement('li');
          li.textContent = lab;
          list.appendChild(li);
        });
      }

      if (tab === 'vencer') {
        const certificados = await loadCertificados();
        renderTablaCertificados(certificados, 'vencerBody');
      }

      ['clv', 'cpp', 'cbpm'].forEach(tipo => {
        if (tab === tipo) {
          loadCertificados().then(certificados => {
            renderTablaCertificados(certificados, `${tipo}Body`);
          });
        }
      });
    });
  });
}

function setupLogout() {
  const btn = document.getElementById('logoutBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    await supa.auth.signOut();
    window.location.href = 'certificados-login.html';
  });
}

function setupSidebarToggle() {
  const btn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  if (!btn || !sidebar) return;

  btn.addEventListener('click', () => {
    if (sidebar.classList.contains('hidden')) {
      sidebar.classList.remove('hidden');
      requestAnimationFrame(() => sidebar.classList.add('open'));
    } else {
      sidebar.classList.remove('open');
      const hide = () => {
        sidebar.classList.add('hidden');
        sidebar.removeEventListener('transitionend', hide);
      };
      sidebar.addEventListener('transitionend', hide);
    }
  });
}

function setupThemeToggle() {
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
    btn?.querySelector('i')?.classList.replace('fa-moon', 'fa-sun');
  }
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-moon');
      icon.classList.toggle('fa-sun');
    }
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const session = await loadSession();
  if (!session) return;

  const name = session.user.user_metadata?.name || session.user.email;
  document.getElementById('userName').textContent = name;
  document.getElementById('headerName').textContent = name.split('@')[0];
  document.getElementById('profilePic').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

  setupSidebarNavigation();
  setupLogout();
  setupSidebarToggle();
  setupThemeToggle();

  // Cargar dashboard por defecto
  mostrarTab('dashboard');
  const certificados = await loadCertificados();
  const estados = calcularEstados(certificados);
  renderChart(estados);
  document.getElementById('totalCert').textContent = certificados.length;
  loadWeather();
  verificarVencimientos(certificados);
});
