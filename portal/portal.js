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
            `${perfil.cargo ?? "Usuario "}`  <br>  `${perfil.empresas?.nombre_fantasia ?? " "}`;
        }
    

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
        });

    });
    
     navigate("dashboard");

    const dashboardItem =
    document.querySelector(
        '[data-page="dashboard"]'
    );

if (dashboardItem) {

    dashboardItem.classList.add("active");
}
}
   

init();
