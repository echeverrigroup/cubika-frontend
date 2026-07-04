import { workersService }
from "../services/workersService.js";

import {
    showConfirmModal
}
from "../components/modal.js";


function mostrarErrorFormulario(mensaje) {

    const errorBox =
        document.getElementById("formError");

    if (!errorBox) return;

    errorBox.textContent = mensaje;

    errorBox.style.display = "block";

}


function limpiarErrorFormulario() {

    const errorBox =
        document.getElementById("formError");

    if (!errorBox) return;

    errorBox.textContent = "";

    errorBox.style.display = "none";

}



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

    cargarTrabajadores();

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



function cargarTrabajadores() {

    const tableContainer =
        document.getElementById("trabajadoresTable");

    const filtro =
        document
            .getElementById("buscarTrabajador")
            ?.value
            .trim()
            .toUpperCase();

    let trabajadores =
    storage.getAll() || [];

        if (!Array.isArray(trabajadores)) {
            trabajadores = [];
        }
    
    if (filtro) {

        trabajadores =
            trabajadores.filter(t =>

                `${t.nombres}
                 ${t.apellidoPaterno}
                 ${t.apellidoMaterno}
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

                    <th>Rut</th>

                    <th>Cargo</th>

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
                    colspan="6"
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
                    ${trabajador.apellidoPaterno}
                    ${trabajador.apellidoMaterno}

                </td>

                <td>

                    ${trabajador.rut}

                </td>

                <td>

                    ${trabajador.cargo}

                </td>

                <td>

                    ${trabajador.empresa}

                </td>

                <td>

                    <span class="
                        estado-badge
                        ${trabajador.estado === "Activo"
                            ? "activo"
                            : "inactivo"}
                    ">

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
                        class="btn-danger btn-delete"
                        data-id="${trabajador.id}">

                        Eliminar

                    </button>

                </td>

            </tr>

        `;

    });

    html += `

            </tbody>

        </table>

    `;

    tableContainer.innerHTML = html;


    document
        .querySelectorAll(".btn-edit")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () =>
                    editarTrabajador(
                        btn.dataset.id
                    )
            );

        });


    document
        .querySelectorAll(".btn-delete")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () =>
                    eliminarTrabajador(
                        btn.dataset.id
                    )
            );

        });

}

function mostrarFormularioNuevoTrabajador() {

    const content =
        document.querySelector(".content");

    content.insertAdjacentHTML("beforeend", obtenerFormularioTrabajador());

    document
        .getElementById("modalTrabajador")
        .style.display = "flex";

    document
        .getElementById("btnCerrarModalTrabajador")
        .addEventListener("click", cerrarModalTrabajador);

    document
        .getElementById("formTrabajador")
        .addEventListener("submit", function (e) {

            e.preventDefault();

            // todavía no guardamos
            crearTrabajador();

        });

}


function obtenerFormularioTrabajador() {

    return `

        <div class="modal-overlay" id="modalTrabajador">

            <div class="modal">

                <div class="modal-header">

                    <h2>Nuevo Trabajador</h2>

                    <button
                        id="btnCerrarModalTrabajador"
                        class="btn-close">

                        ✕

                    </button>

                </div>


                <form id="formTrabajador">

                    <div class="form-grid">

                        <div class="form-group">

                            <label>Nombres</label>

                            <input
                                type="text"
                                id="nombres"
                                required>

                        </div>


                        <div class="form-group">

                            <label>Apellido Paterno</label>

                            <input
                                type="text"
                                id="apellidoPaterno"
                                required>

                        </div>


                        <div class="form-group">

                            <label>Apellido Materno</label>

                            <input
                                type="text"
                                id="apellidoMaterno">

                        </div>


                        <div class="form-group">

                            <label>RUT</label>

                            <input
                                type="text"
                                id="rut"
                                required>

                        </div>


                        <div class="form-group">

                            <label>Cargo</label>

                            <input
                                type="text"
                                id="cargo"
                                required>

                        </div>


                        <div class="form-group">

                            <label>Empresa</label>

                            <input
                                type="text"
                                id="empresa"
                                required>

                        </div>


                        <div class="form-group">

                            <label>Estado</label>

                            <select id="estado">

                                <option value="Activo">
                                    Activo
                                </option>

                                <option value="Inactivo">
                                    Inactivo
                                </option>

                            </select>

                        </div>

                    </div>


                    <div id="formError" class="form-error"></div>


                    <div class="form-actions">

                        <button
                            type="button"
                            id="btnCancelarTrabajador">

                            Cancelar

                        </button>


                        <button
                            type="submit"
                            class="btn-primary">

                            Guardar

                        </button>

                    </div>

                </form>

            </div>

        </div>

    `;

}


