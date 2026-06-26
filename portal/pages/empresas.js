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


async function editarEmpresa(id) {

    const { data, error } =
        await supabase
            .from("empresas")
            .select("*")
            .eq("id", id)
            .single();

    if (error) {

        alert(error.message);

        return;

    }

    const rubros =
        await obtenerRubrosActivos();

    showConfirmModal({

        title: "Editar Empresa",

        size: "large",

        message:
            construirFormularioEmpresa(
                data,
                rubros
            ),

        onConfirm: () =>
            actualizarEmpresa(id)

    });

}


async function mostrarFormularioNuevaEmpresa() {

    const rubros =
    await obtenerRubrosActivos();

showConfirmModal({

    title: "Nueva Empresa",

    size: "large",

    message:
        construirFormularioEmpresa(
            {},
            rubros
        ),

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

    <select
        id="filtroEstado"
        class="cubika-select">

        <option value="">
            Todos los Estados
        </option>

        <option value="Activo">
            Activos
        </option>

        <option value="Inactivo">
            Inactivos
        </option>

    </select>

    <select
        id="filtroRubro"
        class="cubika-select">

        <option value="">
            Todos los Rubros
        </option>

    </select>


    <div class="search-box">

    <span class="search-icon">
        🔍
    </span>

    <input
        id="busquedaEmpresa"
        class="cubika-input"
        type="text"
        placeholder="Buscar por nombre o RUT...">

    </div>

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


function construirFormularioEmpresa(
    empresa = {},
    rubros = []
) {

    const opcionesRubros =
        rubros.map(r => `
            <option
                value="${r.id}"
                ${r.id == empresa.rubro_id
                    ? "selected"
                    : ""}
            >
                ${r.nombre}
            </option>
        `).join("");

    return `
        <div class="cubika-form">

            <p>
                Complete la información de la empresa.
            </p>

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
                        type="text"
                        value="${empresa.nombre_fantasia ?? ""}">

                </div>

                <div class="form-group">

                    <label>
                        Razón Social *
                    </label>

                    <input
                        id="empresaRazonSocial"
                        type="text"
                        value="${empresa.razon_social ?? ""}">

                </div>

                <div class="form-group">

                    <label>
                        RUT *
                    </label>

                    <input
                        id="empresaRut"
                        type="text"
                        value="${empresa.rut ?? ""}">

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
                        type="email"
                        value="${empresa.email ?? ""}">

                </div>

                <div class="form-group">

                    <label>
                        Teléfono
                    </label>

                    <input
                        id="empresaTelefono"
                        type="text"
                        value="${empresa.telefono ?? ""}">

                </div>

            </div>

        </div>
    `;
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


async function actualizarEmpresa(id) {

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
        .update({

            nombre_fantasia,
            razon_social,
            rut,
            rubro_id,
            email,
            telefono

        })
        .eq("id", id);

    if (error) {

        mostrarErrorFormulario(
            error.message
        );

        return false;

    }

    await cargarEmpresas();

    return true;

}


async function cambiarEstadoEmpresa(
    id,
    estado
) {

    const accion =
        estado === "Activo"
            ? "activar"
            : "desactivar";

    showConfirmModal({

        title:
            estado === "Activo"
                ? "Activar Empresa"
                : "Desactivar Empresa",
    
          message: `
        ¿Desea ${accion}
        esta empresa?
    `    ,

        onConfirm: async () => {

            const { error } =
                await supabase
                    .from("empresas")
                    .update({

                        estado

                    })
                    .eq("id", id);

            if (error) {

                alert(error.message);

                return;

            }

            await cargarEmpresas();

        }

    });

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

    query = query.or(

            `nombre_fantasia.ilike.%${textoBusqueda}%,rut.ilike.%${textoBusqueda}%`

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
                        class="btn-edit"
                        data-id="${empresa.id}">
                
                        Editar
                
                    </button>
                
                    ${
                        empresa.estado === "Activo"
                        ? `
                            <button
                                class="btn-delete"
                                data-id="${empresa.id}">
                
                                Desactivar
                
                            </button>
                        `
                        : `
                            <button
                                class="btn-restore"
                                data-id="${empresa.id}">
                
                                Activar
                
                            </button>
                        `
                    }
                
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
                editarEmpresa(
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
                cambiarEstadoEmpresa(
                    btn.dataset.id,
                    "Inactivo"
                )
        );

    });

    document
        .querySelectorAll(".btn-restore")
        .forEach(btn => {
    
            btn.addEventListener(
                "click",
                () =>
                    cambiarEstadoEmpresa(
                        btn.dataset.id,
                        "Activo"
                    )
            );

    });

}
