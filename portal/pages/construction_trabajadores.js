import { workersService }
from "../services/workersService.js";

import { empresasService }
from "../services/empresasService.js";

import {

    showConfirmModal,
    showFormModal,
    setModalLoading,
    setModalError

}
from "../components/modal.js";





export async function renderConstructionTrabajadores() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>Trabajadores</h1>

            <button id="btnNuevoTrabajador">

                + Nuevo Trabajador

            </button>

        </div>


        <div class="table-filters">

            <input
                id="buscarTrabajador"
                class="cubika-input"
                type="text"
                placeholder="Buscar trabajador...">

        </div>


        <div id="trabajadoresTable">

            Cargando...

        </div>

    `;

    await cargarTrabajadores();

    const btnNuevo = document.getElementById("btnNuevoTrabajador");

        if (btnNuevo) {
            btnNuevo.addEventListener("click", mostrarFormularioNuevoTrabajador);
        }

    document
        .getElementById("buscarTrabajador")
        .addEventListener(
            "keyup",
            cargarTrabajadores
        );

}



async function cargarTrabajadores() {

    const tableContainer =
        document.getElementById("trabajadoresTable");

    const filtro =
        document
            .getElementById("buscarTrabajador")
            ?.value
            .trim()
            .toUpperCase();

    let trabajadores =
        await workersService.getAll();


    if (filtro) {

        trabajadores =
            trabajadores.filter(t =>

                `${t.nombres}
                 ${t.apellido_paterno}
                 ${t.apellido_materno}
                 ${t.rut}`
                    .toUpperCase()
                    .includes(filtro)

            );

    }


    let html = `

        <table class="cubika-table">

            <thead>

                <tr>

                    <th>Nombre</th>

                    <th>RUT</th>

                    <th>Empresa</th>

                    <th>Estado</th>

                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody>

    `;


    if (!trabajadores.length) {

        html += `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;padding:30px;">

                    No existen trabajadores registrados.

                </td>

            </tr>

        `;

    }


    trabajadores.forEach(trabajador => {

        html += `

            <tr>

                <td>

                    ${trabajador.nombres}
                    ${trabajador.apellido_paterno}
                    ${trabajador.apellido_materno ?? ""}

                </td>

                <td>

                    ${trabajador.rut ?? ""}

                </td>


                <td>

                    ${trabajador.empresa?.nombre ?? ""}

                </td>

                <td>

                    <span class="
                        estado-badge
                        ${trabajador.estado === "Activo"
                            ? "activo"
                            : "inactivo"}">

                        ${trabajador.estado}

                    </span>

                </td>

                <td>

                    <button
                        class="btn-edit"
                        data-id="${trabajador.id}">

                        Editar

                    </button>

                    <button
                        class="${trabajador.estado === "Activo"
                            ? "btn-danger"
                            : "btn-primary"} btn-toggle-estado"
                        data-id="${trabajador.id}">

                        ${trabajador.estado === "Activo"
                            ? "Historial"
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


    tableContainer.innerHTML =
        html;


    document
        .querySelectorAll(".btn-edit")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => editarTrabajador(btn.dataset.id)
            );

        });


    document
        .querySelectorAll(".btn-toggle-estado")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => cambiarEstadoTrabajador(btn.dataset.id)
            );

        });

}


async function mostrarFormularioNuevoTrabajador() {

        showFormModal({
    
                title: "Nuevo Trabajador",
            
                content:
                    await obtenerFormularioTrabajador(),
            
                submitText: "Guardar",
            
                onSubmit: crearTrabajador
            
            });
        }