function cerrarModalTrabajador() {

    const modal =
        document.getElementById("modalTrabajador");

    if (modal) {
        modal.remove();
    }

}


function crearTrabajador() {

    limpiarErrorFormulario();

    const nombres =
        document.getElementById("nombres").value.trim();

    const apellidoPaterno =
        document.getElementById("apellidoPaterno").value.trim();

    const apellidoMaterno =
        document.getElementById("apellidoMaterno").value.trim();

    const rut =
        document.getElementById("rut").value.trim();

    const cargo =
        document.getElementById("cargo").value.trim();

    const empresa =
        document.getElementById("empresa").value.trim();

    const estado =
        document.getElementById("estado").value;


    // =========================
    // VALIDACIONES BÁSICAS
    // =========================

    if (!nombres || !apellidoPaterno || !rut || !cargo || !empresa) {

        mostrarErrorFormulario(
            "Completa todos los campos obligatorios."
        );

        return;

    }


    const trabajador = {

        id: crypto.randomUUID(),

        nombres,
        apellidoPaterno,
        apellidoMaterno,
        rut,
        cargo,
        empresa,
        estado: estado || "Activo",

        createdAt: new Date().toISOString()

    };
    


    storage.create(trabajador);

    cerrarModalTrabajador();

    cargarTrabajadores();

}



function editarTrabajador(id) {

    const trabajador =
        storage.getById(id);

    if (!trabajador) return;

    const content =
        document.querySelector(".content");

    content.insertAdjacentHTML(
        "beforeend",
        obtenerFormularioTrabajador()
    );

    document
        .getElementById("modalTrabajador")
        .style.display = "flex";

    // =========================
    // RELLENAR FORMULARIO
    // =========================

    document.getElementById("nombres").value =
        trabajador.nombres;

    document.getElementById("apellidoPaterno").value =
        trabajador.apellidoPaterno;

    document.getElementById("apellidoMaterno").value =
        trabajador.apellidoMaterno;

    document.getElementById("rut").value =
        trabajador.rut;

    document.getElementById("cargo").value =
        trabajador.cargo;

    document.getElementById("empresa").value =
        trabajador.empresa;

    document.getElementById("estado").value =
        trabajador.estado;


    document
        .getElementById("btnCerrarModalTrabajador")
        .addEventListener("click", cerrarModalTrabajador);

    document
        .getElementById("formTrabajador")
        .addEventListener("submit", function (e) {

            e.preventDefault();

            actualizarTrabajador(id);

        });

}


function actualizarTrabajador(id) {

    limpiarErrorFormulario();

    const nombres =
        document.getElementById("nombres").value.trim();

    const apellidoPaterno =
        document.getElementById("apellidoPaterno").value.trim();

    const apellidoMaterno =
        document.getElementById("apellidoMaterno").value.trim();

    const rut =
        document.getElementById("rut").value.trim();

    const cargo =
        document.getElementById("cargo").value.trim();

    const empresa =
        document.getElementById("empresa").value.trim();

    const estado =
        document.getElementById("estado").value;


    if (!nombres || !apellidoPaterno || !rut || !cargo || !empresa) {

        mostrarErrorFormulario(
            "Completa todos los campos obligatorios."
        );

        return;

    }


    const trabajadorActualizado = {

        id,

        nombres,
        apellidoPaterno,
        apellidoMaterno,
        rut,
        cargo,
        empresa,
        estado,

        updatedAt: new Date().toISOString()

    };


    storage.update(id, trabajadorActualizado);

    cerrarModalTrabajador();

    cargarTrabajadores();

}


function eliminarTrabajador(id) {

    const trabajador =
        storage.getById(id);

    if (!trabajador) return;

    showConfirmModal(
        "¿Eliminar trabajador?",
        `Se eliminará: ${trabajador.nombres} ${trabajador.apellidoPaterno}`,
        () => {

            storage.delete(id);

            cargarTrabajadores();

        }
    );

}
