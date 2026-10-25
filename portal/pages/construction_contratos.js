import { storageService } from "../js/services/storageService.js";
import { construirDocumentoHtml } from "./construction_contrato_editor.js";

import {
    construirVariables,
    reemplazarVariables,
    validarPlantilla,
    obtenerVariablesPlantilla
} from "../modules/construccion/documentEngine.js";


import {
    constructorasService
} from "../services/constructorasService.js";

import {
    obrasService
} from "../services/obrasService.js";

import {
    cargosService
} from "../services/cargosService.js";

import {
    workersService
} from "../services/workersService.js";

import {
    empresasService    
} from "../services/empresasService.js";

import {
    navigate
}
from "../router.js";


import { plantillasDocumentoService }
    from "../services/plantillasDocumentoService.js";


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


import {
    documentNumberService
} from "../services/documentNumberService.js";

import {
    estadosContratoService
} from "../services/estadosContratoService.js";


import {
    documentosGeneradosEventosService
} from "../services/documentosGeneradosEventosService.js";


import { supabase }
from "../../js/supabaseClient.js";


let contratosVisibles = [];


let contratoPendienteDeApertura = null;

export function solicitarAperturaContrato(contratoId) {
    if (!contratoId) {
        console.error("No se recibió el ID del contrato.");
        return;
    }

    contratoPendienteDeApertura = String(contratoId);

    navigate("construction_contratos");
}



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


        <div class="cubika-tabs" role="tablist" aria-label="Vistas de documentos">
            <button
                type="button"
                id="tabContratos"
                class="cubika-tab active"
                role="tab"
                aria-selected="true"
            >
                Contratos
            </button>
        
            <button
                type="button"
                id="tabHistorial"
                class="cubika-tab"
                role="tab"
                aria-selected="false"
            >
                Historial
            </button>
        </div>


       <div id="vistaContratos" class="contratos-card">
       
        <details class="cubika-filters-panel">

   <summary class="cubika-filters-header">

        <span id="filtrosContratosTitulo">
            Filtros de búsqueda
        </span>
    
        <div class="cubika-filters-actions">
    
            <button
                type="button"
                id="btnLimpiarFiltros"
                class="btn-limpiar-filtros"
            >
                Limpiar filtros
            </button>
    
           <span class="cubika-filters-chevron">
                <img
                    src="/img/icons/filtros-desplegar.svg"
                    alt="Desplegar filtros"
                >
            </span>
    
        </div>
    
    </summary>


    <div
        class="cubika-filters"
        style="
            display:grid;
            grid-template-columns:repeat(4, minmax(0, 1fr));
            gap:16px;
            margin-top: 0;
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

            <label>Mandante</label>

            <select
                id="filtroMandante"
                class="cubika-select">

                <option value="">
                    Todas las empresas mandantes
                </option>

            </select>

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

</details>


<div class="contratos-table-toolbar">

    <div
        id="contratosResultadosResumen"
        class="historial-resultados-resumen contratos-resultados-resumen"
        aria-live="polite"
    >
        Mostrando 0 de 0
    </div>

    <div class="contratos-table-actions">

    <button
        type="button"
        id="btnExportarContratos"
        class="btn-exportar-excel"
        title="Exportar Excel"
        aria-label="Exportar Excel"
    >
        <img
            src="/img/icons/excel-exportar.png"
            alt=""
            aria-hidden="true"
        >
    </button>

    </div>

</div>

 
        <div id="contratosTable">

        </div>

        </div> <!-- Cierre de vistaContratos -->

    <div id="vistaHistorial" class="contratos-card" hidden>
           
        
            <details class="cubika-filters-panel historial-filters-panel">
                <summary class="cubika-filters-header">
                    <span>Filtros del historial</span>
                    <div class="cubika-filters-actions">
                        <button type="button" id="btnLimpiarFiltrosHistorial"
                            class="btn-limpiar-filtros">Limpiar filtros</button>
                        <span class="cubika-filters-chevron">
                            <img src="/img/icons/filtros-desplegar.svg" alt="Desplegar filtros">
                        </span>
                    </div>
                </summary>
                <div class="cubika-filters historial-filters-grid">
                    <div class="form-group">
                        <label for="buscarHistorial">Buscar</label>
                        <input id="buscarHistorial" type="text" class="cubika-input"
                            placeholder="Documento, trabajador o RUT...">
                    </div>
                    <div class="form-group">
                        <label for="filtroTipoHistorial">Tipo de documento</label>
                        <select id="filtroTipoHistorial" class="cubika-select">
                            <option value="">Todos los tipos</option>
                            <option value="CONTRATO">Contrato</option>
                            <option value="ANEXO">Anexo</option>
                            <option value="COMPLEMENTO">Complemento</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filtroEmpresaHistorial">Empresa mandante</label>
                        <select id="filtroEmpresaHistorial" class="cubika-select">
                            <option value="">Todas las empresas mandantes</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="historialFechaDesde">Fecha desde</label>
                        <input id="historialFechaDesde" type="date" class="cubika-input">
                    </div>
                    <div class="form-group">
                        <label for="historialFechaHasta">Fecha hasta</label>
                        <input id="historialFechaHasta" type="date" class="cubika-input">
                    </div>
                </div>
            </details>

            <div id="historialDocumentosTable">
                <p>Preparando el historial de documentos...</p>
            </div>
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


    const tabContratos = document.getElementById("tabContratos");
    const tabHistorial = document.getElementById("tabHistorial");
    const vistaContratos = document.getElementById("vistaContratos");
    const vistaHistorial = document.getElementById("vistaHistorial");
    
    function cambiarVistaDocumentos(vista) {
        const mostrarContratos = vista === "contratos";
    
        vistaContratos.hidden = !mostrarContratos;
        vistaHistorial.hidden = mostrarContratos;
    
        tabContratos.classList.toggle("active", mostrarContratos);
        tabHistorial.classList.toggle("active", !mostrarContratos);
    
        tabContratos.setAttribute(
            "aria-selected",
            String(mostrarContratos)
        );
    
        tabHistorial.setAttribute(
            "aria-selected",
            String(!mostrarContratos)
        );
    }
    
    tabContratos.addEventListener("click", () => {
        cambiarVistaDocumentos("contratos");
    });
    
    tabHistorial.addEventListener("click", () => {
        cambiarVistaDocumentos("historial");
        cargarHistorialDocumentos();
    });
    

    const btnLimpiarFiltros =
            document.getElementById(
                "btnLimpiarFiltros"
            );
        
        if (btnLimpiarFiltros) {
        
            btnLimpiarFiltros.addEventListener(
                "click",
                event => {
        
                    event.preventDefault();
                    event.stopPropagation();
        
                    document.getElementById(
                        "buscarContrato"
                    ).value = "";
        
                    document.getElementById(
                        "filtroMandante"
                    ).value = "";
        
                    document.getElementById(
                        "filtroConstructora"
                    ).value = "";
        
                    document.getElementById(
                        "filtroObra"
                    ).value = "";
        
                    document.getElementById(
                        "filtroCargo"
                    ).value = "";
        
                    document.getElementById(
                        "filtroTipoContrato"
                    ).value = "";
        
                    document.getElementById(
                        "filtroEstado"
                    ).value = "";
        
        
                    cargarContratosGenerados(true);
        
                }
            );
        
        }

    

    const btnExportarContratos =
            document.getElementById(
                "btnExportarContratos"
            );
        
        if (btnExportarContratos) {
        
            btnExportarContratos.addEventListener(
                "click",
                () => {
                    exportarContratosExcel(
                        contratosVisibles
                    );
                }
            );
        
        }
    

    const filtros = [
        "buscarContrato",
        "filtroMandante",
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
        
                    cargarContratosGenerados(true);
        
                }
            );
        
        });
    
    cargarContratosGenerados(true);

}


