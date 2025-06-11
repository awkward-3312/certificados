// dashboard.js actualizado con todas las mejoras

function isAuthorized(email) {
  return (window.ALLOWED_EMAILS || []).includes((email || '').toLowerCase());
}

let certificados = [];
let page = 1;
const pageSize = 10;

const searchInput = document.getElementById('search');
const filterPais = document.getElementById('filterPais');
const filterTipoProducto = document.getElementById('filterTipoProducto');
const filterTipoCertificado = document.getElementById('filterTipoCertificado');
const tableBody = document.getElementById('tableBody');
const loadingDiv = document.getElementById('loading');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const logoutBtn = document.getElementById('logoutBtn');
const exportBtn = document.getElementById('exportBtn');
const statCards = document.getElementById('statCards');

// Tabs
const tabs = {
  dashboard: document.getElementById('tab-dashboard'),
  labs: document.getElementById('tab-labs'),
  vencer: document.getElementById('tab-vencer'),
  clv: document.getElementById('tab-clv'),
  cpp: document.getElementById('tab-cpp'),
  cbpm: document.getElementById('tab-cbpm')
};
const labList = document.getElementById('labList');
const vencerBody = document.getElementById('vencerBody');
const vencerLoading = document.getElementById('vencerLoading');

searchInput.value = localStorage.getItem('search') || '';
filterPais.value = localStorage.getItem('filterPais') || '';
filterTipoProducto.value = localStorage.getItem('filterTipoProducto') || '';
filterTipoCertificado.value = localStorage.getItem('filterTipoCertificado') || '';

