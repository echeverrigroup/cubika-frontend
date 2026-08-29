/**
 * Componente Navbar
 * Maneja la presentación de la barra de navegación superior
 * Refactorización de: portal/portal.js (lineas 42-76)
 */

import { userService } from "../../../services/userService.js";
import { authService } from "../../../core/auth/authService.js";
import { MESSAGES } from "../../../config/constants.js";

export class Navbar {
    
    constructor() {
        this.profile = null;
        this.logoutCallback = null;
    }
    
    /**
     * Inicializa el navbar con datos del usuario
     * @param {Function} onLogout - Callback al hacer logout
     */
    async init(onLogout = null) {
        this.logoutCallback = onLogout;
        
        // Obtiene el usuario actual
        const user = await authService.getCurrentUser();
        
        if (!user) return;
        
        // Obtiene y formatea el perfil
        this.profile = await userService.getFormattedProfile(user.id);
        
        // Renderiza los datos
        this.render();
        
        // Configura los event listeners
        this.setupEventListeners();
    }
    
    /**
     * Renderiza los datos del usuario en el navbar
     */
    render() {
        if (!this.profile) return;
        
        this.updateUserInfo(
            this.profile.name,
            this.profile.role,
            this.profile.company
        );
    }
    
    /**
     * Actualiza la información del usuario en el DOM
     * @param {string} name - Nombre del usuario
     * @param {string} role - Cargo del usuario
     * @param {string} company - Empresa del usuario
     */
    updateUserInfo(name, role, company) {
        const nameElement = document.getElementById("user-name");
        const roleElement = document.getElementById("user-role");
        const companyElement = document.getElementById("user-empresa");
        
        if (nameElement) nameElement.textContent = name;
        if (roleElement) roleElement.textContent = role;
        if (companyElement) companyElement.textContent = company;
    }
    
    /**
     * Configura los event listeners del navbar
     */
    setupEventListeners() {
        const logoutBtn = document.getElementById("logoutBtn");
        
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                if (this.logoutCallback) {
                    this.logoutCallback();
                }
            });
        }
    }
    
    /**
     * Realiza el logout
     */
    async logout() {
        const success = await authService.logout();
        
        if (success) {
            window.location.href = "/login.html";
        }
    }
}

export const navbar = new Navbar();
