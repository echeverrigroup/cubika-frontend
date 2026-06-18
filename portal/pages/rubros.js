import { supabase } from "../../js/supabaseClient.js";
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


export async function renderRubros() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `
    <div class="page-header">

        <h1>Rubros</h1>

        <button id="btnNuevoRubro">
            + Nuevo Rubro
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

    <div id="rubrosTable">
        Cargando...
    </div>
`;
    
    await cargarRubros();

    document
    .getElementById("filtroEstado")
    .addEventListener(
        "change",
        cargarRubros
    );

   document
    .getElementById("btnNuevoRubro")
    .addEventListener(
        "click",
        mostrarFormularioNuevoRubro
    );
}

async function crearRubro() {

     limpiarErrorFormulario();

    const nombre =
        document
        .getElementById("rubroNombre")
        .value
        .trim()
        .toUpperCase();

    const descripcion =
        document
        .getElementById("rubroDescripcion")
        .value
        .trim();

    if (!nombre) {

        mostrarErrorFormulario(
        "Debe ingresar un nombre"
        );
        
        return false;
    }

    
    if (!descripcion) {

   mostrarErrorFormulario(
        "Debe ingresar una descripción."
    );

    return false;
    }
        


    const { data: existe } =
        await supabase
            .from("rubros")
            .select("id")
            .ilike("nombre", nombre)
            .limit(1);

    if (existe && existe.length) {
        mostrarErrorFormulario(
            "Ya existe un rubro con ese nombre."
        );

return false;
    }

  const { error } =
    await supabase
        .from("rubros")
        .insert({

            nombre,
            descripcion,
            estado: "Activo"

        });

if (error) {

    mostrarErrorFormulario(
        error.message
    );

    return false;
}

await cargarRubros();

return true;
}



async function cambiarEstadoRubro(id, estadoActual) {

    const nuevoEstado =
        estadoActual === "Activo"
            ? "Inactivo"
            : "Activo";

    showConfirmModal({

        title:
            nuevoEstado === "Activo"
                ? "Activar Rubro"
                : "Desactivar Rubro",

        message: `

            ¿Desea cambiar el estado a
            <strong>${nuevoEstado}</strong>?

        `,

        onConfirm: async () => {

            const { error } =
                await supabase
                    .from("rubros")
                    .update({

                        estado: nuevoEstado

                    })
                    .eq("id", id);

            if (error) {

                alert(error.message);

                return;
            }

            await cargarRubros();

        }

    });

}


function mostrarFormularioNuevoRubro() {

    showConfirmModal({

        title: "Nuevo Rubro",

       message: `

    <div class="cubika-form">

        <div class="cubika-form-header">

            <div>
            
                <p>
                    Crear una nueva categoría
                    para organizar empresas
                    dentro de Cubika.
                </p>

            </div>

        </div>

        <div
            id="formError"
            class="form-error"
            style="display:none;">
        </div>

        <div class="form-group">

            <label>
                Nombre del Rubro *
            </label>

            <input
                id="rubroNombre"
                type="text"
                maxlength="100"
                required
                placeholder="Ej: RETAIL"
                style="text-transform: uppercase;">

        </div>

        <div class="form-group">

            <label>
                Descripción *
            </label>

            <input
                id="rubroDescripcion"
                type="text"
                maxlength="250"
                required
                placeholder="Descripción obligatoria">

        </div>

        <div class="estado-preview">

            <span class="estado-badge activo">
                Activo
            </span>

            <small>
                El rubro quedará disponible inmediatamente.
            </small>

        </div>

          </div>

        `,

        onConfirm: crearRubro

    });

}


async function editarRubro(id) {

    const { data, error } =
        await supabase
            .from("rubros")
            .select("*")
            .eq("id", id)
            .single();

    if (error) {

        alert(error.message);

        return;
    }

    showConfirmModal({

        title: "Editar Rubro",

         message: `

        

        <div
            id="formError"
            class="form-error"
            style="display:none;">
        </div>
        
        <div class="form-group">

                <label>Nombre</label>

                <input
                    id="rubroNombre"
                    type="text"
                    style="text-transform: uppercase;"
                    value="${data.nombre ?? ""}">

            </div>

            <div class="form-group">

                <label>Descripción</label>

                <input
                    id="rubroDescripcion"
                    type="text"
                    value="${data.descripcion ?? ""}">

            </div>

        `,

        onConfirm: () =>
            actualizarRubro(id)

    });

}


async function actualizarRubro(id) {

     limpiarErrorFormulario();

    const nombre =
        document
            .getElementById("rubroNombre")
            .value
            .trim()
            .toUpperCase();

    const descripcion =
        document
            .getElementById("rubroDescripcion")
            .value
            .trim();

    if (!nombre) {

       mostrarErrorFormulario(
            "Debe ingresar un nombre."
        );
        
        return false;
    }

    if (!descripcion) {

    mostrarErrorFormulario(
    "Debe ingresar una descripción."
    );
    
    return false;
    }

    const { error } =
        await supabase
            .from("rubros")
            .update({

                nombre,
                descripcion

            })
            .eq("id", id);

    if (error) {

       mostrarErrorFormulario(
        error.message
    );
    
    return false;
        }

    await cargarRubros();

    return true;

}


async function cargarRubros() {

    const tableContainer =
        document.getElementById("rubrosTable");

    let query =
    supabase
        .from("rubros")
        .select("*");

const filtroEstado =
    document.getElementById("filtroEstado")
        ?.value;

if (filtroEstado) {

    query =
        query.eq(
            "estado",
            filtroEstado
        );

}

const { data, error } =
    await query.order("nombre");

    if (error) {

        tableContainer.innerHTML =
            `<p>Error al cargar rubros.</p>`;

        return;
    }

        let html = `
        <table class="cubika-table">

            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
    `;

    data.forEach(rubro => {

        html += `
<tr>

    <td>${rubro.id}</td>

    <td>${rubro.nombre}</td>

    <td>${rubro.descripcion ?? ""}</td>

    <td>
    <span class="
        estado-badge
        ${rubro.estado === "Activo"
            ? "activo"
            : "inactivo"}
    ">
        ${rubro.estado}
    </span>
    </td>

    <td>

        <button
            class="btn-edit"
            data-id="${rubro.id}">

            Editar

        </button>

        <button
            class="${
            rubro.estado === 'Activo'
            ? 'btn-danger'
            : 'btn-success'
            } btn-toggle-estado"
            data-id="${rubro.id}"
            data-estado="${rubro.estado}">
    
        
            ${rubro.estado === "Activo"
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

  tableContainer.innerHTML = html;

        document
            .querySelectorAll(".btn-edit")
            .forEach(btn => {
        
                btn.addEventListener(
                    "click",
                    () => editarRubro(btn.dataset.id)
                );
        
            });
        
        document
            .querySelectorAll(".btn-toggle-estado")
            .forEach(btn => {
        
                btn.addEventListener(
                    "click",
                    () =>
                        cambiarEstadoRubro(
                            btn.dataset.id,
                            btn.dataset.estado
                        )
                );
        
            });
}
