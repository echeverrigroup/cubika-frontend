import { empresasService }
from "../services/empresasService.js";

import { obrasService }
from "../services/obrasService.js";

import {

    showConfirmModal,
    showFormModal,
    setModalLoading,
    setModalError

}
from "../components/modal.js";


export async function renderConstructionObras() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>Obras</h1>

            <button
                id="btnNuevaObra"
                class="btn-primary">

                + Nueva Obra

            </button>

        </div>


        <div class="table-filters">

            <input
                id="buscarObra"
                class="cubika-input"
                type="text"
                placeholder="Buscar obra...">

        </div>


        <div id="obrasTable">

            Cargando...

        </div>

    `;


    await cargarObras();


    document
        .getElementById("buscarObra")
        .addEventListener(
            "keyup",
            cargarObras
        );


    document
        .getElementById("btnNuevaObra")
        .addEventListener(
            "click",
            mostrarFormularioNuevaObra
        );

}



async function cargarObras() {

    const table =
        document.getElementById("obrasTable");


    const filtro =
        document
            .getElementById("buscarObra")
            ?.value
            .trim()
            .toUpperCase();


    let obras =
        await obrasService.getAll();


    if (filtro) {

        obras =
            obras.filter(obra =>

                `${obra.nombre}
                 ${obra.codigo ?? ""}
                 ${obra.ciudad ?? ""}
                 ${obra.empresa?.nombre ?? ""}`

                    .toUpperCase()

                    .includes(filtro)

            );

    }


    let html = `

        <table class="cubika-table">

            <thead>

                <tr>

                    <th>Nombre</th>

                    <th>Empresa</th>

                    <th>Ciudad</th>

                    <th>Estado</th>

                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody>

    `;


    if (!obras.length) {

        html += `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;padding:30px;">

                    No existen obras registradas.

                </td>

            </tr>

        `;

    }


    obras.forEach(obra => {

        html += `

            <tr>

                <td>

                    ${obra.nombre}

                </td>

                <td>

                    ${obra.empresa?.nombre ?? ""}

                </td>

                <td>

                    ${obra.ciudad ?? ""}

                </td>

                <td>

                    <span class="
                        estado-badge
                        ${obra.estado === "Activa"
                            ? "activo"
                            : "inactivo"}">

                        ${obra.estado}

                    </span>

                </td>

                <td>

                    <button
                        class="btn-edit"
                        data-id="${obra.id}">

                        Editar

                    </button>

                    <button
                        class="${obra.estado === "Activa"
                            ? "btn-danger"
                            : "btn-primary"} btn-toggle-estado"
                        data-id="${obra.id}">

                        ${obra.estado === "Activa"
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
                () => editarObra(btn.dataset.id)
            );

        });


    document
        .querySelectorAll(".btn-toggle-estado")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => cambiarEstadoObra(btn.dataset.id)
            );

        });

}


async function mostrarFormularioNuevaObra() {

    showFormModal({

        title: "Nueva Obra",

        content:
            await obtenerFormularioObra(),

        submitText: "Guardar",

        onSubmit: crearObra

    });

}