async function cargarContratosGenerados(cargarFiltros = false) {

    const tabla =
        document.getElementById(
            "contratosTable"
        );

    if (!tabla)
        return;


    const contratosTodos =
        await contratosGeneradosService.getAll();
    
    const contratos = contratosTodos.filter(
        documento =>
            documento.tipo_documento === "CONTRATO"
    );
    

    if (cargarFiltros) {

        cargarOpcionesFiltros(contratos);

        actualizarContadorFiltros();

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

    contratosVisibles = contratosFiltrados;


    if (contratoPendienteDeApertura) {
        const contratoId = contratoPendienteDeApertura;
    
        const contratoExiste = contratosVisibles.some(
            contrato => String(contrato.id) === contratoId
        );
    
        if (contratoExiste) {
            contratoPendienteDeApertura = null;
            abrirDetalleContrato(contratoId);
        } else {
            console.warn(
                "No se encontró el contrato solicitado:",
                contratoId
            );
    
            contratoPendienteDeApertura = null;
        }
    }


    const resumenContratos = document.getElementById(
        "contratosResultadosResumen"
    );

    if (resumenContratos) {
        resumenContratos.textContent =
            `Mostrando ${contratosFiltrados.length} de ${contratos.length}`;
    }

    if (!contratos.length) {

        tabla.innerHTML = `
            <div class="card">
                <p>No hay contratos generados todavía.</p>
            </div>
        `;

        return;

    }


    tabla.innerHTML = `

        <div class="card contratos-card">
        
        <div class="table-container contratos-table-scroll">
            <table class="cubika-table historial-documentos-table">


                    <thead>

                        <tr>

                            <th>Estado</th>

                            <th>Mandante</th>

                            <th>RUT trabajador</th>

                            <th>Trabajador</th>



                            <th>Cargo</th>

                            <th>Tipo contrato</th>

                            <th>Fecha inicio</th>



                            <th>Constructora</th>

                            <th>Obra</th>

                            <th>Acciones</th>

                            <th>Fecha generación</th>

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
                                            ${contrato.empresa?.nombre ?? "-"}
                                        </td>

                                        <td>
                                            ${contrato.worker?.rut ?? "-"}
                                        </td>

                                        <td>
                                            ${trabajador}
                                        </td>
                                        

                                         <td>
                                            ${contrato.cargo?.nombre ?? "-"}
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
                                            ${contrato.obra?.constructora?.nombre ?? "-"}
                                        </td>

                                        <td>
                                            ${contrato.obra?.nombre ?? "-"}
                                        </td>

                                        
                                      <td class="acciones-cell">

                                        <div class="cubika-actions">
                                    
                                            <!-- VER -->
                                            <button
                                                type="button"
                                                class="cubika-action"
                                                data-action="ver"
                                                data-contrato-id="${contrato.id}"
                                                title="Ver contrato"
                                                aria-label="Ver contrato"
                                            >
                                                <img
                                                    src="/img/icons/ver.svg"
                                                    alt=""
                                                >
                                            </button>
                                    
                                    
                                            <!-- DESCARGAR -->
                                            <button
                                                type="button"
                                                class="cubika-action"
                                                data-action="descargar"
                                                data-contrato-id="${contrato.id}"
                                                title="Descargar contrato"
                                                aria-label="Descargar contrato"
                                            >
                                                <img
                                                    src="/img/icons/descargar.svg"
                                                    alt=""
                                                >
                                            </button>
                                    
                                    
                                            <!-- AÑADIR ANEXO -->
                                            ${
                                                determinarEstadoContrato(contrato) !== "FINIQUITADO"
                                                    ? `
                                                        <button
                                                            type="button"
                                                            class="cubika-action"
                                                            data-action="anexo"
                                                            data-contrato-id="${contrato.id}"
                                                            title="Añadir anexo"
                                                            aria-label="Añadir anexo"
                                                        >
                                                            <img
                                                                src="/img/icons/anexo.svg"
                                                                alt=""
                                                            >
                                                        </button>
                                                    `
                                                    : ""
                                            }
                                    
                                    
                                            <!-- MÁS ACCIONES -->
                                            <button
                                                type="button"
                                                class="cubika-action"
                                                data-action="mas"
                                                data-contrato-id="${contrato.id}"
                                                title="Más acciones"
                                                aria-label="Más acciones"
                                            >
                                                <img
                                                    src="/img/icons/mas.svg"
                                                    alt=""
                                                >
                                            </button>
                                    
                                        </div>
                                    
                                    </td>
                                    

                                     <td>
                                            ${formatearFechaHora(
                                                contrato.fecha_generacion
                                            )}
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

    configurarAccionesContratos();

}




async function descargarContratoPDF(contratoId) {
    try {
        const contrato = contratosVisibles.find(
            item => String(item.id) === String(contratoId)
        );

        if (!contrato) {
            throw new Error(
                "No se encontró el contrato seleccionado."
            );
        }

        if (!contrato.empresa_id || !contrato.worker_id) {
            throw new Error(
                "Faltan datos para localizar el PDF del contrato."
            );
        }

        // El PDF original se guarda en esta ruta de Storage.
        const rutaPDF =
            `${contrato.empresa_id}/${contrato.worker_id}/${contrato.id}/contrato.pdf`;

            console.log("Contrato seleccionado:", contrato);
            console.log("Ruta PDF que se intentará descargar:", rutaPDF);

        // Generar una URL firmada nueva para evitar usar una URL vencida.
        const pdfUrl = await storageService.createSignedUrl(
            rutaPDF
        );

        // Recuperar el archivo almacenado.
        const response = await fetch(pdfUrl);

        if (!response.ok) {
            throw new Error(
                `No fue posible recuperar el PDF (${response.status}).`
            );
        }

        const pdfBlob = await response.blob();

        if (!pdfBlob.size) {
            throw new Error("El PDF recuperado está vacío.");
        }

        // Descargar el archivo original.
        const urlTemporal = URL.createObjectURL(pdfBlob);
        const enlace = document.createElement("a");

        enlace.href = urlTemporal;
        enlace.download =
            `contrato-${contrato.numero_contrato ?? contrato.id}.pdf`;

        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        setTimeout(() => {
            URL.revokeObjectURL(urlTemporal);
        }, 1000);

    } catch (error) {
        console.error(
            "Error al descargar el contrato:",
            error
        );

        alert(
            "No fue posible descargar el contrato. " +
            (error.message ?? "Revisa la consola para más detalles.")
        );
    }
}





function configurarAccionesContratos() {

    const botones =
        document.querySelectorAll(
            "#contratosTable .cubika-action"
        );

    botones.forEach(
        boton => {

            boton.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();

                    const accion =
                        boton.dataset.action;

                    const contratoId =
                        boton.dataset.contratoId;


                    console.log(
                        "Acción Gestor Documental:",
                        accion,
                        "Contrato:",
                        contratoId
                    );


                    if (accion === "ver") {

                        abrirDetalleContrato(contratoId);
                    
                    }

                    if (accion === "descargar") {
                        
                        descargarContratoPDF(contratoId);
                    
                    }
                    
                                        
                    if (accion === "anexo") {
                    
                        abrirSelectorPlantillaAnexo(contratoId);
                    
                    }
                }
            );

        }
    );

}




function abrirDetalleContrato(contratoId) {

    const contrato =
        contratosVisibles.find(
            contrato =>
                String(contrato.id) ===
                String(contratoId)
        );


    if (!contrato) {

        console.error(
            "No se encontró el contrato:",
            contratoId
        );

        return;

    }


    console.log(
        "Contrato seleccionado:",
        contrato
    );


    const trabajador =
        contrato.worker
            ? [
                contrato.worker.nombres,
                contrato.worker.apellido_paterno,
                contrato.worker.apellido_materno
            ]
                .filter(Boolean)
                .join(" ")
            : "-";


    const estado =
        determinarEstadoContrato(
            contrato
        );


    const estadoNombre =
        contrato.estado?.nombre ??
        estado;


    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "cubika-modal-overlay";


    modal.innerHTML = `

        <div class="cubika-modal contrato-detalle-modal">

            <div class="cubika-modal-header">

                <div>

                    <h2>
                        Detalle del contrato
                    </h2>

                    <span class="contrato-detalle-numero">
                        ${contrato.numero_contrato ?? "Sin número"}
                    </span>

                </div>


                <button
                    type="button"
                    class="cubika-modal-close"
                    aria-label="Cerrar"
                    title="Cerrar"
                >
                    ×
                </button>

            </div>


            <div class="contrato-detalle-body">


                <!-- ESTADO -->

                <div class="contrato-detalle-estado">

                    <span class="contrato-detalle-label">
                        Estado
                    </span>

                    <span class="contrato-detalle-estado-valor">
                        ${contrato.estado?.simbolo ?? "●"}
                        ${estadoNombre}
                    </span>

                </div>


                <!-- TRABAJADOR -->

                <section class="contrato-detalle-seccion">

                    <h3>
                        Trabajador
                    </h3>


                    <div class="contrato-detalle-grid">

                        <div class="contrato-detalle-item">

                            <span>
                                Nombre
                            </span>

                            <strong>
                                ${trabajador}
                            </strong>

                        </div>


                        <div class="contrato-detalle-item">

                            <span>
                                RUT
                            </span>

                            <strong>
                                ${contrato.worker?.rut ?? "-"}
                            </strong>

                        </div>

                    </div>

                </section>


                <!-- RELACIÓN LABORAL -->

                <section class="contrato-detalle-seccion">

                    <h3>
                        Relación laboral
                    </h3>


                    <div class="contrato-detalle-grid">

                        <div class="contrato-detalle-item">

                            <span>
                                Mandante
                            </span>

                            <strong>
                                ${contrato.empresa?.nombre ?? "-"}
                            </strong>

                        </div>


                        <div class="contrato-detalle-item">

                            <span>
                                Constructora
                            </span>

                            <strong>
                                ${contrato.obra?.constructora?.nombre ?? "-"}
                            </strong>

                        </div>


                        <div class="contrato-detalle-item">

                            <span>
                                Obra
                            </span>

                            <strong>
                                ${contrato.obra?.nombre ?? "-"}
                            </strong>

                        </div>


                        <div class="contrato-detalle-item">

                            <span>
                                Cargo
                            </span>

                            <strong>
                                ${contrato.cargo?.nombre ?? "-"}
                            </strong>

                        </div>

                    </div>

                </section>


                <!-- CONTRATO -->

                <section class="contrato-detalle-seccion">

                    <h3>
                        Contrato
                    </h3>


                    <div class="contrato-detalle-grid">

                        <div class="contrato-detalle-item">

                            <span>
                                Tipo de contrato
                            </span>

                            <strong>
                                ${contrato.tipo_contrato?.nombre ?? "-"}
                            </strong>

                        </div>


                        <div class="contrato-detalle-item">

                            <span>
                                Fecha generación
                            </span>

                            <strong>
                                ${formatearFechaHora(
                                    contrato.fecha_generacion
                                )}
                            </strong>

                        </div>


                        <div class="contrato-detalle-item">

                            <span>
                                Fecha inicio
                            </span>

                            <strong>
                                ${formatearFecha(
                                    contrato.fecha_inicio
                                )}
                            </strong>

                        </div>


                        <div class="contrato-detalle-item">

                            <span>
                                Fecha término
                            </span>

                            <strong>
                                ${formatearFecha(
                                    contrato.fecha_termino
                                )}
                            </strong>

                        </div>


                        <div class="contrato-detalle-item">

                            <span>
                                Sueldo base
                            </span>

                            <strong>
                                ${formatearSueldo(
                                    contrato.sueldo
                                )}
                            </strong>

                        </div>


                        <div class="contrato-detalle-item">

                            <span>
                                Causal de término
                            </span>

                            <strong>
                                ${contrato.causal_termino ?? "-"}
                            </strong>

                        </div>

                    </div>

                </section>


            </div>


            
            <div class="cubika-modal-footer contrato-detalle-footer">
            
                <div class="contrato-detalle-acciones-principales">
            
                    ${
                        estado !== "FINIQUITADO"
                            ? `
                                <button
                                    type="button"
                                    class="btn-detalle-anexo"
                                    data-accion-detalle="anexo"
                                >
                                    <span class="btn-detalle-icono">+</span>
                                    Añadir Anexo
                                </button>
            
                                <button
                                    type="button"
                                    class="btn-detalle-finiquitar"
                                    data-accion-detalle="finiquitar"
                                >
                                    Finiquitar
                                </button>
                            `
                            : ""
                    }
            
                    <button
                        type="button"
                        class="btn-detalle-historial"
                        data-accion-detalle="historial"
                        title="Historial contractual"
                        aria-label="Historial contractual"
                    >
                        <svg class="btn-detalle-historial-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M7 3.75h7l4 4v5.1" />
                            <path d="M14 3.75v4h4" />
                            <path d="M7 7.5H5.75A1.75 1.75 0 0 0 4 9.25v10A1.75 1.75 0 0 0 5.75 21h7.5A1.75 1.75 0 0 0 15 19.25V18" />
                            <path d="M7.5 11h5M7.5 14h3" />
                            <circle cx="17" cy="16" r="4.25" />
                            <path d="M17 13.8v2.45l1.65 1" />
                        </svg>
                    </button>
                </div>

                <button
                    type="button"
                    class="btn-detalle-cerrar"
                    data-cerrar-detalle
                >
                    Cerrar
                </button>
            
            </div>


        </div>

    `;


    document.body.appendChild(
        modal
    );


    const cerrar =
        () => {

            modal.remove();

        };


    modal
        .querySelector(
            ".cubika-modal-close"
        )
        .addEventListener(
            "click",
            cerrar
        );


    modal
        .querySelector(
            "[data-cerrar-detalle]"
        )
        .addEventListener(
            "click",
            cerrar
        );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                cerrar();

            }

        }
    );


    
    modal
        .querySelector('[data-accion-detalle="anexo"]')
        ?.addEventListener("click", () => {
            cerrar();
            abrirSelectorPlantillaAnexo(contrato.id);
        });

    modal
        .querySelector('[data-accion-detalle="historial"]')
        ?.addEventListener("click", () => {
            abrirHistorialContractual(contrato.id);
        });


}

async function abrirHistorialContractual(contratoId) {
    const anterior = document.getElementById("modalHistorialContractual");
    anterior?.remove();

    const modal = document.createElement("div");
    modal.id = "modalHistorialContractual";
    modal.className = "cubika-modal-overlay historial-contractual-overlay";
    modal.innerHTML = `
        <div class="cubika-modal historial-contractual-modal" role="dialog" aria-modal="true" aria-labelledby="historialContractualTitulo">
            <div class="cubika-modal-header historial-contractual-header">
                <div>
                    <h2 id="historialContractualTitulo">Historial contractual</h2>
                    <p class="historial-contractual-subtitulo">Trazabilidad de este contrato y sus documentos asociados</p>
                </div>
                <button type="button" class="cubika-modal-close" data-cerrar-historial aria-label="Cerrar">×</button>
            </div>
            <div class="historial-contractual-contenido">
                <p class="historial-contractual-cargando">Cargando historial contractual…</p>
            </div>
            <div class="cubika-modal-footer historial-contractual-footer">
                <button type="button" class="btn-detalle-cerrar" data-cerrar-historial> Cerrar </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const cerrar = () => modal.remove();
    modal.querySelectorAll("[data-cerrar-historial]").forEach(btn => btn.addEventListener("click", cerrar));
    modal.addEventListener("click", event => {
        if (event.target === modal) cerrar();
    });

    const contenido = modal.querySelector(".historial-contractual-contenido");
    const escapar = valor => String(valor ?? "—").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);

    const fechaHora = valor => {
        if (!valor) return "Fecha no registrada";
        const fecha = new Date(valor);
        if (Number.isNaN(fecha.getTime())) return "Fecha no registrada";
        return fecha.toLocaleString("es-CL", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    };

    // Las fechas de tipo DATE se formatean como fecha local para evitar desfases de zona horaria.
    const fechaSimple = valor => {
        if (!valor) return "No registrada";
        const soloFecha = String(valor).slice(0, 10);
        const partes = soloFecha.split("-");
        if (partes.length !== 3) return "No registrada";
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    };

    try {
        const [documentos, eventosDocumentales] = await Promise.all([
            contratosGeneradosService.getAll(),
            documentosGeneradosEventosService.getAll()
        ]);

        const seleccionado = documentos.find(d => String(d.id) === String(contratoId));
        if (!seleccionado) {
            contenido.innerHTML = `<p class="historial-contractual-vacio">No se encontró el contrato seleccionado.</p>`;
            return;
        }

        // Resolver el contrato raíz para que el historial se limite a esta relación laboral,
        // sin mezclar otros contratos del mismo trabajador.
        const porId = new Map(documentos.map(d => [String(d.id), d]));
        let raiz = seleccionado;
        const visitados = new Set();
        while (raiz.contrato_madre_id && porId.has(String(raiz.contrato_madre_id)) && !visitados.has(String(raiz.id))) {
            visitados.add(String(raiz.id));
            raiz = porId.get(String(raiz.contrato_madre_id));
        }

        const idsRelacionados = new Set([String(raiz.id)]);
        let cambio = true;
        while (cambio) {
            cambio = false;
            documentos.forEach(d => {
                if (d.contrato_madre_id && idsRelacionados.has(String(d.contrato_madre_id)) && !idsRelacionados.has(String(d.id))) {
                    idsRelacionados.add(String(d.id));
                    cambio = true;
                }
            });
        }

        const documentosRelacionados = documentos.filter(d => idsRelacionados.has(String(d.id)));
        const nombreTrabajador = d => [d.worker?.nombres, d.worker?.apellido_paterno, d.worker?.apellido_materno].filter(Boolean).join(" ") || "Trabajador sin nombre";
        const nombreTipo = tipo => ({
            CONTRATO: "Contrato original",
            ANEXO: "Anexo",
            COMPLEMENTO: "Complemento"
        }[String(tipo || "").toUpperCase()] || String(tipo || "Documento"));

        const entradas = documentosRelacionados.map(d => ({
            fecha: d.fecha_generacion || d.created_at,
            titulo: nombreTipo(d.tipo_documento),
            detalle: [
                d.numero_contrato ? `N.º ${d.numero_contrato}` : "",
                d.plantilla?.nombre || "",
                d.estado?.nombre ? `Estado: ${d.estado.nombre}` : "",
                d.observaciones || ""
            ].filter(Boolean).join(" · "),
            clase: String(d.tipo_documento || "").toLowerCase() || "documento",
            tipo: "documento"
        }));

        // Los complementos pueden existir únicamente como eventos documentales.
        // Solo se incorporan los registros GENERADO, que representan el documento;
        // los logs de descarga y error no son hitos del roadmap.
        const idsRelacionadosTexto = new Set([...idsRelacionados].map(String));
        const complementosPersistidos = documentosRelacionados
            .filter(d => String(d.tipo_documento || "").toUpperCase() === "COMPLEMENTO");

        const complementosGenerados = eventosDocumentales
            .filter(e =>
                String(e.evento || "").toUpperCase() === "GENERADO" &&
                String(e.tipo_documento || "").toUpperCase() === "COMPLEMENTO" &&
                idsRelacionadosTexto.has(String(e.contrato_id))
            )
            .filter(e => {
                // Evita duplicar un complemento si también existe como documento persistido.
                const nombreEvento = String(e.nombre_documento || "").trim().toLocaleLowerCase("es");
                return !complementosPersistidos.some(d => {
                    const nombrePersistido = String(
                        d.nombre_documento || d.plantilla?.nombre || ""
                    ).trim().toLocaleLowerCase("es");
                    return nombreEvento && nombrePersistido && nombreEvento === nombrePersistido;
                });
            })
            .map(e => ({
                fecha: e.created_at,
                titulo: nombreTipo("COMPLEMENTO"),
                detalle: String(e.nombre_documento || "Complemento generado"),
                clase: "complemento",
                tipo: "documento"
            }));

        entradas.push(...complementosGenerados);
        entradas.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));

        const resumen = `
            <div class="historial-contractual-resumen">
                <div><span>Trabajador</span><strong>${escapar(nombreTrabajador(seleccionado))}</strong></div>
                <div><span>RUT</span><strong>${escapar(seleccionado.worker?.rut || "—")}</strong></div>
                <div><span>Empresa</span><strong>${escapar(seleccionado.empresa?.nombre || "—")}</strong></div>
                <div><span>Inicio de Relación Laboral</span><strong>${escapar(fechaSimple(raiz.fecha_inicio))}</strong></div>
            </div>`;

        const lista = entradas.length ? `
            <ol class="historial-contractual-timeline">
                ${entradas.map(e => `
                    <li class="historial-contractual-evento ${escapar(e.clase)}">
                        <span class="historial-contractual-punto" aria-hidden="true"></span>
                        <div class="historial-contractual-evento-cuerpo">
                            <div class="historial-contractual-evento-cabecera">
                                <strong>${escapar(e.titulo)}</strong>
                                <time>${escapar(fechaHora(e.fecha))}</time>
                            </div>
                            ${e.detalle ? `<p>${escapar(e.detalle)}</p>` : ""}
                        </div>
                    </li>
                `).join("")}
            </ol>` : `<p class="historial-contractual-vacio">Todavía no hay hitos contractuales registrados para este contrato.</p>`;

        contenido.innerHTML = resumen + lista;
    } catch (error) {
        console.error("Error al cargar historial contractual:", error);
        contenido.innerHTML = `<p class="historial-contractual-error">No fue posible cargar el historial contractual. Revisa la consola para ver el detalle del error.</p>`;
    }
}



