import { supabase } from "../js/supabaseClient.js";
import { requireAuth } from "./auth.js";
import { navigate } from "./router.js";
import { showConfirmModal }
    from "./components/modal.js";

import {
    inicializarContexto,
    obtenerContexto,
    limpiarContexto
} from "./contexto.js";


import {
    inicializarTenantContext,
    limpiarTenantContext
} from "./tenantContextService.js";




async function init() {

    const user = await requireAuth();

        if (!user) return;
        
        let contexto;

            try {
            
                // 1. Inicializar identidad y rol del usuario
                contexto = await inicializarContexto(user);
            
                // 2. Inicializar empresa cliente activa
                await inicializarTenantContext(contexto);
            
            } catch (error) {
            
                console.error(
                    "Error al inicializar contexto:",
                    error
                );
            
                limpiarTenantContext();
                limpiarContexto();
            
                await supabase.auth.signOut();
            
                window.location.href = "/login.html";
            
                return;
            }
    

    const logoutBtn =
    document.getElementById("logoutBtn");

    logoutBtn.addEventListener(
    "click",
    () => {

        showConfirmModal({

            title: "Cerrar sesión",

            message:
                "¿Deseas abandonar la sesión actual de Cubika?",

            limpiarTenantContext();

            limpiarContexto();
            
            await supabase.auth.signOut();

                window.location.href =
                    "/login.html";

            }

        });

    }
);

    
    const userName =
        document.getElementById("user-name");
    
    const userRole =
        document.getElementById("user-role");
    
    const userEmpresa =
        document.getElementById("user-empresa");
    
    
    if (contexto.tipo === "SUPER_ADMIN") {
    
        userName.textContent = "Super Admin";
    
        userRole.textContent = "Administrador de plataforma";
    
        userEmpresa.textContent = "Cubika";
    
    } else {
    
        userName.textContent =
            `${contexto.nombre} ${contexto.apellido ?? ""}`.trim();
    
        userRole.textContent =
            contexto.cargo ?? "Usuario";
    
        userEmpresa.textContent =
            contexto.empresa;
    
    }
    

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    const mobileSidebarOverlay =
        document.getElementById("mobileSidebarOverlay");

    const mainContainer =
        document.querySelector(".main-container");

    function closeMobileMenu() {

        if (!mainContainer) return;

        mainContainer.classList.remove("mobile-menu-open");

        mobileMenuBtn?.setAttribute(
            "aria-expanded",
            "false"
        );

        mobileMenuBtn?.setAttribute(
            "aria-label",
            "Abrir menú"
        );

    }

    function toggleMobileMenu() {

        if (!mainContainer) return;

        const isOpen =
            mainContainer.classList.toggle(
                "mobile-menu-open"
            );

        mobileMenuBtn?.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        mobileMenuBtn?.setAttribute(
            "aria-label",
            isOpen
                ? "Cerrar menú"
                : "Abrir menú"
        );

    }

    mobileMenuBtn?.addEventListener(
        "click",
        toggleMobileMenu
    );

    mobileSidebarOverlay?.addEventListener(
        "click",
        closeMobileMenu
    );


    document
    .querySelectorAll("[data-page]")
    .forEach(item => {

        item.addEventListener("click", () => {

            document
                .querySelectorAll("[data-page]")
                .forEach(i =>
                    i.classList.remove("active")
                );
            const pagina =
            item.dataset.page;
        
        
        if (
            pagina === "construction_empresas" ||
            pagina === "construction_trabajadores" ||
            pagina === "construction_plantillas"
        ) {
        
            abrirConfiguracion();
        
        }

        if (
            pagina === "construction_welcome"
        ) {
        
            abrirAyuda();
        
        }

            item.classList.add("active");

            navigate(item.dataset.page);

            closeMobileMenu();
        });

    });

    // =========================================================
    // CONFIGURACIÓN - DESPLEGABLE
    // =========================================================
    
    const configuracionToggle =
        document.getElementById(
            "configuracionToggle"
        );
    
    const configuracionSubmenu =
        document.getElementById(
            "configuracionSubmenu"
        );
    
    const configuracionChevron =
        document.getElementById(
            "configuracionChevron"
        );
    
    
    function abrirConfiguracion() {
    
        configuracionToggle
            ?.classList.add("open");
    
        configuracionSubmenu
            ?.classList.add("open");
    
    }
    
    
    function cerrarConfiguracion() {
    
        configuracionToggle
            ?.classList.remove("open");
    
        configuracionSubmenu
            ?.classList.remove("open");
    
    }
    
    
    configuracionToggle
        ?.addEventListener(
            "click",
            () => {
    
                const abierto =
                    configuracionSubmenu
                        ?.classList.contains("open");
    
    
                if (abierto) {
    
                    cerrarConfiguracion();
    
                } else {
    
                    abrirConfiguracion();
    
                }
    
            }
        );


    const paginasConfiguracion = [

            "construction_empresas",
        
            "construction_trabajadores",
        
            "construction_plantillas"
        
        ];
        
        
        const paginaActual =
            new URLSearchParams(
                window.location.search
            ).get("page");
        
        
        if (
            paginasConfiguracion.includes(
                paginaActual
            )
        ) {
        
            abrirConfiguracion();
        
        }



    // =========================================================
    // AYUDA - DESPLEGABLE
    // =========================================================
    
    const ayudaToggle =
        document.getElementById(
            "ayudaToggle"
        );
    
    const ayudaSubmenu =
        document.getElementById(
            "ayudaSubmenu"
        );
    
    
    function abrirAyuda() {
    
        ayudaToggle
            ?.classList.add("open");
    
        ayudaSubmenu
            ?.classList.add("open");
    
    }
    
    
    function cerrarAyuda() {
    
        ayudaToggle
            ?.classList.remove("open");
    
        ayudaSubmenu
            ?.classList.remove("open");
    
    }
    
    
    ayudaToggle
        ?.addEventListener(
            "click",
            () => {
    
                const abierto =
                    ayudaSubmenu
                        ?.classList.contains("open");
    
    
                if (abierto) {
    
                    cerrarAyuda();
    
                } else {
    
                    abrirAyuda();
    
                }
    
            }
        );

    
    
    
        const params =
            new URLSearchParams(
                window.location.search
            );
        
        const pagina =
            params.get("page") || "dashboard";
        
        // Limpiar cualquier selección anterior
        document
            .querySelectorAll("[data-page]")
            .forEach(item => {
                item.classList.remove("active");
            });
        
        // Activar el CRUD correspondiente en el sidebar
        const sidebarItem =
            document.querySelector(
                `[data-page="${pagina}"]`
            );
        
        if (sidebarItem) {
        
            sidebarItem.classList.add("active");
        
        }
        
        // Abrir el grupo correspondiente si es necesario
        if (
            pagina === "construction_empresas" ||
            pagina === "construction_trabajadores" ||
            pagina === "construction_plantillas"
        ) {
        
            abrirConfiguracion();
        
        }
        
        if (pagina === "construction_welcome") {
        
            abrirAyuda();
        
        }
        
        // Cargar la página
        navigate(pagina);
}
   

init();


// =========================================================
// MENÚ DE USUARIO RESPONSIVE
// =========================================================

const userMenu = document.querySelector(".user-menu");

if (userMenu) {

    const syncUserMenu = () => {

        if (window.innerWidth <= 768) {

            // En móvil comienza cerrado
            userMenu.removeAttribute("open");

        } else {

            // En desktop permanece siempre abierto
            userMenu.setAttribute("open", "");

        }

    };

    // Estado inicial
    syncUserMenu();

    // Adaptar si cambia el tamaño de la ventana
    window.addEventListener("resize", syncUserMenu);

}


// PRUEBA: mostrar solamente Construcción
document.querySelectorAll(".sidebar > h3").forEach(seccion => {

    if (seccion.textContent.trim() !== "Construcción") {
        seccion.style.display = "none";

        const menu = seccion.nextElementSibling;

        if (menu && menu.classList.contains("sidebar-menu")) {
            menu.style.display = "none";
        }
    }

});
