import { supabase }
from "../../js/supabaseClient.js";


export const geograficaService = {

    async getRegiones() {

        const { data, error } =
            await supabase
                .from("regiones")
                .select("*")
                .order("nombre");

        if (error)
            throw error;

        return data;

    },


    async getComunas(regionId) {

        const { data, error } =
            await supabase
                .from("comunas")
                .select("*")
                .eq("region_id", regionId)
                .order("nombre");

        if (error)
            throw error;

        return data;

    }

};
