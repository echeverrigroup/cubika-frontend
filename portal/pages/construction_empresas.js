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
