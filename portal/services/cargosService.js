
import { supabase }
from "../../js/supabaseClient.js";

import {
    obtenerTenantIdActual
} from "../tenantContextService.js";


const TABLE = "cargos";

export const cargosService = {

    // ========================================================
    // OBTENER TENANT ACTUAL
    // ========================================================

    obtenerClienteId() {

        const clienteId = obtenerTenantIdActual();

        if (clienteId == null) {
            throw new Error(
                "No se pudo determinar la empresa activa."
            );
        }

        return clienteId;
    },


    // ========================================================
    // CONSULTAR TODOS
    // ========================================================

    async getAll() {

        const clienteId = this.obtenerClienteId();

        const { data, error } =
            await supabase
                .from(TABLE)
                .select("*")
                .eq("cliente_id", clienteId)
                .order("nombre");

        if (error)
            throw error;

        return data;
    },


    // ========================================================
    // CONSULTAR POR ID
    // ========================================================

    async getById(id) {

        const clienteId = this.obtenerClienteId();

        const { data, error } =
            await supabase
                .from(TABLE)
                .select("*")
                .eq("id", id)
                .eq("cliente_id", clienteId)
                .single();

        if (error)
            throw error;

        return data;
    },


    // ========================================================
    // CREAR
    // ========================================================

    async create(cargo) {

        const clienteId = this.obtenerClienteId();

        const { data, error } =
            await supabase.rpc(
                "crear_cargo",
                {
                    p_datos: cargo,
                    p_cliente_id: clienteId
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

        const clienteId = this.obtenerClienteId();

        const { data, error } =
            await supabase.rpc(
                "actualizar_cargo",
                {
                    p_cargo_id: id,
                    p_datos: cargo,
                    p_cliente_id: clienteId
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

        const clienteId = this.obtenerClienteId();

        const { data, error } =
            await supabase.rpc(
                "cambiar_estado_cargo",
                {
                    p_cargo_id: id,
                    p_estado: estado,
                    p_cliente_id: clienteId
                }
            );

        if (error)
            throw error;

        return data;
    }

};
