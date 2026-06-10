import { supabase } from "../../js/supabaseClient.js";

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

            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    tableContainer.innerHTML = html;
}
