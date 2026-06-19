import { supabase }
from "../../js/supabaseClient.js";
import {
    showConfirmModal
}
from "../components/modal.js";


async function obtenerRubrosActivos() {

    const { data, error } =
        await supabase
            .from("rubros")
            .select("id,nombre")
            .eq("estado", "Activo")
            .order("nombre");

    if (error) {

        console.error(error);

        return [];

    }

    return data;

}


async function cargarFiltroRubros() {

    const select =
        document.getElementById(
            "filtroRubro"
        );

    const { data } =
        await supabase
            .from("rubros")
            .select("id,nombre")
            .eq("estado", "Activo")
            .order("nombre");

    let html = `

        <option value="">
            Todos los Rubros
        </option>

    `;

    data.forEach(rubro => {

        html += `

            <option value="${rubro.id}">
                ${rubro.nombre}
            </option>

        `;

    });

    select.innerHTML = html;

}


async function mostrarFormularioNuevaEmpresa() {

    const rubros =
        await obtenerRubrosActivos();

    const opcionesRubros =
        rubros.map(r => `

            <option value="${r.id}">
                ${r.nombre}
            </option>

        `).join("");

    showConfirmModal({

        title: "Nueva Empresa",

        size: "large",

        message: `

            <div class="cubika-form">

                <div
                        <p>
                            Registrar una nueva empresa
                            dentro de Cubika. <br><br>
                        </p>

                 </div> 
             </div>


                <div
                    id="formError"
                    class="form-error"
                    style="display:none;">
                </div>

            <div class="cubika-form-grid">

                <div class="form-group">

                    <label>
                        Nombre Fantasía *
                    </label>

                    <input
                        id="empresaNombreFantasia"
                        type="text">

                </div>

                <div class="form-group">

                    <label>
                        Razón Social *
                    </label>

                    <input
                        id="empresaRazonSocial"
                        type="text">

                </div>

                <div class="form-group">

                    <label>
                        RUT *
                    </label>

                    <input
                        id="empresaRut"
                        type="text">

                </div>

                <div class="form-group">

                    <label>
                        Rubro *
                    </label>

                    <select
                        id="empresaRubro"
                        class="cubika-select">

                        <option value="">
                            Seleccione...
                        </option>

                        ${opcionesRubros}

                    </select>

                </div>

                <div class="form-group">

                    <label>
                        Email
                    </label>

                    <input
                        id="empresaEmail"
                        type="email">

                </div>

                <div class="form-group">

                    <label>
                        Teléfono
                    </label>

                    <input
                        id="empresaTelefono"
                        type="text">

                </div>

            </div>

            </div>

        `,

        onConfirm: crearEmpresa

    });

}


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

            <select id="filtroEstado"
                        class="cubika-select">

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

    await cargarFiltroRubros();

    await cargarEmpresas();

    document
    .getElementById("btnNuevaEmpresa")
    .addEventListener(
        "click",
        mostrarFormularioNuevaEmpresa
    );

    document
        .getElementById("filtroEstado")
        .addEventListener(
            "change",
            cargarEmpresas
        );

    document
    .getElementById("filtroRubro")
    .addEventListener(
        "change",
        cargarEmpresas
    );

    document
    .getElementById("busquedaEmpresa")
    .addEventListener(
        "input",
        cargarEmpresas
    );

}


async function crearEmpresa() {

    limpiarErrorFormulario();

    const nombre_fantasia =
        document
            .getElementById(
                "empresaNombreFantasia"
            )
            .value
            .trim();

    const razon_social =
        document
            .getElementById(
                "empresaRazonSocial"
            )
            .value
            .trim();

    const rut =
        document
            .getElementById(
                "empresaRut"
            )
            .value
            .trim();

    const rubro_id =
        document
            .getElementById(
                "empresaRubro"
            )
            .value;

    const email =
        document
            .getElementById(
                "empresaEmail"
            )
            .value
            .trim();

    const telefono =
        document
            .getElementById(
                "empresaTelefono"
            )
            .value
            .trim();

    if (!nombre_fantasia) {

        mostrarErrorFormulario(
            "Debe ingresar un nombre fantasía."
        );

        return false;

    }

    if (!razon_social) {

        mostrarErrorFormulario(
            "Debe ingresar una razón social."
        );

        return false;

    }

    if (!rut) {

        mostrarErrorFormulario(
            "Debe ingresar un RUT."
        );

        return false;

    }

    if (!rubro_id) {

        mostrarErrorFormulario(
            "Debe seleccionar un rubro."
        );

        return false;

    }

    const { error } =
        await supabase
            .from("empresas")
            .insert({

                nombre_fantasia,

                razon_social,

                rut,

                rubro_id,

                email,

                telefono,

                estado: "Activo"

            });

    if (error) {

        mostrarErrorFormulario(
            error.message
        );

        return false;

    }

    await cargarEmpresas();

    return true;

}


function mostrarErrorFormulario(mensaje) {

    const errorBox =
        document.getElementById(
            "formError"
        );

    if (!errorBox) return;

    errorBox.textContent = mensaje;

    errorBox.style.display = "block";

}

function limpiarErrorFormulario() {

    const errorBox =
        document.getElementById(
            "formError"
        );

    if (!errorBox) return;

    errorBox.style.display = "none";

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

    const filtroRubro =
    document
        .getElementById(
            "filtroRubro"
        )
        ?.value;

    const textoBusqueda =
        document
            .getElementById(
                "busquedaEmpresa"
            )
            ?.value
            ?.trim();

    if (filtroRubro) {

    query =
        query.eq(
            "rubro_id",
            filtroRubro
        );

}

    if (filtroEstado) {

        query =
            query.eq(
                "estado",
                filtroEstado
            );

    }

    if (textoBusqueda) {

    query =
        query.or(

            `nombre_fantasia.ilike.%${textoBusqueda}%,
             rut.ilike.%${textoBusqueda}%`

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
                        Contacto
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
                    ${empresa.email ?? ""}
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
