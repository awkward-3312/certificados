// main.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configuración Supabase
const supabaseUrl = 'https://yzdjpwdoutjeuuvxmqmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGpwd2RvdXRqZXV1dnhtcW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MTg2NTMsImV4cCI6MjA2NTA5NDY1M30.WgC0o1VLVCMTi2cKiGC6OIPHrwgjTA';
const supabase = createClient(supabaseUrl, supabaseKey);

const tableContainer = document.getElementById('certificatesTable');
const form = document.getElementById('certificateForm');
const modal = document.getElementById('certificateModal');
const addBtn = document.getElementById('addCertificateBtn');
const cancelBtn = document.getElementById('cancelBtn');
const searchInput = document.getElementById('searchInput');
const tipoProductoFilter = document.getElementById('filterTipoProducto');
const formaFilter = document.getElementById('filterForma');
const tipoCertificadoFilter = document.getElementById('filterTipoCertificado');

// Mostrar/Ocultar modal
addBtn.addEventListener('click', () => {
  form.reset();
  document.getElementById('certId').value = '';
  modal.classList.remove('hidden');
});

cancelBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Cargar certificados
async function loadCertificates() {
  const { data, error } = await supabase.from('dataBase').select('*');
  if (error) return console.error('Error cargando certificados:', error.message);

  renderTable(data);
  populateFilters(data);
}

// Renderizar tabla
function renderTable(data) {
  const searchTerm = searchInput.value.toLowerCase();
  const tipo = tipoProductoFilter.value;
  const forma = formaFilter.value;
  const cert = tipoCertificadoFilter.value;

  const filtered = data.filter(item => {
    return (
      (!searchTerm || item.labName?.toLowerCase().includes(searchTerm)) &&
      (!tipo || item.tipoProducto === tipo) &&
      (!forma || item.forma === forma) &&
      (!cert || item.tipoCertificado === cert)
    );
  });

  if (filtered.length === 0) {
    tableContainer.innerHTML = '<p class="empty">No hay certificados disponibles.</p>';
    return;
  }

  const rows = filtered.map(item => `
    <div class="card">
      <h3>${item.labName}</h3>
      <p><strong>Dirección:</strong> ${item.labAddress}</p>
      <p><strong>Producto:</strong> ${item.tipoProducto}</p>
      <p><strong>Forma:</strong> ${item.forma}</p>
      <p><strong>Certificado:</strong> ${item.tipoCertificado}</p>
      <p><strong>Emisión:</strong> ${item.fechaEmision}</p>
      <p><strong>Vencimiento:</strong> ${item.fechaVencimiento}</p>
      <div class="card-actions">
        <button onclick='editCertificate(${JSON.stringify(item)})'><i class="fas fa-edit"></i></button>
        <button onclick='deleteCertificate(${item.id})'><i class="fas fa-trash-alt"></i></button>
      </div>
    </div>
  `).join('');

  tableContainer.innerHTML = rows;
}

// Llenar selects de filtros
function populateFilters(data) {
  const tipos = [...new Set(data.map(i => i.tipoProducto))];
  const formas = [...new Set(data.map(i => i.forma))];
  const certificados = [...new Set(data.map(i => i.tipoCertificado))];

  fillSelect(tipoProductoFilter, tipos);
  fillSelect(formaFilter, formas);
  fillSelect(tipoCertificadoFilter, certificados);
}

function fillSelect(select, items) {
  const current = select.value;
  select.innerHTML = `<option value="">${select.getAttribute('aria-label').replace('Filtrar por ', '')}</option>`;
  items.forEach(i => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    select.appendChild(option);
  });
  select.value = current;
}

// Guardar (insertar o actualizar)
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const certId = document.getElementById('certId').value;
  const values = {
    labName: form.labName.value,
    labAddress: form.labAddress.value,
    tipoProducto: form.tipoProducto.value,
    forma: form.forma.value,
    tipoCertificado: form.tipoCertificado.value,
    fechaEmision: form.fechaEmision.value,
    fechaVencimiento: form.fechaVencimiento.value,
  };

  if (certId) {
    const { error } = await supabase.from('dataBase').update(values).eq('id', certId);
    if (error) return alert('Error actualizando: ' + error.message);
  } else {
    const { error } = await supabase.from('dataBase').insert([values]);
    if (error) return alert('Error agregando: ' + error.message);
  }

  modal.classList.add('hidden');
  loadCertificates();
});

// Editar
window.editCertificate = (item) => {
  document.getElementById('certId').value = item.id;
  form.labName.value = item.labName || '';
  form.labAddress.value = item.labAddress || '';
  form.tipoProducto.value = item.tipoProducto || '';
  form.forma.value = item.forma || '';
  form.tipoCertificado.value = item.tipoCertificado || '';
  form.fechaEmision.value = item.fechaEmision || '';
  form.fechaVencimiento.value = item.fechaVencimiento || '';
  modal.classList.remove('hidden');
};

// Eliminar
window.deleteCertificate = async (id) => {
  const confirmDelete = confirm('¿Eliminar este certificado?');
  if (!confirmDelete) return;

  const { error } = await supabase.from('dataBase').delete().eq('id', id);
  if (error) return alert('Error eliminando: ' + error.message);
  loadCertificates();
};

// Filtros en tiempo real
[searchInput, tipoProductoFilter, formaFilter, tipoCertificadoFilter].forEach(el =>
  el.addEventListener('input', loadCertificates)
);

// Iniciar
loadCertificates();
