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

searchInput.value = localStorage.getItem('search') || '';
filterPais.value = localStorage.getItem('filterPais') || '';
filterTipoProducto.value = localStorage.getItem('filterTipoProducto') || '';
filterTipoCertificado.value = localStorage.getItem('filterTipoCertificado') || '';

function rowClass(row) {
  const hoy = new Date();
  const limite = 30 * 24 * 60 * 60 * 1000;
  const vto = row.fecha_vencimiento ? new Date(row.fecha_vencimiento) : null;
  if (!vto) return '';
  const diff = vto - hoy;
  if (diff < 0) return 'expirado';
  if (diff <= limite) return 'por-vencer';
  return 'valido';
}

function stateIcon(row) {
  const cls = rowClass(row);
  if (cls === 'valido') return '🟢';
  if (cls === 'por-vencer') return '🟡';
  if (cls === 'expirado') return '🔴';
  return '';
}

function formatDate(str) {
  const d = new Date(str);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

function applyFilters() {
  const search = searchInput.value.toLowerCase();
  return certificados.filter(row => {
    const texto = `${row.laboratorio || ''} ${row.pais || ''} ${row.tipo_producto || ''} ${row.forma_farmaceutica || ''} ${row.tipo_certificado || ''}`.toLowerCase();
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

function renderTable() {
  const filtrados = applyFilters();
  const totalPages = Math.ceil(filtrados.length / pageSize) || 1;
  if (page > totalPages) page = totalPages;
  const paginated = filtrados.slice((page - 1) * pageSize, page * pageSize);
  tableBody.innerHTML = paginated.map(row => `
    <tr class="${rowClass(row)}">
      <td>${row.laboratorio || ''}</td>
      <td>${row.direccion || ''}</td>
      <td>${row.pais || ''}</td>
      <td>${row.tipo_producto || ''}</td>
      <td>${row.tipo_forma || ''}</td>
      <td>${row.tipo_certificado || ''}</td>
      <td>${row.fecha_emision ? formatDate(row.fecha_emision) : ''}</td>
      <td>${row.fecha_vencimiento ? formatDate(row.fecha_vencimiento) : ''}</td>
      <td>
        <button class="text-blue-600 mr-2" data-action="ver" data-url="${row.archivo_pdf}">Ver</button>
        <button class="text-green-600" data-action="descargar" data-url="${row.archivo_pdf}">Descargar</button>
      </td>
      <td class="text-lg">${row.activo ? '🟢 Activo' : '🔴 Inactivo'}</td>
      <td>${row.fecha_agregado ? formatDate(row.fecha_agregado) : ''}</td>
    </tr>
  `).join('');

  if (filtrados.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="12" class="text-center py-4">No hay certificados disponibles</td></tr>';
  }

  pageInfo.textContent = `${page} / ${totalPages}`;
  prevBtn.disabled = page === 1;
  nextBtn.disabled = page === totalPages;
}

tableBody.addEventListener('click', (e) => {
  if (e.target.dataset.action === 'ver') {
    window.open(e.target.dataset.url, '_blank', 'noopener,noreferrer');
  } else if (e.target.dataset.action === 'descargar') {
    const a = document.createElement('a');
    a.href = e.target.dataset.url;
    a.download = '';
    a.click();
  }
});

prevBtn.addEventListener('click', () => { page--; renderTable(); });
nextBtn.addEventListener('click', () => { page++; renderTable(); });

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

async function loadCertificados() {
  loadingDiv.textContent = 'Cargando...';
  const { data, error } = await supa
    .from('dataBase')
    .select('*')
    .order('fecha_emision', { ascending: false });
  loadingDiv.textContent = '';
  if (!error) {
    certificados = data || [];
    renderOptions();
    renderTable();
  }
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
});
