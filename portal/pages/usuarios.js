import { supabase }
from "../js/supabaseClient.js";


import { empresasService }
from "../services/empresasService.js";


import {
    showConfirmModal,
    showFormModal,
    setModalLoading,
    setModalError
}
from "../components/modal.js";



/*
=========================================================
RENDER PRINCIPAL
=========================================================
*/

export async function renderUsuarios() {

    const content =
        document.querySelector(".content");


    content.innerHTML = `

        <div class="page-header">

            <h1>
                Usuarios
            </h1>

            <button
                id="btnNuevoUsuario"
                class="btn-primary">

                + Nuevo Usuario

            </button>

        </div>


        <div class="table-filters">

            <select
                id="filtroEstado"
                class="cubika-select">

                <option value="">
                    Todos los Estados
                </option>

                <option value="ACTIVO">
                    Activos
                </option>

                <option value="PENDIENTE">
                    Pendientes
                </option>

                <option value="INACTIVO">
                    Inactivos
                </option>

            </select>


            <div class="search-box">

                <span class="search-icon">
                    🔍
                </span>

                <input
                    id="buscarUsuario"
                    class="cubika-input"
                    type="text"
                    placeholder="Buscar por nombre, email, RUT o cargo...">

            </div>

        </div>


        <div id="usuariosTable">

            Cargando...

        </div>

    `;


    await cargarUsuarios();


    document
        .getElementById("btnNuevoUsuario")
        .addEventListener(
            "click",
            mostrarFormularioNuevoUsuario
        );


    document
        .getElementById("filtroEstado")
        .addEventListener(
            "change",
            cargarUsuarios
        );


    document
        .getElementById("buscarUsuario")
        .addEventListener(
            "input",
            cargarUsuarios
        );

}



/*
=========================================================
CARGAR USUARIOS
=========================================================
*/

async function cargarUsuarios() {

    const table =
        document.getElementById(
            "usuariosTable"
        );


    if (!table)
        return;


    try {

        let query =
            supabase
                .from("usuarios")
                .select(`
                    id,
                    empresa_id,
                    sucursal_id,
                    nombre,
                    apellido,
                    rut,
                    email,
                    telefono,
                    cargo,
                    nivel,
                    estado,
                    ultimo_acceso,
                    created_at,
                    updated_at,
                    auth_user_id,
                    empresas (
                        id,
                        razon_social,
                        nombre_fantasia
                    )
                `)
                .order(
                    "nombre",
                    {
                        ascending: true
                    }
                );


        const filtroEstado =
            document
                .getElementById(
                    "filtroEstado"
                )
                ?.value;


        const filtroBusqueda =
            document
                .getElementById(
                    "buscarUsuario"
                )
                ?.value
                .trim()
                .toUpperCase();


        if (filtroEstado) {

            query =
                query.eq(
                    "estado",
                    filtroEstado
                );

        }


        const {
            data: usuarios,
            error
        } =
            await query;


        if (error)
            throw error;


        let usuariosFiltrados =
            usuarios || [];


        /*
        -------------------------------------------------
        FILTRO DE BÚSQUEDA
        -------------------------------------------------
        */

        if (filtroBusqueda) {

            usuariosFiltrados =
                usuariosFiltrados.filter(
                    usuario => {

                        const texto = `

                            ${usuario.nombre ?? ""}

                            ${usuario.apellido ?? ""}

                            ${usuario.email ?? ""}

                            ${usuario.rut ?? ""}

                            ${usuario.cargo ?? ""}

                            ${obtenerNombreEmpresa(
                                usuario
                            )}

                        `
                            .toUpperCase();


                        return texto.includes(
                            filtroBusqueda
                        );

                    }
                );

        }


        renderTablaUsuarios(
            usuariosFiltrados
        );

    }

    catch (error) {

        console.error(
            "Error cargando usuarios:",
            error
        );


        table.innerHTML = `

            <div class="form-error"
                 style="display:block;">

                No fue posible cargar
                los usuarios.

            </div>

        `;

    }

}



/*
=========================================================
TABLA
=========================================================
*/

