import { supabase } from "../js/supabaseClient.js";
import { requireAuth } from "./auth.js";
import { navigate } from "./router.js";
import { showConfirmModal }
    from "./components/modal.js";

async function init() {

    const user = await requireAuth();

    if (!user) return;

    const logoutBtn =
    document.getElementById("logoutBtn");

    logoutBtn.addEventListener(
    "click",
    () => {

        showConfirmModal({

            title: "Cerrar sesión",

            message:
                "¿Deseas abandonar la sesión actual de Cubika?",

            onConfirm: async () => {

                await supabase.auth.signOut();

                window.location.href =
                    "/login.html";

            }

        });

    }
);

    
    const { data: perfil, error } = await supabase
    .from("usuarios")
    .select(`
        nombre,
        apellido,
        cargo,
        empresas (
            nombre_fantasia
        )
    `)
    .eq("auth_user_id", user.id)
    .single();

    if (error) {

    console.error(error);

    document.getElementById("user-name").textContent =
        "Error de perfil";

    return;
    }


    if (perfil) {

        document.getElementById("user-name").textContent =
            `${perfil.nombre} ${perfil.apellido ?? ""}`;

       document.getElementById("user-role").textContent =
            `${perfil.cargo ?? "Usuario "}`;

        document.getElementById("user-empresa").textContent =
            `${perfil.empresas?.nombre_fantasia ?? " "}`;
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
        params.get("page");
    
    if (pagina) {
    
        navigate(pagina);
    
    } else {
    
        navigate("construction_welcome");
    
    }

    const dashboardItem =
    document.querySelector(
        '[data-page="dashboard"]'
    );

if (dashboardItem) {

    dashboardItem.classList.add("active");
}
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
