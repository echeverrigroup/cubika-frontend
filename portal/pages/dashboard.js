import {
    solicitarAperturaContrato
} from "./construction_contratos.js";


import { constructionResumenService } from "../services/constructionResumenService.js";
import { navigate } from "../router.js";


export function renderDashboard() {
    return `
        <div class="page-header">
            <h1>Resumen</h1>
            <span class="resumen-subtitulo">
                Gestor Documental · Vista global
            </span>
        </div>

        <section class="card resumen-filtros">
            <button
                type="button"
                id="btnToggleFiltrosResumen"
                class="resumen-filtros-toggle"
                aria-expanded="false"
                aria-controls="resumenFiltrosContenido"
            >
                <span class="resumen-filtros-toggle-info">
                    <span class="resumen-filtros-icono" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="1.8"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 6h16M7 12h10m-7 6h4"/>
                        </svg>
                    </span>
                    <span>
                        <strong>Filtros</strong>
                        <small>Personaliza los indicadores por empresa y obra</small>
                    </span>
                </span>

                <svg
                    class="resumen-filtros-chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                >
                    <path d="m6 9 6 6 6-6"/>
                </svg>
            </button>

            <div
                id="resumenFiltrosContenido"
                class="resumen-filtros-contenido"
                hidden
            >
                <div class="resumen-filtros-grid">
                    <div class="form-group">
                        <label for="resumenEmpresa">Empresa cliente</label>
                        <select id="resumenEmpresa" class="cubika-select">
                            <option value="">Todas las empresas</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="resumenObra">Obra</label>
                        <select id="resumenObra" class="cubika-select">
                            <option value="">Todas las obras</option>
                        </select>
                    </div>

                    <div class="resumen-filtros-acciones">
                        <button
                            id="btnLimpiarResumen"
                            class="btn-secondary"
                            type="button"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <div id="resumenMensaje" role="status" aria-live="polite">
            Cargando indicadores...
        </div>

        <section
            id="resumenIndicadores"
            class="resumen-indicadores"
            aria-label="Indicadores generales"
        ></section>

        <section class="card resumen-alertas-card">
            <div class="resumen-alertas-header">
                <div>
                    <h2>Alertas que requieren atención</h2>
                    <p>Contratos vencidos o próximos a vencer</p>
                </div>
                <span
                    id="resumenTotalAlertas"
                    class="resumen-alertas-contador"
                ></span>
            </div>

            <div id="resumenAlertas">
                Cargando alertas...
            </div>
        </section>
    `;
}



