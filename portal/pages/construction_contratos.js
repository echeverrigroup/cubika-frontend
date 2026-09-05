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

import { supabase }
from "../../js/supabaseClient.js";

let filtrosContratosCargados = false;



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

                + Nuevo Contrato

            </button>

             </div>


       <div class="card">

            <h2>
        
                Historial de documentos generados. <br>
        
            </h2>
        
        
            <div class="cubika-filters"
                style="
                    display:grid;
                    grid-template-columns:repeat(3, minmax(0, 1fr));
                    gap:16px;
                "
            >
        
                <div class="form-group">
        
                    <label>Buscar</label>
        
                    <input
                        id="buscarContrato"
                        type="text"
                        class="cubika-input"
                        placeholder="Trabajador, RUT u obra..."
                    >
        
                </div>
        
        
                <div class="form-group">
        
                    <label>Constructora</label>
        
                    <select
                        id="filtroConstructora"
                        class="cubika-select">
        
                        <option value="">
                            Todas las constructoras
                        </option>
        
                    </select>
        
                </div>
        
        
                <div class="form-group">
        
                    <label>Obra</label>
        
                    <select
                        id="filtroObra"
                        class="cubika-select">
        
                        <option value="">
                            Todas las obras
                        </option>
        
                    </select>
        
                </div>
        
        
                <div class="form-group">
        
                    <label>Cargo</label>
        
                    <select
                        id="filtroCargo"
                        class="cubika-select">
        
                        <option value="">
                            Todos los cargos
                        </option>
        
                    </select>
        
                </div>
        
        
                <div class="form-group">
        
                    <label>Tipo contrato</label>
        
                    <select
                        id="filtroTipoContrato"
                        class="cubika-select">
        
                        <option value="">
                            Todos los tipos
                        </option>
        
                    </select>
        
                </div>
        
        
                <div class="form-group">
        
                    <label>Estado</label>
        
                    <select
                        id="filtroEstado"
                        class="cubika-select">
        
                        <option value="">
                            Todos los estados
                        </option>
        
                        <option value="GENERADO">
                            Generado
                        </option>
        
                        <option value="ACTIVO">
                            Activo
                        </option>
        
                        <option value="PROXIMO_VENCER">
                            Próximo a vencer
                        </option>
        
                        <option value="VENCIDO">
                            Vencido
                        </option>
        
                        <option value="FINIQUITADO">
                            Finiquitado
                        </option>
        
                    </select>
        
                </div>
        
            </div>
        
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

    const filtros = [

            "buscarContrato",
            "filtroConstructora",
            "filtroObra",
            "filtroCargo",
            "filtroTipoContrato",
            "filtroEstado"
        
        ];
        
        
        filtros.forEach(id => {
        
            const elemento =
                document.getElementById(id);
        
            if (!elemento)
                return;
        
        
            elemento.addEventListener(
                id === "buscarContrato"
                    ? "input"
                    : "change",
                () => {

            cargarContratosGenerados();

        }
    );

});

    const contratos =
    await cargarContratosGenerados();

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

    if (!filtrosContratosCargados) {

    cargarOpcionesFiltros(contratos);

    filtrosContratosCargados = true;

}


    const contratosFiltrados =
        filtrarContratos(contratos);

        for (
            const contrato
            of contratos
        ) {
        
            await sincronizarEstadoContrato(
                contrato
            );
        
        }
    

    contratos.forEach(
            contrato => {
        
                console.log(
                    contrato.numero_contrato,
                    determinarEstadoContrato(
                        contrato
                    )
                );
        
            }
        );


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

                        ${contratosFiltrados.map(
                            contrato => {
                        
                                const codigoEstado =
                                    determinarEstadoContrato(
                                        contrato
                                    );
                        
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
                                        

                                        <td class="estado-cell">                                        
                        
                                            <span
                                                class="estado-indicador ${
                                                    codigoEstado
                                                        .toLowerCase()
                                                        .replace("_", "-")
                                                }"
                                                title="${contrato.estado?.nombre ?? ""}"
                                            >
                        
                                                ${contrato.estado?.simbolo ?? "●"}
                        
                                            </span>
                        
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


function cargarOpcionesFiltros(contratos) {

    const constructoras =
        [...new Map(
            contratos
                .filter(c => c.obra?.constructora)
                .map(c => [
                    c.obra.constructora.id,
                    c.obra.constructora
                ])
        ).values()]
            .sort((a, b) =>
                a.nombre.localeCompare(b.nombre)
            );


    const obras =
        [...new Map(
            contratos
                .filter(c => c.obra)
                .map(c => [
                    c.obra.id,
                    c.obra
                ])
        ).values()]
            .sort((a, b) =>
                a.nombre.localeCompare(b.nombre)
            );


    const cargos =
        [...new Map(
            contratos
                .filter(c => c.cargo)
                .map(c => [
                    c.cargo.id,
                    c.cargo
                ])
        ).values()]
            .sort((a, b) =>
                a.nombre.localeCompare(b.nombre)
            );


    const tiposContrato =
        [...new Map(
            contratos
                .filter(c => c.tipo_contrato)
                .map(c => [
                    c.tipo_contrato.id,
                    c.tipo_contrato
                ])
        ).values()]
            .sort((a, b) =>
                a.nombre.localeCompare(b.nombre)
            );


    const selectConstructora =
        document.getElementById(
            "filtroConstructora"
        );

    const selectObra =
        document.getElementById(
            "filtroObra"
        );

    const selectCargo =
        document.getElementById(
            "filtroCargo"
        );

    const selectTipoContrato =
        document.getElementById(
            "filtroTipoContrato"
        );


    if (selectConstructora) {

        selectConstructora.innerHTML = `

            <option value="">
                Todas las constructoras
            </option>

            ${constructoras.map(
                constructora => `

                    <option value="${constructora.id}">
                        ${constructora.nombre}
                    </option>

                `
            ).join("")}

        `;
    }


    if (selectObra) {

        selectObra.innerHTML = `

            <option value="">
                Todas las obras
            </option>

            ${obras.map(
                obra => `

                    <option value="${obra.id}">
                        ${obra.nombre}
                    </option>

                `
            ).join("")}

        `;
    }


    if (selectCargo) {

        selectCargo.innerHTML = `

            <option value="">
                Todos los cargos
            </option>

            ${cargos.map(
                cargo => `

                    <option value="${cargo.id}">
                        ${cargo.nombre}
                    </option>

                `
            ).join("")}

        `;
    }


    if (selectTipoContrato) {

        selectTipoContrato.innerHTML = `

            <option value="">
                Todos los tipos
            </option>

            ${tiposContrato.map(
                tipo => `

                    <option value="${tipo.id}">
                        ${tipo.nombre}
                    </option>

                `
            ).join("")}

        `;
    }
}


function filtrarContratos(contratos) {

    const texto =
        document
            .getElementById("buscarContrato")
            ?.value
            .trim()
            .toUpperCase() ?? "";


    const constructora =
        document
            .getElementById("filtroConstructora")
            ?.value ?? "";


    const obra =
        document
            .getElementById("filtroObra")
            ?.value ?? "";


    const cargo =
        document
            .getElementById("filtroCargo")
            ?.value ?? "";


    const tipoContrato =
        document
            .getElementById("filtroTipoContrato")
            ?.value ?? "";


    const estado =
        document
            .getElementById("filtroEstado")
            ?.value ?? "";


    return contratos.filter(contrato => {

        const trabajador =

            contrato.worker

                ? `${contrato.worker.nombres ?? ""}
                    ${contrato.worker.apellido_paterno ?? ""}
                    ${contrato.worker.apellido_materno ?? ""}`

                : "";


        const rut =
            contrato.worker?.rut ?? "";


        const nombreObra =
            contrato.obra?.nombre ?? "";


        const coincideTexto =

            !texto ||

            `
                ${trabajador}
                ${rut}
                ${nombreObra}
            `
                .toUpperCase()
                .includes(texto);


        const coincideConstructora =

            !constructora ||

            String(
                contrato.obra?.constructora?.id ?? ""
            ) === constructora;


        const coincideObra =

            !obra ||

            String(
                contrato.obra?.id ?? ""
            ) === obra;


        const coincideCargo =

            !cargo ||

            String(
                contrato.cargo?.id ?? ""
            ) === cargo;


        const coincideTipoContrato =

            !tipoContrato ||

            String(
                contrato.tipo_contrato?.id ?? ""
            ) === tipoContrato;


        const codigoEstado =
            determinarEstadoContrato(
                contrato
            );


        const coincideEstado =

            !estado ||

            codigoEstado === estado;


        return (

            coincideTexto &&

            coincideConstructora &&

            coincideObra &&

            coincideCargo &&

            coincideTipoContrato &&

            coincideEstado

        );

    });
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


function determinarEstadoContrato(contrato) {

    const hoy =
        new Date();

    const fechaInicio =
        contrato.fecha_inicio
            ? new Date(
                contrato.fecha_inicio
            )
            : null;

    const fechaTermino =
        contrato.fecha_termino
            ? new Date(
                contrato.fecha_termino
            )
            : null;


    // Finiquitado es un estado
    // explícitamente asignado.
    if (
        contrato.estado?.codigo ===
        "FINIQUITADO"
    ) {

        return "FINIQUITADO";

    }


    // Un contrato sin fecha de término
    // nunca puede vencer.
    if (
        !fechaTermino
    ) {

        if (
            fechaInicio &&
            hoy < fechaInicio
        ) {

            return "GENERADO";

        }

        return "ACTIVO";

    }


    // Ya pasó la fecha de término.
    if (
        hoy > fechaTermino
    ) {

        return "VENCIDO";

    }


    // Faltan 15 días o menos.
    const diferenciaMs =
        fechaTermino - hoy;

    const diasRestantes =
        diferenciaMs /
        (
            1000 *
            60 *
            60 *
            24
        );


    if (
        diasRestantes <= 15
    ) {

        return "PROXIMO_VENCER";

    }


    // Todavía no comienza.
    if (
        fechaInicio &&
        hoy < fechaInicio
    ) {

        return "GENERADO";

    }


    return "ACTIVO";

}


async function sincronizarEstadoContrato(contrato) {

    const codigoEstado =
        determinarEstadoContrato(
            contrato
        );


    const estadoActual =
        contrato.estado?.codigo;


    if (
        codigoEstado === estadoActual
    ) {

        return contrato;

    }


    const { data: nuevoEstado, error } =
        await supabase
            .from("estados_contrato")
            .select("id, codigo, nombre, simbolo")
            .eq(
                "codigo",
                codigoEstado
            )
            .single();


    if (error)
        throw error;


    await contratosGeneradosService.update(

        contrato.id,

        {
            estado_id:
                nuevoEstado.id
        }

    );


    contrato.estado =
        nuevoEstado;


    return contrato;

}

