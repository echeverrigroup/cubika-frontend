import { supabase }
from "../../js/supabaseClient.js";

export async function renderEmpresas() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>
                Empresas
            </h1>

            <button
                id="btnNuevaEmpresa">

                + Nueva Empresa

            </button>

        </div>

        <div class="table-filters">

            <select id="filtroEstado">

                <option value="">
                    Todos
                </option>

                <option value="Activo">
                    Activos
                </option>

                <option value="Inactivo">
                    Inactivos
                </option>

            </select>

        </div>

        <div id="empresasTable">

            Cargando...

        </div>

    `;

    await cargarEmpresas();

    document
        .getElementById("filtroEstado")
        .addEventListener(
            "change",
            cargarEmpresas
        );

}


async function cargarEmpresas() {

    const tableContainer =
        document.getElementById(
            "empresasTable"
        );

    let query =
        supabase
            .from("empresas")
            .select(`

                *,
                rubros (
                    nombre
                )

            `);

    const filtroEstado =
        document
            .getElementById(
                "filtroEstado"
            )
            ?.value;

    if (filtroEstado) {

        query =
            query.eq(
                "estado",
                filtroEstado
            );

    }

    const {
        data,
        error
    } = await query.order(
        "nombre_fantasia"
    );

    if (error) {

        tableContainer.innerHTML = `
            <p>
                Error al cargar empresas.
            </p>
        `;

        console.error(error);

        return;

    }

    let html = `

        <table class="cubika-table">

            <thead>

                <tr>

                    <th>ID</th>

                    <th>
                        Nombre Fantasía
                    </th>

                    <th>
                        Razón Social
                    </th>

                    <th>
                        RUT
                    </th>

                    <th>
                        Rubro
                    </th>

                    <th>
                        Estado
                    </th>

                    <th>
                        Acciones
                    </th>

                </tr>

            </thead>

            <tbody>

    `;

    data.forEach(empresa => {

        html += `

            <tr>

                <td>
                    ${empresa.id}
                </td>

                <td>
                    ${empresa.nombre_fantasia ?? ""}
                </td>

                <td>
                    ${empresa.razon_social}
                </td>

                <td>
                    ${empresa.rut ?? ""}
                </td>

                <td>
                    ${empresa.rubros?.nombre ?? ""}
                </td>

                <td>

                    <span
                        class="
                            estado-badge
                            ${empresa.estado === "Activo"
                                ? "activo"
                                : "inactivo"}
                        ">

                        ${empresa.estado}

                    </span>

                </td>

                <td>

                    <button
                        class="btn-edit">

                        Editar

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

}
