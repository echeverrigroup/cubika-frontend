import { supabase } from "../../js/supabaseClient.js";
import {
    showConfirmModal
    }
    from "../components/modal.js";
    
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

        alert("Debe ingresar un nombre");

        return;
    }

    const { data: existe } =
        await supabase
            .from("rubros")
            .select("id")
            .ilike("nombre", nombre)
            .limit(1);

    if (existe && existe.length) {

        alert(
            "Ya existe un rubro con ese nombre."
        );

        return;
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

        alert(error.message);

        return;
    }

    await cargarRubros();
}



async function desactivarRubro(id) {

    showConfirmModal({

        title: "Desactivar Rubro",

        message: `
            ¿Desea desactivar este rubro?
        `,

        onConfirm: async () => {

            const { error } =
                await supabase
                    .from("rubros")
                    .update({

                        estado: "Inactivo"

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

            <div class="form-group">

                <label>Nombre      </label>

                <input
                    id="rubroNombre"
                    type="text"
                    style="text-transform: uppercase;"
                    >

            </div>

            <div class="form-group">

                <label>Descripción  </label>

                <input
                    id="rubroDescripcion"
                    type="text">

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

        alert("Debe ingresar un nombre");

        return;
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

        alert(error.message);

        return;
    }

    await cargarRubros();

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
            class="btn-delete"
            data-id="${rubro.id}">

            Desactivar

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
            .querySelectorAll(".btn-delete")
            .forEach(btn => {
        
                btn.addEventListener(
                    "click",
                    () => desactivarRubro(btn.dataset.id)
                );
        
            });
}
