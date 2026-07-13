import {
    workersService
}
from "../services/workersService.js";

import {
    empresasService
}
from "../services/empresasService.js";

import {
    obrasService
}
from "../services/obrasService.js";

import {
    cargosService
}
from "../services/cargosService.js";

import {
    plantillasDocumentoService
}
from "../services/plantillasDocumentoService.js";


import {
    navigate
}

    
from "../router.js";


let pasoActual = 1;


let contratoActual = {

    worker_id: null,

    empresa_id: null,

    obra_id: null,

    cargo_id: null,

    plantilla_id: null,

    fecha_inicio: null,

    fecha_termino: null,

    sueldo: null,

    jornada: null,

    contenido: ""

};


export function nuevoContrato() {

    pasoActual = 1;

    contratoActual = {

        worker_id: null,

        empresa_id: null,

        obra_id: null,

        cargo_id: null,

        plantilla_id: null,

        fecha_inicio: null,

        fecha_termino: null,

        sueldo: null,

        jornada: null,

        contenido: ""

    };

}


export async function renderConstructionContratoEditor() {

    const content =
        document.querySelector(
            ".content"
        );


    content.innerHTML = `

        <div class="page-header">

            <div>

                <button
                    id="btnVolverContratos"
                    class="btn-secondary">

                    ← Volver

                </button>

            </div>


            <div>

                <button
                    id="btnGuardarBorrador"
                    class="btn-secondary">

                    Guardar Borrador

                </button>

            </div>

        </div>



        <div class="editor-documento">

            <div class="editor-header">

                <h1>

                    Asistente de Generación
                    de Contratos

                </h1>

                <p>

                    Complete la información
                    requerida para generar
                    un nuevo contrato.

                </p>

            </div>



            <div class="wizard-steps">

                <div
                    class="
                        wizard-step
                        ${pasoActual === 1
                            ? "active"
                            : ""}
                    ">

                    1

                    <span>

                        Información Base

                    </span>

                </div>


                <div
                    class="
                        wizard-step
                        ${pasoActual === 2
                            ? "active"
                            : ""}
                    ">

                    2

                    <span>

                        Datos Contractuales

                    </span>

                </div>


                <div
                    class="
                        wizard-step
                        ${pasoActual === 3
                            ? "active"
                            : ""}
                    ">

                    3

                    <span>

                        Vista Previa

                    </span>

                </div>

            </div>



            <div id="contratoWizard">

            </div>


        </div>

    `;


    renderPasoActual();


    document

        .getElementById(
            "btnVolverContratos"
        )

        .addEventListener(

            "click",

            () => navigate(
                "construction_contratos"
            )

        );

}


function renderPasoActual() {

    const container =
        document.getElementById(
            "contratoWizard"
        );


    switch (pasoActual) {

        case 1:

            container.innerHTML =
                renderPaso1();

            break;


        case 2:

            container.innerHTML =
                renderPaso2();

            break;


        case 3:

            container.innerHTML =
                renderPaso3();

            break;

    }


     cargarDatosPaso();
    
    inicializarNavegacion();
   

}


function renderPaso1() {

    return `

        <div class="editor-section">

            <h2>

                Información Base

            </h2>


            <div class="form-grid">

                <div class="form-group">

                    <label>

                        Trabajador

                    </label>

                    <select
                        id="worker_id"
                        class="cubika-select">

                        <option>

                            Seleccione

                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>

                        Empresa

                    </label>

                    <select
                        id="empresa_id"
                        class="cubika-select">

                        <option>

                            Seleccione

                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>

                        Obra

                    </label>

                    <select
                        id="obra_id"
                        class="cubika-select">

                        <option>

                            Seleccione

                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>

                        Cargo

                    </label>

                    <select
                        id="cargo_id"
                        class="cubika-select">

                        <option>

                            Seleccione

                        </option>

                    </select>

                </div>

            </div>


            <div class="wizard-buttons">

                <button
                    id="btnSiguiente"
                    class="btn-primary">

                    Siguiente →

                </button>

            </div>

        </div>

    `;

}


function renderPaso2() {

    return `

        <div class="editor-section">

            <h2>

                Datos Contractuales

            </h2>


            <div class="form-grid">

                <div class="form-group">

                    <label>

                        Fecha Inicio

                    </label>

                    <input
                        id="fecha_inicio"
                        type="date"
                        class="cubika-input">

                </div>


                <div class="form-group">

                    <label>

                        Fecha Término

                    </label>

                    <input
                        id="fecha_termino"
                        type="date"
                        class="cubika-input">

                </div>


                <div class="form-group">

                    <label>

                        Sueldo

                    </label>

                    <input
                        id="sueldo"
                        type="number"
                        class="cubika-input">

                </div>


                <div class="form-group">

                    <label>

                        Jornada

                    </label>

                    <input
                        id="jornada"
                        type="text"
                        class="cubika-input"
                        placeholder="
                            Ej:
                            Art.22,
                            45 horas, etc.
                        ">

                </div>


                <div
                    class="form-group"
                    style="
                        grid-column:1/-1;
                    ">

                    <label>

                        Plantilla

                    </label>

                    <select
                        id="plantilla_id"
                        class="cubika-select">

                        <option>

                            Seleccione una plantilla

                        </option>

                    </select>

                </div>

            </div>


            <div class="wizard-buttons">

                <button
                    id="btnAnterior"
                    class="btn-secondary">

                    ← Anterior

                </button>


                <button
                    id="btnSiguiente"
                    class="btn-primary">

                    Siguiente →

                </button>

            </div>

        </div>

    `;

}