function renderTablaUsuarios(
    usuarios
) {

    const table =
        document.getElementById(
            "usuariosTable"
        );


    let html = `

        <table class="cubika-table">

            <thead>

                <tr>

                    <th>
                        Usuario
                    </th>

                    <th>
                        Empresa
                    </th>

                    <th>
                        Email
                    </th>

                    <th>
                        Cargo
                    </th>

                    <th>
                        Nivel
                    </th>

                    <th>
                        Estado
                    </th>

                    <th>
                        Acciones
                    </th>

                </tr>

            </thead>

            <tbody>

    `;


    if (!usuarios.length) {

        html += `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:30px;
                    ">

                    No existen usuarios
                    registrados.

                </td>

            </tr>

        `;

    }


    usuarios.forEach(usuario => {

        const nombreCompleto =
            `${usuario.nombre ?? ""}
             ${usuario.apellido ?? ""}`
                .trim();


        const estado =
            (usuario.estado || "")
                .toUpperCase();


        let estadoClase =
            "inactivo";


        if (
            estado === "ACTIVO"
        ) {

            estadoClase =
                "activo";

        }


        html += `

            <tr>

                <td>

                    <strong>
                        ${escapeHtml(
                            nombreCompleto
                        )}
                    </strong>

                    ${
                        usuario.rut
                            ? `
                                <br>

                                <small>
                                    ${escapeHtml(
                                        usuario.rut
                                    )}
                                </small>
                              `
                            : ""
                    }

                </td>


                <td>

                    ${escapeHtml(
                        obtenerNombreEmpresa(
                            usuario
                        )
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        usuario.email ?? ""
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        usuario.cargo ?? "—"
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        usuario.nivel ?? "USUARIO"
                    )}

                </td>


                <td>

                    <span
                        class="
                            estado-badge
                            ${estadoClase}
                        ">

                        ${escapeHtml(
                            usuario.estado ?? ""
                        )}

                    </span>

                </td>


                <td>

                    <button
                        class="btn-edit"
                        data-id="${usuario.id}">

                        Editar

                    </button>


                    <button
                        class="${
                            estado === "ACTIVO"
                                ? "btn-danger"
                                : "btn-primary"
                        } btn-toggle-estado"
                        data-id="${usuario.id}">

                        ${
                            estado === "ACTIVO"
                                ? "Desactivar"
                                : "Activar"
                        }

                    </button>

                </td>

            </tr>

        `;

    });


    html += `

            </tbody>

        </table>

    `;


    table.innerHTML =
        html;


    /*
    -------------------------------------------------
    BOTONES EDITAR
    -------------------------------------------------
    */

    document
        .querySelectorAll(
            "#usuariosTable .btn-edit"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () =>
                    editarUsuario(
                        btn.dataset.id
                    )
            );

        });


    /*
    -------------------------------------------------
    BOTONES ESTADO
    -------------------------------------------------
    */

    document
        .querySelectorAll(
            "#usuariosTable .btn-toggle-estado"
        )
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () =>
                    cambiarEstadoUsuario(
                        btn.dataset.id
                    )
            );

        });

}



/*
=========================================================
FORMULARIO NUEVO USUARIO
=========================================================
*/

async function mostrarFormularioNuevoUsuario() {

    const contenido =
        await obtenerFormularioUsuario();


    showFormModal({

        title:
            "Nuevo Usuario",

        content:
            contenido,

        submitText:
            "Enviar invitación",

        onSubmit:
            crearUsuario

    });

}



/*
=========================================================
OBTENER FORMULARIO
=========================================================
*/

async function obtenerFormularioUsuario(
    usuario = null
) {

    const empresas =
        await empresasService.getAll();


    const opcionesEmpresas =
        empresas

            .filter(empresa =>

                empresa.estado === "Activo"

                ||
                empresa.id ===
                    usuario?.empresa_id

            )

            .map(empresa => {

                const nombreEmpresa =
                    empresa.nombre_fantasia
                    ||
                    empresa.razon_social
                    ||
                    "Empresa";


                const seleccionada =
                    String(
                        empresa.id
                    ) ===
                    String(
                        usuario?.empresa_id
                    );


                return `

                    <option
                        value="${empresa.id}"
                        ${
                            seleccionada
                                ? "selected"
                                : ""
                        }>

                        ${escapeHtml(
                            nombreEmpresa
                        )}

                        ${
                            empresa.estado ===
                            "Inactivo"

                                ? " (Inactiva)"

                                : ""
                        }

                    </option>

                `;

            })

            .join("");


    return `

        <form id="formUsuario">

            <div class="cubika-form-grid">


                <!-- EMPRESA -->

                <div class="form-group">

                    <label>
                        Empresa *
                    </label>

                    <select
                        id="empresa_id"
                        class="cubika-select"
                        required>

                        <option value="">

                            Seleccione una empresa

                        </option>

                        ${opcionesEmpresas}

                    </select>

                </div>


                <!-- NOMBRE -->

                <div class="form-group">

                    <label>
                        Nombre *
                    </label>

                    <input
                        id="nombre"
                        type="text"
                        class="cubika-input"
                        value="${escapeAttribute(
                            usuario?.nombre
                        )}"
                        placeholder="Nombre..."
                        required>

                </div>


                <!-- APELLIDO -->

                <div class="form-group">

                    <label>
                        Apellido
                    </label>

                    <input
                        id="apellido"
                        type="text"
                        class="cubika-input"
                        value="${escapeAttribute(
                            usuario?.apellido
                        )}"
                        placeholder="Apellido...">

                </div>


                <!-- RUT -->

                <div class="form-group">

                    <label>
                        RUT
                    </label>

                    <input
                        id="rut"
                        type="text"
                        class="cubika-input"
                        value="${escapeAttribute(
                            usuario?.rut
                        )}"
                        placeholder="12.345.678-9">

                </div>


                <!-- EMAIL -->

                <div
                    class="form-group"
                    style="
                        grid-column:1/-1;
                    ">

                    <label>
                        Correo electrónico *
                    </label>

                    <input
                        id="email"
                        type="email"
                        class="cubika-input"
                        value="${escapeAttribute(
                            usuario?.email
                        )}"
                        placeholder="usuario@empresa.cl"
                        required>

                </div>


                <!-- TELÉFONO -->

                <div class="form-group">

                    <label>
                        Teléfono
                    </label>

                    <input
                        id="telefono"
                        type="text"
                        class="cubika-input"
                        value="${escapeAttribute(
                            usuario?.telefono
                        )}"
                        placeholder="+56 9...">

                </div>


                <!-- CARGO -->

                <div class="form-group">

                    <label>
                        Cargo
                    </label>

                    <input
                        id="cargo"
                        type="text"
                        class="cubika-input"
                        value="${escapeAttribute(
                            usuario?.cargo
                        )}"
                        placeholder="Cargo...">

                </div>


            </div>


            <div
                id="modalFormError"
                class="form-error"
                style="
                    display:none;
                    margin-top:20px;
                ">
            </div>

        </form>

    `;

}



