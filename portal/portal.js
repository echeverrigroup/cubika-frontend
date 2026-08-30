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

            item.classList.add("active");

            navigate(item.dataset.page);

            closeMobileMenu();
        });

    });
    
     navigate("construccionWelcome");

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
