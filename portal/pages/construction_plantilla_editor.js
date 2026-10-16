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

        <label style="margin-top:10px;">
            Descripción
        </label>

        <input
            id="descripcion"
            class="cubika-input"
            type="text"
            value="${plantilla?.descripcion ?? ""}">

    </div>

</div>

<!-- CONTENIDO: permanece dentro de editor-main -->
<div class="editor-section">

    <h2>
        Contenido
    </h2>

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

</div>
  


                <!-- ====================================== -->
                <!-- SIDEBAR -->
                <!-- ====================================== -->

                <aside class="editor-sidebar">

                    <div class="editor-section">

                        <h2>

                            Biblioteca de Variables

                        </h2>

                        <div id="variablesPanel">

                        </div>

                    </div>

                </aside>


            </div>

        </div>

    `;


    renderBibliotecaVariables();

    inicializarVariables();


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

        .getElementById("btnVolverPlantillas")

        .addEventListener(

            "click",

            volverListadoPlantillas

        );


    document

        .getElementById("btnGuardarPlantilla")

        .addEventListener(

            "click",

            () => guardarPlantilla(id)

        );

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


    const nombre =
        document
            .getElementById("nombre")
            .value
            .trim();

    const descripcion =
        document
            .getElementById("descripcion")
            .value
            .trim();

    const tipo_documento =
        document
            .getElementById("tipo_documento")
            .value;

    const contenido =
        document
            .getElementById("contenido")
            .value
            .trim();

   const validacion =
        validarPlantilla(
            contenido
        );
    
    if (
        !validacion.valido
    ) {
    
        mostrarErrorEditor(
    
            validacion.errores
                .map(
                    e => e.mensaje
                )
                .join("<br>")
    
        );
    
        return false;
    
    }


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


    if (!contenido) {

        mostrarErrorEditor(
            "Debe ingresar el contenido de la plantilla."
        );

        return false;

    }


    
    
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




    const datos = {

        nombre,

        descripcion,

        tipo_documento,

        contenido

    };


    
        try {
        
            let plantillaGuardada;
        
            if (id) {
        
                datos.updated_at = new Date().toISOString();
        
                plantillaGuardada = await plantillasDocumentoService.update(
                    id,
                    datos
                );
        
            } else {
        
                datos.version = 1;
                datos.estado = "Activo";
        
                plantillaGuardada = await plantillasDocumentoService.create(
                    datos
                );
        
            }
        
            
            await plantillasDocumentoService.guardarAsociaciones(
                plantillaGuardada.id,
                constructoraIds,
                cargoIds
            );

        
            navigate("construction_plantillas");
        
            return true;
        
        } catch (error) {
        
            console.error(error);
        
            mostrarErrorEditor(
                "No fue posible guardar la plantilla y sus asociaciones."
            );
        
            return false;
        
        }


}
