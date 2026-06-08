import { supabase } from "../js/supabaseClient.js";
import { requireAuth } from "./auth.js";

async function init() {

    const user = await requireAuth();

    if (!user) return;

    document
        .getElementById("logoutBtn")
        .addEventListener("click", async () => {

            await supabase.auth.signOut();

            window.location.href = "/login.html";
        });

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

    console.log("USER:", user);
    console.log("PERFIL:", perfil);
    console.log("ERROR:", error);

    if (perfil) {

        document.getElementById("user-name").textContent =
            `${perfil.nombre} ${perfil.apellido ?? ""}`;

       document.getElementById("user-role").textContent =
            `${perfil.cargo ?? "Usuario"} · ${perfil.empresas?.nombre ?? ""}`;
    }
}

init();
