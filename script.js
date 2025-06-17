document.getElementById('fotos').addEventListener('change', mostrarPreview);

function mostrarPreview(event) {
  const previewContainer = document.getElementById('previewContainer');
  previewContainer.innerHTML = '';
  Array.from(event.target.files).slice(0, 5).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'img-fluid mb-2 rounded shadow';
      previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

async function subirImagenAStorage(file, equipo, index) {
  const storageRef = firebase.storage().ref();
  const fileRef = storageRef.child(`reportes/${equipo}_${Date.now()}_${index}.jpg`);
  await fileRef.put(file);
  return await fileRef.getDownloadURL();
}

async function guardarReporteEnFirebase(nombre, fecha, caracteristicas, urlsFotos) {
  const dbRef = firebase.database().ref("reportes");
  const nuevoReporte = dbRef.push();
  await nuevoReporte.set({
    equipo: nombre,
    fecha: fecha,
    caracteristicas: caracteristicas,
    fotos: urlsFotos
  });
}

async function generarWord() {
  const nombre = document.getElementById('nombreEquipo').value;
  const fecha = document.getElementById('fecha').value;
  const caracteristicas = document.getElementById('caracteristicas').value;
  const fotos = Array.from(document.getElementById('fotos').files).slice(0, 5);

  const urlsFotos = [];
  for (let i = 0; i < fotos.length; i++) {
    const url = await subirImagenAStorage(fotos[i], nombre, i);
    urlsFotos.push(url);
  }

  await guardarReporteEnFirebase(nombre, fecha, caracteristicas, urlsFotos);
  alert("Reporte guardado exitosamente en Firebase.");
}