function renderPaso3() {

    return `

        <div class="editor-section">

            <h2>

                Vista Previa

            </h2>


            <div
                id="previewContrato"
                class="document-preview">

                <p>

                    La vista previa del contrato
                    aparecerá aquí.

                </p>

            </div>


            <div class="wizard-buttons">

                <button
                    id="btnAnterior"
                    class="btn-secondary">

                    ← Anterior

                </button>


                <div class="page-header">

                <button
                    id="btnGenerarContrato"
                    class="btn-cubika-green">

                    Aprobar y Generar

                </button>

                </div>
                
            </div>

        </div>

    `;

}


function inicializarNavegacion() {

    document

        .getElementById(
            "btnAnterior"
        )

        ?.addEventListener(

            "click",

            () => {

                guardarPasoActual();

                pasoActual--;

                renderConstructionContratoEditor();

            }

        );


    document

        .getElementById(
            "btnSiguiente"
        )

        ?.addEventListener(

            "click",

            () => {

                guardarPasoActual();

                pasoActual++;

                renderConstructionContratoEditor();

            }

        );

}


function guardarPasoActual() {

    if (pasoActual === 1) {

        contratoActual.worker_id =

            document
                .getElementById(
                    "worker_id"
                )
                ?.value;


        contratoActual.empresa_id =

            document
                .getElementById(
                    "empresa_id"
                )
                ?.value;


        contratoActual.obra_id =

            document
                .getElementById(
                    "obra_id"
                )
                ?.value;


        contratoActual.cargo_id =

            document
                .getElementById(
                    "cargo_id"
                )
                ?.value;

    }


    if (pasoActual === 2) {

        contratoActual.fecha_inicio =

            document
                .getElementById(
                    "fecha_inicio"
                )
                ?.value;


        contratoActual.fecha_termino =

            document
                .getElementById(
                    "fecha_termino"
                )
                ?.value;


        contratoActual.sueldo =

            document
                .getElementById(
                    "sueldo"
                )
                ?.value;


        contratoActual.jornada =

            document
                .getElementById(
                    "jornada"
                )
                ?.value;


        contratoActual.plantilla_id =

            document
                .getElementById(
                    "plantilla_id"
                )
                ?.value;

    }

}


async function cargarDatosPaso() {

    switch (pasoActual) {

        case 1:

            await cargarPaso1();

            break;

        case 2:

            await cargarPaso2();

            break;

    }

}


async function cargarPaso1() {

    const trabajadores =
        await workersService.getAll();

    const empresas =
        await empresasService.getAll();

    const obras =
        await obrasService.getAll();

    const cargos =
        await cargosService.getAll();


    cargarSelect(

        "worker_id",

        trabajadores,

        t =>

            `${t.nombres}
             ${t.apellido_paterno}
             ${t.apellido_materno ?? ""}`,

        contratoActual.worker_id

    );


    cargarSelect(

        "empresa_id",

        empresas,

        e => e.nombre,

        contratoActual.empresa_id

    );


    cargarSelect(

        "obra_id",

        obras,

        o => o.nombre,

        contratoActual.obra_id

    );


    cargarSelect(

        "cargo_id",

        cargos,

        c => c.nombre,

        contratoActual.cargo_id

    );

}


async function cargarPaso2() {

    const plantillas =
        await plantillasDocumentoService
            .getAll();


    cargarSelect(

        "plantilla_id",

        plantillas,

        p => p.nombre,

        contratoActual.plantilla_id

    );


    document
        .getElementById(
            "fecha_inicio"
        )
        .value =

        contratoActual.fecha_inicio
        ?? "";


    document
        .getElementById(
            "fecha_termino"
        )
        .value =

        contratoActual.fecha_termino
        ?? "";


    document
        .getElementById(
            "sueldo"
        )
        .value =

        contratoActual.sueldo
        ?? "";


    document
        .getElementById(
            "jornada"
        )
        .value =

        contratoActual.jornada
        ?? "";

}


function cargarSelect(

    id,

    items,

    getLabel,

    selected = null

) {

    const select =
        document.getElementById(id);

    if (!select)
        return;


    select.innerHTML = `

        <option value="">

            Seleccione

        </option>

    `;


    items.forEach(item => {

        select.innerHTML += `

            <option

                value="${item.id}"

                ${item.id ==
                    selected

                    ? "selected"

                    : ""}>

                ${getLabel(item)}

            </option>

        `;

    });

}