async function abrirSelectorPlantillaAnexo(contratoId) {

    const contrato =
        contratosVisibles.find(
            contrato =>
                String(contrato.id) ===
                String(contratoId)
        );

    if (!contrato) {

        console.error(
            "No se encontró el contrato para crear el anexo:",
            contratoId
        );

        return;
    }


    try {

        const plantillas =
            await plantillasDocumentoService.getAll();


        const plantillasAnexo =
            plantillas.filter(
                plantilla =>
                    plantilla.tipo_documento
                        ?.toLowerCase() === "anexo"
                    &&
                    plantilla.estado
                        ?.toLowerCase() === "activo"
            );


        if (!plantillasAnexo.length) {

            alert(
                "No existen plantillas de Anexo activas."
            );

            return;
        }


        const modal =
            document.createElement(
                "div"
            );

        modal.className =
            "cubika-modal-overlay";


        modal.innerHTML = `

            <div class="cubika-modal contrato-detalle-modal">

                <div class="cubika-modal-header">

                    <div>

                        <h2>
                            Añadir anexo
                        </h2>

                        <span class="contrato-detalle-numero">

                            ${contrato.numero_contrato ?? "Sin número"}

                        </span>

                    </div>


                    <button
                        type="button"
                        class="cubika-modal-close"
                        aria-label="Cerrar"
                        title="Cerrar"
                    >
                        ×
                    </button>

                </div>


                <div class="contrato-detalle-body">

                    <section class="contrato-detalle-seccion">

                        <h3>
                            Selecciona una plantilla
                        </h3>


                        <div
                            class="anexo-plantillas-lista"
                        >

                            ${plantillasAnexo.map(
                                plantilla => `

                                    <button
                                        type="button"
                                        class="anexo-plantilla-option"
                                        data-plantilla-id="${plantilla.id}"
                                    >

                                        <span>
                                            ${plantilla.nombre}
                                        </span>

                                        <span>
                                            →
                                        </span>

                                    </button>

                                `
                            ).join("")}

                        </div>

                    </section>

                </div>


                <div class="cubika-modal-footer">

                    <button
                        type="button"
                        class="btn-cubika-secondary"
                        data-cerrar-anexo
                    >
                        Cancelar
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        const cerrar = () => {

            modal.remove();

        };


        modal
            .querySelector(
                ".cubika-modal-close"
            )
            .addEventListener(
                "click",
                cerrar
            );


        modal
            .querySelector(
                "[data-cerrar-anexo]"
            )
            .addEventListener(
                "click",
                cerrar
            );


        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    cerrar();

                }

            }
        );


        modal
            .querySelectorAll(
                ".anexo-plantilla-option"
            )
            .forEach(
                boton => {

                    boton.addEventListener(
                        "click",
                        () => {

                            const plantillaId =
                                boton.dataset.plantillaId;
                        
                            const plantillaSeleccionada =
                                plantillas.find(
                                    plantilla =>
                                        String(plantilla.id) ===
                                        String(plantillaId)
                                );
                        
                            if (!plantillaSeleccionada) {
                                alert(
                                    "No fue posible identificar la plantilla seleccionada."
                                );
                                return;
                            }
                        
                            modal.remove();
                        
                            abrirFormularioAnexo(
                                contrato,
                                plantillaSeleccionada
                            );

                        }
                    );

                }
            );

    }
    catch (error) {

        console.error(
            "Error al cargar plantillas de Anexo:",
            error
        );

        alert(
            "No fue posible cargar las plantillas de Anexo."
        );

    }

}




async function abrirFormularioAnexo(contrato, plantilla) {
    const trabajadorNombre = contrato.worker
        ? [
            contrato.worker.nombres,
            contrato.worker.apellido_paterno,
            contrato.worker.apellido_materno
        ].filter(Boolean).join(" ")
        : "-";

    const esTraslado = plantilla.tipo_anexo === "TRASLADO";

    const overlay = document.createElement("div");
    overlay.className = "cubika-modal-overlay";

    overlay.innerHTML = `
        <div class="cubika-modal contrato-anexo-modal">
            <div class="cubika-modal-header">
                <div>
                    <h2>Añadir anexo</h2>
                    <p>Completa los antecedentes necesarios para generar el documento.</p>
                </div>
                <button type="button" class="cubika-modal-close"
                    id="cerrarFormularioAnexo" aria-label="Cerrar">×</button>
            </div>

            <div class="cubika-modal-body">
                <div class="anexo-contexto">
                    <div>
                        <span>Contrato</span>
                        <strong>${contrato.numero_contrato ?? "-"}</strong>
                    </div>
                    <div>
                        <span>Trabajador</span>
                        <strong>${trabajadorNombre}</strong>
                    </div>
                    <div>
                        <span>Plantilla</span>
                        <strong>${plantilla.nombre}</strong>
                    </div>
                </div>

                <div class="anexo-seccion">
                    <div class="anexo-seccion-header">
                        <h3>Datos del anexo</h3>
                        <p>Estos antecedentes serán utilizados al generar el documento.</p>
                    </div>

                    <div class="anexo-form-grid">
                        ${
                            esTraslado
                                ? `
                                    <div class="form-group">
                                        <label for="anexoObra">Nueva obra</label>
                                        <select id="anexoObra" class="cubika-input" required>
                                            <option value="">Cargando obras...</option>
                                        </select>
                                    </div>
                                `
                                : ""
                        }

                        <div class="form-group">
                            <label for="anexoFechaVigencia">Fecha de vigencia</label>
                            <input type="date" id="anexoFechaVigencia"
                                class="cubika-input" required>
                        </div>

                        <div class="form-group">
                            <label for="anexoObservaciones">Observaciones</label>
                            <input type="text" id="anexoObservaciones"
                                class="cubika-input"
                                placeholder="Observaciones del anexo">
                        </div>
                    </div>
                </div>
            </div>

            <div class="cubika-modal-footer">
                <button type="button" class="btn-cubika-secondary"
                    id="cancelarFormularioAnexo">Cancelar</button>
                <button type="button" class="btn-cubika-green"
                    id="continuarFormularioAnexo">Generar anexo</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const cerrar = () => overlay.remove();

    overlay.querySelector("#cerrarFormularioAnexo")
        ?.addEventListener("click", cerrar);

    overlay.querySelector("#cancelarFormularioAnexo")
        ?.addEventListener("click", cerrar);

    if (esTraslado) {
        const selectObra = overlay.querySelector("#anexoObra");

        try {
            const obras = await obrasService.getAll();

            const obrasActivas = obras.filter(
                obra => obra.estado?.toLowerCase() === "activa"
            );

            selectObra.innerHTML = `
                <option value="">Selecciona una obra</option>
            `;

            obrasActivas.forEach(obra => {
                const option = document.createElement("option");
                option.value = obra.id;
                option.textContent = [
                    obra.nombre,
                    obra.constructora?.nombre,
                    obra.comuna?.nombre
                ].filter(Boolean).join(" — ");

                selectObra.appendChild(option);
            });

            if (!obrasActivas.length) {
                selectObra.innerHTML = `
                    <option value="">No hay obras activas disponibles</option>
                `;
            }
        } catch (error) {
            console.error("Error al cargar obras:", error);
            selectObra.innerHTML = `
                <option value="">Error al cargar las obras</option>
            `;
        }
    }

    const botonGenerar = overlay.querySelector("#continuarFormularioAnexo");

    botonGenerar.addEventListener("click", async () => {
        const fechaVigencia =
            overlay.querySelector("#anexoFechaVigencia")?.value;

        const observaciones =
            overlay.querySelector("#anexoObservaciones")?.value.trim() ?? "";

        const obraId = esTraslado
            ? overlay.querySelector("#anexoObra")?.value
            : contrato.obra_id;

        if (!fechaVigencia) {
            alert("Debes indicar la fecha de vigencia del anexo.");
            return;
        }

        if (esTraslado && !obraId) {
            alert("Debes seleccionar la nueva obra para el traslado.");
            return;
        }

        botonGenerar.disabled = true;
        botonGenerar.textContent = "Generando...";

        try {
            // 1. Recuperar los datos completos del contrato original.
            const [
                empresa,
                trabajador,
                obra,
                cargo,
                plantillaCompleta
            ] = await Promise.all([
                empresasService.getById(contrato.empresa_id),
                workersService.getByIdForDocument(contrato.worker_id),
                obrasService.getById(obraId),
                cargosService.getById(contrato.cargo_id),
                plantillasDocumentoService.getById(plantilla.id)
            ]);

            // La constructora debe corresponder a la obra seleccionada.
            const constructora = await constructorasService.getById(
                obra.constructora_id
            );

            // 2. Construir las variables sin alterar el contrato original.
            const contratoParaDocumento = {
                ...contrato,
                observaciones
            };

            const datosDocumento = {
                empresa,
                constructora,
                trabajador,
                obra,
                cargo,
                contrato: contratoParaDocumento,
                fechaVigencia
            };

            const variables = construirVariables(datosDocumento);

            variables.NUMERO_CONTRATO = contrato.numero_contrato ?? "";

            const contenidoHtml = reemplazarVariables(
                plantillaCompleta.contenido,
                variables
            );

            if (!contenidoHtml.trim()) {
                throw new Error(
                    "La plantilla no generó contenido. Revisa su campo contenido."
                );
            }

            // 3. Obtener el estado y el número del nuevo anexo.
            const [numeroAnexo, estadoGenerado] = await Promise.all([
                documentNumberService.generarNumeroDocumento("ANX"),
                estadosContratoService.getByCodigo("GENERADO")
            ]);

            if (!estadoGenerado?.id) {
                throw new Error(
                    "No se encontró el estado GENERADO en estados_contrato."
                );
            }

            // 4. Guardar un registro independiente vinculado al contrato madre.
            const registroAnexo = {
                worker_id: contrato.worker_id,
                empresa_id: contrato.empresa_id,
                obra_id: obraId,
                cargo_id: contrato.cargo_id,
                plantilla_id: plantilla.id,
                numero_contrato: numeroAnexo,

                fecha_inicio: contrato.fecha_inicio,
                fecha_termino: contrato.fecha_termino,
                sueldo: contrato.sueldo,
                jornada_id: contrato.jornada_id,
                distribucion_horaria: contrato.distribucion_horaria,
                causal_termino: contrato.causal_termino,

                observaciones,
                contenido_html: contenidoHtml,
                variables,

                estado_id: estadoGenerado.id,
                tipo_documento: "ANEXO",
                contrato_madre_id: contrato.id
            };

            // 1. Crear el registro del anexo en Supabase.
            const anexoCreado = await contratosGeneradosService.create(
                registroAnexo
            );
            
            if (!anexoCreado?.id) {
                throw new Error(
                    "El anexo se guardó, pero no se obtuvo su ID."
                );
            }
            
            // 2. Obtener la URL del logo de la empresa, si existe.
            const logoUrl = empresa?.logo_path
                ? await storageService.createSignedUrlLogo(
                    empresa.logo_path
                )
                : null;
            
            // 3. Construir el HTML definitivo del documento.
            const documentoPdfHtml = await construirDocumentoHtml(
                contenidoHtml,
                logoUrl,
                variables.NOMBRE_EMPRESA ?? "",
                "ANEXO DE CONTRATO DE TRABAJO"
            );
            
            // 4. Solicitar la generación del PDF a la API.
            const response = await fetch(
                "https://api.cubika.cl/api/pdf",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        html: documentoPdfHtml
                    })
                }
            );
            
            if (!response.ok) {
                const detalle = await response.text();
            
                throw new Error(
                    `Error generando PDF (${response.status}): ${detalle}`
                );
            }
            
            // 5. Obtener el PDF generado.
            const pdfBlob = await response.blob();
            
            if (!pdfBlob.size) {
                throw new Error(
                    "La API devolvió un PDF vacío."
                );
            }
            
            // 6. Subir el PDF a Storage, con un nombre independiente.
            const upload = await storageService.uploadContrato({
                empresaId: anexoCreado.empresa_id,
                workerId: anexoCreado.worker_id,
                contratoId: anexoCreado.id,
                pdfBlob,
                nombreArchivo: "anexo.pdf"
            });
            
            // 7. Crear la URL firmada.
            const pdfUrl = await storageService.createSignedUrl(
                upload.path
            );
            
            // 8. Guardar la URL en el registro del anexo.
            await contratosGeneradosService.update(
                anexoCreado.id,
                {
                    pdf_url: pdfUrl
                }
            );
            
            // 9. Descargar el PDF.
            const downloadUrl = URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
            
            link.href = downloadUrl;
            link.download = `anexo-${numeroAnexo}.pdf`;
            
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            setTimeout(() => {
                URL.revokeObjectURL(downloadUrl);
            }, 1000);
            
            // 10. Confirmar el éxito y actualizar el listado.
            alert(`Anexo ${numeroAnexo} generado y guardado correctamente.`);
            
            cerrar();
            
            await cargarContratosGenerados(true);
            

        } catch (error) {
            console.error("Error al generar el anexo:", error);

            alert(
                "No fue posible generar el anexo. " +
                (error.message ?? "Revisa la consola para más detalles.")
            );

            botonGenerar.disabled = false;
            botonGenerar.textContent = "Generar anexo";
        }
    });
}




