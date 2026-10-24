
import { contratosGeneradosService } from "./contratosGeneradosService.js";
import { obrasService } from "./obrasService.js";

/**
 * Calcula el estado de vigencia sin escribir en Supabase.
 * Mantiene las reglas del módulo de Contratos.
 */
export function determinarEstadoContratoResumen(contrato, ahora = new Date()) {
    const fechaInicio = contrato.fecha_inicio
        ? new Date(`${contrato.fecha_inicio}T00:00:00`)
        : null;

    const fechaTermino = contrato.fecha_termino
        ? new Date(`${contrato.fecha_termino}T00:00:00`)
        : null;

    if (contrato.estado?.codigo === "FINIQUITADO") {
        return "FINIQUITADO";
    }

    if (!fechaTermino) {
        if (fechaInicio && ahora < fechaInicio) {
            return "GENERADO";
        }

        return "ACTIVO";
    }

    const hoy = new Date(ahora);
    hoy.setHours(0, 0, 0, 0);

    if (hoy > fechaTermino) {
        return "VENCIDO";
    }

    const diasRestantes =
        (fechaTermino.getTime() - hoy.getTime()) /
        (1000 * 60 * 60 * 24);

    if (diasRestantes <= 15) {
        return "PROXIMO_VENCER";
    }

    if (fechaInicio && ahora < fechaInicio) {
        return "GENERADO";
    }

    return "ACTIVO";
}

function esDocumentoContrato(contrato) {
    const tipo = String(contrato.tipo_documento ?? "")
        .trim()
        .toUpperCase();

    // Los registros históricos sin tipo se mantienen provisionalmente.
    return !tipo || tipo === "CONTRATO";
}

function obtenerContratosConEstado(contratos) {
    return contratos
        .filter(esDocumentoContrato)
        .map(contrato => ({
            ...contrato,
            estadoCalculado: determinarEstadoContratoResumen(contrato)
        }));
}

function aplicarFiltros(contratos, { empresaId = "", obraId = "" } = {}) {
    return contratos.filter(contrato => {
        const coincideEmpresa =
            !empresaId ||
            String(contrato.empresa?.id ?? contrato.empresa_id ?? "") ===
                String(empresaId);

        const coincideObra =
            !obraId ||
            String(contrato.obra?.id ?? contrato.obra_id ?? "") ===
                String(obraId);

        return coincideEmpresa && coincideObra;
    });
}

function calcularIndicadores(contratos) {
    const trabajadoresActivos = new Set();

    for (const contrato of contratos) {
        if (
            ["ACTIVO", "PROXIMO_VENCER"].includes(contrato.estadoCalculado) &&
            contrato.worker?.id
        ) {
            trabajadoresActivos.add(String(contrato.worker.id));
        }
    }

    const proximosAVencer = contratos.filter(
        c => c.estadoCalculado === "PROXIMO_VENCER"
    );

    const vencidos = contratos.filter(
        c => c.estadoCalculado === "VENCIDO"
    );

    const vigentes = contratos.filter(
        c => ["ACTIVO", "PROXIMO_VENCER"].includes(c.estadoCalculado)
    );

    const alertas = [
        ...proximosAVencer.map(contrato => ({
            tipo: "PROXIMO_VENCER",
            prioridad: "advertencia",
            mensaje: "Contrato próximo a vencer",
            contrato
        })),
        ...vencidos.map(contrato => ({
            tipo: "VENCIDO",
            prioridad: "critica",
            mensaje: "Contrato vencido",
            contrato
        }))
    ].sort((a, b) => {
        const prioridad = { critica: 0, advertencia: 1 };
        return prioridad[a.prioridad] - prioridad[b.prioridad];
    });

    return {
        trabajadoresActivos: trabajadoresActivos.size,
        contratosVigentes: vigentes.length,
        contratosProximosAVencer: proximosAVencer.length,
        contratosVencidos: vencidos.length,
        alertas
    };
}

export const constructionResumenService = {
    async getResumen(filtros = {}) {
        const [contratosOriginales, obras] = await Promise.all([
            contratosGeneradosService.getAll(),
            obrasService.getAll()
        ]);

        const contratos = obtenerContratosConEstado(contratosOriginales);
        const contratosFiltrados = aplicarFiltros(contratos, filtros);

        const empresas = [
            ...new Map(
                contratos
                    .filter(c => c.empresa?.id)
                    .map(c => [String(c.empresa.id), c.empresa])
            ).values()
        ].sort((a, b) => a.nombre.localeCompare(b.nombre));

        const obrasFiltradas = obras
            .filter(obra => {
                if (!filtros.empresaId) return true;

                // La relación empresa-mandante/obra debe verificarse
                // antes de aplicar este filtro a las obras.
                return contratos.some(c =>
                    String(c.empresa?.id ?? c.empresa_id ?? "") ===
                        String(filtros.empresaId) &&
                    String(c.obra?.id ?? c.obra_id ?? "") ===
                        String(obra.id)
                );
            })
            .sort((a, b) => a.nombre.localeCompare(b.nombre));

        return {
            indicadores: calcularIndicadores(contratosFiltrados),
            contratos: contratosFiltrados,
            empresas,
            obras: obrasFiltradas
        };
    }
};
