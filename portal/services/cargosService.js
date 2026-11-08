
import { supabase }
from "../../js/supabaseClient.js";

const TABLE = "cargos";

export const cargosService = {

    // ========================================================
    // CONSULTAR TODOS
    // ========================================================

    async getAll() {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select("*")
                .order("nombre");

        if (error)
            throw error;

        return data;
    },


    // ========================================================
    // CONSULTAR POR ID
    // ========================================================

    async getById(id) {

        const { data, error } =
            await supabase
                .from(TABLE)
                .select("*")
                .eq("id", id)
                .single();

        if (error)
            throw error;

        return data;
    },


    // ========================================================
    // CREAR
    // ========================================================

    async create(cargo) {

        const { data, error } =
            await supabase.rpc(
                "crear_cargo",
                {
                    p_datos: cargo
                }
            );

        if (error)
            throw error;

        return data;
    },


    // ========================================================
    // ACTUALIZAR
    // ========================================================

    async update(id, cargo) {

        const { data, error } =
            await supabase.rpc(
                "actualizar_cargo",
                {
                    p_cargo_id: id,
                    p_datos: cargo
                }
            );

        if (error)
            throw error;

        return data;
    },


    // ========================================================
    // CAMBIAR ESTADO
    // ========================================================

    async cambiarEstado(id, estado) {

        const { data, error } =
            await supabase.rpc(
                "cambiar_estado_cargo",
                {
                    p_cargo_id: id,
                    p_estado: estado
                }
            );

        if (error)
            throw error;

        return data;
    }

};