function cargarOpcionesFiltros(contratos) {

    const filtros = {
        mandante: "filtroMandante",
        constructora: "filtroConstructora",
        obra: "filtroObra",
        cargo: "filtroCargo",
        tipoContrato: "filtroTipoContrato",
        estado: "filtroEstado"
    };


    /*
     * Primero eliminamos selecciones que ya no son válidas.
     */

    Object.entries(filtros).forEach(
        ([nombreFiltro, idSelect]) => {

            const select =
                document.getElementById(idSelect);

            if (!select)
                return;


            const valorActual =
                select.value;

            if (!valorActual)
                return;


            const contratosCompatibles =
                filtrarContratos(
                    contratos,
                    nombreFiltro
                );


            const valoresDisponibles =
                obtenerValoresDisponibles(
                    contratosCompatibles,
                    nombreFiltro
                );


            if (
                !valoresDisponibles.has(
                    String(valorActual)
                )
            ) {

                select.value = "";

            }

        }
    );


    /*
     * Reconstruimos las opciones de cada filtro
     * según los demás filtros activos.
     */

    Object.entries(filtros).forEach(
        ([nombreFiltro, idSelect]) => {

            const select =
                document.getElementById(idSelect);

            if (!select)
                return;


            const valorActual =
                select.value;


            const contratosCompatibles =
                filtrarContratos(
                    contratos,
                    nombreFiltro
                );


            const valoresDisponibles =
                obtenerValoresDisponibles(
                    contratosCompatibles,
                    nombreFiltro
                );


            /* =========================
               MANDANTE
               ========================= */

            if (nombreFiltro === "mandante") {

                const mandantes =
                    [...new Map(
                        contratosCompatibles
                            .filter(
                                c =>
                                    c.empresa
                            )
                            .map(
                                c => [
                                    c.empresa.id,
                                    c.empresa
                                ]
                            )
                    ).values()]
                    .sort(
                        (a, b) =>
                            a.nombre.localeCompare(
                                b.nombre
                            )
                    );


                select.innerHTML = `

                    <option value="">
                        Todas las mandantes
                    </option>

                    ${mandantes.map(
                        mandante => `

                            <option
                                value="${mandante.id}"
                                ${String(mandante.id) === String(valorActual)
                                    ? "selected"
                                    : ""}
                            >
                                ${mandante.nombre}
                            </option>

                        `
                    ).join("")}

                `;

            }


            /* =========================
               CONSTRUCTORA
               ========================= */

            else if (
                nombreFiltro === "constructora"
            ) {

                const constructoras =
                    [...new Map(
                        contratosCompatibles
                            .filter(
                                c =>
                                    c.obra?.constructora
                            )
                            .map(
                                c => [
                                    c.obra.constructora.id,
                                    c.obra.constructora
                                ]
                            )
                    ).values()]
                    .sort(
                        (a, b) =>
                            a.nombre.localeCompare(
                                b.nombre
                            )
                    );


                select.innerHTML = `

                    <option value="">
                        Todas las constructoras
                    </option>

                    ${constructoras.map(
                        constructora => `

                            <option
                                value="${constructora.id}"
                                ${String(constructora.id) === String(valorActual)
                                    ? "selected"
                                    : ""}
                            >
                                ${constructora.nombre}
                            </option>

                        `
                    ).join("")}

                `;

            }


            /* =========================
               OBRA
               ========================= */

            else if (
                nombreFiltro === "obra"
            ) {

                const obras =
                    [...new Map(
                        contratosCompatibles
                            .filter(
                                c =>
                                    c.obra
                            )
                            .map(
                                c => [
                                    c.obra.id,
                                    c.obra
                                ]
                            )
                    ).values()]
                    .sort(
                        (a, b) =>
                            a.nombre.localeCompare(
                                b.nombre
                            )
                    );


                select.innerHTML = `

                    <option value="">
                        Todas las obras
                    </option>

                    ${obras.map(
                        obra => `

                            <option
                                value="${obra.id}"
                                ${String(obra.id) === String(valorActual)
                                    ? "selected"
                                    : ""}
                            >
                                ${obra.nombre}
                            </option>

                        `
                    ).join("")}

                `;

            }


            /* =========================
               CARGO
               ========================= */

            else if (
                nombreFiltro === "cargo"
            ) {

                const cargos =
                    [...new Map(
                        contratosCompatibles
                            .filter(
                                c =>
                                    c.cargo
                            )
                            .map(
                                c => [
                                    c.cargo.id,
                                    c.cargo
                                ]
                            )
                    ).values()]
                    .sort(
                        (a, b) =>
                            a.nombre.localeCompare(
                                b.nombre
                            )
                    );


                select.innerHTML = `

                    <option value="">
                        Todos los cargos
                    </option>

                    ${cargos.map(
                        cargo => `

                            <option
                                value="${cargo.id}"
                                ${String(cargo.id) === String(valorActual)
                                    ? "selected"
                                    : ""}
                            >
                                ${cargo.nombre}
                            </option>

                        `
                    ).join("")}

                `;

            }


            /* =========================
               TIPO CONTRATO
               ========================= */

            else if (
                nombreFiltro === "tipoContrato"
            ) {

                const tiposContrato =
                    [...new Map(
                        contratosCompatibles
                            .filter(
                                c =>
                                    c.tipo_contrato
                            )
                            .map(
                                c => [
                                    c.tipo_contrato.id,
                                    c.tipo_contrato
                                ]
                            )
                    ).values()]
                    .sort(
                        (a, b) =>
                            a.nombre.localeCompare(
                                b.nombre
                            )
                    );


                select.innerHTML = `

                    <option value="">
                        Todos los tipos
                    </option>

                    ${tiposContrato.map(
                        tipo => `

                            <option
                                value="${tipo.id}"
                                ${String(tipo.id) === String(valorActual)
                                    ? "selected"
                                    : ""}
                            >
                                ${tipo.nombre}
                            </option>

                        `
                    ).join("")}

                `;

            }


            /* =========================
               ESTADO
               ========================= */

            else if (
                nombreFiltro === "estado"
            ) {

                const estados = [

                    {
                        codigo: "GENERADO",
                        nombre: "Generado"
                    },

                    {
                        codigo: "ACTIVO",
                        nombre: "Activo"
                    },

                    {
                        codigo: "PROXIMO_VENCER",
                        nombre: "Próximo a vencer"
                    },

                    {
                        codigo: "VENCIDO",
                        nombre: "Vencido"
                    },

                    {
                        codigo: "FINIQUITADO",
                        nombre: "Finiquitado"
                    }

                ];


                select.innerHTML = `

                    <option value="">
                        Todos los estados
                    </option>

                    ${estados
                        .filter(
                            estado =>
                                valoresDisponibles.has(
                                    estado.codigo
                                )
                        )
                        .map(
                            estado => `

                                <option
                                    value="${estado.codigo}"
                                    ${estado.codigo === valorActual
                                        ? "selected"
                                        : ""}
                                >
                                    ${estado.nombre}
                                </option>

                            `
                        )
                        .join("")}

                `;

            }

        }
    );

}