async function obtenerFormularioObra(obra = null) {

    const empresas =
        await empresasService.getAll();


    const opcionesEmpresas =
        empresas

            .filter(e =>

                e.estado === "Activo"

                ||

                e.id === obra?.empresa_id

            )

            .map(e => `

                <option
                    value="${e.id}"

                    ${obra?.empresa_id === e.id
                        ? "selected"
                        : ""}>

                    ${e.nombre}

                    ${e.estado === "Inactivo"
                        ? " (Inactiva)"
                        : ""}

                </option>

            `)

            .join("");


    return `

        <form id="formObra">

            <div class="form-grid">

                <div class="form-group">

                    <label>Empresa</label>

                    <select
                        id="empresa_id"
                        required>

                        <option value="">

                            Seleccione una empresa

                        </option>

                        ${opcionesEmpresas}

                    </select>

                </div>


                <div class="form-group">

                    <label>Nombre</label>

                    <input
                        id="nombre"
                        type="text"
                        value="${obra?.nombre ?? ""}"
                        required>

                </div>


                <div class="form-group">

                    <label>Código</label>

                    <input
                        id="codigo"
                        type="text"
                        value="${obra?.codigo ?? ""}">

                </div>


                <div class="form-group">

                    <label>Dirección</label>

                    <input
                        id="direccion"
                        type="text"
                        value="${obra?.direccion ?? ""}">

                </div>


                <div class="form-group">

                    <label>Comuna</label>

                    <input
                        id="comuna"
                        type="text"
                        value="${obra?.comuna ?? ""}">

                </div>


                <div class="form-group">

                    <label>Ciudad</label>

                    <input
                        id="ciudad"
                        type="text"
                        value="${obra?.ciudad ?? ""}">

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


async function crearObra() {

    const empresa_id =
        document
            .getElementById("empresa_id")
            .value;

    const nombre =
        document
            .getElementById("nombre")
            .value
            .trim();

    const codigo =
        document
            .getElementById("codigo")
            .value
            .trim();

    const direccion =
        document
            .getElementById("direccion")
            .value
            .trim();

    const comuna =
        document
            .getElementById("comuna")
            .value
            .trim();

    const ciudad =
        document
            .getElementById("ciudad")
            .value
            .trim();


    // =========================
    // VALIDACIONES
    // =========================

    if (!empresa_id) {

        setModalError(
            "Debe seleccionar una empresa."
        );

        return false;

    }

    if (!nombre) {

        setModalError(
            "Debe ingresar el nombre de la obra."
        );

        return false;

    }


    try {

        setModalLoading(true);

        await obrasService.create({

            empresa_id,

            nombre,

            codigo,

            direccion,

            comuna,

            ciudad,

            estado: "Activa"

        });

        await cargarObras();

        setModalLoading(false);

        return true;

    }

    catch (error) {

        console.error(error);

        setModalLoading(false);

        setModalError(
            "No fue posible guardar la obra."
        );

        return false;

    }

}


async function editarObra(id) {

    const obra =
        await obrasService.getById(id);

    if (!obra)
        return;

    showFormModal({

        title: "Editar Obra",

        content:
            await obtenerFormularioObra(obra),

        submitText: "Actualizar",

        onSubmit: () =>
            actualizarObra(id)

    });

}


async function actualizarObra(id) {

    const empresa_id =
        document
            .getElementById("empresa_id")
            .value;

    const nombre =
        document
            .getElementById("nombre")
            .value
            .trim();

    const codigo =
        document
            .getElementById("codigo")
            .value
            .trim();

    const direccion =
        document
            .getElementById("direccion")
            .value
            .trim();

    const comuna =
        document
            .getElementById("comuna")
            .value
            .trim();

    const ciudad =
        document
            .getElementById("ciudad")
            .value
            .trim();


    if (!empresa_id) {

        setModalError(
            "Debe seleccionar una empresa."
        );

        return false;

    }

    if (!nombre) {

        setModalError(
            "Debe ingresar el nombre de la obra."
        );

        return false;

    }


    try {

        setModalLoading(true);

        await obrasService.update(id, {

            empresa_id,

            nombre,

            codigo,

            direccion,

            comuna,

            ciudad,

            updated_at:
                new Date().toISOString()

        });

        await cargarObras();

        setModalLoading(false);

        return true;

    }

    catch (error) {

        console.error(error);

        setModalLoading(false);

        setModalError(
            "No fue posible actualizar la obra."
        );

        return false;

    }

}


async function cambiarEstadoObra(id) {

    const obra =
        await obrasService.getById(id);

    if (!obra)
        return;

    const nuevoEstado =
        obra.estado === "Activa"
            ? "Inactiva"
            : "Activa";


    showConfirmModal({

        title:

            nuevoEstado === "Activa"

                ? "Activar obra"

                : "Desactivar obra",

        message: `

            La obra

            <strong>

                ${obra.nombre}

            </strong>

            será

            <strong>

                ${nuevoEstado.toLowerCase()}

            </strong>.

            <br><br>

            Podrá cambiar su estado nuevamente cuando lo desee.

        `,

        onConfirm: async () => {

            try {

                await obrasService.update(id, {

                    estado: nuevoEstado,

                    updated_at:
                        new Date().toISOString()

                });

                await cargarObras();

            }

            catch (error) {

                console.error(error);

                return false;

            }

        }

    });

}
