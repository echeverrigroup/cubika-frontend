import { supabase } from "./js/supabaseClient.js";

const form = document.getElementById("loginForm");
const errorBox = document.getElementById("loginError");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  errorBox.style.display = "none";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    await postLoginRedirect();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.style.display = "block";
  }
});

async function postLoginRedirect() {

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sesión inválida.");
  }

  const { data: perfil, error } = await supabase
    .from("usuarios")
    .select(`
      id,
      empresa_id,
      sucursal_id,
      nombre,
      apellido,
      email,
      nivel,
      estado
    `)
    .eq("auth_user_id", user.id)
    .single();

  if (error || !perfil) {

    await supabase.auth.signOut();

    throw new Error(
      "No existe un perfil asociado a este usuario."
    );
  }

  if (perfil.estado !== "ACTIVO") {

    await supabase.auth.signOut();

    throw new Error(
      "Usuario inactivo. Contacte al administrador."
    );
  }

  window.location.href = "/portal/";
}
