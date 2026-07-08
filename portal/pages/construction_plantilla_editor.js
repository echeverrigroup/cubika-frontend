import { plantillasDocumentoService }
from "../services/plantillasDocumentoService.js";

import {
    navigate
}
from "../router.js";



export async function renderConstructionPlantillaEditor(id = null) {

    let plantilla = null;

    if (id) {

        plantilla =
            await plantillasDocumentoService.getById(id);

    }


    const content =
        document.querySelector(".content");


    content.innerHTML = `

        <div class="page-header">

            <div>

                <button
                    id="btnVolverPlantillas"
                    class="btn-secondary">

                    ← Volver

                </button>

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

            <div class="editor-header">

                <h1>

                    ${id
                        ? "Editar Plantilla"
                        : "Nueva Plantilla"}

                </h1>

                <p>
                    <br>
                    Configure la información general y el contenido
                    del documento.
                    <br>
                </p>

            </div>


            <div
                id="editorError"
                class="form-error"
                style="display:none;">
            </div>


     <div class="editor-layout">

            <div class="editor-main">


            <div class="editor-section">

                <h2>

                    Datos Generales

                </h2>


                <div class="form-grid">


                    <div class="form-group">

                        <label>

                            Nombre

                        </label>

                        <input

                            id="nombre"

                            class="cubika-input"

                            type="text"

                            value="${plantilla?.nombre ?? ""}">

                    </div>



                    <div class="form-group">

                        <label>

                            Tipo Documento

                        </label>

                        <select

                            id="tipo_documento"

                            class="cubika-select">

                            <option
                                value="Contrato">

                                Contrato

                            </option>

                            <option
                                value="Anexo">

                                Anexo

                            </option>

                            <option
                                value="Finiquito">

                                Finiquito

                            </option>

                            <option
                                value="Carta">

                                Carta

                            </option>

                            <option
                                value="Certificado">

                                Certificado

                            </option>

                        </select>

                    </div>



                    <div
                        class="form-group"
                        style="grid-column:1/-1;">

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

            </div>



            <div class="editor-section">

                <h2>

                    Contenido

                </h2>

                <textarea

                    id="contenido"

                    class="cubika-input"

                    style="

                        min-height:550px;

                        resize:vertical;

                        font-family:Consolas, monospace;

                    "

                >${plantilla?.contenido ?? ""}</textarea>

            </div>


        </div>


        <aside class="editor-sidebar">

           <div class="editor-section">

                <h2>

                    Biblioteca de Variables

                </h2>

                <div id="variablesPanel">

                    <!-- Parte 2 -->

                </div>

            </div>

            </aside>

    `   </div>

</div>

`;

    renderBibliotecaVariables();

    inicializarVariables();

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



const BIBLIOTECA_VARIABLES = {

    "Empresa": [

        "{{EMPRESA}}",
        "{{RUT_EMPRESA}}",
        "{{REPRESENTANTE}}",
        "{{DIRECCION_EMPRESA}}"

    ],

    "Trabajador": [

        "{{TRABAJADOR}}",
        "{{RUT_TRABAJADOR}}"

    ],

    "Obra": [

        "{{OBRA}}",
        "{{CODIGO_OBRA}}",
        "{{DIRECCION_OBRA}}",
        "{{COMUNA}}",
        "{{REGION}}"

    ],

    "Contrato": [

        "{{CARGO}}",
        "{{FECHA}}",
        "{{FECHA_INGRESO}}",
        "{{FECHA_TERMINO}}",
        "{{SUELDO}}",
        "{{JORNADA}}"

    ]

};



function renderBibliotecaVariables() {

    const panel =
        document.getElementById("variablesPanel");

    if (!panel)
        return;


    let html = "";


    Object.entries(BIBLIOTECA_VARIABLES)

        .forEach(([categoria, variables]) => {

            html += `

                <div class="variables-category">

                    <h3>

                        ${categoria}

                    </h3>

                    <div class="variables-list">

            `;


            variables.forEach(variable => {

                html += `

                    <span
                        class="variable-chip">

                        ${variable}

                    </span>

                `;

            });


            html += `

                    </div>

                </div>

            `;

        });


    panel.innerHTML =
        html;

}


function inicializarVariables() {

    document

        .querySelectorAll(".variable-chip")

        .forEach(chip => {

            chip.addEventListener(

                "click",

                () => insertarVariable(

                    chip.textContent.trim()

                )

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


function mostrarErrorEditor(mensaje = "") {

    const box =
        document.getElementById("editorError");

    if (!box)
        return;

    box.textContent =
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


    const datos = {

        nombre,

        descripcion,

        tipo_documento,

        contenido

    };


    try {

        if (id) {

            datos.updated_at =
                new Date().toISOString();

            await plantillasDocumentoService.update(
                id,
                datos
            );

        }

        else {

            datos.version = 1;

            datos.estado = "Activo";

            await plantillasDocumentoService.create(
                datos
            );

        }


        navigate(
            "construction_plantillas"
        );

        return true;

    }

    catch (error) {

        console.error(error);

        mostrarErrorEditor(
            "No fue posible guardar la plantilla."
        );

        return false;

    }

}
