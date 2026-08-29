/**
 * Portal Principal
 * Punto de entrada de la aplicación
 * Refactorizado para usar los nuevos módulos
 */

import { requireAuth } from "./core/auth/authGuard.js";
import { navigate, router } from "./core/router.js";
import { navigator } from "./core/navigator.js";
import { navbar } from "./components/common/Navbar/Navbar.js";
import { sidebar } from "./components/common/Sidebar/Sidebar.js";
import { showConfirmModal } from "./components/common/Modal/Modal.js";
import { authService } from "./core/auth/authService.js";
import { MESSAGES, ROUTES } from "./config/constants.js";

async function init() {
    
    // 1. Verifica autenticación
    const user = await requireAuth();
    if (!user) return;
    
    // 2. Inicializa el router
    router.init();
    
    // 3. Inicializa el navbar
    await navbar.init(handleLogout);
    
    // 4. Inicializa el sidebar
    sidebar.init();
    
    // 5. Configura los listeners de navegación
    navigator.initMenuListeners((page, params) => {
        navigate(page, params);
    });
    
    // 6. Navega al dashboard por defecto
    navigate(ROUTES.DASHBOARD);
    navigator.activateMenuItem(ROUTES.DASHBOARD);
}

/**
 * Maneja el logout del usuario
 */
async function handleLogout() {
    showConfirmModal({
        title: MESSAGES.LOGOUT_CONFIRMATION.title,
        message: MESSAGES.LOGOUT_CONFIRMATION.message,
        onConfirm: async () => {
            const success = await authService.logout();
            if (success) {
                window.location.href = "/login.html";
            }
        }
    });
}

// Inicia la aplicación
init().catch(error => {
    console.error("Error al inicializar portal:", error);
});
