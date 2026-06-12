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

        <div id="rubrosTable">
            Cargando...
        </div>
    `;

    await cargarRubros();

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
        .trim();

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
            .insert({

                nombre,
                descripcion

            });

    if (error) {

        alert(error.message);

        return;
    }

    await cargarRubros();
}


function mostrarFormularioNuevoRubro() {

    showConfirmModal({

        title: "Nuevo Rubro",

        message: `

            <div class="form-group">

                <label>Nombre</label>

                <input
                    id="rubroNombre"
                    type="text">

            </div>

            <div class="form-group">

                <label>Descripción</label>

                <textarea
                    id="rubroDescripcion">
                </textarea>

            </div>

        `,

        onConfirm: crearRubro

    });

}

async function cargarRubros() {

    const tableContainer =
        document.getElementById("rubrosTable");

    const { data, error } = await supabase
        .from("rubros")
        .select("*")
        .order("nombre");

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

    <td>${rubro.estado}</td>

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
}
