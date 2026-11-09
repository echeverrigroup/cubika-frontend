import { supabase } from "../../js/supabaseClient.js";

const TABLE = "contratos_generados";

export const contratosGeneradosService = {

   async getAll() {

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
            .single();

    if (error)
        throw error;

    return data;

},


async getAnexosByContrato(contratoMadreId) {

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
            .eq(
                "contrato_madre_id",
                contratoMadreId
            )
            .eq(
                "tipo_documento",
                "ANEXO"
            )
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



async actualizarPdf(anexoId, pdfUrl, clienteId = null) {

    const { data, error } = await supabase.rpc(
        "actualizar_pdf_anexo",
        {
            p_anexo_id: anexoId,
            p_pdf_url: pdfUrl,
            p_cliente_id: clienteId
        }
    );

    if (error) {
        console.error("Error al actualizar PDF del anexo:", error);
        throw error;
    }

    return data;
},

   

async sincronizarEstadosMasivamente(clienteId = null) {

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

    const { data, error } = await supabase.rpc(
        "sincronizar_estado_contrato",
        {
            p_contrato_id: id
        }
    );

    if (error) {
        console.error(
            "Error al sincronizar estado del contrato:",
            error
        );

        throw error;
    }

    return data;
},


   

   async create(contrato) {
       const { data, error } = await supabase.rpc(
           "crear_contrato_generado",
           {
               p_datos: contrato
           }
       );
   
       if (error) {
           console.error("Error al crear documento:", error);
           throw error;
       }
   
       return data;
   },


   
    async update(id, contrato) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .update(contrato)
                .eq("id", id)
                .select()
                .single();

        if (error) throw error;

        return data;

    },


    async delete(id) {

        const { error } =
            await supabase
                .from(TABLE)
                .delete()
                .eq("id", id);

        if (error) throw error;

        return true;

    }

};
