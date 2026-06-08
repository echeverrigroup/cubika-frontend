import { requireAuth } from "./auth.js";
import { supabase } from "../js/supabaseClient.js";

async function init() {

    const user = await requireAuth();

    if (!user) return;

    const userLabel =
        document.getElementById("usuario-logueado");

        document
          .getElementById("logoutBtn")
          .addEventListener("click", async () => {
        
              await supabase.auth.signOut();
        
              window.location.href = "/login.html";
      });

    userLabel.textContent = user.email;
}

init();