function obtenerValoresDisponibles(
    contratos,
    nombreFiltro
) {

    const valores =
        new Set();

    if (nombreFiltro === "mandante") {

        contratos.forEach(contrato => {
    
            if (contrato.empresa?.id) {
    
                valores.add(
                    String(
                        contrato.empresa.id
                    )
                );
    
            }
    
        });
    
    }


    contratos.forEach(contrato => {

        if (nombreFiltro === "constructora") {

            if (contrato.obra?.constructora?.id) {

                valores.add(
                    String(
                        contrato.obra.constructora.id
                    )
                );

            }

        }


        else if (nombreFiltro === "obra") {

            if (contrato.obra?.id) {

                valores.add(
                    String(
                        contrato.obra.id
                    )
                );

            }

        }


        else if (nombreFiltro === "cargo") {

            if (contrato.cargo?.id) {

                valores.add(
                    String(
                        contrato.cargo.id
                    )
                );

            }

        }


        else if (nombreFiltro === "tipoContrato") {

            if (contrato.tipo_contrato?.id) {

                valores.add(
                    String(
                        contrato.tipo_contrato.id
                    )
                );

            }

        }


        else if (nombreFiltro === "estado") {

            valores.add(
                determinarEstadoContrato(
                    contrato
                )
            );

        }

    });


    return valores;

}



