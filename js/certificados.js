export function renderPorVencer(certificados, containerId = 'vencerBody') {
    const container = document.getElementById(containerId);
    if (!container) return;
  
    const hoy = new Date();
    const limite = new Date(hoy.getTime() + 90 * 24 * 60 * 60 * 1000);
    const proximos = certificados
      .filter(c => c.activo && c.fecha_vencimiento)
      .filter(c => {
        const v = new Date(c.fecha_vencimiento);
        return v >= hoy && v <= limite;
      })
      .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));
  
    container.innerHTML = proximos.length
      ? `<table class="table-auto w-full text-sm">
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
            ${proximos.map(row => `
              <tr>
                <td class="px-3 py-2">${row.laboratorio}</td>
                <td class="px-3 py-2">${row.pais}</td>
                <td class="px-3 py-2">${row.tipo_certificado}</td>
                <td class="px-3 py-2">${formatDate(row.fecha_vencimiento)}</td>
                <td class="px-3 py-2"><a href="${row.archivo_pdf}" target="_blank" class="text-blue-600 underline">Ver</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>`
      : '<p class="text-sm">No hay certificados próximos a vencer.</p>';
  }
  
  export function renderTipoCertificado(certificados, tipo, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
  
    const filtrados = certificados.filter(c => c.tipo_certificado?.toLowerCase() === tipo.toLowerCase());
  
    container.innerHTML = filtrados.length
      ? `<table class="table-auto w-full text-sm">
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
        </table>`
      : '<p class="text-sm">No hay certificados de este tipo.</p>';
  }
  
  function formatDate(str) {
    const d = new Date(str);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
  }
  