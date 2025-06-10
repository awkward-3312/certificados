const supabaseUrl = 'https://yzdjpwdoutjeuuvxmqmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGpwd2RvdXRqZXV1dnhtcW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MTg2NTMsImV4cCI6MjA2NTA5NDY1M30.WgC0o1VLVCMTi2cKiGC6OIPHrwgjTA.'; // API Key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let data = [];
let editingId = null;

async function fetchCertificates() {
  const { data: rows, error } = await supabase.from('certificados').select('*');
  if (error) {
    alert('Error al obtener datos');
    console.error(error);
    return;
  }
  data = rows;
  populateFilters();
  renderTable();
}

function escapeHTML(str) {
  return str ? str.replace(/[&<>\'\"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag])) : '';
}

function renderTable() {
  const tbody = document.querySelector('#certTable tbody');
  tbody.innerHTML = '';
  const filters = {
    lab: document.getElementById('labFilter').value,
    type: document.getElementById('typeFilter').value,
    form: document.getElementById('formFilter').value,
    cert: document.getElementById('certFilter').value
  };
  data.filter(row => {
    return (!filters.lab || row.lab_name === filters.lab) &&
           (!filters.type || row.product_type === filters.type) &&
           (!filters.form || row.pharmaceutical_form === filters.form) &&
           (!filters.cert || row.certificate_type === filters.cert);
  }).forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHTML(row.lab_name)}</td>
      <td>${escapeHTML(row.address)}</td>
      <td>${escapeHTML(row.product_type)}</td>
      <td>${escapeHTML(row.pharmaceutical_form)}</td>
      <td>${escapeHTML(row.certificate_type)}</td>
      <td>${escapeHTML(row.issue_date)}</td>
      <td>${escapeHTML(row.expiry_date)}</td>
      <td>
        <button class="actions-btn edit" data-id="${row.id}" aria-label="Editar"><i class="fa fa-edit"></i></button>
        <button class="actions-btn delete" data-id="${row.id}" aria-label="Eliminar"><i class="fa fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function populateFilters() {
  const labs = new Set();
  const types = new Set();
  const forms = new Set();
  const certs = new Set();
  data.forEach(row => {
    labs.add(row.lab_name);
    types.add(row.product_type);
    forms.add(row.pharmaceutical_form);
    certs.add(row.certificate_type);
  });
  fillSelect('labFilter', labs);
  fillSelect('typeFilter', types);
  fillSelect('formFilter', forms);
  fillSelect('certFilter', certs);
}

function fillSelect(id, values) {
  const select = document.getElementById(id);
  const current = select.value;
  const first = select.options[0].textContent;
  select.innerHTML = `<option value="">${first}</option>`;
  [...values].sort().forEach(v => {
    select.innerHTML += `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`;
  });
  select.value = current;
}

// Event listeners

document.getElementById('addBtn').addEventListener('click', () => openModal());
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('certForm').addEventListener('submit', saveCert);
['labFilter','typeFilter','formFilter','certFilter'].forEach(id => {
  document.getElementById(id).addEventListener('change', renderTable);
});

document.querySelector('#certTable tbody').addEventListener('click', e => {
  if (e.target.closest('.edit')) {
    const id = e.target.closest('button').dataset.id;
    editCert(id);
  } else if (e.target.closest('.delete')) {
    const id = e.target.closest('button').dataset.id;
    deleteCert(id);
  }
});

function openModal(cert = null) {
  const modal = document.getElementById('modal');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modal.querySelector('#modalTitle').textContent = cert ? 'Editar Certificado' : 'Agregar Certificado';
  document.getElementById('certForm').reset();
  editingId = cert ? cert.id : null;
  if (cert) {
    document.getElementById('lab').value = cert.lab_name;
    document.getElementById('address').value = cert.address;
    document.getElementById('productType').value = cert.product_type;
    document.getElementById('pharmaForm').value = cert.pharmaceutical_form;
    document.getElementById('certType').value = cert.certificate_type;
    document.getElementById('issueDate').value = cert.issue_date;
    document.getElementById('expiryDate').value = cert.expiry_date;
  }
  modal.querySelector('.modal-content').focus();
}

function closeModal() {
  document.getElementById('modal').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  editingId = null;
}

async function saveCert(event) {
  event.preventDefault();
  const fields = {
    lab_name: document.getElementById('lab').value.trim(),
    address: document.getElementById('address').value.trim(),
    product_type: document.getElementById('productType').value.trim(),
    pharmaceutical_form: document.getElementById('pharmaForm').value.trim(),
    certificate_type: document.getElementById('certType').value.trim(),
    issue_date: document.getElementById('issueDate').value,
    expiry_date: document.getElementById('expiryDate').value
  };
  if (editingId) {
    const { error } = await supabase.from('certificados').update(fields).eq('id', editingId);
    if (error) return alert('Error al actualizar');
  } else {
    const { error } = await supabase.from('certificados').insert(fields);
    if (error) return alert('Error al insertar');
  }
  closeModal();
  fetchCertificates();
}

function editCert(id) {
  const cert = data.find(r => String(r.id) === String(id));
  if (cert) openModal(cert);
}

async function deleteCert(id) {
  if (!confirm('¿Eliminar certificado?')) return;
  const { error } = await supabase.from('certificados').delete().eq('id', id);
  if (error) {
    alert('Error al eliminar');
  } else {
    fetchCertificates();
  }
}

fetchCertificates();