function filtrarContratos(
    contratos,
    filtroExcluido = null
) {

    const texto =
        document
            .getElementById("buscarContrato")
            ?.value
            .trim()
            .toUpperCase() ?? "";

    const mandante =
        document
            .getElementById("filtroMandante")
            ?.value ?? "";


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


    return contratos.filter(
        contrato => {


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

            const coincideMandante =
            
                filtroExcluido === "mandante" ||
            
                !mandante ||
            
                String(
                    contrato.empresa?.id ?? ""
                ) === String(mandante);


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

                filtroExcluido === "constructora" ||

                !constructora ||

                String(
                    contrato.obra?.constructora?.id ?? ""
                ) === String(constructora);


            const coincideObra =

                filtroExcluido === "obra" ||

                !obra ||

                String(
                    contrato.obra?.id ?? ""
                ) === String(obra);


            const coincideCargo =

                filtroExcluido === "cargo" ||

                !cargo ||

                String(
                    contrato.cargo?.id ?? ""
                ) === String(cargo);


            const coincideTipoContrato =

                filtroExcluido === "tipoContrato" ||

                !tipoContrato ||

                String(
                    contrato.tipo_contrato?.id ?? ""
                ) === String(tipoContrato);


            const codigoEstado =
                determinarEstadoContrato(
                    contrato
                );


            const coincideEstado =

                filtroExcluido === "estado" ||

                !estado ||

                codigoEstado === estado;


            return (

                coincideTexto &&

                coincideMandante &&

                coincideConstructora &&

                coincideObra &&

                coincideCargo &&

                coincideTipoContrato &&

                coincideEstado

            );

        }
    );

}


