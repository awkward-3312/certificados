export async function renderLaboratorios(certificados, containerId = 'labList') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const labs = [...new Set(certificados.map(c => c.laboratorio).filter(Boolean))].sort();
  
    container.innerHTML = labs.length
      ? labs.map(lab => `<li>${lab}</li>`).join('')
      : '<li>No hay laboratorios registrados</li>';
  }