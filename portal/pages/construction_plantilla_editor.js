import {

    DOCUMENT_VARIABLES

}
from "../modules/construccion/documentVariables.js";

import { constructorasService }
from "../services/constructorasService.js";

import { cargosService }
from "../services/cargosService.js";


import {

    validarPlantilla

}
from "../modules/construccion/documentEngine.js";



import { plantillasDocumentoService }
from "../services/plantillasDocumentoService.js";

import {
    navigate
}
from "../router.js";




function inicializarSelectorConChecks({
    containerId,
    buttonId,
    panelId,
    allId,
    optionClass,
    allLabel
}) {
    const container = document.getElementById(containerId);
    const button = document.getElementById(buttonId);
    const panel = document.getElementById(panelId);
    const checkboxTodos = document.getElementById(allId);

    if (!container || !button || !panel || !checkboxTodos) return;

    const opciones = Array.from(
        panel.querySelectorAll(`.${optionClass}`)
    );

    function actualizarResumen() {
        const seleccionadas = opciones.filter(opcion => opcion.checked);

        if (seleccionadas.length === 0) {
            checkboxTodos.checked = true;
            button.innerHTML = `${allLabel} <span>▾</span>`;
        } else {
            checkboxTodos.checked = false;
            button.innerHTML =
                `${seleccionadas.length} seleccionada(s) <span>▾</span>`;
        }
    }

    button.addEventListener("click", () => {
        const abrir = panel.hidden;

        // Cerrar los otros selectores personalizados del editor.
        document.querySelectorAll(".cubika-multi-panel").forEach(otro => {
            if (otro !== panel) otro.hidden = true;
        });

        document.querySelectorAll(".cubika-multi-trigger").forEach(otro => {
            if (otro !== button) otro.setAttribute("aria-expanded", "false");
        });

        panel.hidden = !abrir;
        button.setAttribute("aria-expanded", String(abrir));
    });

    checkboxTodos.addEventListener("change", () => {
        if (checkboxTodos.checked) {
            opciones.forEach(opcion => {
                opcion.checked = false;
            });
        } else if (!opciones.some(opcion => opcion.checked)) {
            checkboxTodos.checked = true;
        }

        actualizarResumen();
    });

    opciones.forEach(opcion => {
        opcion.addEventListener("change", () => {
            const haySeleccionadas = opciones.some(item => item.checked);

            checkboxTodos.checked = !haySeleccionadas;
            actualizarResumen();
        });
    });

    // Cerrar al hacer clic fuera del selector.
    container.addEventListener("focusout", event => {
        if (!container.contains(event.relatedTarget)) {
            panel.hidden = true;
            button.setAttribute("aria-expanded", "false");
        }
    });

    actualizarResumen();
}



