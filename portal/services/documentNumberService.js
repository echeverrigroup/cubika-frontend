
import { supabase } from "../../js/supabaseClient.js";

export const documentNumberService = {

    async generarNumeroDocumento(
        clienteId,
        tipoDocumento
    ) {

        if (!clienteId) {
            throw new Error(
                "No se recibió el cliente para generar el documento."
            );
        }

        const { data, error } =
            await supabase.rpc(
                "generar_numero_documento",
                {
                    p_cliente_id: clienteId,
                    p_tipo_documento: tipoDocumento
                }
            );

        if (error)
            throw error;

        return data;

    }

};
