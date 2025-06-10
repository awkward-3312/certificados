import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://yzdjpwdoutjeuuvxmqmv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGpwd2RvdXRqZXV1dnhtcW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MTg2NTMsImV4cCI6MjA2NTA5NDY1M30.WgC0o1VLVCMTi2cKiGC6OIPHrwgjTA';
const supabase = createClient(supabaseUrl, supabaseKey);

const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const tableBody = document.getElementById('certBody');

let certificates = [];

async function fetchCertificates() {
  const { data, error } = await supabase.from('dataBase').select('*');
  if (error) {
    console.error('Error loading certificates:', error.message);
    return;
  }
  certificates = data || [];
  renderTable();
}

function getStatus(dateStr) {
  const today = new Date();
  const exp = new Date(dateStr);
  const diff = (exp - today) / (1000 * 60 * 60 * 24);
  if (isNaN(diff)) return 'unknown';
  if (diff < 0) return 'expired';
  if (diff <= 60) return 'expiring';
  return 'valid';
}

function renderTable() {
  const term = searchInput.value.toLowerCase();
  const status = statusFilter.value;

  const filtered = certificates.filter(item => {
    const matchesSearch =
      !term ||
      item.labName?.toLowerCase().includes(term) ||
      item.tipoCertificado?.toLowerCase().includes(term);
    const itemStatus = getStatus(item.fechaVencimiento);
    const matchesStatus = !status || itemStatus === status;
    return matchesSearch && matchesStatus;
  });

  tableBody.innerHTML = filtered.map(item => {
    const state = getStatus(item.fechaVencimiento);
    const color =
      state === 'valid'
        ? 'text-green-500'
        : state === 'expiring'
        ? 'text-yellow-500'
        : 'text-red-500';
    const pdf = item.pdfUrl || item.pdf_url || '';
    const pdfCell = pdf
      ? `<a href="${pdf}" target="_blank" class="text-blue-600 underline">PDF</a>`
      : '';

    return `
      <tr>
        <td class="px-3 py-2 text-center"><i class="fas fa-circle ${color}"></i></td>
        <td class="px-3 py-2">${item.tipoCertificado || ''}</td>
        <td class="px-3 py-2">${item.labName || ''}</td>
        <td class="px-3 py-2">${item.tipoProducto || ''}</td>
        <td class="px-3 py-2">${item.forma || ''}</td>
        <td class="px-3 py-2">${item.fechaVencimiento || ''}</td>
        <td class="px-3 py-2">${pdfCell}</td>
      </tr>`;
  }).join('');
}

searchInput.addEventListener('input', renderTable);
statusFilter.addEventListener('change', renderTable);

fetchCertificates();