export async function initDashboard() {
    const empresaSelect = document.getElementById("resumenEmpresa");
    const obraSelect = document.getElementById("resumenObra");
    const indicadores = document.getElementById("resumenIndicadores");
    const alertas = document.getElementById("resumenAlertas");
    const mensaje = document.getElementById("resumenMensaje");
    const totalAlertas = document.getElementById("resumenTotalAlertas");

    const btnToggleFiltros = document.getElementById(
        "btnToggleFiltrosResumen"
    );
    const filtrosContenido = document.getElementById(
        "resumenFiltrosContenido"
    );

    if (!empresaSelect || !obraSelect || !indicadores || !alertas) return;

    btnToggleFiltros?.addEventListener("click", () => {
        const estaAbierto =
            btnToggleFiltros.getAttribute("aria-expanded") === "true";
    
        btnToggleFiltros.setAttribute(
            "aria-expanded",
            String(!estaAbierto)
        );
    
        filtrosContenido.hidden = estaAbierto;
    });

    let datos = null;

    const escapar = valor => String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);

    function poblarEmpresas(empresas) {
        const valorActual = empresaSelect.value;

        empresaSelect.innerHTML = `
            <option value="">Todas las empresas</option>
            ${empresas.map(empresa => `
                <option value="${escapar(empresa.id)}">
                    ${escapar(empresa.nombre)}
                </option>
            `).join("")}
        `;

        if (empresas.some(e => String(e.id) === valorActual)) {
            empresaSelect.value = valorActual;
        }
    }

    function poblarObras(obras) {
        const valorActual = obraSelect.value;

        obraSelect.innerHTML = `
            <option value="">Todas las obras</option>
            ${obras.map(obra => `
                <option value="${escapar(obra.id)}">
                    ${escapar(obra.nombre)}
                </option>
            `).join("")}
        `;

        if (obras.some(o => String(o.id) === valorActual)) {
            obraSelect.value = valorActual;
        }
    }

    function pintarIndicadores(resumen) {
        const tarjetas = [
            {
                titulo: "Trabajadores activos",
                valor: resumen.trabajadoresActivos,
                detalle: "Con contrato vigente"
            },
            {
                titulo: "Contratos vigentes",
                valor: resumen.contratosVigentes,
                detalle: "Activos o próximos a vencer"
            },
            {
                titulo: "Próximos a vencer",
                valor: resumen.contratosProximosAVencer,
                detalle: "Vencimiento en 15 días o menos"
            },
            {
                titulo: "Contratos vencidos",
                valor: resumen.contratosVencidos,
                detalle: "Requieren revisión"
            }
        ];

        indicadores.innerHTML = tarjetas.map(tarjeta => `
            <article class="card resumen-indicador">
                <span class="resumen-indicador-titulo">
                    ${escapar(tarjeta.titulo)}
                </span>
                <strong class="resumen-indicador-valor">
                    ${tarjeta.valor}
                </strong>
                <span class="resumen-indicador-detalle">
                    ${escapar(tarjeta.detalle)}
                </span>
            </article>
        `).join("");
    }

    function pintarAlertas(lista) {
        totalAlertas.textContent = `${lista.length} alertas`;

        if (!lista.length) {
            alertas.innerHTML = `
                <div class="resumen-sin-alertas">
                    No hay contratos próximos a vencer ni vencidos
                    dentro de los filtros seleccionados.
                </div>
            `;
            return;
        }

        alertas.innerHTML = `
            <div class="resumen-alertas-lista">
                ${lista.map(alerta => {
                    const contrato = alerta.contrato;
                    const trabajador = contrato.worker
                        ? [
                            contrato.worker.nombres,
                            contrato.worker.apellido_paterno,
                            contrato.worker.apellido_materno
                        ].filter(Boolean).join(" ")
                        : "Trabajador no identificado";

                    return `
                        <article class="resumen-alerta ${alerta.prioridad}">
                            <div class="resumen-alerta-contenido">
                                <strong>${escapar(alerta.mensaje)}</strong>
                                <span>${escapar(trabajador)}</span>
                                <small>
                                    ${escapar(contrato.empresa?.nombre ?? "Sin empresa")}
                                    · ${escapar(contrato.obra?.nombre ?? "Sin obra")}
                                </small>
                                <small>
                                    Vencimiento:
                                    ${escapar(contrato.fecha_termino ?? "Sin fecha")}
                                </small>
                            </div>
                            <button
                                type="button"
                                class="btn-secondary btn-ver-contrato"
                                data-contrato-id="${escapar(contrato.id)}"
                            >
                                Ver contratos
                            </button>
                        </article>
                    `;
                }).join("")}
            </div>
        `;

        alertas.querySelectorAll(".btn-ver-contrato").forEach(boton => {
            boton.addEventListener("click", () => {
                solicitarAperturaContrato(
                    boton.dataset.contratoId
                );
            });
        });
    }

    async function actualizar() {
        mensaje.textContent = "Actualizando indicadores...";
        indicadores.innerHTML = "";
        alertas.innerHTML = "Cargando alertas...";

        try {
            datos = await constructionResumenService.getResumen({
                empresaId: empresaSelect.value,
                obraId: obraSelect.value
            });

            poblarEmpresas(datos.empresas);
            poblarObras(datos.obras);

            pintarIndicadores(datos.indicadores);
            pintarAlertas(datos.indicadores.alertas);

            mensaje.textContent = "";
        } catch (error) {
            console.error("Error al cargar el Resumen:", error);
            mensaje.textContent =
                "No fue posible cargar los indicadores. Revisa la consola y los permisos de Supabase.";
            indicadores.innerHTML = "";
            alertas.innerHTML = "";
        }
    }

    empresaSelect.addEventListener("change", async () => {
        obraSelect.value = "";
        await actualizar();
    });

    obraSelect.addEventListener("change", actualizar);

    document.getElementById("btnLimpiarResumen")
        ?.addEventListener("click", async () => {
            empresaSelect.value = "";
            obraSelect.value = "";
            await actualizar();
        });

    await actualizar();
}
