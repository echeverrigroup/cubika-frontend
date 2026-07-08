import { plantillasDocumentoService }
from "../services/plantillasDocumentoService.js";

import {

    showConfirmModal,
    showFormModal,
    setModalError,
    setModalLoading

}
from "../components/modal.js";



export async function renderConstructionPlantillas() {

    const content =
        document.querySelector(".content");


    content.innerHTML = `

        <div class="page-header">

            <h1>

                Plantillas Documentales

            </h1>

            <button
                id="btnNuevaPlantilla">

                + Nueva Plantilla

            </button>

        </div>


        <div class="table-filters">

            <input

                id="buscarPlantilla"

                class="cubika-input"

                type="text"

                placeholder="Buscar plantilla...">

        </div>


        <div id="plantillasTable">

            Cargando...

        </div>

    `;


    await cargarPlantillas();


    document

        .getElementById("btnNuevaPlantilla")

        .addEventListener(

            "click",

            mostrarFormularioNuevaPlantilla

        );


    document

        .getElementById("buscarPlantilla")

        .addEventListener(

            "keyup",

            cargarPlantillas

        );

}



async function cargarPlantillas() {

    const table =
        document.getElementById("plantillasTable");


    const filtro =
        document
            .getElementById("buscarPlantilla")
            ?.value
            .trim()
            .toUpperCase();


    let plantillas =
        await plantillasDocumentoService.getAll();


    if (filtro) {

        plantillas =
            plantillas.filter(p =>

                `${p.nombre}
                 ${p.descripcion ?? ""}
                 ${p.tipo_documento}`

                    .toUpperCase()

                    .includes(filtro)

            );

    }


    let html = `

        <table class="cubika-table">

            <thead>

                <tr>

                    <th>Nombre</th>

                    <th>Tipo</th>

                    <th>Versión</th>

                    <th>Estado</th>

                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody>

    `;


    if (!plantillas.length) {

        html += `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;padding:30px;">

                    No existen plantillas registradas.

                </td>

            </tr>

        `;

    }


    plantillas.forEach(plantilla => {

        html += `

            <tr>

                <td>

                    ${plantilla.nombre}

                </td>

                <td>

                    ${plantilla.tipo_documento}

                </td>

                <td>

                    ${plantilla.version}

                </td>

                <td>

                    <span class="

                        estado-badge

                        ${plantilla.estado === "Activo"

                            ? "activo"

                            : "inactivo"}">

                        ${plantilla.estado}

                    </span>

                </td>

                <td>

                    <button

                        class="btn-edit"

                        data-id="${plantilla.id}">

                        Editar

                    </button>


                    <button

                        class="${plantilla.estado === "Activo"

                            ? "btn-danger"

                            : "btn-primary"} btn-toggle-estado"

                        data-id="${plantilla.id}">

                        ${plantilla.estado === "Activo"

                            ? "Desactivar"

                            : "Activar"}

                    </button>

                </td>

            </tr>

        `;

    });


    html += `

            </tbody>

        </table>

    `;


    table.innerHTML =
        html;


    document

        .querySelectorAll(".btn-edit")

        .forEach(btn => {

            btn.addEventListener(

                "click",

                () => editarPlantilla(btn.dataset.id)

            );

        });


    document

        .querySelectorAll(".btn-toggle-estado")

        .forEach(btn => {

            btn.addEventListener(

                "click",

                () => cambiarEstadoPlantilla(btn.dataset.id)

            );

        });

}


async function mostrarFormularioNuevaPlantilla() {

    showFormModal({

        title: "Nueva Plantilla",

        size: "large",

        content:
            await obtenerFormularioPlantilla(),

        submitText: "Guardar",

        onSubmit: crearPlantilla

    });

}



async function editarPlantilla(id) {

    const plantilla =
        await plantillasDocumentoService.getById(id);

    if (!plantilla)
        return;


    showFormModal({

        title: "Editar Plantilla",

        size: "large",

        content:
            await obtenerFormularioPlantilla(plantilla),

        submitText: "Actualizar",

        onSubmit: () =>
            actualizarPlantilla(id)

    });

}



