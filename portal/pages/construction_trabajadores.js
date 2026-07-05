import { workersService }
from "../services/workersService.js";

import { empresasService }
from "../services/empresasService.js";

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
            .filter(e => e.estado === "Activo")
            .map(e => `

                <option
                    value="${e.id}"
                    ${trabajador?.empresa_id === e.id
                        ? "selected"
                        : ""}>

                    ${e.nombre}

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


    cargarTrabajadores();

}



function editarTrabajador(id) {

    const trabajador =
        storage.getById(id);

    if (!trabajador) return;

    const content =
        document.querySelector(".content");


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