async function obtenerFormularioTrabajador(trabajador = null) {

    const empresas =
        await empresasService.getAll();

    const opcionesEmpresas =
    empresas
        .filter(e =>

            e.estado === "Activo"

            ||

            e.id === trabajador?.empresa_id

        )
        .map(e => `

            <option
                value="${e.id}"
                ${trabajador?.empresa_id === e.id
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

        <form id="formTrabajador">

            <div class="form-grid">

                <div class="form-group">

                    <label>Nombres</label>

                    <input
                        id="nombres"
                        type="text"
                        value="${trabajador?.nombres ?? ""}"
                        required>

                </div>

                <div class="form-group">

                    <label>Apellido Paterno</label>

                    <input
                        id="apellidoPaterno"
                        type="text"
                        value="${trabajador?.apellido_paterno ?? ""}"
                        required>

                </div>

                <div class="form-group">

                    <label>Apellido Materno</label>

                    <input
                        id="apellidoMaterno"
                        type="text"
                        value="${trabajador?.apellido_materno ?? ""}">

                </div>

                <div class="form-group">

                    <label>RUT</label>

                    <input
                        id="rut"
                        type="text"
                        value="${trabajador?.rut ?? ""}"
                        required>

                </div>

                <div class="form-group">

                    <label>Empresa</label>

                    <select
                        id="empresa_id"
                        class="cubika-select"
                        required>

                        <option value="">

                            Seleccione una empresa

                        </option>

                        ${opcionesEmpresas}

                    </select>

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



async function crearTrabajador() {

    const nombres =
        document
            .getElementById("nombres")
            .value
            .trim();

    const apellido_paterno =
        document
            .getElementById("apellidoPaterno")
            .value
            .trim();

    const apellido_materno =
        document
            .getElementById("apellidoMaterno")
            .value
            .trim();

    const rut =
        document
            .getElementById("rut")
            .value
            .trim();

    const empresa_id =
        document
            .getElementById("empresa_id")
            .value;


    // =========================
    // VALIDACIONES
    // =========================

    if (!nombres) {

        setModalError(
            "Debe ingresar los nombres del trabajador."
        );

        return false;

    }

    if (!apellido_paterno) {

        setModalError(
            "Debe ingresar el apellido paterno."
        );

        return false;

    }

    if (!rut) {

        setModalError(
            "Debe ingresar el RUT."
        );

        return false;

    }

    if (!empresa_id) {

        setModalError(
            "Debe seleccionar una empresa."
        );

        return false;

    }


    try {

        setModalLoading(true);

        await workersService.create({

            empresa_id,

            nombres,

            apellido_paterno,

            apellido_materno,

            rut

        });

        await cargarTrabajadores();

        setModalLoading(false);

        return true;

    }

    catch (error) {

        console.error(error);

        setModalLoading(false);

        setModalError(
            "No fue posible guardar el trabajador."
        );

        return false;

    }

}


async function editarTrabajador(id) {

    const trabajador =
        await workersService.getById(id);

    if (!trabajador)
        return;

    showFormModal({

        title: "Editar Trabajador",

        content:
            await obtenerFormularioTrabajador(trabajador),

        submitText: "Actualizar",

        onSubmit: () =>
            actualizarTrabajador(id)

    });

}


async function actualizarTrabajador(id) {

    const nombres =
        document
            .getElementById("nombres")
            .value
            .trim();

    const apellido_paterno =
        document
            .getElementById("apellidoPaterno")
            .value
            .trim();

    const apellido_materno =
        document
            .getElementById("apellidoMaterno")
            .value
            .trim();

    const rut =
        document
            .getElementById("rut")
            .value
            .trim();

    const empresa_id =
        document
            .getElementById("empresa_id")
            .value;


    // =========================
    // VALIDACIONES
    // =========================

    if (!nombres) {

        setModalError(
            "Debe ingresar los nombres del trabajador."
        );

        return false;

    }

    if (!apellido_paterno) {

        setModalError(
            "Debe ingresar el apellido paterno."
        );

        return false;

    }

    if (!rut) {

        setModalError(
            "Debe ingresar el RUT."
        );

        return false;

    }

    if (!empresa_id) {

        setModalError(
            "Debe seleccionar una empresa."
        );

        return false;

    }


    try {

        setModalLoading(true);

        await workersService.update(id, {

            empresa_id,

            nombres,

            apellido_paterno,

            apellido_materno,

            rut,

            updated_at:
                new Date().toISOString()

        });

        await cargarTrabajadores();

        setModalLoading(false);

        return true;

    }

    catch (error) {

        console.error(error);

        setModalLoading(false);

        setModalError(
            "No fue posible actualizar el trabajador."
        );

        return false;

    }

}


async function cambiarEstadoTrabajador(id) {

    const trabajador =
        await workersService.getById(id);

    if (!trabajador)
        return;

    const nuevoEstado =
        trabajador.estado === "Activo"
            ? "Inactivo"
            : "Activo";

    showConfirmModal({

        title:
            nuevoEstado === "Activo"
                ? "Activar trabajador"
                : "Desactivar trabajador",

        message: `

            El trabajador

            <strong>

                ${trabajador.nombres}
                ${trabajador.apellido_paterno}

            </strong>

            será
            <strong>

                ${nuevoEstado.toLowerCase()}

            </strong>.

        `,

        onConfirm: async () => {

            try {

                await workersService.update(id, {

                    estado: nuevoEstado,

                    updated_at:
                        new Date().toISOString()

                });

                await cargarTrabajadores();

            }

            catch (error) {

                console.error(error);

                return false;

            }

        }

    });

}
