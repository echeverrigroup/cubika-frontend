/**
 * Guard de autenticación
 * Protege rutas y asegura que el usuario esté autenticado
 * Reemplazo mejorado de: portal/auth.js
 */

import { authService } from "./authService.js";
import { AUTH_CONFIG } from "../../config/constants.js";

/**
 * Verifica si el usuario está autenticado
 * Si no, redirige al login
 * @returns {Promise<Object|null>}
 */
export async function requireAuth() {
    const user = await authService.getCurrentUser();
    
    if (!user) {
        window.location.href = AUTH_CONFIG.REDIRECT_LOGIN;
        return null;
    }
    
    return user;
}

/**
 * Verifica autenticación sin redirigir
 * @returns {Promise<boolean>}
 */
export async function checkAuth() {
    return await authService.isAuthenticated();
}