function formatDate(str) {
  const d = new Date(str);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

function applyFilters() {
  const search = searchInput.value.toLowerCase();
  return certificados.filter(row => {
    const texto = `${row.laboratorio || ''} ${row.pais || ''} ${row.tipo_producto || ''} ${row.tipo_forma || ''} ${row.tipo_certificado || ''}`.toLowerCase();
    const matchSearch = !search || texto.includes(search);
    const matchPais = !filterPais.value || row.pais === filterPais.value;
    const matchProd = !filterTipoProducto.value || row.tipo_producto === filterTipoProducto.value;
    const matchCert = !filterTipoCertificado.value || row.tipo_certificado === filterTipoCertificado.value;
    return matchSearch && matchPais && matchProd && matchCert;
  });
}

function renderOptions() {
  const paises = [...new Set(certificados.map(r => r.pais).filter(Boolean))];
  filterPais.innerHTML = '<option value="">Todos los países</option>' +
    paises.map(p => `<option value="${p}">${p}</option>`).join('');
  const productos = [...new Set(certificados.map(r => r.tipo_producto).filter(Boolean))];
  filterTipoProducto.innerHTML = '<option value="">Todos los productos</option>' +
    productos.map(p => `<option value="${p}">${p}</option>`).join('');
  const certificadosTipos = [...new Set(certificados.map(r => r.tipo_certificado).filter(Boolean))];
  filterTipoCertificado.innerHTML = '<option value="">Todos los certificados</option>' +
    certificadosTipos.map(c => `<option value="${c}">${c}</option>`).join('');
  filterPais.value = localStorage.getItem('filterPais') || '';
  filterTipoProducto.value = localStorage.getItem('filterTipoProducto') || '';
  filterTipoCertificado.value = localStorage.getItem('filterTipoCertificado') || '';
}

function renderStatCards() {
  const total = certificados.length;
  const activos = certificados.filter(c => c.activo).length;
  const vencidos = certificados.filter(c => c.fecha_vencimiento && new Date(c.fecha_vencimiento) < new Date()).length;
  const porVencer = certificados.filter(c => {
    if (!c.fecha_vencimiento) return false;
    const vto = new Date(c.fecha_vencimiento);
    const hoy = new Date();
    const limite = new Date(hoy.getTime() + 90 * 24 * 60 * 60 * 1000);
    return vto >= hoy && vto <= limite;
  }).length;

  statCards.innerHTML = `
    <div class="bg-white shadow rounded p-4 text-center">
      <h3 class="text-lg font-semibold text-gray-600">Total</h3>
      <p class="text-2xl font-bold text-blue-600">${total}</p>
    </div>
    <div class="bg-white shadow rounded p-4 text-center">
      <h3 class="text-lg font-semibold text-gray-600">Activos</h3>
      <p class="text-2xl font-bold text-green-600">${activos}</p>
    </div>
    <div class="bg-white shadow rounded p-4 text-center">
      <h3 class="text-lg font-semibold text-gray-600">Por Vencer</h3>
      <p class="text-2xl font-bold text-yellow-600">${porVencer}</p>
    </div>
    <div class="bg-white shadow rounded p-4 text-center">
      <h3 class="text-lg font-semibold text-gray-600">Vencidos</h3>
      <p class="text-2xl font-bold text-red-600">${vencidos}</p>
    </div>
  `;
}

function renderTable() {
  const filtrados = applyFilters();
  const totalPages = Math.ceil(filtrados.length / pageSize) || 1;
  if (page > totalPages) page = totalPages;
  const paginated = filtrados.slice((page - 1) * pageSize, page * pageSize);

  tableBody.innerHTML = paginated.map(row => `
    <tr>
      <td class="px-3 py-2">${row.laboratorio || ''}</td>
      <td class="px-3 py-2">${row.direccion || ''}</td>
      <td class="px-3 py-2">${row.pais || ''}</td>
      <td class="px-3 py-2">${row.tipo_producto || ''}</td>
      <td class="px-3 py-2">${row.tipo_formafarmaceutica || ''}</td>
      <td class="px-3 py-2">${row.tipo_forma || ''}</td>
      <td class="px-3 py-2">${row.tipo_certificado || ''}</td>
      <td class="px-3 py-2">${formatDate(row.fecha_emision)}</td>
      <td class="px-3 py-2">${formatDate(row.fecha_vencimiento)}</td>
      <td class="px-3 py-2"><a href="${row.archivo_pdf}" target="_blank" class="text-blue-600 underline">Ver</a></td>
      <td class="px-3 py-2">${row.activo ? 'Activo' : 'Inactivo'}</td>
      <td class="px-3 py-2">${formatDate(row.fecha_agregado)}</td>
    </tr>
  `).join('');

  if (filtrados.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="12" class="text-center py-4">No hay certificados disponibles</td></tr>';
  }

  pageInfo.textContent = `${page} / ${totalPages}`;
  prevBtn.disabled = page === 1;
  nextBtn.disabled = page === totalPages;
}

function exportToExcel() {
  const ws = XLSX.utils.json_to_sheet(certificados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Certificados");
  XLSX.writeFile(wb, "certificados.xlsx");
}

function renderLabs() {
  const labs = [...new Set(certificados.map(c => c.laboratorio).filter(Boolean))].sort();
  labList.innerHTML = labs.length ? labs.map(l => `<li>${l}</li>`).join('') : '<li>No hay laboratorios registrados</li>';
}

function renderVencer() {
  vencerLoading.textContent = 'Cargando...';
  const hoy = new Date();
  const limite = new Date(hoy.getTime() + 90 * 24 * 60 * 60 * 1000);
  const proximos = certificados
    .filter(c => c.activo && c.fecha_vencimiento)
    .filter(c => {
      const v = new Date(c.fecha_vencimiento);
      return v >= hoy && v <= limite;
    })
    .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));

  vencerBody.innerHTML = proximos.length
    ? proximos.map(row => `
        <tr>
          <td class="px-3 py-2">${row.laboratorio}</td>
          <td class="px-3 py-2">${row.pais}</td>
          <td class="px-3 py-2">${row.tipo_certificado}</td>
          <td class="px-3 py-2">${formatDate(row.fecha_vencimiento)}</td>
          <td class="px-3 py-2"><a href="${row.archivo_pdf}" target="_blank" class="text-blue-600 underline">Ver</a></td>
        </tr>
      `).join('')
    : '<tr><td colspan="5" class="text-center py-4">No hay certificados próximos a vencer</td></tr>';
  vencerLoading.textContent = '';
}

