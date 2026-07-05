import { empresasService }
from "../services/empresasService.js";

import {

    showConfirmModal,
    showFormModal,
    setModalLoading,
    setModalError

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

    showFormModal({

        title: "Nueva Empresa",

        content: obtenerFormularioEmpresa(),

        submitText: "Guardar",

        onSubmit: crearEmpresa

    });

}


function obtenerFormularioEmpresa(empresa = null) {

    return `

                <form id="formEmpresa">

                    <div class="form-grid">

                        <div class="form-group">

                            <label>Nombre</label>

                            <input
                                id="nombre"
                                type="text"
                                value="${empresa?.nombre ?? ""}"
                                required>

                        </div>

                        <div class="form-group">

                            <label>RUT</label>

                            <input
                                id="rut"
                                type="text"
                                value="${empresa?.rut ?? ""}">

                        </div>

                        <div class="form-group">

                            <label>Estado</label>

                            <select id="estado">

                                <option
                                    value="Activo"
                                    ${empresa?.estado === "Activo"
                                        ? "selected"
                                        : ""}>

                                    Activo

                                </option>

                                <option
                                    value="Inactivo"
                                    ${empresa?.estado === "Inactivo"
                                        ? "selected"
                                        : ""}>

                                    Inactivo

                                </option>

                            </select>

                        </div>

                    </div>

                    <div
                        id="modalFormError"
                        class="form-error"
                        style="display:none;">
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

                            ${empresa
                                ? "Actualizar"
                                : "Guardar"}

                        </button>

                    </div>

                </form>
                
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

        setModalError(
            "Debe ingresar el nombre."
        );

        return;

    }

    try {

        setModalLoading(true);

        await empresasService.create({

            nombre,
            rut,
            estado

        });

        cerrarModalEmpresa();

        await cargarEmpresas();

        setModalLoading(false);

    }

    catch (error) {

        console.error(error);

       setModalError(
            "No fue posible guardar la empresa."
        );

    }

}


async function editarEmpresa(id) {

    const empresa =
        await empresasService.getById(id);

    if (!empresa)
        return;

    showFormModal({

        title: "Editar Empresa",

        content: obtenerFormularioEmpresa(empresa),

        submitText: "Actualizar",

        onSubmit: () =>
            actualizarEmpresa(id)

    });

}

async function actualizarEmpresa(id) {

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

       setModalError(
            "Debe ingresar el nombre."
        );
        return;

    }

    try {

        setModalLoading(true);

        await empresasService.update(id, {

            nombre,
            rut,
            estado

        });

        cerrarModalEmpresa();

        await cargarEmpresas();

        setModalLoading(false);

    }

    catch(error){

        console.error(error);

       setModalLoading(false);

        setModalError(
            "No fue posible actualizar la empresa."
        );
    }

}


async function eliminarEmpresa(id) {

    const empresa =
        await empresasService.getById(id);

    if (!empresa)
        return;

    showConfirmModal({

        title: "Desactivar empresa",

        message: `

            La empresa
            <strong>${empresa.nombre}</strong>
            será desactivada.

            <br><br>

            Podrá volver a activarse posteriormente.

        `,

        onConfirm: async () => {

            try {

                await empresasService.update(id, {

                    estado: "Inactivo"

                });

                await cargarEmpresas();

            }

            catch (error) {

                console.error(error);

                return false;

            }

        }

    });

}
