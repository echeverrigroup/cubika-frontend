import { supabase } from "../../../js/supabaseClient.js";


const BUCKET = "contratos";

export const storageService = {

    async uploadContrato({
        empresaId,
        workerId,
        contratoId,
        pdfBlob
    }) {

        if (!empresaId)
            throw new Error("Falta empresaId.");

        if (!workerId)
            throw new Error("Falta workerId.");

        if (!contratoId)
            throw new Error("Falta contratoId.");

        if (!pdfBlob)
            throw new Error("Falta el PDF.");

        const path =
            `${empresaId}/${workerId}/${contratoId}/contrato.pdf`;

        const { data, error } =
            await supabase
                .storage
                .from(BUCKET)
                .upload(
                    path,
                    pdfBlob,
                    {
                        contentType: "application/pdf",
                        upsert: true
                    }
                );

        if (error)
            throw error;

        return {
            path: data.path
        };
    },


    async createSignedUrl(path, expiresIn = 3600) {

        if (!path)
            throw new Error("Falta la ruta del archivo.");

        const { data, error } =
            await supabase
                .storage
                .from(BUCKET)
                .createSignedUrl(
                    path,
                    expiresIn
                );

        if (error)
            throw error;

        return data.signedUrl;
    },


    async remove(path) {

        if (!path)
            throw new Error("Falta la ruta del archivo.");

        const { error } =
            await supabase
                .storage
                .from(BUCKET)
                .remove([path]);

        if (error)
            throw error;

        return true;
    }

};