export async function renderConstructionPlantillaEditor(id = null) {

    
    let plantilla = null;

    if (id) {

        plantilla =
            await plantillasDocumentoService.getById(id);

    }


    
        const [
            constructoras,
            cargos,
            constructorasSeleccionadas,
            cargosSeleccionados
        ] = await Promise.all([
            constructorasService.getAll(),
            cargosService.getAll(),
            id
                ? plantillasDocumentoService.getConstructorasIds(id)
                : Promise.resolve([]),
            id
                ? plantillasDocumentoService.getCargosIds(id)
                : Promise.resolve([])
        ]);



    const content =
        document.querySelector(".content");
        


    content.innerHTML = `
        
        <div class="page-header plantilla-editor-toolbar">

    <div class="editor-header">
    
                    <h1>
    
                        ${id
                            ? "Editar Plantilla"
                            : "Nueva Plantilla"}
    
                    </h1>
    
                    <p> <br>
    
                        Configure la información general y el contenido
                        del documento.
    
                    </p>
    
            </div>




            <div>

                <button
                    id="btnGuardarPlantilla"
                    class="btn-primary">

                    Guardar Plantilla

                </button>

            </div>

        </div>


        <div class="editor-documento">

            <div
                id="editorError"
                class="form-error"
                style="display:none;">

            </div>


            <div class="editor-layout">


                <!-- ====================================== -->
                <!-- COLUMNA PRINCIPAL -->
                <!-- ====================================== -->

                <div class="editor-main">

 <div class="editor-section">

    <h2 style="margin-top:10px;">
        Datos Generales
    </h2>

    <!-- FILA 1: Nombre y Tipo de Plantilla -->
    <div class="form-grid plantilla-fila">

        <div class="form-group">
            <label style="margin-top:10px;">
                Nombre
            </label>

            <input
                id="nombre"
                class="cubika-input"
                type="text"
                value="${plantilla?.nombre ?? ""}">
        </div>

        <div class="form-group">
            <label style="margin-top:10px;">
                Tipo Documento
            </label>

            <select
                id="tipo_documento"
                class="cubika-select">

                <option value="" disabled
                    ${!plantilla?.tipo_documento ? "selected" : ""}>
                    Seleccionar tipo de plantilla
                </option>

                <option value="CONTRATO"
                    ${String(plantilla?.tipo_documento ?? "").toUpperCase() === "CONTRATO" ? "selected" : ""}>
                    CONTRATO
                </option>

                <option value="ANEXO"
                    ${String(plantilla?.tipo_documento ?? "").toUpperCase() === "ANEXO" ? "selected" : ""}>
                    ANEXO
                </option>

                <option value="COMPLEMENTO"
                    ${String(plantilla?.tipo_documento ?? "").toUpperCase() === "COMPLEMENTO" ? "selected" : ""}>
                    COMPLEMENTO
                </option>

                <option value="FINIQUITO"
                    ${String(plantilla?.tipo_documento ?? "").toUpperCase() === "FINIQUITO" ? "selected" : ""}>
                    FINIQUITO
                </option>

                <option value="CERTIFICADO"
                    ${String(plantilla?.tipo_documento ?? "").toUpperCase() === "CERTIFICADO" ? "selected" : ""}>
                    CERTIFICADO
                </option>

            </select>
        </div>

    </div>

    <!-- FILA 2: Constructoras y Cargos -->
    <div class="form-grid plantilla-fila">

        <div class="form-group">
            
            <label style="margin-top:10px;">
                Constructoras autorizadas
            </label>

            <div
                class="cubika-multi-dropdown"
                id="selectorConstructoras">

                <button
                    type="button"
                    class="cubika-select cubika-multi-trigger"
                    id="btnConstructoras"
                    aria-expanded="false">

                    Todas las constructoras

                </button>

                <div
                    class="cubika-multi-panel"
                    id="panelConstructoras"
                    hidden>

                    <label class="cubika-multi-option">

                        <input
                            type="checkbox"
                            id="todasConstructoras"
                            ${constructorasSeleccionadas.length === 0 ? "checked" : ""}>

                        <span>Todas las constructoras</span>

                    </label>

                    <div class="cubika-multi-divider"></div>

                    ${constructoras.map(constructora => `
                        <label class="cubika-multi-option">

                            <input
                                type="checkbox"
                                class="opcion-constructora"
                                value="${constructora.id}"
                                ${constructorasSeleccionadas.includes(constructora.id) ? "checked" : ""}>

                            <span>${constructora.nombre}</span>

                        </label>
                    `).join("")}

                </div>

            </div>

        </div>

        <div class="form-group">

            <label style="margin-top:10px;">
                Cargos autorizados
            </label>

            <div
                class="cubika-multi-dropdown"
                id="selectorCargos">

                <button
                    type="button"
                    class="cubika-select cubika-multi-trigger"
                    id="btnCargos"
                    aria-expanded="false">

                    Todos los cargos

                </button>

                <div
                    class="cubika-multi-panel"
                    id="panelCargos"
                    hidden>

                    <label class="cubika-multi-option">

                        <input
                            type="checkbox"
                            id="todosCargos"
                            ${cargosSeleccionados.length === 0 ? "checked" : ""}>

                        <span>Todos los cargos</span>

                    </label>

                    <div class="cubika-multi-divider"></div>

                    ${cargos.map(cargo => `
                        <label class="cubika-multi-option">

                            <input
                                type="checkbox"
                                class="opcion-cargo"
                                value="${cargo.id}"
                                ${cargosSeleccionados.includes(cargo.id) ? "checked" : ""}>

                            <span>${cargo.nombre}</span>

                        </label>
                    `).join("")}

                </div>

            </div>

        </div>

    </div>

    <!-- DESCRIPCIÓN: ancho completo -->
    <div class="form-group" style="margin-top:16px;">

        <label>
            Descripción
        </label>

        <input
            id="descripcion"
            class="cubika-input"
            type="text"
            value="${plantilla?.descripcion ?? ""}">

    </div>

</div>


<!-- FORMATO DE CONTENIDO: HTML o DOCX -->
<div class="editor-section plantilla-formato-section">

    <div
        class="cubika-tabs plantilla-formato-tabs"
        role="tablist"
        aria-label="Formato de plantilla">

        <button
            type="button"
            id="tabContenidoHTML"
            class="cubika-tab ${
                !plantilla?.formato_contenido ||
                plantilla?.formato_contenido === "HTML"
                    ? "active"
                    : ""
            }"
            role="tab"
            aria-selected="${
                !plantilla?.formato_contenido ||
                plantilla?.formato_contenido === "HTML"
                    ? "true"
                    : "false"
            }"
            aria-controls="panelContenidoHTML">
            Contenido
        </button>

        <button
            type="button"
            id="tabContenidoDOCX"
            class="cubika-tab ${
                plantilla?.formato_contenido === "DOCX"
                    ? "active"
                    : ""
            }"
            role="tab"
            aria-selected="${
                plantilla?.formato_contenido === "DOCX"
                    ? "true"
                    : "false"
            }"
            aria-controls="panelContenidoDOCX">
            Cargar
        </button>

    </div>

    <input
        type="hidden"
        id="formato_contenido"
        value="${
            plantilla?.formato_contenido === "DOCX"
                ? "DOCX"
                : "HTML"
        }">

    <!-- PANEL HTML: conserva el editor existente -->
    <div
        id="panelContenidoHTML"
        role="tabpanel"
        aria-labelledby="tabContenidoHTML"
        ${
            plantilla?.formato_contenido === "DOCX"
                ? "hidden"
                : ""
        }>

        <h2>Contenido</h2>

        <textarea
            id="contenido"
            class="cubika-input"
            style="
                margin-top:10px;
                min-height:650px;
                resize:vertical;
                font-family:Consolas, monospace;
                line-height:1.6;
            "
        >${plantilla?.contenido ?? ""}</textarea>

    </div>

    <!-- PANEL DOCX -->
    <div
        id="panelContenidoDOCX"
        role="tabpanel"
        aria-labelledby="tabContenidoDOCX"
        ${
            plantilla?.formato_contenido !== "DOCX"
                ? "hidden"
                : ""
        }>

        
<div class="editor-section plantilla-docx-card">

    <h2>Documento Word</h2>

    <p style="margin:10px 0;">
        Selecciona un documento Word (.docx) como plantilla.
        El documento generado se entregará para descargar.
    </p>

    
    <!-- VISOR DEL DOCUMENTO ACTUAL -->
    <div
        id="archivoDocxActual"
        style="margin-top:16px;">
    
        ${
            plantilla?.formato_contenido === "DOCX" &&
            plantilla?.archivo_docx_path
                ? `
                    <div class="plantilla-docx-existente">
    
                        <div class="plantilla-docx-info">
                            <strong>Documento cargado</strong>
                            <span>
                                ${plantilla.archivo_docx_path
                                    .split("/")
                                    .pop()
                                    .replace(/^\d+-/, "")}
                            </span>
                        </div>
    
                        <button
                            type="button"
                            id="btnEditarArchivoDocx"
                            class="btn-secondary">
                            Editar
                        </button>
    
                    </div>
                `
                : `
                    <p>
                        Aún no existe un documento Word asociado.
                    </p>
                `
        }
    
    </div>
    
    <!-- SELECTOR: OCUPA EL LUGAR DEL VISOR AL EDITAR -->
    <div
        id="selectorArchivoDocx"
        style="margin-top:16px; ${
            plantilla?.formato_contenido === "DOCX" &&
            plantilla?.archivo_docx_path
                ? "display:none;"
                : ""
        }">
    
        <div class="form-group">
    
            <label for="archivoDocx">
                Seleccionar documento Word (.docx)
            </label>
    
            <input
                id="archivoDocx"
                class="cubika-input"
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
    
        </div>
    
        <button
            type="button"
            id="btnCancelarEdicionDocx"
            class="btn-secondary"
            style="${
                plantilla?.formato_contenido === "DOCX" &&
                plantilla?.archivo_docx_path
                    ? ""
                    : "display:none;"
            }">
            Cancelar
        </button>
    
    </div>
        
    </div>


    </div>

</div>



</div>


                <!-- ====================================== -->
                <!-- SIDEBAR -->
                <!-- ====================================== -->

                
                <aside
                    class="editor-sidebar"
                    id="bibliotecaVariablesSidebar">
                
                    <div class="editor-section">
                
                        <h2>
                            Biblioteca de Variables
                        </h2>
                
                        <div id="variablesPanel">
                        </div>
                
                    </div>
                
                </aside>


            </div>

    

    `;



    window.__plantillaDocxActual =
        plantilla?.formato_contenido === "DOCX"
            ? {
                id: plantilla.id,
                path: plantilla.archivo_docx_path
            }
            : null;
    
    renderBibliotecaVariables();
    
    inicializarVariables();
    
    inicializarTabsFormato(
        plantilla?.formato_contenido === "DOCX"
            ? "DOCX"
            : "HTML"
    );


    // Edición del archivo DOCX existente.

        const btnEditarDocx = document.getElementById(
            "btnEditarArchivoDocx"
        );
        
        const btnCancelarDocx = document.getElementById(
            "btnCancelarEdicionDocx"
        );
        
        const visorDocx = document.getElementById(
            "archivoDocxActual"
        );
        
        const selectorDocx = document.getElementById(
            "selectorArchivoDocx"
        );
        
        const archivoDocxInput = document.getElementById(
            "archivoDocx"
        );
        
        // Cambiar del visor al selector.
        if (btnEditarDocx && visorDocx && selectorDocx) {
            btnEditarDocx.addEventListener("click", () => {
                visorDocx.style.display = "none";
                selectorDocx.style.display = "block";
            });
        }
        
        // Cancelar: descartar la selección y volver al visor.
        if (
            btnCancelarDocx &&
            visorDocx &&
            selectorDocx
        ) {
            btnCancelarDocx.addEventListener("click", () => {
                if (archivoDocxInput) {
                    archivoDocxInput.value = "";
                }
        
                selectorDocx.style.display = "none";
                visorDocx.style.display = "block";
            });
        }
    
        


    inicializarSelectorConChecks({
        containerId: "selectorConstructoras",
        buttonId: "btnConstructoras",
        panelId: "panelConstructoras",
        allId: "todasConstructoras",
        optionClass: "opcion-constructora",
        allLabel: "Todas las constructoras"
    });
    
    inicializarSelectorConChecks({
        containerId: "selectorCargos",
        buttonId: "btnCargos",
        panelId: "panelCargos",
        allId: "todosCargos",
        optionClass: "opcion-cargo",
        allLabel: "Todos los cargos"
    });
    


    document

        .getElementById("btnGuardarPlantilla")

        .addEventListener(

            "click",

            () => guardarPlantilla(id)

        );

}