function renderTipoCertificadoTab(tipo, containerId) {
  const container = document.getElementById(containerId);
  const filtrados = certificados.filter(c => c.tipo_certificado === tipo);

  container.innerHTML = `
    <table class="table-auto w-full divide-y divide-gray-200 text-sm">
      <thead class="bg-gray-200 text-gray-700">
        <tr>
          <th class="px-3 py-2">Laboratorio</th>
          <th class="px-3 py-2">País</th>
          <th class="px-3 py-2">Tipo de Certificado</th>
          <th class="px-3 py-2">Vencimiento</th>
          <th class="px-3 py-2">PDF</th>
        </tr>
      </thead>
      <tbody>
        ${filtrados.map(c => `
          <tr>
            <td class="px-3 py-2">${c.laboratorio}</td>
            <td class="px-3 py-2">${c.pais}</td>
            <td class="px-3 py-2">${c.tipo_certificado}</td>
            <td class="px-3 py-2">${formatDate(c.fecha_vencimiento)}</td>
            <td class="px-3 py-2"><a href="${c.archivo_pdf}" target="_blank" class="text-blue-600 underline">Ver</a></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function showTab(tab) {
  Object.keys(tabs).forEach(k => tabs[k].classList.add('hidden'));
  tabs[tab].classList.remove('hidden');

  if (tab === 'labs') renderLabs();
  if (tab === 'vencer') renderVencer();
  if (tab === 'clv') renderTipoCertificadoTab('CLV', 'tab-clv');
  if (tab === 'cpp') renderTipoCertificadoTab('CPP', 'tab-cpp');
  if (tab === 'cbpm') renderTipoCertificadoTab('CBPM', 'tab-cbpm');
}

async function loadCertificados() {
  loadingDiv.textContent = 'Cargando...';
  const { data, error } = await supa.from('dataBase').select('*').order('fecha_emision', { ascending: false });
  loadingDiv.textContent = '';
  if (error) {
    console.error('Error al cargar certificados:', error);
    return;
  }
  certificados = data || [];
  renderOptions();
  renderTable();
  renderStatCards();
}

async function checkSession() {
  const { data } = await supa.auth.getSession();
  const session = data.session;
  if (!session || !isAuthorized(session.user.email)) {
    window.location.href = 'certificados-login.html';
    return;
  }
  await loadCertificados();
}

document.addEventListener('DOMContentLoaded', () => {
  checkSession();
  showTab('dashboard');

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('bg-blue-600'));
      link.classList.add('bg-blue-600');
      showTab(link.dataset.tab);
    });
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await supa.auth.signOut();
        window.location.href = 'certificados-login.html';
      } catch (err) {
        console.error('Error al cerrar sesión:', err);
        alert('No se pudo cerrar sesión. Intenta nuevamente.');
      }
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', exportToExcel);
  }

  searchInput.addEventListener('input', () => {
    localStorage.setItem('search', searchInput.value);
    page = 1;
    renderTable();
  });
  filterPais.addEventListener('change', () => {
    localStorage.setItem('filterPais', filterPais.value);
    page = 1;
    renderTable();
  });
  filterTipoProducto.addEventListener('change', () => {
    localStorage.setItem('filterTipoProducto', filterTipoProducto.value);
    page = 1;
    renderTable();
  });
  filterTipoCertificado.addEventListener('change', () => {
    localStorage.setItem('filterTipoCertificado', filterTipoCertificado.value);
    page = 1;
    renderTable();
  });
});