async function obtenerFormularioPlantilla(plantilla = null) {

    return `

        <form id="formPlantilla">

            <div class="form-grid">

                <div class="form-group">

                    <label>Nombre</label>

                    <input
                        id="nombre"
                        class="cubika-input"
                        type="text"
                        value="${plantilla?.nombre ?? ""}"
                        required>

                </div>


                <div class="form-group">

                    <label>Tipo de Documento</label>

                    <select
                        id="tipo_documento"
                        class="cubika-select">

                        <option
                            value="Contrato"
                            ${plantilla?.tipo_documento === "Contrato"
                                ? "selected"
                                : ""}>

                            Contrato

                        </option>

                        <option
                            value="Anexo"
                            ${plantilla?.tipo_documento === "Anexo"
                                ? "selected"
                                : ""}>

                            Anexo

                        </option>

                        <option
                            value="Finiquito"
                            ${plantilla?.tipo_documento === "Finiquito"
                                ? "selected"
                                : ""}>

                            Finiquito

                        </option>

                        <option
                            value="Carta"
                            ${plantilla?.tipo_documento === "Carta"
                                ? "selected"
                                : ""}>

                            Carta

                        </option>

                        <option
                            value="Certificado"
                            ${plantilla?.tipo_documento === "Certificado"
                                ? "selected"
                                : ""}>

                            Certificado

                        </option>

                    </select>

                </div>


                <div class="form-group"
                    style="grid-column:1/-1;">

                    <label>Descripción</label>

                    <input
                        id="descripcion"
                        class="cubika-input"
                        type="text"
                        value="${plantilla?.descripcion ?? ""}">

                </div>


                <div class="form-group"
                    style="grid-column:1/-1;">

                    <label>

                        Contenido de la Plantilla

                    </label>

                    <textarea

                        id="contenido"

                        class="cubika-input"

                        style="
                            min-height:420px;
                            resize:vertical;
                            font-family:Consolas, monospace;
                            line-height:1.5;"

                    >${plantilla?.contenido ?? ""}</textarea>

                </div>


                <div
                    class="form-group"
                    style="grid-column:1/-1;">

                    <label>

                        Variables disponibles

                    </label>

                    <div
                        class="variables-box">

                        <strong>Empresa</strong><br>

                        {{EMPRESA}}<br>
                        {{RUT_EMPRESA}}<br>
                        {{REPRESENTANTE}}<br>
                        {{DIRECCION_EMPRESA}}<br><br>


                        <strong>Trabajador</strong><br>

                        {{TRABAJADOR}}<br>
                        {{RUT_TRABAJADOR}}<br><br>


                        <strong>Obra</strong><br>

                        {{OBRA}}<br>
                        {{DIRECCION_OBRA}}<br>
                        {{COMUNA}}<br>
                        {{REGION}}<br><br>


                        <strong>Contrato</strong><br>

                        {{CARGO}}<br>
                        {{FECHA}}<br>
                        {{FECHA_INGRESO}}<br>
                        {{FECHA_TERMINO}}<br>
                        {{SUELDO}}<br>
                        {{JORNADA}}<br>

                    </div>

                </div>

            </div>


            <div
                id="modalFormError"
                class="form-error"
                style="display:none;">
            </div>

        </form>

    `;

}



async function crearPlantilla() {

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

        setModalError(
            "Debe ingresar el nombre de la plantilla."
        );

        return false;

    }


    if (!contenido) {

        setModalError(
            "Debe ingresar el contenido de la plantilla."
        );

        return false;

    }


    try {

        setModalLoading(true);

        await plantillasDocumentoService.create({

            nombre,

            descripcion,

            tipo_documento,

            contenido,

            version: 1,

            estado: "Activo"

        });

        await cargarPlantillas();

        setModalLoading(false);

        return true;

    }

    catch (error) {

        console.error(error);

        setModalLoading(false);

        setModalError(
            "No fue posible guardar la plantilla."
        );

        return false;

    }

}



async function actualizarPlantilla(id) {

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

        setModalError(
            "Debe ingresar el nombre de la plantilla."
        );

        return false;

    }


    if (!contenido) {

        setModalError(
            "Debe ingresar el contenido de la plantilla."
        );

        return false;

    }


    try {

        setModalLoading(true);

        await plantillasDocumentoService.update(id, {

            nombre,

            descripcion,

            tipo_documento,

            contenido,

            updated_at:
                new Date().toISOString()

        });

        await cargarPlantillas();

        setModalLoading(false);

        return true;

    }

    catch (error) {

        console.error(error);

        setModalLoading(false);

        setModalError(
            "No fue posible actualizar la plantilla."
        );

        return false;

    }

}



async function cambiarEstadoPlantilla(id) {

    const plantilla =
        await plantillasDocumentoService.getById(id);

    if (!plantilla)
        return;


    const nuevoEstado =
        plantilla.estado === "Activo"
            ? "Inactivo"
            : "Activo";


    showConfirmModal({

        title:
            `${nuevoEstado} Plantilla`,

        message: `

            La plantilla
            <strong>${plantilla.nombre}</strong>
            será
            ${nuevoEstado.toLowerCase()}.

        `,

        onConfirm: async () => {

            try {

                await plantillasDocumentoService.update(id, {

                    estado: nuevoEstado,

                    updated_at:
                        new Date().toISOString()

                });

                await cargarPlantillas();

            }

            catch (error) {

                console.error(error);

                return false;

            }

        }

    });

}