function actualizarContadorFiltros() {

    const titulo =
        document.getElementById(
            "filtrosContratosTitulo"
        );

    if (!titulo)
        return;


    const filtros = [

        document.getElementById(
            "buscarContrato"
        ),

        document.getElementById(
            "filtroMandante"
        ),

        document.getElementById(
            "filtroConstructora"
        ),

        document.getElementById(
            "filtroObra"
        ),

        document.getElementById(
            "filtroCargo"
        ),

        document.getElementById(
            "filtroTipoContrato"
        ),

        document.getElementById(
            "filtroEstado"
        )

    ];


    const cantidad =
        filtros.filter(
            filtro =>
                filtro &&
                filtro.value.trim() !== ""
        ).length;


    titulo.textContent =
        cantidad > 0

            ? `Filtros de búsqueda · ${cantidad} aplicados`

            : "Filtros de búsqueda";

    const btnLimpiarFiltros =
        document.getElementById(
            "btnLimpiarFiltros"
        );
    
    if (btnLimpiarFiltros) {
    
        btnLimpiarFiltros.style.display =
            cantidad > 0
                ? "inline-block"
                : "none";
    
    }

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



async function cargarHistorialDocumentos() {
    const tabla = document.getElementById("historialDocumentosTable");
    if (!tabla) return;
    tabla.innerHTML = "<p>Cargando historial...</p>";

    try {
        const [documentos, eventos] = await Promise.all([
            contratosGeneradosService.getAll(),
            documentosGeneradosEventosService.getAll()
        ]);

        const documentosPersistidos = documentos
            .filter(d => ["CONTRATO", "ANEXO"].includes(String(d.tipo_documento || "").toUpperCase()))
            .map(d => ({
                id: d.id,
                fecha: d.fecha_generacion || d.created_at,
                tipo: String(d.tipo_documento || "").toUpperCase(),
                nombre: String(d.tipo_documento || "").toUpperCase() === "ANEXO"
                    ? `Anexo de ${d.contrato_madre_id || "contrato"}`
                    : `Contrato ${d.numero_contrato || ""}`.trim(),
                trabajador: [d.worker?.nombres, d.worker?.apellido_paterno, d.worker?.apellido_materno].filter(Boolean).join(" "),
                rut: d.worker?.rut || "—",
                empresa: d.empresa?.nombre || "—",
                empresaId: d.empresa_id || d.empresa?.id || "",
                origen: "Persistido"
            }));

        const complementos = eventos
            .filter(e => e.evento === "GENERADO" && String(e.tipo_documento || "").toUpperCase() === "COMPLEMENTO")
            .map(e => {
                const base = documentos.find(d => String(d.id) === String(e.contrato_id));
                return {
                    id: `complemento-${e.id}`,
                    fecha: e.created_at,
                    tipo: "COMPLEMENTO",
                    nombre: e.nombre_documento || "Complemento",
                    trabajador: [base?.worker?.nombres, base?.worker?.apellido_paterno, base?.worker?.apellido_materno].filter(Boolean).join(" "),
                    rut: base?.worker?.rut || "—",
                    empresa: base?.empresa?.nombre || "—",
                    empresaId: base?.empresa_id || base?.empresa?.id || "",
                    origen: "Generación temporal"
                };
            });

        const historial = [...documentosPersistidos, ...complementos]
            .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));

        const escapar = valor => String(valor ?? "—").replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[c]);

        const etiquetaTipo = tipo => {
            const t = String(tipo || "").toUpperCase();
            const clases = { CONTRATO: "contrato", ANEXO: "anexo", COMPLEMENTO: "complemento" };
            const nombres = { CONTRATO: "Contrato", ANEXO: "Anexo", COMPLEMENTO: "Complemento" };
            return `<span class="historial-tipo-badge ${clases[t] || "otro"}">${nombres[t] || escapar(t || "Otro")}</span>`;
        };

        const etiquetaOrigen = origen => {
            const temporal = origen === "Generación temporal";
            return `<span class="historial-origen-badge ${temporal ? "temporal" : "persistido"}">${temporal ? "Temporal" : "Persistido"}</span>`;
        };

        const filtroEmpresa = document.getElementById("filtroEmpresaHistorial");
        if (filtroEmpresa) {
            const anterior = filtroEmpresa.value;
            const empresas = [...new Map(historial.filter(d => d.empresaId).map(d => [
                String(d.empresaId), { id: String(d.empresaId), nombre: d.empresa }
            ])).values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
            filtroEmpresa.innerHTML = `<option value="">Todas las empresas mandantes</option>` +
                empresas.map(e => `<option value="${escapar(e.id)}" ${String(e.id) === anterior ? "selected" : ""}>${escapar(e.nombre)}</option>`).join("");
        }

        tabla.innerHTML = `
            <div class="historial-resultados-resumen" id="historialResultadosResumen"></div>
            <div class="historial-table-scroll">
                <table class="cubika-table historial-documentos-table">
                    <thead><tr>
                        <th>Fecha de generación</th><th>Documento</th><th>Tipo</th>
                        <th>RUT trabajador</th><th>Trabajador</th><th>Empresa mandante</th><th>Origen</th>
                    </tr></thead>
                    <tbody id="historialDocumentosTbody"></tbody>
                </table>
            </div>
            <p class="historial-sin-resultados" id="historialSinResultados" hidden>
                No hay documentos que coincidan con los filtros seleccionados.
            </p>`;

        const buscar = document.getElementById("buscarHistorial");
        const tipo = document.getElementById("filtroTipoHistorial");
        const desde = document.getElementById("historialFechaDesde");
        const hasta = document.getElementById("historialFechaHasta");
        const tbody = document.getElementById("historialDocumentosTbody");
        const resumen = document.getElementById("historialResultadosResumen");
        const vacio = document.getElementById("historialSinResultados");

        const fechaISO = fecha => {
            if (!fecha) return "";
            const d = new Date(fecha);
            if (Number.isNaN(d.getTime())) return "";
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        };

        const renderizar = () => {
            const q = (buscar?.value || "").trim().toLocaleLowerCase("es");
            const t = tipo?.value || "";
            const e = filtroEmpresa?.value || "";
            const fDesde = desde?.value || "";
            const fHasta = hasta?.value || "";

            const resultados = historial.filter(d => {
                const texto = [d.nombre, d.trabajador, d.rut, d.empresa].join(" ").toLocaleLowerCase("es");
                const fecha = fechaISO(d.fecha);
                return (!q || texto.includes(q))
                    && (!t || d.tipo === t)
                    && (!e || String(d.empresaId) === e)
                    && (!fDesde || (fecha && fecha >= fDesde))
                    && (!fHasta || (fecha && fecha <= fHasta));
            });

            tbody.innerHTML = resultados.map(d => `
                <tr>
                    <td class="historial-fecha">${escapar(d.fecha ? new Date(d.fecha).toLocaleString("es-CL") : "—")}</td>
                    <td class="historial-documento-nombre">${escapar(d.nombre)}</td>
                    <td>${etiquetaTipo(d.tipo)}</td>
                    <td class="historial-rut">${escapar(d.rut)}</td>
                    <td>${escapar(d.trabajador || "—")}</td>
                    <td>${escapar(d.empresa)}</td>
                    <td>${etiquetaOrigen(d.origen)}</td>
                </tr>`).join("");

            resumen.textContent = `Mostrando ${resultados.length} de ${historial.length} documentos`;
            vacio.hidden = resultados.length > 0;
            tbody.closest("table").hidden = resultados.length === 0;
        };

        [buscar, tipo, filtroEmpresa, desde, hasta].forEach(control => {
            control?.addEventListener(control === buscar ? "input" : "change", renderizar);
        });

        document.getElementById("btnLimpiarFiltrosHistorial")?.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            [buscar, tipo, filtroEmpresa, desde, hasta].forEach(control => {
                if (control) control.value = "";
            });
            renderizar();
        });

        renderizar();
    } catch (error) {
        console.error("Error al cargar el historial documental:", error);
        tabla.innerHTML = `<p>No fue posible cargar el historial. Revisa la consola para ver el error.</p>`;
    }
}


