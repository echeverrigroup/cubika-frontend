import {
    navigate
} from "../router.js";

import {
    renderConstructionPlantillaEditor
} from "./construction_plantilla_editor.js";

import {
    plantillasDocumentoService
} from "../services/plantillasDocumentoService.js";

import {
    showConfirmModal
} from "../components/modal.js";


let tipoPlantillaActivo = "CONTRATO";


export async function renderConstructionPlantillas() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>
                Plantillas Documentales
            </h1>

            <button
                id="btnNuevaPlantilla">

                + Nueva Plantilla

            </button>

        </div>


        
       <div class="cubika-tabs" id="plantillasTabs">
        
                <button
                    type="button"
                    class="cubika-tab active"
                    data-tipo="CONTRATO">
                    Contratos
                </button>
        
                <button
                    type="button"
                    class="cubika-tab"
                    data-tipo="ANEXO">
                    Anexos
                </button>
        
                <button
                    type="button"
                    class="cubika-tab"
                    data-tipo="COMPLEMENTO">
                    Complementos
                </button>
        
                <button
                    type="button"
                    class="cubika-tab"
                    data-tipo="FINIQUITO">
                    Finiquitos
                </button>
        
                <button
                    type="button"
                    class="cubika-tab"
                    data-tipo="CERTIFICADO">
                    Certificados
                </button>
        
            </div>
            

            <div class="crud-workspace">
            
                <div class="table-filters">
        
                <input
                    id="buscarPlantilla"
                    class="cubika-input"
                    type="text"
                    placeholder="Buscar plantilla...">
        
            </div>
        
            <div id="plantillasTable" class="crud-table-shadow">
                Cargando...
            </div>
        
        </div>


    `;


    document
        .getElementById("btnNuevaPlantilla")
        .addEventListener("click", () => {
            navigate("construction_plantilla_editor");
        });


    document
        .getElementById("buscarPlantilla")
        .addEventListener("input", () => {
            cargarPlantillas();
        });


    document
        .querySelectorAll("#plantillasTabs .cubika-tab")
        .forEach(tab => {

            tab.addEventListener("click", () => {

                tipoPlantillaActivo =
                    tab.dataset.tipo;

                document
                    .querySelectorAll(
                        "#plantillasTabs .cubika-tab"
                    )
                    .forEach(item => {

                        item.classList.toggle(
                            "active",
                            item === tab
                        );

                    });

                cargarPlantillas();

            });

        });


    await cargarPlantillas();

}




async function cargarPlantillas() {

    const table =
        document.getElementById("plantillasTable");

    if (!table) return;

    table.innerHTML = "Cargando...";

    try {

        const filtro =
            document
                .getElementById("buscarPlantilla")
                ?.value
                .trim()
                .toUpperCase() ?? "";

        let plantillas =
            await plantillasDocumentoService.getAll();

        console.log(
            "[PLANTILLAS CRUD]",
            plantillas
        );


        // Filtrar por la pestaña seleccionada.
        plantillas = plantillas.filter(plantilla => {

            const tipo =
                String(
                    plantilla.tipo_documento ?? ""
                )
                .trim()
                .toUpperCase();

            return tipo === tipoPlantillaActivo;

        });


        // Aplicar la búsqueda sobre la pestaña activa.
        if (filtro) {

            plantillas = plantillas.filter(plantilla => {

                const texto = `
                    ${plantilla.nombre ?? ""}
                    ${plantilla.descripcion ?? ""}
                    ${plantilla.tipo_documento ?? ""}
                    ${plantilla.estado ?? ""}
                `.toUpperCase();

                return texto.includes(filtro);

            });

        }


        let html = `

            <table class="cubika-table">

                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Versión</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>

        `;


        if (!plantillas.length) {

            html += `
                <tr>
                    <td
                        colspan="5"
                        style="
                            text-align:center;
                            padding:30px;
                        ">

                        No existen plantillas
                        para esta categoría.

                    </td>
                </tr>
            `;

        } else {

            plantillas.forEach(plantilla => {

                const estadoActivo =
                    plantilla.estado === "Activo";

                html += `

                    <tr>

                        <td>
                            ${plantilla.nombre ?? ""}
                        </td>

                        <td>
                            ${plantilla.tipo_documento ?? ""}
                        </td>

                        <td>
                            ${plantilla.version ?? 1}
                        </td>

                        <td>

                            <span class="
                                estado-badge
                                ${estadoActivo
                                    ? "activo"
                                    : "inactivo"}
                            ">

                                ${plantilla.estado ?? "Sin estado"}

                            </span>

                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn-edit"
                                data-id="${plantilla.id}">

                                Editar

                            </button>

                            <button
                                type="button"
                                class="${
                                    estadoActivo
                                        ? "btn-danger"
                                        : "btn-primary"
                                } btn-toggle-estado"
                                data-id="${plantilla.id}">

                                ${estadoActivo
                                    ? "Desactivar"
                                    : "Activar"}

                            </button>

                        </td>

                    </tr>

                `;

            });

        }


        // Cerrar tabla y renderizar.
        html += `

                </tbody>

            </table>

        `;

        table.innerHTML = html;


        // Eventos para editar plantillas.
        table
            .querySelectorAll(".btn-edit")
            .forEach(btn => {

                btn.addEventListener("click", () => {

                    navigate(
                        "construction_plantilla_editor",
                        btn.dataset.id
                    );

                });

            });


        // Eventos para activar o desactivar plantillas.
        table
            .querySelectorAll(".btn-toggle-estado")
            .forEach(btn => {

                btn.addEventListener("click", () => {

                    cambiarEstadoPlantilla(
                        btn.dataset.id
                    );

                });

            });

    } catch (error) {

        console.error(
            "Error al cargar las plantillas:",
            error
        );

        table.innerHTML = `

            <div class="form-error">

                No fue posible cargar las plantillas.
                Intenta nuevamente.

            </div>

        `;

    }

}




async function cambiarEstadoPlantilla(id) {

    try {

        const plantilla =
            await plantillasDocumentoService.getById(id);

        if (!plantilla) return;

        const nuevoEstado =
            plantilla.estado === "Activo"
                ? "Inactivo"
                : "Activo";

        showConfirmModal({

            title: `${nuevoEstado} plantilla`,

            message: `
                La plantilla
                <strong>${plantilla.nombre}</strong>
                será
                ${nuevoEstado.toLowerCase()}.
            `,

            onConfirm: async () => {

                try {

                    await plantillasDocumentoService.cambiarEstado(
                        id,
                        nuevoEstado
                    );

                    await cargarPlantillas();

                }

                catch (error) {

                    console.error(
                        "Error al cambiar el estado:",
                        error
                    );

                    return false;
                }

            }

        });

    }

    catch (error) {

        console.error(
            "Error al consultar la plantilla:",
            error
        );

    }

}