function inicializarTabsFormato(formatoInicial = "HTML") {

    const tabHTML = document.getElementById("tabContenidoHTML");
    const tabDOCX = document.getElementById("tabContenidoDOCX");

    const panelHTML = document.getElementById("panelContenidoHTML");
    const panelDOCX = document.getElementById("panelContenidoDOCX");

    const inputFormato = document.getElementById("formato_contenido");

    if (
        !tabHTML ||
        !tabDOCX ||
        !panelHTML ||
        !panelDOCX ||
        !inputFormato
    ) {
        return;
    }

    function activarFormato(formato) {

        const esHTML = formato === "HTML";

        inputFormato.value = esHTML ? "HTML" : "DOCX";

        panelHTML.hidden = !esHTML;
        panelDOCX.hidden = esHTML;

        
        // Mostrar la Biblioteca de Variables únicamente
        // cuando está activa la pestaña Contenido.
        const bibliotecaVariables = document.getElementById(
            "bibliotecaVariablesSidebar"
        );
        
        if (bibliotecaVariables) {
            bibliotecaVariables.style.display = esHTML ? "" : "none";
        }

        
        tabHTML.classList.toggle("active", esHTML);
        tabDOCX.classList.toggle("active", !esHTML);

        tabHTML.setAttribute(
            "aria-selected",
            String(esHTML)
        );

        tabDOCX.setAttribute(
            "aria-selected",
            String(!esHTML)
        );
    }

    tabHTML.addEventListener("click", () => {
        activarFormato("HTML");
    });

    tabDOCX.addEventListener("click", () => {
        activarFormato("DOCX");
    });

    activarFormato(formatoInicial);
}



