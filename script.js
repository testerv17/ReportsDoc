let imagenes = []; // Almacena objetos con { file, descripcion }

function handleFileUpload(event) {
  const files = event.target.files;
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64 = e.target.result;

      const index = imagenes.length;
      imagenes.push({ file, descripcion: "", base64 });

      const div = document.createElement('div');
      div.className = "col-md-4";
      div.innerHTML = `
        <div class="card shadow-sm">
          <img src="${base64}" class="card-img-top" />
          <div class="card-body">
            <textarea class="form-control mb-2" placeholder="Descripción..." oninput="imagenes[${index}].descripcion = this.value"></textarea>
            <button class="btn btn-sm btn-outline-danger w-100" onclick="eliminarImagen(${index})">Eliminar</button>
          </div>
        </div>
      `;
      document.getElementById("preview").appendChild(div);
    };
    reader.readAsDataURL(file);
  }
}

function eliminarImagen(index) {
  imagenes.splice(index, 1);
  actualizarPreview();
}

function actualizarPreview() {
  const contenedor = document.getElementById("preview");
  contenedor.innerHTML = "";
  const copia = [...imagenes];
  imagenes = [];
  for (const img of copia) {
    handleFileUpload({ target: { files: [img.file] } });
  }
}

async function enviarReporte() {
  const equipo = document.getElementById("equipo").value.trim();
  const caracteristicas = document.getElementById("caracteristicas").value.trim();

  if (!equipo || !caracteristicas || imagenes.length === 0) {
    alert("Por favor completa todos los campos y sube al menos una imagen.");
    return;
  }

  const fecha = new Date().toISOString().split("T")[0];
  const storageRef = firebase.storage().ref();
  const dbRef = firebase.database().ref("reportes");
  const nuevoReporteRef = dbRef.push();
  const imagenesSubidas = [];

  for (let i = 0; i < imagenes.length; i++) {
    const img = imagenes[i];
    const nombreArchivo = `${equipo}_${Date.now()}_${i}.jpg`;
    const fotoRef = storageRef.child(`fotos/${nombreArchivo}`);

    await fotoRef.put(img.file);
    const url = await fotoRef.getDownloadURL();

    imagenesSubidas.push({
      url,
      descripcion: img.descripcion || "(sin descripción)",
    });
  }

  const datosReporte = {
    equipo,
    caracteristicas,
    fecha,
    imagenes: imagenesSubidas
  };

  await nuevoReporteRef.set(datosReporte);
  alert("✅ Reporte enviado correctamente");
  location.reload();
}
