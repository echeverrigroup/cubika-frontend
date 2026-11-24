import { storageService } from "../js/services/storageService.js";

import { mostrarConfirmacionExito }
    from "../components/confirmacionExito.js";


import {
    construirDocumentoHtml,
    construirDocumentoComplementario,
    generarDocxComplementario,
    registrarEventoDocumentalSeguro
} from "./construction_contrato_editor.js";


import { evolucionContractualService } from "../services/evolucionContractualService.js";

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

let sincronizacionEstadosIniciada = false;



export function solicitarAperturaContrato(contratoId) {
    if (!contratoId) {
        console.error("No se recibió el ID del contrato.");
        return;
    }

    contratoPendienteDeApertura = String(contratoId);

    navigate("construction_contratos");
}



export function renderConstructionContratos() {

    sincronizacionEstadosIniciada = false;

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
            margin-top: 5px;
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


    
const contratosTodos = await contratosGeneradosService.getAll();


const anexosContrato = contratosTodos.filter(documento =>
    String(documento.contrato_madre_id) ===
        "948d4df3-767e-495a-b427-3696c0d9e2bd" &&
    documento.tipo_documento === "ANEXO"
);
    


    // Cargar catálogo de cargos del tenant activo.
const cargos = await cargosService.getAll();

const cargosPorId = new Map(
    cargos.map(cargo => [
        String(cargo.id),
        cargo
    ])
);


// Cargar catálogo de obras y sus constructoras.
const obras = await obrasService.getAll();

const obrasPorId = new Map(
    obras.map(obra => [
        String(obra.id),
        obra
    ])
);
    

// Agrupar los anexos por contrato madre.
// Se aprovecha la información ya recuperada por getAll().
const anexosPorContrato = new Map();

contratosTodos
    .filter(documento =>
        documento.tipo_documento === "ANEXO" &&
        documento.contrato_madre_id
    )
    .forEach(anexo => {

        const contratoId = String(anexo.contrato_madre_id);

        if (!anexosPorContrato.has(contratoId)) {
            anexosPorContrato.set(contratoId, []);
        }

        anexosPorContrato.get(contratoId).push(anexo);

    });

// Calcular las condiciones vigentes de cada contrato.
    const contratos = contratosTodos
        .filter(documento =>
            documento.tipo_documento === "CONTRATO"
        )
        .map(contrato => {
    
            const anexos =
                anexosPorContrato.get(String(contrato.id)) ?? [];
    
            const evolucion =
                evolucionContractualService.calcularCondicionesVigentes(
                    contrato,
                    anexos
                );
    
            const cargoActual = cargosPorId.get(
                String(evolucion.condiciones_actuales.cargo_id)
            ) ?? null;

            const obraActual = obrasPorId.get(
                String(evolucion.condiciones_actuales.obra_id)
            ) ?? null;
            
            return {
                ...contrato,
                condiciones_actuales: evolucion.condiciones_actuales,
                cargo_actual: cargoActual,
                obra_actual: obraActual,
                constructora_actual: obraActual?.constructora ?? null,
                evolucion_contractual: evolucion
            };
    
        });

    

    if (cargarFiltros) {

        cargarOpcionesFiltros(contratos);

        actualizarContadorFiltros();

    }

   
    const contratosFiltrados =
        filtrarContratos(contratos);


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
                 <p class="historial-sin-resultados">
                    No hay Contratos generados aún.
                </p>
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

                            <th>Fecha inicio</th>

                            <th>Tipo contrato</th>

                            <th>Cargo</th>

                            <th>Obra</th>                  

                            <th>Constructora</th>

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
                                            ${formatearFecha(
                                                contrato.fecha_inicio
                                            )}
                                        </td>


                                        <td>
                                            ${contrato.tipo_contrato?.nombre ?? "-"}
                                        </td>
                                        

                                         <td>
                                            ${contrato.cargo_actual?.nombre ?? contrato.cargo?.nombre ?? "-"}
                                        </td>
                                                                                

                                       <td>
                                            ${contrato.obra_actual?.nombre ?? contrato.obra?.nombre ?? "-"}
                                        </td>                                        


                                        <td>
                                            ${contrato.constructora_actual?.nombre ?? contrato.obra?.constructora?.nombre ?? "-"}
                                        </td>

                                        

                                        
                                      <td class="acciones-cell">

                                        <div class="cubika-actions">
                                    
                                            <!-- VER -->
                                            <button
                                                type="button"
                                                class="cubika-action"
                                                data-action="ver"
                                                data-contrato-id="${contrato.id}"
                                                title="Ver detalle"
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
                                            <div class="cubika-more-wrapper">
                                            
                                                <button
                                                    type="button"
                                                    class="cubika-action"
                                                    data-action="mas"
                                                    data-contrato-id="${contrato.id}"
                                                    title="Más acciones"
                                                    aria-label="Más acciones"
                                                    aria-expanded="false"
                                                >
                                                    <img
                                                        src="/img/icons/mas.svg"
                                                        alt=""
                                                    >
                                                </button>
                                            
                                                <div class="cubika-more-menu" hidden>
                                            
                                                    <button
                                                        type="button"
                                                        class="cubika-more-item"
                                                        data-action="complemento"
                                                        data-contrato-id="${contrato.id}"
                                                    >
                                                        Añadir Complemento
                                                    </button>
                                            
                                                    <div class="cubika-more-divider"></div>
                                            
                                                    <button
                                                        type="button"
                                                        class="cubika-more-item"
                                                        disabled
                                                        title="Próximamente"
                                                    >
                                                        Otro
                                                    </button>
                                            
                                                </div>
                                            
                                            </div>
                                    
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

    // Sincronización masiva en segundo plano.
    // No bloquea la carga ni la interacción con el listado.
    
    if (!sincronizacionEstadosIniciada) {
    
        sincronizacionEstadosIniciada = true;
    
        contratosGeneradosService
            .sincronizarEstadosMasivamente()
            .then(resultado => {
    
                console.info(
                    "Sincronización de contratos completada:",
                    resultado
                );
    
            })
            .catch(error => {
    
                console.error(
                    "No fue posible sincronizar los estados:",
                    error
                );
    
            });
    
    }

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

    const contenedor = document.querySelector("#contratosTable");

    if (!contenedor) return;

    const botones = contenedor.querySelectorAll(".cubika-action");

    botones.forEach(boton => {

        boton.addEventListener("click", event => {

            event.preventDefault();
            event.stopPropagation();

            const accion = boton.dataset.action;
            const contratoId = boton.dataset.contratoId;


            if (accion === "ver") {
                abrirDetalleContrato(contratoId);
                return;
            }

            if (accion === "descargar") {
                descargarContratoPDF(contratoId);
                return;
            }

            if (accion === "anexo") {
                abrirSelectorPlantillaAnexo(contratoId);
                return;
            }

            
        if (accion === "mas") {
        
            const wrapper = boton.closest(".cubika-more-wrapper");
            const menu = wrapper?.querySelector(".cubika-more-menu");
        
            if (!menu) return;
        
            // Cerrar otros menús abiertos
            document.querySelectorAll(".cubika-more-menu").forEach(otroMenu => {
        
                if (otroMenu !== menu) {
        
                    otroMenu.hidden = true;
        
                    const otroBoton = otroMenu._cubikaBoton;
        
                    otroBoton?.setAttribute("aria-expanded", "false");
        
                    // Devolver el menú a su ubicación original
                    if (otroMenu._cubikaWrapper) {
                        otroMenu._cubikaWrapper.appendChild(otroMenu);
                    }
                }
        
            });
        
            // Alternar menú actual
            const estabaAbierto = !menu.hidden;
        
            if (estabaAbierto) {
        
                menu.hidden = true;
                boton.setAttribute("aria-expanded", "false");
        
                if (menu._cubikaWrapper) {
                    menu._cubikaWrapper.appendChild(menu);
                }
        
                return;
            }
        
            // Guardar referencias originales
            menu._cubikaWrapper = wrapper;
            menu._cubikaBoton = boton;
        
            // Mover el menú fuera de la tabla
            document.body.appendChild(menu);
        
            menu.hidden = false;
        
            boton.setAttribute("aria-expanded", "true");
        
            // Posicionar el menú respecto al botón
            const rect = boton.getBoundingClientRect();
        
            menu.style.position = "fixed";
            menu.style.zIndex = "99999";
        
            const ancho = menu.offsetWidth;
            const alto = menu.offsetHeight;
        
            let izquierda = rect.right - ancho;
            let arriba = rect.bottom + 6;
        
            if (izquierda < 8) {
                izquierda = 8;
            }
        
            if (izquierda + ancho > window.innerWidth - 8) {
                izquierda = window.innerWidth - ancho - 8;
            }
        
            if (arriba + alto > window.innerHeight - 8) {
                arriba = rect.top - alto - 6;
            }
        
            menu.style.left = `${izquierda}px`;
            menu.style.top = `${Math.max(8, arriba)}px`;
        }


        });

    });


    // Acciones internas del menú
    contenedor.querySelectorAll(".cubika-more-item").forEach(boton => {

        boton.addEventListener("click", event => {

            event.preventDefault();
            event.stopPropagation();

            if (boton.disabled) return;

            const accion = boton.dataset.action;
            const contratoId = boton.dataset.contratoId;

            
            if (accion === "complemento") {
            
                const menu = boton.closest(".cubika-more-menu");
            
                if (menu) {
            
                    menu.hidden = true;
            
                    menu._cubikaBoton?.setAttribute("aria-expanded", "false");
            
                    if (menu._cubikaWrapper) {
                        menu._cubikaWrapper.appendChild(menu);
                    }
                }
            
                abrirSelectorPlantillaComplemento(contratoId);
            }


        });

    });



    // Registrar una sola vez el cierre de menús al hacer clic fuera
    if (!document._cubikaCerrarMenusListener) {
    
        document._cubikaCerrarMenusListener = event => {
    
            // Si el clic fue dentro de un menú, no cerrarlo
            if (event.target.closest(".cubika-more-menu")) return;
    
            // Si el clic fue sobre un botón Más, no interferir
            if (event.target.closest('[data-action="mas"]')) return;
    
            document.querySelectorAll(".cubika-more-menu").forEach(menu => {
    
                menu.hidden = true;
    
                menu._cubikaBoton?.setAttribute("aria-expanded", "false");
    
                // Devolver el menú a su ubicación original
                if (menu._cubikaWrapper) {
                    menu._cubikaWrapper.appendChild(menu);
                }
    
            });
    
        };
    
        document.addEventListener(
            "click",
            document._cubikaCerrarMenusListener
        );
    
    }


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

    const condicionesActuales =
        contrato.condiciones_actuales ?? contrato;

    const sueldoOriginalDifiere =
        contrato.sueldo != null &&
        condicionesActuales.sueldo != null &&
        Number(contrato.sueldo) !==
            Number(condicionesActuales.sueldo);

    // Detectar cambios respecto del contrato madre.

    const cargoOriginalDifiere =
        contrato.cargo_id != null &&
        condicionesActuales.cargo_id != null &&
        String(contrato.cargo_id) !==
            String(condicionesActuales.cargo_id);
    
    
    const obraOriginalDifiere =
        contrato.obra_id != null &&
        condicionesActuales.obra_id != null &&
        String(contrato.obra_id) !==
            String(condicionesActuales.obra_id);
    
    
    const constructoraOriginalId =
        contrato.obra?.constructora?.id;
    
    const constructoraActualId =
        contrato.constructora_actual?.id;
    
    const constructoraOriginalDifiere =
        constructoraOriginalId != null &&
        constructoraActualId != null &&
        String(constructoraOriginalId) !==
            String(constructoraActualId);


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

                            <span>Constructora</span>
                        
                            <strong>
                                ${contrato.constructora_actual?.nombre ??
                                  contrato.obra?.constructora?.nombre ?? "-"}
                            </strong>
                        
                            ${
                                constructoraOriginalDifiere
                                    ? `
                                        <small class="contrato-detalle-original">
                                            Contrato original: ${contrato.obra?.constructora?.nombre ?? "-"}
                                        </small>
                                    `
                                    : ""
                            }
                        
                        </div>
                        

                        <div class="contrato-detalle-item">

                            <span>Obra</span>
                        
                            <strong>
                                ${contrato.obra_actual?.nombre ??
                                  contrato.obra?.nombre ?? "-"}
                            </strong>
                        
                            ${
                                obraOriginalDifiere
                                    ? `
                                        <small class="contrato-detalle-original">
                                            Contrato original: ${contrato.obra?.nombre ?? "-"}
                                        </small>
                                    `
                                    : ""
                            }
                        
                        </div>


                        <div class="contrato-detalle-item">

                            <span>Cargo</span>
                        
                            <strong>
                                ${contrato.cargo_actual?.nombre ??
                                  contrato.cargo?.nombre ?? "-"}
                            </strong>
                        
                            ${
                                cargoOriginalDifiere
                                    ? `
                                        <small class="contrato-detalle-original">
                                            Contrato original: ${contrato.cargo?.nombre ?? "-"}
                                        </small>
                                    `
                                    : ""
                            }
                        
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
                                Sueldo base vigente
                            </span>
                        
                            <strong>
                                ${formatearSueldo(
                                    condicionesActuales.sueldo
                                )}
                            </strong>
                        
                            ${
                                sueldoOriginalDifiere
                                    ? `
                                        <small class="contrato-detalle-original">
                                            Contrato original: ${formatearSueldo(contrato.sueldo)}
                                        </small>
                                    `
                                    : ""
                            }
                        
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




async function abrirSelectorPlantillaAnexo(
    contratoId,
    tipoAnexoInicial = null,
    plantillaInicialId = null
) {

    const contrato = contratosVisibles.find(
        contrato =>
            String(contrato.id) === String(contratoId)
    );

    if (!contrato) {
        console.error(
            "No se encontró el contrato para crear el anexo:",
            contratoId
        );
        return;
    }

    try {

        const [
            plantillas,
            asociacionesConstructoras,
            asociacionesCargos
        ] = await Promise.all([

            plantillasDocumentoService.getAll(),

            plantillasDocumentoService.getTodasLasAsociacionesConstructoras(),

            plantillasDocumentoService.getTodasLasAsociacionesCargos()

        ]);

        // 1. Identificar constructora y cargo vigentes.
        const constructoraId =
            contrato.constructora_actual?.id ??
            contrato.obra_actual?.constructora?.id ??
            contrato.obra?.constructora?.id ??
            null;

        const cargoId =
            contrato.cargo_actual?.id ??
            contrato.condiciones_actuales?.cargo_id ??
            contrato.cargo?.id ??
            contrato.cargo_id ??
            null;


        // 2. Filtrar plantillas activas de tipo ANEXO.
        const plantillasAnexo = plantillas.filter(plantilla => {

            return (
                String(plantilla.tipo_documento ?? "")
                    .trim()
                    .toUpperCase() === "ANEXO" &&

                String(plantilla.estado ?? "")
                    .trim()
                    .toUpperCase() === "ACTIVO" &&

                String(plantilla.tipo_anexo ?? "").trim() !== ""
            );

        });


        // 3. Aplicar restricciones por constructora y cargo.
        const plantillasDisponibles = plantillasAnexo.filter(plantilla => {

            const asociacionesDeConstructora =
                asociacionesConstructoras.filter(
                    asociacion =>
                        String(asociacion.plantilla_id) ===
                        String(plantilla.id)
                );

            const asociacionesDeCargo =
                asociacionesCargos.filter(
                    asociacion =>
                        String(asociacion.plantilla_id) ===
                        String(plantilla.id)
                );


            // Sin asociaciones: disponible para todas las constructoras.
            const constructoraPermitida =
                asociacionesDeConstructora.length === 0 ||
                (
                    constructoraId !== null &&
                    asociacionesDeConstructora.some(
                        asociacion =>
                            String(asociacion.constructora_id) ===
                            String(constructoraId)
                    )
                );


            // Sin asociaciones: disponible para todos los cargos.
            const cargoPermitido =
                asociacionesDeCargo.length === 0 ||
                (
                    cargoId !== null &&
                    asociacionesDeCargo.some(
                        asociacion =>
                            String(asociacion.cargo_id) ===
                            String(cargoId)
                    )
                );


            return constructoraPermitida && cargoPermitido;

        });


        if (!plantillasDisponibles.length) {

            alert(
                "No existen plantillas de Anexo activas disponibles para este contrato."
            );

            return;
        }


        // 4. Obtener los tipos de anexo disponibles.
        const tiposAnexo = [
            ...new Set(
                plantillasDisponibles.map(
                    plantilla =>
                        String(plantilla.tipo_anexo)
                            .trim()
                            .toUpperCase()
                )
            )
        ].sort();


        // Presentación de los tipos en el selector.
        const formatearTipoAnexo = tipo => {

            return tipo
                .replace(/_/g, " ")
                .toLocaleLowerCase("es")
                .replace(/^./, letra => letra.toLocaleUpperCase("es"));

        };


        // 5. Crear modal.
        const modal = document.createElement("div");

        modal.className = "cubika-modal-overlay";

        modal.innerHTML = `

            <div class="cubika-modal contrato-detalle-modal">

                <div class="cubika-modal-header">

                    <div>

                        <h2>Añadir anexo</h2>

                        <span class="contrato-detalle-numero">
                            ${contrato.numero_contrato ?? "Sin número"}
                            ·
                            ${[
                                contrato.worker?.nombres,
                                contrato.worker?.apellido_paterno,
                                contrato.worker?.apellido_materno
                            ].filter(Boolean).join(" ") || "Sin trabajador"}
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

                        <h3>Configuración del anexo</h3>


                        <div class="anexo-selectores-grid">
                        
                            <div class="form-group">
                                <label for="selectorTipoAnexo">
                                    ¿Qué tipo de anexo deseas generar?
                                </label>
                        
                                <select
                                    id="selectorTipoAnexo"
                                    class="cubika-select"
                                >
                                    <option value="">
                                        Selecciona un tipo de anexo
                                    </option>
                        
                                    ${tiposAnexo.map(tipo => `
                                        <option value="${tipo}">
                                            ${formatearTipoAnexo(tipo)}
                                        </option>
                                    `).join("")}
                                </select>
                            </div>
                        
                            <div class="form-group">
                                <label for="selectorPlantillaAnexo">
                                    Plantilla disponible
                                </label>
                        
                                <select
                                    id="selectorPlantillaAnexo"
                                    class="cubika-select"
                                    disabled
                                >
                                    <option value="">
                                        Primero selecciona un tipo de anexo
                                    </option>
                                </select>
                        
                                <small
                                    id="anexoSelectorAyuda"
                                    class="anexo-selector-ayuda"
                                >
                                    Las plantillas se mostrarán según el tipo seleccionado.
                                </small>
                            </div>
                        
                        </div>

                    </section>

                </div>


                <div class="cubika-modal-footer">

                    <button
                        type="button"
                        class="btn-cubika-secondary"
                        data-cerrar-anexo
                    >
                        Atrás
                    </button>

                    <button
                        type="button"
                        class="btn-cubika-green"
                        id="btnContinuarAnexo"
                        disabled
                    >
                        Continuar
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(modal);


        // 6. Referencias a los controles.
        const selectTipo =
            modal.querySelector("#selectorTipoAnexo");

        const selectPlantilla =
            modal.querySelector("#selectorPlantillaAnexo");

        const btnContinuar =
            modal.querySelector("#btnContinuarAnexo");

        const ayuda =
            modal.querySelector("#anexoSelectorAyuda");


        // 7. Cierre del modal.
        const cerrar = () => modal.remove();

        modal.querySelector(".cubika-modal-close")
            .addEventListener("click", cerrar);

        modal.querySelector("[data-cerrar-anexo]")
            .addEventListener("click", cerrar);

        modal.addEventListener("click", event => {

            if (event.target === modal) {
                cerrar();
            }

        });


        // 8. Al seleccionar el tipo, actualizar las plantillas.
        selectTipo.addEventListener("change", () => {

            const tipoSeleccionado = selectTipo.value;

            selectPlantilla.innerHTML = "";
            btnContinuar.disabled = true;

            if (!tipoSeleccionado) {

                selectPlantilla.disabled = true;

                selectPlantilla.innerHTML = `
                    <option value="">
                        Primero selecciona un tipo de anexo
                    </option>
                `;

                ayuda.textContent =
                    "Las plantillas se mostrarán según el tipo seleccionado.";

                return;
            }


            const plantillasFiltradas =
                plantillasDisponibles.filter(
                    plantilla =>
                        String(plantilla.tipo_anexo)
                            .trim()
                            .toUpperCase() === tipoSeleccionado
                );


            selectPlantilla.disabled = false;

            selectPlantilla.innerHTML = `
                <option value="">
                    Selecciona una plantilla
                </option>
            `;


            plantillasFiltradas.forEach(plantilla => {

                const option = document.createElement("option");

                option.value = plantilla.id;
                option.textContent = plantilla.nombre;

                selectPlantilla.appendChild(option);

            });


            ayuda.textContent =
                `${plantillasFiltradas.length} plantilla(s) disponible(s) para este tipo de anexo.`;

        });


        // 9. Habilitar continuar cuando exista una plantilla seleccionada.
        selectPlantilla.addEventListener("change", () => {

            btnContinuar.disabled = !selectPlantilla.value;

        });


        // Recuperar selección anterior cuando se regresa desde el formulario.
        if (tipoAnexoInicial) {
        
            selectTipo.value = tipoAnexoInicial;
        
            selectTipo.dispatchEvent(
                new Event("change")
            );
        
            if (plantillaInicialId) {
        
                selectPlantilla.value = plantillaInicialId;
        
                btnContinuar.disabled = !selectPlantilla.value;
        
            }
        
        }


        // 10. Continuar con el formulario de generación.
        btnContinuar.addEventListener("click", () => {

            const plantillaSeleccionada =
                plantillasDisponibles.find(
                    plantilla =>
                        String(plantilla.id) ===
                        String(selectPlantilla.value)
                );

            if (!plantillaSeleccionada) {

                alert(
                    "No fue posible identificar la plantilla seleccionada."
                );

                return;
            }

            cerrar();

            abrirFormularioAnexo(
                contrato,
                plantillaSeleccionada
            );

        });

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



async function abrirSelectorPlantillaComplemento(contratoId) {

    const contrato = contratosVisibles.find(
        contrato =>
            String(contrato.id) === String(contratoId)
    );

    if (!contrato) {
        console.error(
            "No se encontró el contrato para añadir el complemento:",
            contratoId
        );
        return;
    }

    try {

        const [
            plantillas,
            asociacionesConstructoras,
            asociacionesCargos
        ] = await Promise.all([

            plantillasDocumentoService.getComplementos(),

            plantillasDocumentoService.getTodasLasAsociacionesConstructoras(),

            plantillasDocumentoService.getTodasLasAsociacionesCargos()

        ]);


        // Identificar constructora y cargo del contrato
        const constructoraId =
            contrato.constructora_actual?.id ??
            contrato.obra_actual?.constructora?.id ??
            contrato.obra?.constructora?.id ??
            null;

        const cargoId =
            contrato.cargo_actual?.id ??
            contrato.condiciones_actuales?.cargo_id ??
            contrato.cargo?.id ??
            contrato.cargo_id ??
            null;


        // Aplicar restricciones de disponibilidad
        const complementosDisponibles = plantillas.filter(plantilla => {

            const asociacionesDeConstructora =
                asociacionesConstructoras.filter(
                    asociacion =>
                        String(asociacion.plantilla_id) ===
                        String(plantilla.id)
                );

            const asociacionesDeCargo =
                asociacionesCargos.filter(
                    asociacion =>
                        String(asociacion.plantilla_id) ===
                        String(plantilla.id)
                );


            // Sin asociaciones: disponible para todas las constructoras
            const constructoraPermitida =
                asociacionesDeConstructora.length === 0 ||
                (
                    constructoraId !== null &&
                    asociacionesDeConstructora.some(
                        asociacion =>
                            String(asociacion.constructora_id) ===
                            String(constructoraId)
                    )
                );


            // Sin asociaciones: disponible para todos los cargos
            const cargoPermitido =
                asociacionesDeCargo.length === 0 ||
                (
                    cargoId !== null &&
                    asociacionesDeCargo.some(
                        asociacion =>
                            String(asociacion.cargo_id) ===
                            String(cargoId)
                    )
                );


            return constructoraPermitida && cargoPermitido;

        });


        
        
        // Crear modal
        const modal = document.createElement("div");

        modal.className = "cubika-modal-overlay";

        modal.innerHTML = `

            <div
                class="cubika-modal contrato-detalle-modal"
                style="
                    width: min(700px, calc(100vw - 32px));
                    max-width: 700px;
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                "
            >

                <div class="cubika-modal-header" style="flex-shrink: 0;">

                    <div>

                        <h2>Añadir complemento</h2>

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


                <div
                    class="contrato-detalle-body"
                    style="
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                        min-height: 0;
                        overflow: hidden;
                    "
                >

                    <section
                        class="contrato-detalle-seccion"
                        style="
                            display: flex;
                            flex-direction: column;
                            flex: 1;
                            min-height: 0;
                        "
                    >

                        <h3>Selecciona una plantilla</h3>


                        ${
                            complementosDisponibles.length
                                ? `

                                    <div style="margin-bottom: 14px;">

                                        <input
                                            type="search"
                                            class="cubika-input"
                                            data-buscar-complemento
                                            placeholder="Buscar plantilla..."
                                            style="width: 100%;"
                                        >

                                    </div>


                                    <div
                                        data-lista-complementos
                                        style="
                                            display: grid;
                                            grid-template-columns: repeat(2, minmax(0, 1fr));
                                            gap: 8px 12px;
                                            overflow-y: auto;
                                            max-height: 350px;
                                            min-height: 0;
                                            padding-right: 5px;
                                            align-content: start;
                                        "
                                    >

                                        ${complementosDisponibles.map(plantilla => `

                                            <button
                                                type="button"
                                                class="anexo-plantilla-option"
                                                data-plantilla-id="${plantilla.id}"
                                                style="
                                                    display: flex;
                                                    align-items: center;
                                                    justify-content: space-between;
                                                    gap: 10px;
                                                    width: 100%;
                                                    padding: 12px;
                                                    border: 1px solid #e5e7eb;
                                                    border-radius: 8px;
                                                    cursor: pointer;
                                                    margin-bottom: 0;
                                                    background: #fff;
                                                    font: inherit;
                                                    color: #64748b;
                                                    text-align: left;
                                                "
                                            >

                                                <span style="font-weight: 600;">
                                                    ${plantilla.nombre}
                                                </span>

                                                <span aria-hidden="true">
                                                    →
                                                </span>

                                            </button>

                                        `).join("")}

                                    </div>


                                    <p
                                        data-complementos-sin-resultados
                                        class="historial-contractual-vacio"
                                        style="display: none;"
                                    >
                                        No se encontraron plantillas.
                                    </p>

                                `
                                : `
                                    <p class="historial-contractual-vacio">
                                        No existen plantillas de Complemento
                                        activas disponibles para este contrato.
                                    </p>
                                `
                        }

                    </section>

                </div>


                <div
                    class="cubika-modal-footer"
                    style="flex-shrink: 0;"
                >

                    <button
                        type="button"
                        class="btn-cubika-secondary"
                        data-cerrar-complemento
                    >
                        Cerrar
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(modal);


        // Cerrar modal
        const cerrar = () => {
            modal.remove();
        };


        modal.querySelector(".cubika-modal-close")
            .addEventListener("click", cerrar);


        modal.querySelector("[data-cerrar-complemento]")
            .addEventListener("click", cerrar);


        modal.addEventListener("click", event => {

            if (event.target === modal) {
                cerrar();
            }

        });


        // Buscar plantillas
        const buscador = modal.querySelector(
            "[data-buscar-complemento]"
        );

        if (buscador) {

            const opciones = [
                ...modal.querySelectorAll(".anexo-plantilla-option")
            ];

            const mensajeSinResultados = modal.querySelector(
                "[data-complementos-sin-resultados]"
            );

            buscador.addEventListener("input", () => {

                const termino = buscador.value
                    .trim()
                    .toLocaleLowerCase("es");

                let resultadosVisibles = 0;

                opciones.forEach(opcion => {

                    const nombre = opcion.textContent
                        .trim()
                        .toLocaleLowerCase("es");

                    const coincide = nombre.includes(termino);

                    opcion.hidden = !coincide;

                    if (coincide) {
                        resultadosVisibles++;
                    }

                });

                mensajeSinResultados.style.display =
                    resultadosVisibles === 0 ? "block" : "none";

            });

        }


        // Seleccionar plantilla
        modal
            .querySelectorAll(".anexo-plantilla-option")
            .forEach(boton => {

                boton.addEventListener("click", () => {

                    const plantillaId = boton.dataset.plantillaId;

                    const plantillaSeleccionada =
                        complementosDisponibles.find(
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

                    cerrar();

                    generarComplementoDesdeContrato(
                        contrato,
                        plantillaSeleccionada
                    );

                });

            });


    }
    catch (error) {

        console.error(
            "Error al cargar plantillas de Complemento:",
            error
        );

        alert(
            "No fue posible cargar las plantillas de Complemento."
        );

    }

}





async function generarComplementoDesdeContrato(contrato, plantilla) {

    try {

        // 1. Validar que el contrato tenga sus variables disponibles.
        const variables = contrato.variables;

        if (
            !variables ||
            typeof variables !== "object" ||
            !Object.keys(variables).length
        ) {
            throw new Error(
                "El contrato no contiene las variables necesarias para generar el complemento."
            );
        }

        // 2. Determinar el formato de la plantilla.
        const formato = String(
            plantilla.formato_contenido || "HTML"
        ).toUpperCase();

        let documentoBlob;
        let extension;

        // 3. Generar según el formato.
        if (formato === "DOCX") {

            documentoBlob = await generarDocxComplementario(
                plantilla,
                variables
            );

            extension = "docx";

        } else if (formato === "HTML") {

            const documentoComplementario =
                await construirDocumentoComplementario(
                    plantilla,
                    contrato
                );

            const htmlComplementario =
                await construirDocumentoHtml(
                    documentoComplementario.contenidoHtml
                );

            const response = await fetch(
                "https://api.cubika.cl/api/pdf",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        html: htmlComplementario
                    })
                }
            );

            if (!response.ok) {
                throw new Error(
                    "No fue posible convertir el complemento a PDF."
                );
            }

            documentoBlob = await response.blob();
            extension = "pdf";

        } else {

            throw new Error(
                `El formato "${formato}" no está soportado para complementos.`
            );

        }

        // 4. Validar el documento generado.
        if (!documentoBlob || !documentoBlob.size) {
            throw new Error(
                "El documento generado está vacío."
            );
        }

        // 5. Preparar los datos de trazabilidad.
        const loteId = crypto.randomUUID();

        const datosEvento = {
            cliente_id: contrato.cliente_id,
            lote_id: loteId,
            contrato_id: contrato.id,
            plantilla_id: plantilla.id,
            empresa_id: contrato.empresa_id,
            worker_id: contrato.worker_id,
            tipo_documento: "COMPLEMENTO",
            nombre_documento: plantilla.nombre
        };

        // 6. Registrar la generación.
        try {

            await registrarEventoDocumentalSeguro(
                "registrarGeneracion",
                datosEvento
            );

        } catch (error) {

            console.error(
                "No fue posible registrar la generación del complemento:",
                error
            );

        }

        // 7. Descargar el documento.
        const urlTemporal = URL.createObjectURL(documentoBlob);

        const enlace = document.createElement("a");

        const nombreArchivo = String(
            plantilla.nombre || "complemento"
        )
            .trim()
            .replace(/[\\/:*?"<>|]/g, "-");

        enlace.href = urlTemporal;
        enlace.download = `${nombreArchivo}.${extension}`;

        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        setTimeout(() => {
            URL.revokeObjectURL(urlTemporal);
        }, 1000);

        // 8. Registrar la descarga.
        try {

            await registrarEventoDocumentalSeguro(
                "registrarDescarga",
                datosEvento
            );

        } catch (error) {

            console.error(
                "No fue posible registrar la descarga del complemento:",
                error
            );

        }

        alert(
            `El complemento "${plantilla.nombre}" fue generado correctamente.`
        );

    } catch (error) {

        console.error(
            "Error al generar el complemento:",
            error
        );

        alert(
            "No fue posible generar el complemento. " +
            (error.message ?? "Revisa la consola para más detalles.")
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
    

    const tipoAnexo = String(
        plantilla.tipo_anexo ?? ""
    ).trim().toUpperCase();
    
    const camposModificables = Array.isArray(
        plantilla.campos_modificables
    )
        ? plantilla.campos_modificables
        : [];
    
    const esTraslado = camposModificables.includes("obra_id");
    const esCambioSueldo = camposModificables.includes("sueldo");
    const esCambioCargo = camposModificables.includes("cargo_id");


    const camposHtml = [];

    if (esTraslado) {
        camposHtml.push(`
            <div class="form-group">
                <label for="anexoObra">Nueva obra</label>
                <select
                    id="anexoObra"
                    class="cubika-input"
                    required
                >
                    <option value="">Cargando obras...</option>
                </select>
            </div>
        `);
    }
    
    if (esCambioSueldo) {
        camposHtml.push(`
            <div class="form-group">
                <label for="anexoSueldo">Nuevo sueldo</label>
                <input
                    type="number"
                    id="anexoSueldo"
                    class="cubika-input"
                    min="0"
                    step="1"
                    placeholder="Ingresa el nuevo sueldo"
                    required
                >
            </div>
        `);
    }

    if (esCambioCargo) {
        camposHtml.push(`
            <div class="form-group">
                <label for="anexoCargo">Nuevo cargo</label>
                <select
                    id="anexoCargo"
                    class="cubika-input"
                    required
                >
                    <option value="">Cargando cargos...</option>
                </select>
            </div>
        `);
    }
    

    if (!camposModificables.length) {
        alert(
            "Esta plantilla no tiene condiciones contractuales configuradas."
        );
        return;
    }
    
    const camposNoSoportados = camposModificables.filter(
        campo => !["obra_id", "sueldo", "cargo_id"].includes(campo)
    );
    
    if (camposNoSoportados.length) {
        alert(
            "Esta plantilla contiene campos que todavía no están implementados: " +
            camposNoSoportados.join(", ")
        );
        return;
    }
        

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
            
                <!-- ETAPA 1: FORMULARIO -->
                <div id="anexoFormularioContenido">
            
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
                            <p>Completa los antecedentes necesarios para preparar el documento.</p>
                        </div>
            
                        <div class="anexo-form-grid">
                            ${camposHtml.join("")}
            
                            <div class="form-group">
                                <label for="anexoFechaVigencia">Fecha de vigencia</label>
                                <input
                                    type="date"
                                    id="anexoFechaVigencia"
                                    class="cubika-input"
                                    required
                                >
                            </div>
            
                            <div class="form-group">
                                <label for="anexoObservaciones">Observaciones</label>
                                <input
                                    type="text"
                                    id="anexoObservaciones"
                                    class="cubika-input"
                                    placeholder="Observaciones del anexo"
                                >
                            </div>
                        </div>
                    </div>
            
                </div>
            
                <!-- ETAPA 2: VISTA PREVIA PDF -->
                <div id="anexoVistaPrevia" hidden>
            
                    <div class="anexo-seccion-header">
                        <h3>Revisión del documento</h3>
                        <p>
                            Revisa el contenido del anexo antes de confirmar su generación.
                        </p>
                    </div>
            
                    <div class="anexo-pdf-contenedor">
                        <iframe
                            id="anexoPdfPreview"
                            title="Vista previa del anexo"
                            width="100%"
                            height="650"
                        ></iframe>
                    </div>
            
                </div>
            
            </div>
            
            <div class="cubika-modal-footer">
            
               <button
                    type="button"
                    class="btn-cubika-secondary"
                    id="volverSelectorAnexo"
                >
                    Atrás
                </button>
            
                <button
                    type="button"
                    class="btn-cubika-secondary"
                    id="volverFormularioAnexo"
                    hidden
                >
                    Volver a editar
                </button>
            
                <button
                    type="button"
                    class="btn-cubika-green"
                    id="continuarFormularioAnexo"
                >
                    Vista previa del anexo
                </button>
            
                <button
                    type="button"
                    class="btn-cubika-green"
                    id="confirmarGeneracionAnexo"
                    hidden
                >
                    Generar anexo
                </button>
            
            </div>

        </div>
    `;

    document.body.appendChild(overlay);

    const cerrar = () => {
        if (pdfPreviewUrl) {
            URL.revokeObjectURL(pdfPreviewUrl);
            pdfPreviewUrl = null;
        }
    
        overlay.remove();
    };

    
    overlay.querySelector("#cerrarFormularioAnexo")
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


    if (esCambioCargo) {
        const selectCargo = overlay.querySelector("#anexoCargo");
    
        try {
           const cargos = await cargosService.getAll();
                
                
                console.table(
                    cargos.map(cargo => ({
                        id: cargo.id,
                        nombre: cargo.nombre,
                        estado: cargo.estado
                    }))
                );
                
                const cargosActivos = cargos.filter(
                    cargo => cargo.estado?.trim().toLowerCase() === "activo"
                );
                
    
            selectCargo.innerHTML = `
                <option value="">Selecciona un cargo</option>
            `;
    
            cargosActivos.forEach(cargo => {
                const option = document.createElement("option");
    
                option.value = cargo.id;
                option.textContent = cargo.nombre;
    
                selectCargo.appendChild(option);
            });
    
            if (!cargosActivos.length) {
                selectCargo.innerHTML = `
                    <option value="">No hay cargos activos disponibles</option>
                `;
            }
    
        } catch (error) {
            console.error("Error al cargar cargos:", error);
    
            selectCargo.innerHTML = `
                <option value="">Error al cargar los cargos</option>
            `;
        }
    }

    const botonGenerar = overlay.querySelector("#continuarFormularioAnexo");
    const botonConfirmar = overlay.querySelector("#confirmarGeneracionAnexo");
    const botonVolver = overlay.querySelector("#volverFormularioAnexo");
    
    const formularioContenido = overlay.querySelector("#anexoFormularioContenido");
    const vistaPrevia = overlay.querySelector("#anexoVistaPrevia");
    const visorPdf = overlay.querySelector("#anexoPdfPreview");
    
    let anexoPendiente = null;
    let pdfPreviewUrl = null;


    // Regresar al selector de tipo y plantilla.
    overlay.querySelector("#volverSelectorAnexo")
        ?.addEventListener("click", () => {
    
            cerrar();
    
            abrirSelectorPlantillaAnexo(
                contrato.id,
                tipoAnexo,
                plantilla.id
            );
    
        });

    
    botonGenerar.addEventListener("click", async () => {
        const fechaVigencia =
            overlay.querySelector("#anexoFechaVigencia")?.value;

        const observaciones =
            overlay.querySelector("#anexoObservaciones")?.value.trim() ?? "";


        const obraId = esTraslado
            ? overlay.querySelector("#anexoObra")?.value
            : contrato.obra_id;
        
        const cargoId = esCambioCargo
            ? overlay.querySelector("#anexoCargo")?.value
            : contrato.cargo_id;

        if (!fechaVigencia) {
            alert("Debes indicar la fecha de vigencia del anexo.");
            return;
        }

        if (esTraslado && !obraId) {
            alert("Debes seleccionar la nueva obra para el traslado.");
            return;
        }

        if (esCambioCargo && !cargoId) {
            alert("Debes seleccionar el nuevo cargo.");
            return;
        }

        botonGenerar.disabled = true;
        botonGenerar.textContent = "Generando...";

        try {

            // 0. Preparar la evolución contractual.
        let sueldoAnterior = null;
        let sueldoNuevo = null;
        let obraAnteriorId = null;
        let cargoAnteriorId = null;
        
        
        // Reconstruir la obra vigente para la fecha del nuevo traslado.
        if (esTraslado) {
        
            if (!contrato.obra_id) {
                throw new Error(
                    "El contrato original no tiene una obra asociada."
                );
            }
        
            const anexosExistentes =
                await contratosGeneradosService.getAnexosByContrato(
                    contrato.id
                );
        
            const cambiosTraslado = (anexosExistentes ?? [])
                .map(anexo => ({
                    fecha: anexo.variables?._evolucion_contractual?.fecha_vigencia,
                    anterior: anexo.variables?._evolucion_contractual?.modificaciones?.obra_id?.anterior,
                    nuevo: anexo.variables?._evolucion_contractual?.modificaciones?.obra_id?.nuevo
                }))
                .filter(cambio =>
                    cambio.fecha &&
                    cambio.nuevo
                );
        
            // No permitir dos traslados en la misma fecha.
            const existeMismoDia = cambiosTraslado.some(
                cambio => cambio.fecha === fechaVigencia
            );
        
            if (existeMismoDia) {
                throw new Error(
                    "Ya existe un traslado con esa fecha de vigencia. Revisa el historial contractual."
                );
            }
        
            // Considerar únicamente los traslados anteriores
            // a la fecha de vigencia del nuevo anexo.
            const cambiosAnteriores = cambiosTraslado
                .filter(cambio => cambio.fecha < fechaVigencia)
                .sort((a, b) => a.fecha.localeCompare(b.fecha));
        
            // Partir desde la obra del contrato original.
            obraAnteriorId = contrato.obra_id;
        
            for (const cambio of cambiosAnteriores) {
        
                // Detectar inconsistencias en la secuencia de traslados.
                if (
                    cambio.anterior &&
                    String(cambio.anterior) !== String(obraAnteriorId)
                ) {
                    throw new Error(
                        "Se detectó una inconsistencia en el historial de traslados."
                    );
                }
        
                obraAnteriorId = cambio.nuevo;
            }
        
            if (String(obraAnteriorId) === String(obraId)) {
                throw new Error(
                    "La obra seleccionada ya corresponde a la obra vigente del contrato."
                );
            }
        }

            if (esCambioSueldo) {
                sueldoNuevo = Number(
                    overlay.querySelector("#anexoSueldo")?.value
                );

                if (!Number.isFinite(sueldoNuevo) || sueldoNuevo <= 0) {
                    throw new Error(
                        "Debes ingresar un sueldo nuevo válido."
                    );
                }

                const sueldoOriginal = Number(contrato.sueldo);

                if (!Number.isFinite(sueldoOriginal) || sueldoOriginal <= 0) {
                    throw new Error(
                        "El contrato original no tiene un sueldo válido."
                    );
                }

                // Recuperar los anexos asociados al contrato madre.
                const anexosExistentes =
                    await contratosGeneradosService.getAnexosByContrato(
                        contrato.id
                    );

                // Extraer los cambios de sueldo que ya tienen fecha de vigencia.
                const cambiosSueldo = (anexosExistentes ?? [])
                    .map(anexo => ({
                        fecha: anexo.variables?._evolucion_contractual?.fecha_vigencia,
                        nuevo: anexo.variables?._evolucion_contractual?.modificaciones?.sueldo?.nuevo
                    }))
                    .filter(cambio =>
                        cambio.fecha &&
                        Number.isFinite(Number(cambio.nuevo)) &&
                        Number(cambio.nuevo) > 0
                    );

                // No permitir dos cambios de sueldo en la misma fecha.
                const existeMismoDia = cambiosSueldo.some(
                    cambio => cambio.fecha === fechaVigencia
                );

                if (existeMismoDia) {
                    throw new Error(
                        "Ya existe un cambio de sueldo con esa fecha de vigencia. Revisa el historial contractual."
                    );
                }

                // Considerar exclusivamente los cambios vigentes
                // antes de la fecha del nuevo anexo.
                const cambiosAnteriores = cambiosSueldo
                    .filter(cambio => cambio.fecha < fechaVigencia)
                    .sort((a, b) => a.fecha.localeCompare(b.fecha));

                // Reconstruir el sueldo vigente a la fecha indicada.
                sueldoAnterior = sueldoOriginal;

                for (const cambio of cambiosAnteriores) {
                    sueldoAnterior = Number(cambio.nuevo);
                }
            }


            // Reconstruir el cargo vigente para la fecha del nuevo anexo.
            if (esCambioCargo) {
            
                if (!contrato.cargo_id) {
                    throw new Error(
                        "El contrato original no tiene un cargo asociado."
                    );
                }
            
                // Recuperar los anexos asociados al contrato madre.
                const anexosExistentes =
                    await contratosGeneradosService.getAnexosByContrato(
                        contrato.id
                    );
            
                // Extraer los cambios de cargo registrados.
                const cambiosCargo = (anexosExistentes ?? [])
                    .map(anexo => ({
                        fecha: anexo.variables?._evolucion_contractual?.fecha_vigencia,
                        anterior: anexo.variables?._evolucion_contractual?.modificaciones?.cargo_id?.anterior,
                        nuevo: anexo.variables?._evolucion_contractual?.modificaciones?.cargo_id?.nuevo
                    }))
                    .filter(cambio =>
                        cambio.fecha &&
                        cambio.nuevo
                    );
            
                // No permitir dos cambios de cargo en la misma fecha.
                const existeMismoDia = cambiosCargo.some(
                    cambio => cambio.fecha === fechaVigencia
                );
            
                if (existeMismoDia) {
                    throw new Error(
                        "Ya existe un cambio de cargo con esa fecha de vigencia. Revisa el historial contractual."
                    );
                }
            
                // Considerar únicamente cambios anteriores a la fecha indicada.
                const cambiosAnteriores = cambiosCargo
                    .filter(cambio => cambio.fecha < fechaVigencia)
                    .sort((a, b) => a.fecha.localeCompare(b.fecha));
            
                // Partir desde el cargo original.
                cargoAnteriorId = contrato.cargo_id;
            
                for (const cambio of cambiosAnteriores) {
            
                    // Detectar inconsistencias en la secuencia de cambios.
                    if (
                        cambio.anterior &&
                        String(cambio.anterior) !== String(cargoAnteriorId)
                    ) {
                        throw new Error(
                            "Se detectó una inconsistencia en el historial de cambios de cargo."
                        );
                    }
            
                    cargoAnteriorId = cambio.nuevo;
                }
            
                // El nuevo cargo debe ser diferente del cargo vigente.
                if (String(cargoAnteriorId) === String(cargoId)) {
                    throw new Error(
                        "El cargo seleccionado ya corresponde al cargo vigente del contrato."
                    );
                }
            }

            
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
                cargosService.getById(
                    esCambioCargo ? cargoId : contrato.cargo_id
                ),
                plantillasDocumentoService.getById(plantilla.id)
            ]);

            // La constructora debe corresponder a la obra seleccionada.
            const constructora = await constructorasService.getById(
                obra.constructora_id
            );

            // 2. Construir las variables sin alterar el contrato original.
            const contratoParaDocumento = {
                ...contrato,
                observaciones,
                ...(esCambioSueldo ? { sueldo: sueldoNuevo } : {})
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
            
            // Variables específicas para cambio de cargo.
            if (esCambioCargo) {
            
                const cargoAnterior = await cargosService.getById(
                    cargoAnteriorId
                );
            
                variables.CARGO_ANTERIOR = cargoAnterior.nombre;
                variables.CARGO_NUEVO = cargo.nombre;
            
            }

            // Construir las modificaciones contractuales del anexo.
            const modificaciones = {};
            
            
            if (esCambioSueldo) {
            
                variables.SUELDO_ANTERIOR = sueldoAnterior;
                variables.SUELDO_NUEVO = sueldoNuevo;
            
                modificaciones.sueldo = {
                    anterior: sueldoAnterior,
                    nuevo: sueldoNuevo
                };
            
            }

            
            if (esCambioCargo) {
            
                modificaciones.cargo_id = {
                    anterior: cargoAnteriorId,
                    nuevo: cargoId
                };
            
            }
            
            
            if (esTraslado) {
            
                modificaciones.obra_id = {
                    anterior: obraAnteriorId,
                    nuevo: obraId
                };
            
            }
            
            
            // Guardar metadatos de evolución contractual.
            if (Object.keys(modificaciones).length > 0) {
            
                variables._evolucion_contractual = {
                    tipo_anexo: String(
                        plantilla.tipo_anexo ?? ""
                    ).trim().toUpperCase(),
            
                    fecha_vigencia: fechaVigencia,
            
                    modificaciones
                };
            
            }

            const contenidoHtml = reemplazarVariables(
                plantillaCompleta.contenido,
                variables
            );

            if (!contenidoHtml.trim()) {
                throw new Error(
                    "La plantilla no generó contenido. Revisa su campo contenido."
                );
            }

           // Preparar el PDF para revisión, sin guardar todavía el anexo.

            // Obtener la URL del logo de la empresa, si existe.
            const logoUrl = empresa?.logo_path
                ? await storageService.createSignedUrlLogo(
                    empresa.logo_path
                )
                : null;
            
            // Construir el HTML definitivo.
            const documentoPdfHtml = await construirDocumentoHtml(
                contenidoHtml,
                logoUrl,
                variables.NOMBRE_EMPRESA ?? "",
                "ANEXO DE CONTRATO DE TRABAJO"
            );
            
            // Solicitar el PDF a la API.
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
            
            const pdfBlob = await response.blob();
            
            if (!pdfBlob.size) {
                throw new Error("La API devolvió un PDF vacío.");
            }
            
            // Conservar todos los datos para la confirmación posterior.
            anexoPendiente = {
                empresa,
                obraId,
                observaciones,
                contenidoHtml,
                variables,
                pdfBlob
            };
            
            // Mostrar el PDF en el visor.
            if (pdfPreviewUrl) {
                URL.revokeObjectURL(pdfPreviewUrl);
            }
            
            pdfPreviewUrl = URL.createObjectURL(pdfBlob);
            visorPdf.src = pdfPreviewUrl;
            
            // Cambiar a la segunda etapa.
            formularioContenido.hidden = true;
            vistaPrevia.hidden = false;
            
            botonGenerar.hidden = true;
            botonVolver.hidden = false;
            botonConfirmar.hidden = false;
            
            overlay.querySelector(".cubika-modal-header p").textContent =
                "Revisa el documento antes de confirmar su generación.";
            
            return;
            

        } catch (error) {
            console.error("Error al preparar la vista previa del anexo:", error);
        
            alert(
                "No fue posible preparar el documento. " +
                (error.message ?? "Revisa la consola para más detalles.")
            );
        
            botonGenerar.disabled = false;
            botonGenerar.textContent = "Vista previa del anexo";
        }
    });

        
            botonVolver.addEventListener("click", () => {
        
            vistaPrevia.hidden = true;
            formularioContenido.hidden = false;
        
            botonVolver.hidden = true;
            botonConfirmar.hidden = true;
        
            botonGenerar.hidden = false;
            botonGenerar.disabled = false;
            botonGenerar.textContent = "Actualizar vista previa";
        
            overlay.querySelector(".cubika-modal-header p").textContent =
                "Completa los antecedentes necesarios para generar el documento.";
        
        });


    botonConfirmar.addEventListener("click", async () => {

        if (!anexoPendiente) {
            alert("No existe un documento preparado para generar.");
            return;
        }
    
        botonConfirmar.disabled = true;
        botonConfirmar.textContent = "Guardando anexo...";
    
        try {
    
            const {
                empresa,
                obraId,
                observaciones,
                contenidoHtml,
                variables,
                pdfBlob
            } = anexoPendiente;
    
            // 1. Obtener número y estado definitivo.
            const [numeroAnexo, estadoGenerado] = await Promise.all([
                documentNumberService.generarNumeroDocumento(
                    contrato.cliente_id,
                    "ANX"
                ),
                estadosContratoService.getByCodigo("GENERADO")
            ]);
    
            if (!estadoGenerado?.id) {
                throw new Error(
                    "No se encontró el estado GENERADO en estados_contrato."
                );
            }
    
            // 2. Construir el registro del anexo.
            const registroAnexo = {
                cliente_id: contrato.cliente_id,
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
    
            // 3. Crear el registro en Supabase.
            const anexoCreado = await contratosGeneradosService.create(
                registroAnexo
            );
    
            if (!anexoCreado?.id) {
                throw new Error(
                    "El anexo se guardó, pero no se obtuvo su ID."
                );
            }
    
            // 4. Subir exactamente el PDF que el usuario revisó.
            const upload = await storageService.uploadContrato({
                empresaId: anexoCreado.empresa_id,
                workerId: anexoCreado.worker_id,
                contratoId: anexoCreado.id,
                pdfBlob,
                nombreArchivo: "anexo.pdf"
            });
    
            await contratosGeneradosService.actualizarPdf(
                anexoCreado.id,
                upload.path
            );
    
            // 5. Registrar el evento documental.
            try {
    
                await documentosGeneradosEventosService.registrarGeneracion({
                    cliente_id: contrato.cliente_id,
                    lote_id: crypto.randomUUID(),
    
                    // El evento apunta al contrato original.
                    contrato_id: contrato.id,
    
                    plantilla_id: plantilla.id,
                    empresa_id: contrato.empresa_id,
                    worker_id: contrato.worker_id,
    
                    tipo_documento: "ANEXO",
                    nombre_documento: `Anexo ${numeroAnexo} - ${plantilla.nombre}`
                });
    
            } catch (error) {
    
                console.error(
                    "No fue posible registrar el evento documental:",
                    error
                );
    
            }
    
            // 6. Descargar el PDF aprobado.
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
    
            // 7. Cerrar el modal de generación.
            cerrar();
    
            // 8. Mostrar confirmación.
            mostrarConfirmacionAnexo(numeroAnexo);
    
            // 9. Actualizar el listado.
            await cargarContratosGenerados(true);
    
        } catch (error) {
    
            console.error("Error al generar el anexo:", error);
    
            alert(
                "No fue posible completar la generación del anexo. " +
                (error.message ?? "Revisa la consola para más detalles.")
            );
    
            botonConfirmar.disabled = false;
            botonConfirmar.textContent = "Generar anexo";
    
        }
    
    });
            
    
}



function mostrarConfirmacionAnexo(numeroAnexo) {

    mostrarConfirmacionExito({
        titulo: "Anexo generado exitosamente",
        mensaje: "El documento ha sido generado y añadido correctamente a la relación contractual.",
        detalleEtiqueta: "Número de anexo",
        detalleValor: numeroAnexo,
        botonTexto: "Entendido"
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

    const estadoActual =
        contrato.estado?.codigo;

    // Un contrato finiquitado nunca se reactiva
    // mediante sincronización automática.

    if (estadoActual === "FINIQUITADO") {
        return contrato;
    }

    const nuevoEstado =
        await contratosGeneradosService.sincronizarEstado(
            contrato.id
        );

    contrato.estado = nuevoEstado;

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

        const documentosPorId = new Map(
            documentos.map(d => [
                String(d.id),
                d
            ])
        );

        const documentosPersistidos = documentos
            .filter(d => ["CONTRATO", "ANEXO"].includes(String(d.tipo_documento || "").toUpperCase()))
            .map(d => ({
                id: d.id,
                fecha: d.fecha_generacion || d.created_at,
                tipo: String(d.tipo_documento || "").toUpperCase(),
                nombre: String(d.tipo_documento || "").toUpperCase() === "ANEXO"
                    ? `Anexo ${d.numero_contrato || ""} para ${
                        documentosPorId.get(String(d.contrato_madre_id))?.numero_contrato || "contrato"
                      }`
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
                    nombre: `${e.nombre_documento || "Complemento"} para ${
                            base?.numero_contrato || "contrato"
                        }`,
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