function volverListadoPlantillas() {

    navigate(
        "construction_plantillas"
    );

}



function renderBibliotecaVariables() {

    const panel =
        document.getElementById(
            "variablesPanel"
        );

    if (!panel)
        return;

    let html = "";



    Object
        .entries(
            DOCUMENT_VARIABLES
        )
        .forEach(

            ([
                categoria,
                variables
            ]) => {

                html += `

                    <div
                        class="variables-category">

                        <h3>

                            ${categoria}

                        </h3>

                        <div
                            class="variables-list">

                `;


                variables.forEach(
                    variable => {

                        html += `

                            <span
                                class="variable-chip">

                                {{${variable}}}

                            </span>

                        `;

                    }
                );


                html += `

                        </div>

                    </div>

                `;

            }

        );



    panel.innerHTML =
        html;

}



function inicializarVariables() {

    document

        .querySelectorAll(".variable-chip")

        .forEach(chip => {

            chip.addEventListener(
                "mousedown",
                e => {
            
                    e.preventDefault();
            
                    insertarVariable(
                        chip.textContent.trim()
                    );
            
                }
            );
        });

}



function insertarVariable(variable) {
    

    const textarea =
        document.getElementById("contenido");

    if (!textarea)
        return;


    const inicio =
        textarea.selectionStart;

    const fin =
        textarea.selectionEnd;


    const texto =
        textarea.value;


    textarea.value =

        texto.substring(0, inicio)

        +

        variable

        +

        texto.substring(fin);


    textarea.focus();


    const posicion =

        inicio + variable.length;


    textarea.selectionStart =
        posicion;

    textarea.selectionEnd =
        posicion;

}


