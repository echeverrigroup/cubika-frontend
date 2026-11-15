
/**
 * Servicio de evolución contractual.
 *
 * Reconstruye las condiciones contractuales vigentes
 * a partir del contrato original y sus anexos.
 *
 * No modifica registros ni realiza operaciones en Supabase.
 */

export const evolucionContractualService = {

    /**
     * Obtiene la fecha local en formato YYYY-MM-DD.
     * Evita desfases derivados de convertir fechas a UTC.
     */
    obtenerFechaLocal() {

        const fecha = new Date();

        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;
    },


    /**
     * Calcula las condiciones contractuales vigentes
     * para una fecha determinada.
     *
     * @param {Object} contrato Contrato original.
     * @param {Array} anexos Anexos asociados al contrato.
     * @param {string} fechaConsulta Fecha YYYY-MM-DD.
     *
     * @returns {Object} Condiciones contractuales calculadas.
     */
    calcularCondicionesVigentes(
        contrato,
        anexos = [],
        fechaConsulta = this.obtenerFechaLocal()
    ) {

        if (!contrato?.id) {
            throw new Error(
                "Se requiere un contrato válido para calcular su evolución."
            );
        }

        if (!Array.isArray(anexos)) {
            throw new Error(
                "Los anexos deben entregarse como un arreglo."
            );
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaConsulta)) {
            throw new Error(
                "La fecha de consulta debe tener formato YYYY-MM-DD."
            );
        }


        // 1. Inicializar con las condiciones del contrato original.

        const condiciones = {

            obra_id: contrato.obra_id ?? null,
            cargo_id: contrato.cargo_id ?? null,

            sueldo: contrato.sueldo != null
                ? Number(contrato.sueldo)
                : null,

            jornada_id: contrato.jornada_id ?? null,

            distribucion_horaria:
                contrato.distribucion_horaria ?? null,

            fecha_inicio: contrato.fecha_inicio ?? null,
            fecha_termino: contrato.fecha_termino ?? null

        };


        // 2. Identificar exclusivamente los anexos de este contrato.

        const anexosValidos = anexos.filter(anexo => {

            return (
                String(anexo.contrato_madre_id) === String(contrato.id) &&
                String(anexo.tipo_documento).toUpperCase() === "ANEXO"
            );

        });


        // 3. Extraer las modificaciones contractuales registradas.

        const modificaciones = anexosValidos
            .map(anexo => {

                const evolucion =
                    anexo.variables?._evolucion_contractual;

                if (!evolucion?.fecha_vigencia) {
                    return null;
                }

                return {

                    anexo_id: anexo.id,

                    numero_documento: anexo.numero_contrato,

                    tipo_anexo: evolucion.tipo_anexo,

                    fecha_vigencia: evolucion.fecha_vigencia,

                    modificaciones: evolucion.modificaciones ?? {}

                };

            })
            .filter(Boolean);


        // 4. Considerar únicamente modificaciones vigentes
        //    hasta la fecha consultada.

        const modificacionesVigentes = modificaciones
            .filter(modificacion => {

                const fecha = modificacion.fecha_vigencia;

                if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
                    throw new Error(
                        `El anexo ${modificacion.numero_documento ?? modificacion.anexo_id} tiene una fecha de vigencia inválida.`
                    );
                }

                return fecha <= fechaConsulta;

            })
            .sort((a, b) => {

                return a.fecha_vigencia.localeCompare(
                    b.fecha_vigencia
                );

            });


       // 5. Detectar modificaciones del mismo campo
        //    con idéntica fecha de vigencia.
        
        const fechasSueldo = new Set();
        const fechasObra = new Set();
        
        for (const modificacion of modificacionesVigentes) {
        
            const cambios = modificacion.modificaciones;
            const fecha = modificacion.fecha_vigencia;
        
            // Detectar cambios de sueldo duplicados.
            if (cambios.sueldo) {
        
                if (fechasSueldo.has(fecha)) {
                    throw new Error(
                        `Existe más de un cambio de sueldo con fecha de vigencia ${fecha}. Revisa el historial contractual.`
                    );
                }
        
                fechasSueldo.add(fecha);
            }
        
            // Detectar traslados duplicados.
            if (cambios.obra_id) {
        
                if (fechasObra.has(fecha)) {
                    throw new Error(
                        `Existe más de un traslado con fecha de vigencia ${fecha}. Revisa el historial contractual.`
                    );
                }
        
                fechasObra.add(fecha);
            }
        
        }


        // 6. Aplicar las modificaciones en orden cronológico.
        //    Cada modificación se valida contra la condición anterior.
        
        for (const modificacion of modificacionesVigentes) {
        
            const cambios = modificacion.modificaciones;
        
            const numeroDocumento =
                modificacion.numero_documento ?? modificacion.anexo_id;
        
        
            // CAMBIO DE SUELDO
        
            if (cambios.sueldo) {
        
                const sueldoAnterior =
                    Number(cambios.sueldo.anterior);
        
                const sueldoNuevo =
                    Number(cambios.sueldo.nuevo);
        
                if (
                    !Number.isFinite(sueldoAnterior) ||
                    !Number.isFinite(sueldoNuevo) ||
                    sueldoAnterior <= 0 ||
                    sueldoNuevo <= 0
                ) {
                    throw new Error(
                        `El anexo ${numeroDocumento} contiene valores de sueldo inválidos.`
                    );
                }
        
                // Comprobar coherencia histórica.
                if (Number(condiciones.sueldo) !== sueldoAnterior) {
        
                    throw new Error(
                        `Existe una inconsistencia en la evolución del sueldo del anexo ${numeroDocumento}. El sueldo anterior registrado no coincide con el sueldo reconstruido.`
                    );
        
                }
        
                condiciones.sueldo = sueldoNuevo;
        
            }
        
        
            // TRASLADO DE OBRA
        
            if (cambios.obra_id) {
        
                const obraAnterior = cambios.obra_id.anterior;
                const obraNueva = cambios.obra_id.nuevo;
        
                if (!obraAnterior || !obraNueva) {
        
                    throw new Error(
                        `El anexo ${numeroDocumento} contiene identificadores de obra inválidos.`
                    );
        
                }
        
                // Comprobar coherencia histórica.
                if (
                    String(condiciones.obra_id) !== String(obraAnterior)
                ) {
        
                    throw new Error(
                        `Existe una inconsistencia en la evolución de la obra del anexo ${numeroDocumento}. La obra anterior registrada no coincide con la obra reconstruida.`
                    );
        
                }
        
                condiciones.obra_id = obraNueva;
        
            }
        
        }


        // 7. Devolver la representación calculada.
        //    El contrato original permanece intacto.

        return {

            contrato_id: contrato.id,

            fecha_consulta: fechaConsulta,

            condiciones_actuales: condiciones,

            anexos_considerados: modificacionesVigentes.length

        };

    }

};
