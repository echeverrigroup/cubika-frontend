import { cargosService }
from "../services/cargosService.js";

import {
    showConfirmModal,
    showFormModal,
    setModalError,
    setModalLoading
}
from "../components/modal.js";



export async function renderConstructionCargos() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>Cargos</h1>

            <button id="btnNuevoCargo">

                + Nuevo Cargo

            </button>

        </div>


        <div class="table-filters">

            <input
                id="buscarCargo"
                class="cubika-input"
                type="text"
                placeholder="Buscar cargo...">

        </div>


        <div id="cargosTable">

            Cargando...

        </div>

    `;


    await cargarCargos();


    document
        .getElementById("btnNuevoCargo")
        .addEventListener(
            "click",
            mostrarFormularioNuevoCargo
        );


    document
        .getElementById("buscarCargo")
        .addEventListener(
            "keyup",
            cargarCargos
        );

}



async function cargarCargos() {

    const table =
        document.getElementById("cargosTable");


    const filtro =
        document
            .getElementById("buscarCargo")
            ?.value
            .trim()
            .toUpperCase();


    let cargos =
        await cargosService.getAll();


    if (filtro) {

        cargos =
            cargos.filter(cargo =>

                `${cargo.nombre}
                 ${cargo.descripcion ?? ""}`

                    .toUpperCase()

                    .includes(filtro)

            );

    }


    let html = `

        <table class="cubika-table">

            <thead>

                <tr>

                    <th>Nombre</th>

                    <th>Descripción</th>

                    <th>Estado</th>

                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody>

    `;


    if (!cargos.length) {

        html += `

            <tr>

                <td
                    colspan="4"
                    style="text-align:center;padding:30px;">

                    No existen cargos registrados.

                </td>

            </tr>

        `;

    }


    cargos.forEach(cargo => {

        html += `

            <tr>

                <td>

                    ${cargo.nombre}

                </td>

                <td>

                    ${cargo.descripcion ?? ""}

                </td>

                <td>

                    <span class="
                        estado-badge
                        ${cargo.estado === "Activo"
                            ? "activo"
                            : "inactivo"}">

                        ${cargo.estado}

                    </span>

                </td>

                <td>

                    <button
                        class="btn-edit"
                        data-id="${cargo.id}">

                        Editar

                    </button>

                    <button
                        class="${cargo.estado === "Activo"
                            ? "btn-danger"
                            : "btn-primary"} btn-toggle-estado"
                        data-id="${cargo.id}">

                        ${cargo.estado === "Activo"
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
                () => editarCargo(btn.dataset.id)
            );

        });


    document
        .querySelectorAll(".btn-toggle-estado")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => cambiarEstadoCargo(btn.dataset.id)
            );

        });

}


async function mostrarFormularioNuevoCargo() {

    showFormModal({

        title: "Nuevo Cargo",

        content:
            await obtenerFormularioCargo(),

        submitText: "Guardar",

        onSubmit: crearCargo

    });

}



async function editarCargo(id) {

    const cargo =
        await cargosService.getById(id);

    if (!cargo)
        return;


    showFormModal({

        title: "Editar Cargo",

        content:
            await obtenerFormularioCargo(cargo),

        submitText: "Actualizar",

        onSubmit: () =>
            actualizarCargo(id)

    });

}



async function obtenerFormularioCargo(cargo = null) {

    return `

        <form id="formCargo">

            <div class="form-grid">

                <div class="form-group">

                    <label>Nombre</label>

                    <input
                        id="nombre"
                        class="cubika-input"
                        type="text"
                        value="${cargo?.nombre ?? ""}"
                        required>

                </div>


                <div class="form-group">

                    <label>Descripción</label>

                    <textarea
                        id="descripcion"
                        class="cubika-input"
                        rows="3">${cargo?.descripcion ?? ""}</textarea>

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


async function crearCargo() {

    setModalError("");

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


    if (!nombre) {

        setModalError(
            "Debe ingresar el nombre del cargo."
        );

        return false;

    }


    try {

        setModalLoading(true);

        await cargosService.create({

            nombre,

            descripcion,

            estado: "Activo"

        });

        await cargarCargos();

        setModalLoading(false);

        return true;

    }

    catch (error) {

        console.error(error);

        setModalLoading(false);

        setModalError(
            "No fue posible guardar el cargo."
        );

        return false;

    }

}




async function actualizarCargo(id) {

    setModalError("");

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


    if (!nombre) {

        setModalError(
            "Debe ingresar el nombre del cargo."
        );

        return false;

    }


    try {

        setModalLoading(true);

        await cargosService.update(id, {

            nombre,

            descripcion,

            updated_at:
                new Date().toISOString()

        });

        await cargarCargos();

        setModalLoading(false);

        return true;

    }

    catch (error) {

        console.error(error);

        setModalLoading(false);

        setModalError(
            "No fue posible actualizar el cargo."
        );

        return false;

    }

}


async function cambiarEstadoCargo(id) {

    const cargo =
        await cargosService.getById(id);

    if (!cargo)
        return;


    const nuevoEstado =
        cargo.estado === "Activo"
            ? "Inactivo"
            : "Activo";


    showConfirmModal(

        `${nuevoEstado} Cargo`,

        `¿Desea ${nuevoEstado.toLowerCase()} este cargo?`,

        async () => {

            try {

                await cargosService.update(id, {

                    estado: nuevoEstado,

                    updated_at:
                        new Date().toISOString()

                });

                await cargarCargos();

            }

            catch (error) {

                console.error(error);

            }

        }

    );

}


