import { usuariosService }
from "../services/usuariosService.js";

import { empresasService }
from "../services/empresasService.js";

import {

    showConfirmModal,
    showFormModal,
    setModalLoading,
    setModalError

}
from "../components/modal.js";


let usuarios = [];

let empresas = [];


/*
|--------------------------------------------------------------------------
| RENDER PRINCIPAL
|--------------------------------------------------------------------------
*/

export async function renderUsuarios() {

    const content =
        document.querySelector(".content");

    content.innerHTML = `

        <div class="page-header">

            <h1>Usuarios</h1>

            <button
                id="btnNuevoUsuario"
                class="btn-primary">

                + Nuevo Usuario

            </button>

        </div>


        <div class="table-filters">

            <input
                id="buscarUsuario"
                class="cubika-input"
                type="text"
                placeholder="Buscar usuario...">


            <select
                id="filtroEstado"
                class="cubika-select">

                <option value="">
                    Todos los estados
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

        </div>


        <div id="usuariosTable">

            Cargando...

        </div>

    `;


    await cargarDatos();


    document
        .getElementById("buscarUsuario")
        ?.addEventListener(
            "keyup",
            renderTabla
        );


    document
        .getElementById("filtroEstado")
        ?.addEventListener(
            "change",
            renderTabla
        );


    document
        .getElementById("btnNuevoUsuario")
        ?.addEventListener(
            "click",
            mostrarFormularioNuevoUsuario
        );

}


/*
|--------------------------------------------------------------------------
| CARGAR DATOS
|--------------------------------------------------------------------------
*/

async function cargarDatos() {

    try {

        usuarios =
            await usuariosService.getAll();


        empresas =
            await empresasService.getAll();


        renderTabla();

    }

    catch (error) {

        console.error(error);

        const table =
            document.getElementById(
                "usuariosTable"
            );

        if (table) {

            table.innerHTML = `

                <div class="form-error">

                    No fue posible cargar los usuarios.

                </div>

            `;

        }

    }

}


/*
|--------------------------------------------------------------------------
| TABLA
|--------------------------------------------------------------------------
*/