function exportarContratosExcel(contratos) {

    if (!contratos || !contratos.length) {

        alert(
            "No hay contratos disponibles para exportar."
        );

        return;
    }

    const filas = contratos.map(
        contrato => {

            const trabajador =
                contrato.worker
                    ? [
                        contrato.worker.nombres,
                        contrato.worker.apellido_paterno,
                        contrato.worker.apellido_materno
                    ]
                        .filter(Boolean)
                        .join(" ")
                    : "-";

            return {

                "Fecha generación":
                    formatearFechaHora(
                        contrato.fecha_generacion
                    ),

                "Estado":
                    determinarEstadoContrato(
                        contrato
                    ),

                "Mandante":
                    contrato.empresa?.nombre ?? "-",

                "RUT trabajador":
                    contrato.worker?.rut ?? "-",

                "Trabajador":
                    trabajador,

                "Tipo documento":
                    "Contrato",

                "Cargo":
                    contrato.cargo?.nombre ?? "-",

                "Tipo contrato":
                    contrato.tipo_contrato?.nombre ?? "-",

                "Fecha inicio":
                    formatearFecha(
                        contrato.fecha_inicio
                    ),

                "Fecha fin":
                    formatearFecha(
                        contrato.fecha_termino
                    ),

                "Causal fin":
                    contrato.causal_termino ?? "-",

                "Sueldo base":
                    contrato.sueldo ?? "",

                "Constructora":
                    contrato.obra?.constructora?.nombre ?? "-",

                "Obra":
                    contrato.obra?.nombre ?? "-"

            };

        }
    );

    const worksheet =
        XLSX.utils.json_to_sheet(
            filas
        );

    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Contratos"
    );

    const fecha =
        new Date()
            .toISOString()
            .slice(0, 10);

    XLSX.writeFile(
        workbook,
        `contratos_${fecha}.xlsx`
    );

}