/*
=========================================================
CREAR USUARIO / INVITAR
=========================================================
*/

async function crearUsuario() {

    const empresa_id =
        document
            .getElementById(
                "empresa_id"
            )
            ?.value;


    const nombre =
        document
            .getElementById(
                "nombre"
            )
            ?.value
            .trim();


    const apellido =
        document
            .getElementById(
                "apellido"
            )
            ?.value
            .trim();


    const rut =
        document
            .getElementById(
                "rut"
            )
            ?.value
            .trim();


    const email =
        document
            .getElementById(
                "email"
            )
            ?.value
            .trim()
            .toLowerCase();


    const telefono =
        document
            .getElementById(
                "telefono"
            )
            ?.value
            .trim();


    const cargo =
        document
            .getElementById(
                "cargo"
            )
            ?.value
            .trim();


    /*
    -------------------------------------------------
    VALIDACIONES
    -------------------------------------------------
    */

    if (!empresa_id) {

        setModalError(
            "Debe seleccionar una empresa."
        );

        return false;

    }


    if (!nombre) {

        setModalError(
            "Debe ingresar el nombre del usuario."
        );

        return false;

    }


    if (!email) {

        setModalError(
            "Debe ingresar el correo electrónico."
        );

        return false;

    }


    const emailValido =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);


    if (!emailValido) {

        setModalError(
            "El correo electrónico no es válido."
        );

        return false;

    }


    /*
    -------------------------------------------------
    INVITAR
    -------------------------------------------------
    */

    try {

        setModalLoading(true);


        const {
            data,
            error
        } =
            await supabase
                .functions
                .invoke(
                    "invite-user",
                    {
                        body: {

                            empresa_id,

                            nombre,

                            apellido,

                            email,

                            rut,

                            telefono,

                            cargo,

                            nivel:
                                "USUARIO"

                        }

                    }
                );


        if (error)
            throw error;


        if (
            data?.error
        ) {

            throw new Error(
                data.error
            );

        }


        /*
        -------------------------------------------------
        RECARGAR TABLA
        -------------------------------------------------
        */

        await cargarUsuarios();


        setModalLoading(
            false
        );


        return true;

    }

    catch (error) {

        console.error(
            "Error invitando usuario:",
            error
        );


        setModalLoading(
            false
        );


        setModalError(
            obtenerMensajeError(
                error
            )
        );


        return false;

    }

}



/*
=========================================================
EDITAR USUARIO
=========================================================
*/

async function editarUsuario(id) {

    try {

        const {
            data: usuario,
            error
        } =
            await supabase
                .from("usuarios")
                .select("*")
                .eq("id", id)
                .single();


        if (error)
            throw error;


        if (!usuario)
            return;


        showFormModal({

            title:
                "Editar Usuario",

            content:
                await obtenerFormularioUsuario(
                    usuario
                ),

            submitText:
                "Guardar cambios",

            onSubmit:
                () =>
                    actualizarUsuario(
                        id
                    )

        });

    }

    catch (error) {

        console.error(
            "Error obteniendo usuario:",
            error
        );

    }

}



/*
=========================================================
ACTUALIZAR USUARIO
=========================================================
*/