function renderTabla() {

    const table =
        document.getElementById(
            "usuariosTable"
        );

    if (!table)
        return;


    const filtro =
        document
            .getElementById("buscarUsuario")
            ?.value
            ?.trim()
            ?.toUpperCase();


    const estado =
        document
            .getElementById("filtroEstado")
            ?.value;


    let filtrados =
        [...usuarios];


    /*
     * BUSCADOR
     */

    if (filtro) {

        filtrados =
            filtrados.filter(usuario => {

                const texto = `

                    ${usuario.nombre ?? ""}
                    ${usuario.apellido ?? ""}
                    ${usuario.email ?? ""}
                    ${usuario.rut ?? ""}

                `
                    .toUpperCase();


                return texto.includes(filtro);

            });

    }


    /*
     * FILTRO ESTADO
     */

    if (estado) {

        filtrados =
            filtrados.filter(
                usuario =>
                    usuario.estado === estado
            );

    }


    let html = `

        <table class="cubika-table">

            <thead>

                <tr>

                    <th>Nombre</th>

                    <th>Email</th>

                    <th>Empresa</th>

                    <th>Cargo</th>

                    <th>Nivel</th>

                    <th>Estado</th>

                    <th>Último acceso</th>

                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody>

    `;


    if (!filtrados.length) {

        html += `

            <tr>

                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:30px;
                    ">

                    No existen usuarios registrados.

                </td>

            </tr>

        `;

    }


    filtrados.forEach(usuario => {

        const empresa =
            empresas.find(
                empresa =>
                    empresa.id ==
                    usuario.empresa_id
            );


        const estadoClase =
            usuario.estado === "ACTIVO"
                ? "activo"
                : usuario.estado === "PENDIENTE"
                    ? "pendiente"
                    : "inactivo";


        const ultimoAcceso =
            usuario.ultimo_acceso
                ? formatearFecha(
                    usuario.ultimo_acceso
                )
                : "Nunca";


        html += `

            <tr>

                <td>

                    <strong>
                        ${usuario.nombre ?? ""}
                        ${usuario.apellido ?? ""}
                    </strong>

                </td>


                <td>

                    ${usuario.email ?? ""}

                </td>


                <td>

                    ${empresa
                        ? empresa.razon_social
                        : "—"}

                </td>


                <td>

                    ${usuario.cargo ?? "—"}

                </td>


                <td>

                    ${usuario.nivel ?? "—"}

                </td>


                <td>

                    <span
                        class="
                            estado-badge
                            ${estadoClase}
                        ">

                        ${usuario.estado ?? ""}

                    </span>

                </td>


                <td>

                    ${ultimoAcceso}

                </td>


                <td>

                    <button
                        class="btn-edit"
                        data-id="${usuario.id}">

                        Editar

                    </button>


                    <button
                        class="${
                            usuario.estado === "ACTIVO"
                                ? "btn-danger"
                                : "btn-restore"
                        } btn-toggle-usuario"
                        data-id="${usuario.id}">

                        ${
                            usuario.estado === "ACTIVO"
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


    table.innerHTML = html;


    /*
     * EVENTO EDITAR
     */

    document
        .querySelectorAll(".btn-edit")
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
     * EVENTO ESTADO
     */

    document
        .querySelectorAll(".btn-toggle-usuario")
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
|--------------------------------------------------------------------------
| FORMULARIO NUEVO USUARIO
|--------------------------------------------------------------------------
*/

async function mostrarFormularioNuevoUsuario() {

    if (!empresas.length) {

        empresas =
            await empresasService.getAll();

    }


    showFormModal({

        title:
            "Nuevo Usuario",


        content:
            obtenerFormularioUsuario(),


        submitText:
            "Enviar invitación",


        size:
            "large",


        onSubmit:
            crearUsuario

    });

}


/*
|--------------------------------------------------------------------------
| FORMULARIO
|--------------------------------------------------------------------------
*/

function obtenerFormularioUsuario(
    usuario = null
) {

    return `

        <form id="formUsuario">


            <div class="empresa-layout">


                <!-- DATOS DEL USUARIO -->

                <div class="empresa-section">

                    <h3>
                        Datos del Usuario
                    </h3>


                    <div class="form-group">

                        <label>
                            Empresa
                        </label>

                        <select
                            id="empresa_id"
                            class="cubika-select"
                            required>

                            <option value="">
                                Seleccione una empresa
                            </option>

                            ${
                                empresas
                                    .filter(
                                        empresa =>
                                            empresa.estado ===
                                            "Activo"
                                    )
                                    .map(
                                        empresa => `

                                            <option
                                                value="${empresa.id}"
                                                ${
                                                    usuario?.empresa_id ==
                                                    empresa.id
                                                        ? "selected"
                                                        : ""
                                                }>

                                                ${
                                                    empresa.nombre_fantasia ||
                                                    empresa.razon_social
                                                }

                                            </option>

                                        `
                                    )
                                    .join("")
                            }

                        </select>

                    </div>


                    <div class="cubika-form-grid">


                        <div class="form-group">

                            <label>
                                Nombre
                            </label>

                            <input
                                id="nombre"
                                type="text"
                                class="cubika-input"
                                value="${
                                    usuario?.nombre ?? ""
                                }"
                                required>

                        </div>


                        <div class="form-group">

                            <label>
                                Apellido
                            </label>

                            <input
                                id="apellido"
                                type="text"
                                class="cubika-input"
                                value="${
                                    usuario?.apellido ?? ""
                                }">

                        </div>


                    </div>


                    <div class="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            class="cubika-input"
                            value="${
                                usuario?.email ?? ""
                            }"
                            required>

                    </div>


                    <div class="cubika-form-grid">


                        <div class="form-group">

                            <label>
                                RUT
                            </label>

                            <input
                                id="rut"
                                type="text"
                                class="cubika-input"
                                value="${
                                    usuario?.rut ?? ""
                                }">

                        </div>


                        <div class="form-group">

                            <label>
                                Teléfono
                            </label>

                            <input
                                id="telefono"
                                type="text"
                                class="cubika-input"
                                value="${
                                    usuario?.telefono ?? ""
                                }">

                        </div>


                    </div>


                    <div class="form-group">

                        <label>
                            Cargo
                        </label>

                        <input
                            id="cargo"
                            type="text"
                            class="cubika-input"
                            value="${
                                usuario?.cargo ?? ""
                            }">

                    </div>


                    <div class="form-group">

                        <label>
                            Nivel de usuario
                        </label>

                        <select
                            id="nivel"
                            class="cubika-select">

                            <option
                                value="USUARIO"
                                ${
                                    !usuario ||
                                    usuario.nivel === "USUARIO"
                                        ? "selected"
                                        : ""
                                }>

                                Usuario

                            </option>


                            <option
                                value="ADMIN_EMPRESA"
                                ${
                                    usuario?.nivel ===
                                    "ADMIN_EMPRESA"
                                        ? "selected"
                                        : ""
                                }>

                                Administrador de Empresa

                            </option>

                        </select>

                    </div>


                </div>


            </div>


            <div
                id="modalFormError"
                class="form-error"
                style="display:none;">
            </div>


        </form>

    `;

}


/*
|--------------------------------------------------------------------------
| CREAR / INVITAR USUARIO
|--------------------------------------------------------------------------
*/

async function crearUsuario() {

    const empresa_id =
        document
            .getElementById("empresa_id")
            ?.value;


    const nombre =
        document
            .getElementById("nombre")
            ?.value
            ?.trim();


    const apellido =
        document
            .getElementById("apellido")
            ?.value
            ?.trim();


    const email =
        document
            .getElementById("email")
            ?.value
            ?.trim()
            ?.toLowerCase();


    const rut =
        document
            .getElementById("rut")
            ?.value
            ?.trim();


    const telefono =
        document
            .getElementById("telefono")
            ?.value
            ?.trim();


    const cargo =
        document
            .getElementById("cargo")
            ?.value
            ?.trim();


    const nivel =
        document
            .getElementById("nivel")
            ?.value;


    /*
     * VALIDACIONES
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

        document
            .getElementById("nombre")
            ?.focus();

        return false;

    }


    if (!email) {

        setModalError(
            "Debe ingresar el correo electrónico."
        );

        document
            .getElementById("email")
            ?.focus();

        return false;

    }


    /*
     * VALIDAR EMAIL
     */

    const emailValido =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);


    if (!emailValido) {

        setModalError(
            "Debe ingresar un correo electrónico válido."
        );

        document
            .getElementById("email")
            ?.focus();

        return false;

    }


    /*
     * EVITAR DUPLICADOS
     */

    const existe =
        usuarios.some(
            usuario =>
                usuario.email?.toLowerCase() ===
                email
        );


    if (existe) {

        setModalError(
            "Ya existe un usuario registrado con este correo electrónico."
        );

        return false;

    }


    try {

        setModalLoading(true);


        await usuariosService.invitar({

            empresa_id:
                Number(empresa_id),

            nombre,

            apellido,

            email,

            rut,

            telefono,

            cargo,

            nivel

        });


        await cargarDatos();


        setModalLoading(false);


        return true;

    }

    catch (error) {

        console.error(error);


        setModalLoading(false);


        setModalError(
            error?.message ||
            "No fue posible enviar la invitación."
        );


        return false;

    }

}


/*
|--------------------------------------------------------------------------
| EDITAR USUARIO
|--------------------------------------------------------------------------
*/

async function editarUsuario(id) {

    const usuario =
        await usuariosService.getById(id);


    if (!usuario)
        return;


    showFormModal({

        title:
            "Editar Usuario",


        content:
            obtenerFormularioUsuario(
                usuario
            ),


        submitText:
            "Guardar cambios",


        size:
            "large",


        onSubmit:
            () =>
                actualizarUsuario(
                    id
                )

    });

}


/*
|--------------------------------------------------------------------------
| ACTUALIZAR USUARIO
|--------------------------------------------------------------------------
*/

async function actualizarUsuario(id) {

    const empresa_id =
        document
            .getElementById("empresa_id")
            ?.value;


    const nombre =
        document
            .getElementById("nombre")
            ?.value
            ?.trim();


    const apellido =
        document
            .getElementById("apellido")
            ?.value
            ?.trim();


    const email =
        document
            .getElementById("email")
            ?.value
            ?.trim()
            ?.toLowerCase();


    const rut =
        document
            .getElementById("rut")
            ?.value
            ?.trim();


    const telefono =
        document
            .getElementById("telefono")
            ?.value
            ?.trim();


    const cargo =
        document
            .getElementById("cargo")
            ?.value
            ?.trim();


    const nivel =
        document
            .getElementById("nivel")
            ?.value;


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


        await usuariosService.update(

            id,

            {

                empresa_id:
                    Number(empresa_id),

                nombre,

                apellido,

                email,

                rut:
                    rut || null,

                telefono:
                    telefono || null,

                cargo:
                    cargo || null,

                nivel:
                    nivel || "USUARIO",

                updated_at:
                    new Date().toISOString()

            }

        );


        await cargarDatos();


        setModalLoading(false);


        return true;

    }

    catch (error) {

        console.error(error);


        setModalLoading(false);


        setModalError(
            error?.message ||
            "No fue posible actualizar el usuario."
        );


        return false;

    }

}


/*
|--------------------------------------------------------------------------
| CAMBIAR ESTADO
|--------------------------------------------------------------------------
*/

async function cambiarEstadoUsuario(id) {

    const usuario =
        await usuariosService.getById(id);


    if (!usuario)
        return;


    const nuevoEstado =
        usuario.estado === "ACTIVO"
            ? "INACTIVO"
            : "ACTIVO";


    const accion =
        nuevoEstado === "ACTIVO"
            ? "Activar"
            : "Desactivar";


    showConfirmModal({

        title:
            `${accion} usuario`,


        message: `

            El usuario

            <strong>
                ${usuario.nombre}
                ${usuario.apellido ?? ""}
            </strong>

            será marcado como

            <strong>
                ${nuevoEstado}
            </strong>.

        `,


        onConfirm:
            async () => {

                try {

                    await usuariosService
                        .cambiarEstado(
                            id,
                            nuevoEstado
                        );


                    await cargarDatos();


                    return true;

                }

                catch (error) {

                    console.error(error);

                    return false;

                }

            }

    });

}


/*
|--------------------------------------------------------------------------
| FORMATEAR FECHA
|--------------------------------------------------------------------------
*/

function formatearFecha(fecha) {

    try {

        return new Intl.DateTimeFormat(
            "es-CL",
            {

                dateStyle:
                    "short",

                timeStyle:
                    "short"

            }
        ).format(
            new Date(fecha)
        );

    }

    catch {

        return "—";

    }

}
