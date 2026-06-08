import { supabase } from "../js/supabaseClient.js";

export async function requireAuth() {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {

        window.location.href = "/login.html";
        return null;
    }

    return user;
}