function mostrarErrorEditor(
    mensaje = ""
) {

    const box =
        document.getElementById(
            "editorError"
        );

    if (!box)
        return;

    box.innerHTML =
        mensaje;

    box.style.display =
        mensaje
            ? "block"
            : "none";

}



function limpiarErrorEditor() {

    mostrarErrorEditor("");

}




async function guardarPlantilla(id = null) {

    limpiarErrorEditor();

    const nombre = document
        .getElementById("nombre")
        .value
        .trim();

    const descripcion = document
        .getElementById("descripcion")
        .value
        .trim();

    const tipo_documento = document
        .getElementById("tipo_documento")
        .value;

    const formato = document
        .getElementById("formato_contenido")
        .value;

    const contenidoHTML = document
        .getElementById("contenido")
        .value
        .trim();

    const archivoDocx = document
        .getElementById("archivoDocx")
        ?.files?.[0] ?? null;

    // Validaciones generales.
    if (!tipo_documento) {
        mostrarErrorEditor(
            "Debe seleccionar el tipo de plantilla."
        );
        return false;
    }

    if (!nombre) {
        mostrarErrorEditor(
            "Debe ingresar el nombre de la plantilla."
        );
        return false;
    }

    // Validaciones exclusivas para HTML.
    if (formato === "HTML") {

        const validacion = validarPlantilla(contenidoHTML);

        if (!validacion.valido) {
            mostrarErrorEditor(
                validacion.errores
                    .map(e => e.mensaje)
                    .join("<br>")
            );
            return false;
        }

        if (!contenidoHTML) {
            mostrarErrorEditor(
                "Debe ingresar el contenido de la plantilla."
            );
            return false;
        }
    }

    // Validaciones exclusivas para DOCX.
    const pathAnterior =
        id &&
        window.__plantillaDocxActual?.id === id
            ? window.__plantillaDocxActual.path
            : null;

    if (formato === "DOCX") {

        if (!archivoDocx && !pathAnterior) {
            mostrarErrorEditor(
                "Debes seleccionar un archivo DOCX."
            );
            return false;
        }

        if (
            archivoDocx &&
            !archivoDocx.name.toLowerCase().endsWith(".docx")
        ) {
            mostrarErrorEditor(
                "El archivo debe tener extensión .docx."
            );
            return false;
        }

        if (archivoDocx && archivoDocx.size === 0) {
            mostrarErrorEditor(
                "El archivo seleccionado está vacío."
            );
            return false;
        }
    }

    // Asociaciones actuales.
    const constructoraIds = Array.from(
        document.querySelectorAll(
            "#panelConstructoras .opcion-constructora:checked"
        ),
        opcion => opcion.value
    );

    const cargoIds = Array.from(
        document.querySelectorAll(
            "#panelCargos .opcion-cargo:checked"
        ),
        opcion => opcion.value
    );

    let plantillaGuardada = null;
    let archivoSubidoPath = null;
    let registroGuardado = false;

    try {

        // Preparar los datos según el formato elegido.
        const datos = {
            nombre,
            descripcion,
            tipo_documento,
            formato_contenido: formato,
            contenido: formato === "HTML"
                ? contenidoHTML
                : null,
            archivo_docx_path: formato === "HTML"
                ? null
                : pathAnterior
        };

        if (formato === "DOCX") {

            // Para una plantilla nueva, generar primero su UUID.
            const plantillaId = id || crypto.randomUUID();

            // Subir el nuevo archivo antes de guardar la referencia.
            // El servicio debe usar una ruta única por archivo.
            if (archivoDocx) {
                archivoSubidoPath =
                    await plantillasDocumentoService.subirArchivoDocx(
                        plantillaId,
                        archivoDocx
                    );

                datos.archivo_docx_path = archivoSubidoPath;
            }

            if (!datos.archivo_docx_path) {
                throw new Error(
                    "No se encontró el archivo DOCX de la plantilla."
                );
            }

            if (id) {

                datos.updated_at = new Date().toISOString();

                plantillaGuardada =
                    await plantillasDocumentoService.update(
                        id,
                        datos
                    );

            } else {

                datos.id = plantillaId;
                datos.version = 1;
                datos.estado = "Activo";

                plantillaGuardada =
                    await plantillasDocumentoService.create(
                        datos
                    );
            }

            registroGuardado = true;

        } else {

            // Flujo HTML: mantiene la validación y el contenido actual.
            if (id) {

                datos.updated_at = new Date().toISOString();

                plantillaGuardada =
                    await plantillasDocumentoService.update(
                        id,
                        datos
                    );

            } else {

                datos.version = 1;
                datos.estado = "Activo";

                plantillaGuardada =
                    await plantillasDocumentoService.create(
                        datos
                    );
            }

            registroGuardado = true;
        }

        // Mantener las asociaciones existentes.
        await plantillasDocumentoService.guardarAsociaciones(
            plantillaGuardada.id,
            constructoraIds,
            cargoIds
        );

        // Eliminar el DOCX anterior solo después de guardar
        // correctamente el nuevo estado de la plantilla.
        if (
            pathAnterior &&
            (
                formato === "HTML" ||
                (
                    archivoSubidoPath &&
                    pathAnterior !== archivoSubidoPath
                )
            )
        ) {
            try {
                await plantillasDocumentoService.eliminarArchivoDocx(
                    pathAnterior
                );
            } catch (errorLimpieza) {
                console.error(
                    "La plantilla se guardó, pero no se pudo eliminar el DOCX anterior:",
                    errorLimpieza
                );
            }
        }

        navigate("construction_plantillas");

        return true;

    } catch (error) {

        console.error(
            "Error al guardar plantilla:",
            error
        );

        // Si se subió un archivo, pero no se guardó el registro,
        // intentar retirar el archivo recién subido.
        if (archivoSubidoPath && !registroGuardado) {
            try {
                await plantillasDocumentoService.eliminarArchivoDocx(
                    archivoSubidoPath
                );
            } catch (errorLimpieza) {
                console.error(
                    "No se pudo limpiar el archivo DOCX temporal:",
                    errorLimpieza
                );
            }
        }

        mostrarErrorEditor(
            error?.message
                ? `No fue posible guardar la plantilla: ${error.message}`
                : "No fue posible guardar la plantilla y sus asociaciones."
        );

        return false;
    }
}

