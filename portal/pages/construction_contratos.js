import {
    navigate
}
from "../router.js";

import {
    nuevoContrato
}
from "./construction_contrato_editor.js";

import {

    renderConstructionContratoEditor

}
from "./construction_contrato_editor.js";

import {
    contratosGeneradosService
}
from "../services/contratosGeneradosService.js";




export function renderConstructionContratos() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>

                Contratos

            </h1>

           <button
                id="btnGenerarContrato"
                class="btn-cubika-green">

                Generar Contrato

            </button>

        </div>


        <div class="card">

            <h2>

                Asistente de Generación
                de Contratos

            </h2>

        */
            <p>

                Genere contratos laborales
                utilizando trabajadores,
                empresas, obras, cargos y
                plantillas documentales.

            </p>
          /*
          
        </div>
 
 
        <div id="contratosTable">

        </div>

    `;


    document

        .getElementById(
            "btnGenerarContrato"
        )

        .addEventListener(

            "click",

            () => {

                nuevoContrato();

                navigate(
                    "construction_contrato_editor"
                );

            }

        );

    cargarContratosGenerados();

}


async function cargarContratosGenerados() {

    const tabla =
        document.getElementById(
            "contratosTable"
        );

    if (!tabla)
        return;


    const contratos =
        await contratosGeneradosService
            .getAll();


    if (!contratos.length) {

        tabla.innerHTML = `

            <div class="card">

                <p>

                    No hay contratos
                    generados todavía.

                </p>

            </div>

        `;

        return;

    }


    tabla.innerHTML = `

        <div class="card">

            <div class="table-container">

                <table class="cubika-table">

                    <thead>

                        <tr>

                            <th>Fecha generación</th>

                            <th>RUT trabajador</th>

                            <th>Trabajador</th>

                            <th>Tipo documento</th>

                            <th>Tipo contrato</th>

                            <th>Fecha inicio</th>

                            <th>Fecha fin</th>

                            <th>Causal fin</th>

                            <th>Sueldo base</th>

                            <th>Constructora</th>

                            <th>Obra</th>

                            <th>Cargo</th>

                            <th>Estado</th>

                            <th>Acciones</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${contratos.map(
                            contrato => {

                                const trabajador =

                                    contrato.worker
                                        ? `${contrato.worker.nombres ?? ""}
                                            ${contrato.worker.apellido_paterno ?? ""}
                                            ${contrato.worker.apellido_materno ?? ""}`
                                        .trim()
                                        : "-";


                                return `

                                    <tr>

                                        <td>
                                            ${formatearFechaHora(
                                                contrato.fecha_generacion
                                            )}
                                        </td>

                                        <td>
                                            ${contrato.worker?.rut ?? "-"}
                                        </td>

                                        <td>
                                            ${trabajador}
                                        </td>

                                        <td>
                                            Contrato
                                        </td>

                                        <td>
                                            ${contrato.tipo_contrato?.nombre ?? "-"}
                                        </td>

                                        <td>
                                            ${formatearFecha(
                                                contrato.fecha_inicio
                                            )}
                                        </td>

                                        <td>
                                            ${formatearFecha(
                                                contrato.fecha_termino
                                            )}
                                        </td>

                                        <td>
                                            ${contrato.causal_termino ?? "-"}
                                        </td>

                                        <td>
                                            ${formatearSueldo(
                                                contrato.sueldo
                                            )}
                                        </td>

                                        <td>
                                            ${contrato.obra?.constructora?.nombre ?? "-"}
                                        </td>

                                        <td>
                                            ${contrato.obra?.nombre ?? "-"}
                                        </td>

                                        <td>
                                            ${contrato.cargo?.nombre ?? "-"}
                                        </td>

                                        <td>
                                            ${contrato.estado ?? "-"}
                                        </td>

                                        <td>

                                            <button
                                                class="btn-cubika-secondary"
                                                data-contrato-id="${contrato.id}">

                                                Ver

                                            </button>

                                        </td>

                                    </tr>

                                `;

                            }
                        ).join("")}

                    </tbody>

                </table>

            </div>

        </div>

    `;

}


function formatearFecha(fecha) {

    if (!fecha)
        return "-";

    const partes =
        fecha.split("-");

    if (partes.length !== 3)
        return fecha;

    return `${partes[2]}-${partes[1]}-${partes[0]}`;

}


function formatearFechaHora(fecha) {

    if (!fecha)
        return "-";

    const date =
        new Date(fecha);

    return date.toLocaleString(
        "es-CL",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );

}


function formatearSueldo(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    )
        return "-";

    return Number(valor)
        .toLocaleString(
            "es-CL",
            {
                style: "currency",
                currency: "CLP",
                maximumFractionDigits: 0
            }
        );

}