async function actualizarUsuario(id) {

    const empresa_id =
        document
            .getElementById(
                "empresa_id"
            )
            ?.value;


    const nombre =
        document
            .getElementById(
                "nombre"
            )
            ?.value
            .trim();


    const apellido =
        document
            .getElementById(
                "apellido"
            )
            ?.value
            .trim();


    const rut =
        document
            .getElementById(
                "rut"
            )
            ?.value
            .trim();


    const email =
        document
            .getElementById(
                "email"
            )
            ?.value
            .trim()
            .toLowerCase();


    const telefono =
        document
            .getElementById(
                "telefono"
            )
            ?.value
            .trim();


    const cargo =
        document
            .getElementById(
                "cargo"
            )
            ?.value
            .trim();


    /*
    -------------------------------------------------
    VALIDACIONES
    -------------------------------------------------
    */

    if (!empresa_id) {

        setModalError(
            "Debe seleccionar una empresa."
        );

        return false;

    }


    if (!nombre) {

        setModalError(
            "Debe ingresar el nombre del usuario."
        );

        return false;

    }


    if (!email) {

        setModalError(
            "Debe ingresar el correo electrónico."
        );

        return false;

    }


    try {

        setModalLoading(true);


        const {
            error
        } =
            await supabase
                .from("usuarios")
                .update({

                    empresa_id,

                    nombre,

                    apellido:
                        apellido || null,

                    rut:
                        rut || null,

                    email,

                    telefono:
                        telefono || null,

                    cargo:
                        cargo || null,

                    updated_at:
                        new Date()
                            .toISOString()

                })
                .eq(
                    "id",
                    id
                );


        if (error)
            throw error;


        await cargarUsuarios();


        setModalLoading(
            false
        );


        return true;

    }

    catch (error) {

        console.error(
            "Error actualizando usuario:",
            error
        );


        setModalLoading(
            false
        );


        setModalError(
            "No fue posible actualizar el usuario."
        );


        return false;

    }

}



/*
=========================================================
CAMBIAR ESTADO
=========================================================
*/

async function cambiarEstadoUsuario(id) {

    try {

        const {
            data: usuario,
            error
        } =
            await supabase
                .from("usuarios")
                .select(`
                    id,
                    nombre,
                    apellido,
                    estado
                `)
                .eq(
                    "id",
                    id
                )
                .single();


        if (error)
            throw error;


        if (!usuario)
            return;


        const estadoActual =
            (
                usuario.estado ||
                ""
            ).toUpperCase();


        const nuevoEstado =
            estadoActual === "ACTIVO"

                ? "INACTIVO"

                : "ACTIVO";


        const accion =
            nuevoEstado === "ACTIVO"

                ? "Activar"

                : "Desactivar";


        const nombre =
            `${usuario.nombre ?? ""}
             ${usuario.apellido ?? ""}`
                .trim();


        showConfirmModal({

            title:
                `${accion} usuario`,

            message: `

                El usuario

                <strong>
                    ${escapeHtml(nombre)}
                </strong>

                será marcado como

                <strong>
                    ${nuevoEstado}
                </strong>.

                <br><br>

                Podrás cambiar su estado
                nuevamente cuando lo necesites.

            `,

            onConfirm:
                async () => {

                    try {

                        await supabase
                            .from("usuarios")
                            .update({

                                estado:
                                    nuevoEstado,

                                updated_at:
                                    new Date()
                                        .toISOString()

                            })
                            .eq(
                                "id",
                                id
                            );


                        await cargarUsuarios();


                        return true;

                    }

                    catch (error) {

                        console.error(
                            "Error cambiando estado:",
                            error
                        );


                        return false;

                    }

                }

        });

    }

    catch (error) {

        console.error(
            "Error obteniendo usuario:",
            error
        );

    }

}



/*
=========================================================
UTILIDADES
=========================================================
*/


function obtenerNombreEmpresa(
    usuario
) {

    if (
        !usuario?.empresas
    ) {

        return "—";

    }


    return (

        usuario.empresas.nombre_fantasia

        ||

        usuario.empresas.razon_social

        ||

        "—"

    );

}



function obtenerMensajeError(
    error
) {

    if (
        error?.message
    ) {

        return error.message;

    }


    if (
        error?.context?.body
    ) {

        try {

            const body =
                typeof error.context.body ===
                "string"

                    ? JSON.parse(
                        error.context.body
                    )

                    : error.context.body;


            if (
                body?.error
            ) {

                return body.error;

            }

        }

        catch {

            // Continuar
        }

    }


    return (
        "No fue posible enviar la invitación."
    );

}



/*
=========================================================
SEGURIDAD BÁSICA DE HTML
=========================================================
*/

function escapeHtml(
    valor
) {

    return String(
        valor ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}



function escapeAttribute(
    valor
) {

    return escapeHtml(
        valor
    );

}
