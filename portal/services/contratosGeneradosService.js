import { supabase } from "../../js/supabaseClient.js";

import {
    obtenerTenantIdActual
} from "../tenantContextService.js";


const TABLE = "contratos_generados";

export const contratosGeneradosService = {


    async getAll() {

        const clienteId = obtenerTenantIdActual();
    
        if (clienteId == null) {
            throw new Error(
                "No se pudo determinar la empresa activa."
            );
        }
    
        const { data, error } =
            await supabase
                .from(TABLE)
    
            .select(`
                *,

                worker:workers(
                    id,
                    rut,
                    nombres,
                    apellido_paterno,
                    apellido_materno
                ),

                empresa:empresas_construccion(
                    id,
                    nombre
                ),

                obra:obras(
                    id,
                    nombre,

                    constructora:constructoras(
                        id,
                        nombre
                    )
                ),

                cargo:cargos(
                    id,
                    nombre
                ),

                plantilla:plantillas_documento(
                    id,
                    nombre
                ),

                tipo_contrato:tipos_contrato(
                    id,
                    nombre
                ),

                estado:estados_contrato(
                    id,
                    codigo,
                    nombre,
                    simbolo
                )
            `)

            .eq("cliente_id", clienteId)
    
            .order(
                "fecha_generacion",
                {
                    ascending: false
                }
            );

    if (error)
        throw error;

    return data;

},

   
async getById(id) {


    const clienteId = obtenerTenantIdActual();

    if (clienteId == null) {
        throw new Error(
            "No se pudo determinar la empresa activa."
        );
    }

    const { data, error } =
        await supabase
            .from(TABLE)
            .select(`
                *,

                worker:workers(
                    id,
                    rut,
                    nombres,
                    apellido_paterno,
                    apellido_materno
                ),

                empresa:empresas_construccion(
                    id,
                    nombre
                ),

                obra:obras(
                    id,
                    nombre,

                    constructora:constructoras(
                        id,
                        nombre
                    )
                ),

                cargo:cargos(
                    id,
                    nombre
                ),

                plantilla:plantillas_documento(
                    id,
                    nombre
                ),

                tipo_contrato:tipos_contrato(
                    id,
                    nombre
                ),

                estado:estados_contrato(
                    id,
                    codigo,
                    nombre,
                    simbolo
                )
            `)
            .eq("id", id)
            .eq("cliente_id", clienteId)
            .single();

    if (error)
        throw error;

    return data;

},


async getAnexosByContrato(contratoMadreId) {

    const clienteId = obtenerTenantIdActual();

    if (clienteId == null) {
        throw new Error(
            "No se pudo determinar la empresa activa."
        );
    }

    const { data, error } =
        await supabase
            .from(TABLE)
            .select(`
                *,

                worker:workers(
                    id,
                    rut,
                    nombres,
                    apellido_paterno,
                    apellido_materno
                ),

                empresa:empresas_construccion(
                    id,
                    nombre
                ),

                obra:obras(
                    id,
                    nombre,
                    constructora:constructoras(
                        id,
                        nombre
                    )
                ),

                cargo:cargos(
                    id,
                    nombre
                ),

                plantilla:plantillas_documento(
                    id,
                    nombre
                ),

                tipo_contrato:tipos_contrato(
                    id,
                    nombre
                ),

                estado:estados_contrato(
                    id,
                    codigo,
                    nombre,
                    simbolo
                )
            `)
            .eq("contrato_madre_id", contratoMadreId)
            .eq("tipo_documento", "ANEXO")
            .eq("cliente_id", clienteId)
            .order("fecha_generacion", {
                ascending: false
            });

    if (error) throw error;

    return data;
},



async actualizarPdf(anexoId, pdfUrl) {

    const clienteId = obtenerTenantIdActual();

    if (clienteId == null) {
        throw new Error(
            "No se pudo determinar la empresa activa."
        );
    }

    const { data, error } = await supabase.rpc(
        "actualizar_pdf_anexo",
        {
            p_anexo_id: anexoId,
            p_pdf_url: pdfUrl,
            p_cliente_id: clienteId
        }
    );

    if (error) {
        console.error(
            "Error al actualizar PDF del anexo:",
            error
        );
        throw error;
    }

    return data;
},




async actualizarPdfContrato(contratoId, pdfUrl) {

    const clienteId = obtenerTenantIdActual();

    if (clienteId == null) {
        throw new Error(
            "No se pudo determinar la empresa activa."
        );
    }

    const { data, error } = await supabase.rpc(
        "actualizar_pdf_contrato",
        {
            p_contrato_id: contratoId,
            p_pdf_url: pdfUrl,
            p_cliente_id: clienteId
        }
    );

    if (error) {
        console.error(
            "Error al actualizar PDF del contrato:",
            error
        );
        throw error;
    }

    return data;
},


   

async sincronizarEstadosMasivamente() {

    const clienteId = obtenerTenantIdActual();

    if (clienteId == null) {
        throw new Error(
            "No se pudo determinar la empresa activa."
        );
    }

    const { data, error } = await supabase.rpc(
        "sincronizar_estados_contratos",
        {
            p_cliente_id: clienteId
        }
    );

    if (error) {
        console.error(
            "Error en sincronización masiva de contratos:",
            error
        );

        throw error;
    }

    return data;
},

    

async sincronizarEstado(id) {

    const clienteId = obtenerTenantIdActual();

    if (clienteId == null) {
        throw new Error(
            "No se pudo determinar la empresa activa."
        );
    }

    const { data, error } = await supabase.rpc(
        "sincronizar_estado_contrato",
        {
            p_contrato_id: id,
            p_cliente_id: clienteId
        }
    );

    if (error) throw error;

    return data;
},

   

   async create(contrato) {

        const clienteId = obtenerTenantIdActual();
    
        if (clienteId == null) {
            throw new Error(
                "No se pudo determinar la empresa activa."
            );
        }
    
        const datosContrato = {
            ...contrato,
            cliente_id: clienteId
        };
    
        const { data, error } = await supabase.rpc(
            "crear_contrato_generado",
            {
                p_datos: datosContrato
            }
        );
    
        if (error) {
            console.error(
                "Error al crear documento:",
                error
            );
    
            throw error;
        }
    
        return data;
    },


