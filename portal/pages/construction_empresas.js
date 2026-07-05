import { empresasService }
from "../services/empresasService.js";

import {
    showConfirmModal
}
from "../components/modal.js";



export async function renderConstructionEmpresas() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>Empresas</h1>

            <button
                id="btnNuevaEmpresa"
                class="btn-primary">

                + Nueva Empresa

            </button>

        </div>


        <div class="table-filters">

            <input
                id="buscarEmpresa"
                class="cubika-input"
                type="text"
                placeholder="Buscar empresa...">

        </div>


        <div id="empresasTable">

            Cargando...

        </div>

    `;


    await cargarEmpresas();


    document
        .getElementById("buscarEmpresa")
        .addEventListener(
            "keyup",
            cargarEmpresas
        );


    document
        .getElementById("btnNuevaEmpresa")
        .addEventListener(
            "click",
            mostrarFormularioNuevaEmpresa
        );

}



async function cargarEmpresas() {

    const table =
        document.getElementById("empresasTable");


    const filtro =
        document
            .getElementById("buscarEmpresa")
            ?.value
            .trim()
            .toUpperCase();


    let empresas =
        await empresasService.getAll();


    if (filtro) {

        empresas =
            empresas.filter(empresa =>

                `${empresa.nombre}
                 ${empresa.rut}`
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

                    <th>Estado</th>

                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody>

    `;


    if (!empresas.length) {

        html += `

            <tr>

                <td colspan="4"
                    style="text-align:center;padding:30px;">

                    No existen empresas registradas.

                </td>

            </tr>

        `;

    }


    empresas.forEach(empresa => {

        html += `

            <tr>

                <td>

                    ${empresa.nombre}

                </td>

                <td>

                    ${empresa.rut ?? ""}

                </td>

                <td>

                    <span class="
                        estado-badge
                        ${empresa.estado === "Activo"
                            ? "activo"
                            : "inactivo"}">

                        ${empresa.estado}

                    </span>

                </td>

                <td>

                    <button
                        class="btn-edit"
                        data-id="${empresa.id}">

                        Editar

                    </button>

                    <button
                        class="btn-danger btn-delete"
                        data-id="${empresa.id}">

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


    table.innerHTML = html;


    document
        .querySelectorAll(".btn-edit")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => editarEmpresa(btn.dataset.id)
            );

        });


    document
        .querySelectorAll(".btn-delete")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => eliminarEmpresa(btn.dataset.id)
            );

        });

}


function mostrarFormularioNuevaEmpresa() {

    const content =
        document.querySelector(".content");

    content.insertAdjacentHTML(
        "beforeend",
        obtenerFormularioEmpresa()
    );

    document
        .getElementById("modalEmpresa")
        .style.display = "flex";

    document
        .getElementById("btnCerrarModalEmpresa")
        .addEventListener(
            "click",
            cerrarModalEmpresa
        );

    document
        .getElementById("btnCancelarEmpresa")
        .addEventListener(
            "click",
            cerrarModalEmpresa
        );

    document
        .getElementById("formEmpresa")
        .addEventListener(
            "submit",
            async function (e) {

                e.preventDefault();

                await crearEmpresa();

            }
        );

}


function obtenerFormularioEmpresa() {

    return `

        <div
            class="modal-overlay"
            id="modalEmpresa">

            <div class="modal">

                <div class="modal-header">

                    <h2>Nueva Empresa</h2>

                    <button
                        id="btnCerrarModalEmpresa"
                        class="btn-close">

                        ✕

                    </button>

                </div>

                <form id="formEmpresa">

                    <div class="form-grid">

                        <div class="form-group">

                            <label>Nombre</label>

                            <input
                                id="nombre"
                                type="text"
                                required>

                        </div>

                        <div class="form-group">

                            <label>RUT</label>

                            <input
                                id="rut"
                                type="text">

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

                    <div
                        id="formError"
                        class="form-error">

                    </div>

                    <div class="form-actions">

                        <button
                            type="button"
                            id="btnCancelarEmpresa">

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


function cerrarModalEmpresa() {

    const modal =
        document.getElementById("modalEmpresa");

    if (modal)
        modal.remove();

}


async function crearEmpresa() {

    const nombre =
        document
            .getElementById("nombre")
            .value
            .trim();

    const rut =
        document
            .getElementById("rut")
            .value
            .trim();

    const estado =
        document
            .getElementById("estado")
            .value;

    if (!nombre) {

        alert("Debe ingresar el nombre.");

        return;

    }

    try {

        await empresasService.create({

            nombre,
            rut,
            estado

        });

        cerrarModalEmpresa();

        await cargarEmpresas();

    }

    catch (error) {

        console.error(error);

        alert("No fue posible guardar la empresa.");

    }

}
