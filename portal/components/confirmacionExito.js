
export function mostrarConfirmacionExito({
    titulo,
    mensaje,
    detalleEtiqueta = null,
    detalleValor = null,
    botonTexto = "Entendido"
}) {

    // Evitar que se acumulen confirmaciones abiertas.
    document
        .querySelectorAll(".cubika-confirmacion-overlay")
        .forEach(modal => modal.remove());

    const overlay = document.createElement("div");
    overlay.className =
        "cubika-modal-overlay cubika-confirmacion-overlay";

    const modal = document.createElement("div");
    modal.className =
        "cubika-modal cubika-confirmacion-modal";

    const body = document.createElement("div");
    body.className = "cubika-modal-body";

    const icono = document.createElement("div");
    icono.className = "cubika-confirmacion-icono";
    icono.textContent = "✓";

    const encabezado = document.createElement("h2");
    encabezado.textContent = titulo;

    const descripcion = document.createElement("p");
    descripcion.textContent = mensaje;

    body.append(icono, encabezado, descripcion);

    // Información adicional opcional.
    if (detalleEtiqueta && detalleValor) {

        const detalle = document.createElement("div");
        detalle.className = "cubika-confirmacion-detalle";

        const etiqueta = document.createElement("span");
        etiqueta.textContent = detalleEtiqueta;

        const valor = document.createElement("strong");
        valor.textContent = detalleValor;

        detalle.append(etiqueta, valor);
        body.appendChild(detalle);
    }

    const footer = document.createElement("div");
    footer.className = "cubika-modal-footer";

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn-cubika-green";
    boton.textContent = botonTexto;

    boton.addEventListener("click", () => {
        overlay.remove();
    });

    footer.appendChild(boton);

    modal.append(body, footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    boton.focus();
}
