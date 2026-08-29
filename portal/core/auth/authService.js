/**
 * Servicio de autenticación
 * Encapsula la lógica de negocios de autenticación
 * Extraído de: portal/auth.js
 */

import { supabase } from "../../js/supabaseClient.js";

class AuthService {
    
    /**
     * Obtiene el usuario actual autenticado
     * @returns {Promise<Object|null>}
     */
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) {
                console.error("Error al obtener usuario:", error);
                return null;
            }
            
            return user;
        } catch (error) {
            console.error("Error en getCurrentUser:", error);
            return null;
        }
    }
    
    /**
     * Verifica si el usuario está autenticado
     * @returns {Promise<boolean>}
     */
    async isAuthenticated() {
        const user = await this.getCurrentUser();
        return !!user;
    }
    
    /**
     * Cierra sesión del usuario
     * @returns {Promise<boolean>}
     */
    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error("Error al cerrar sesión:", error);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error("Error en logout:", error);
            return false;
        }
    }
    
    /**
     * Obtiene el ID del usuario actual
     * @returns {Promise<string|null>}
     */
    async getCurrentUserId() {
        const user = await this.getCurrentUser();
        return user?.id || null;
    }
}

export const authService = new AuthService();
