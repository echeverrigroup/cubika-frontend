import {

    ordenarDatos,

    inicializarTableSort,

    getSortClass

}

from "../utils/tableSort.js";

import {
    renderCargosTab
}
from "./construction_cargos.js";

import { geograficaService }
from "../services/geograficaService.js";

import { workersService }
from "../services/workersService.js";

import { empresasService }
from "../services/empresasService.js";

import {

    showConfirmModal,
    showFormModal,
    setModalLoading,
    setModalError

}
from "../components/modal.js";



export async function renderConstructionTrabajadores() {

    
const testGlobal = await workersService.getTiposDocumento();
console.log("TIPOS DOCUMENTO:", testGlobal);


    const content =
        document.querySelector(".content");


    content.innerHTML = `

        <div class="page-header">

            <h1>Trabajadores</h1>

      


                <button id="btnNuevoTrabajador">

                    + Nuevo Trabajador

                </button>

              </div>


        <div class="cubika-tabs">

            <button
                type="button"
                class="cubika-tab active"
                data-tab="trabajadores">

                Trabajadores

            </button>


            <button
                type="button"
                class="cubika-tab"
                data-tab="cargos">

                Cargos

            </button>

        </div>


        <div
            id="trabajadoresTab"
            class="cubika-tab-content">


            <div class="table-filters">

                <input
                    id="buscarTrabajador"
                    class="cubika-input"
                    type="text"
                    placeholder="Buscar trabajador...">

            </div>


            <div id="trabajadoresTable">

                Cargando...

            </div>

        </div>


        <div
            id="cargosTab"
            class="cubika-tab-content"
            style="display:none;">

        </div>

    `;


    // ========================================================
    // ELEMENTOS
    // ========================================================

    const tabs =
        content.querySelectorAll(".cubika-tab");


    const trabajadoresTab =
        content.querySelector("#trabajadoresTab");


    const cargosTab =
        content.querySelector("#cargosTab");


    // ========================================================
    // CARGAR TRABAJADORES
    // ========================================================

    await cargarTrabajadores();


    const btnNuevo =
        content.querySelector("#btnNuevoTrabajador");


    if (btnNuevo) {

        btnNuevo.addEventListener(
            "click",
            mostrarFormularioNuevoTrabajador
        );

    }


    const buscar =
        content.querySelector("#buscarTrabajador");


    if (buscar) {

        buscar.addEventListener(
            "keyup",
            cargarTrabajadores
        );

    }


    // ========================================================
    // CAMBIO DE PESTAÑAS
    // ========================================================

    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            async () => {

                const tabSeleccionada =
                    tab.dataset.tab;


                tabs.forEach(t =>
                    t.classList.remove("active")
                );


                tab.classList.add("active");


                if (
                    tabSeleccionada ===
                    "trabajadores"
                ) {

                    trabajadoresTab.style.display =
                        "block";

                    cargosTab.style.display =
                        "none";

                    return;

                }


                if (
                    tabSeleccionada ===
                    "cargos"
                ) {

                    trabajadoresTab.style.display =
                        "none";

                    cargosTab.style.display =
                        "block";


                    if (
                        !cargosTab.dataset.loaded
                    ) {

                        await renderCargosTab(
                            cargosTab
                        );

                        cargosTab.dataset.loaded =
                            "true";

                    }

                }

            }
        );

    });

}


async function cargarTrabajadores() {


    const tableContainer =
        document.getElementById("trabajadoresTable");

    const filtro =
        document
            .getElementById("buscarTrabajador")
            ?.value
            .trim()
            .toUpperCase();

    let trabajadores =
        await workersService.getAll();


    if (filtro) {

        trabajadores =
            trabajadores.filter(t =>

                `${t.rut}

                 ${t.nombres}
                
                 ${t.apellido_paterno}
                
                 ${t.apellido_materno ?? ""}
                
                 ${t.nacionalidad ?? ""}
                
                 ${t.comuna?.nombre ?? ""}
                
                 ${t.afp ?? ""}
                
                 ${t.salud ?? ""}
                
                 ${t.banco ?? ""}`
                
                    .toUpperCase()
                    .includes(filtro)

            );

    }


    trabajadores =
    ordenarDatos(
        trabajadores
    );


    let html = `

        <div class="table-responsive">

        <table class="cubika-table">

            <thead>

                <tr>
            
                    <th

                        class="sortable ${getSortClass("rut")}"
                    
                        data-column="rut">
                    
                        RUT
                    
                    </th>
            
                    <th

                        class="
                            sortable
                            ${getSortClass("nombres")}
                        "
                    
                        data-column="nombres">
                    
                        Nombre
                    
                    </th>
            
                    <th

                        class="
                            sortable
                            ${getSortClass("nacionalidad")}
                        "
                    
                        data-column="nacionalidad">
                    
                        Nacionalidad
                    
                    </th>
            
                    <th

                        class="
                            sortable
                            ${getSortClass(
                                "comuna.nombre"
                            )}
                        "
                    
                        data-column="comuna.nombre">
                    
                        Comuna
                    
                    </th>
            
                    <th

                        class="
                            sortable
                            ${getSortClass("afp")}
                        "
                    
                        data-column="afp">
                    
                        AFP
                    
                    </th>
            
            
                    <th

                        class="
                            sortable
                            ${getSortClass("salud")}
                        "
                    
                        data-column="salud">
                    
                        Salud
                    
                    </th>
            
            
                    <th

                        class="
                            sortable
                            ${getSortClass("banco")}
                        "
                    
                        data-column="banco">
                    
                        Banco
                    
                    </th>
            
            
                    <th

                        class="
                            sortable
                            ${getSortClass("estado")}
                        "
                    
                        data-column="estado">
                    
                        Estado
                    
                    </th>
            
            
                    <th>Acciones</th>
            
                </tr>
            
            </thead>

            <tbody>

    `;


    if (!trabajadores.length) {

        html += `

            <tr>

                <td
                    colspan="9"
                    style="text-align:center;padding:30px;">

                    No existen trabajadores registrados.

                </td>

            </tr>

        `;

    }


    trabajadores.forEach(trabajador => {

        html += `

           <tr>

                <td>
            
                    ${trabajador.rut ?? ""}
            
                </td>
            
                <td>
            
                    ${trabajador.nombres}
                    ${trabajador.apellido_paterno}
                    ${trabajador.apellido_materno ?? ""}
            
                </td>
            
                <td>
            
                    ${trabajador.nacionalidad ?? ""}
            
                </td>
            
                <td>
            
                    ${trabajador.comuna?.nombre ?? ""}
            
                </td>
            
                <td>
            
                    ${trabajador.afp ?? ""}
            
                </td>
            
                <td>
            
                    ${trabajador.salud ?? ""}
            
                </td>
            
                <td>
            
                    ${trabajador.banco ?? ""}
            
                </td>

                <td>
                
                    <span class="
                        estado-badge
                        ${trabajador.estado === "Activo"
                            ? "activo"
                            : "inactivo"}">

                        ${trabajador.estado}

                    </span>

                </td>

                <td>

                    <button
                        class="btn-edit"
                        data-id="${trabajador.id}">

                        Editar

                    </button>

                    <button
                        class="${trabajador.estado === "Activo"
                            ? "btn-danger"
                            : "btn-primary"} btn-toggle-estado"
                        data-id="${trabajador.id}">

                        ${trabajador.estado === "Activo"
                            ? "Historial"
                            : "Activar"}

                    </button>

                </td>

            </tr>

        `;

    });


    html += `

            </tbody>

        </table>

     </div>

    `;


    tableContainer.innerHTML =
        html;

    inicializarTableSort(
    cargarTrabajadores
    );


    document
        .querySelectorAll(".btn-edit")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => editarTrabajador(btn.dataset.id)
            );

        });


    document
        .querySelectorAll(".btn-toggle-estado")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => cambiarEstadoTrabajador(btn.dataset.id)
            );

        });

}


async function cargarRegiones(regionSeleccionada = null) {

    const regiones =
        await geograficaService.getRegiones();

    const select =
        document.getElementById("region_id");

    if (!select)
        return;

    select.innerHTML = `

        <option value="">
            Seleccione una región
        </option>

    `;

    regiones.forEach(region => {

        select.innerHTML += `

            <option
                value="${region.id}"
                ${region.id == regionSeleccionada
                    ? "selected"
                    : ""}>

                ${region.nombre}

            </option>

        `;

    });

}



async function cargarComunas(
    regionId,
    comunaSeleccionada = null
) {

    const select =
        document.getElementById("comuna_id");

    if (!select)
        return;


    select.innerHTML = `

        <option value="">
            Seleccione una comuna
        </option>

    `;


    if (!regionId)
        return;


    const comunas =
        await geograficaService
            .getComunas(regionId);


    comunas.forEach(comuna => {

        select.innerHTML += `

            <option
                value="${comuna.id}"
                ${comuna.id == comunaSeleccionada
                    ? "selected"
                    : ""}>

                ${comuna.nombre}

            </option>

        `;

    });

}



async function mostrarFormularioNuevoTrabajador() {

    showFormModal({

        title: "Nuevo Trabajador",

        content:
            await obtenerFormularioTrabajador(),

        submitText: "Guardar",

        size: "large",

        onSubmit:
            crearTrabajador

    });


    await cargarRegiones();


    document

        .getElementById("region_id")

        .addEventListener(

            "change",

            async e => {

                await cargarComunas(
                    e.target.value
                );

            }

        );

}


async function obtenerFormularioTrabajador(trabajador = null) {

    const tiposDocumento =
        await workersService.getTiposDocumento();

    const estadosCiviles =
        await workersService.getEstadosCiviles();

    const bancos =
        await workersService.getBancos();

    const tiposCuenta =
        await workersService.getTiposCuenta();

    return `

<form id="formTrabajador">

    <div class="form-grid-4">

        <div class="form-group">

            <label>Tipo de documento</label>
        
            <select
                id="tipo_documento_id"
                class="cubika-select"
                required>
        
                <option value="">
                    Seleccione
                </option>
        
                ${tiposDocumento.map(tipo => `
                    <option
                        value="${tipo.id}"
                        ${trabajador?.tipo_documento_id === tipo.id
                            ? "selected"
                            : ""}>
                        ${tipo.nombre}
                    </option>
                `).join("")}
        
            </select>
        
        </div>
        
        
        <div class="form-group">
        
            <label>Número de documento</label>
        
            <input
                id="rut"
                class="cubika-input"
                type="text"
                value="${trabajador?.rut ?? ""}"
                required>
        
        </div>


        <div class="form-group">

            <label>Nombres</label>

            <input
                id="nombres"
                class="cubika-input"
                type="text"
                value="${trabajador?.nombres ?? ""}"
                required>

        </div>


        <div class="form-group">

            <label>Apellido Paterno</label>

            <input
                id="apellido_paterno"
                class="cubika-input"
                type="text"
                value="${trabajador?.apellido_paterno ?? ""}"
                required>

        </div>


        <div class="form-group">

            <label>Apellido Materno</label>

            <input
                id="apellido_materno"
                class="cubika-input"
                type="text"
                value="${trabajador?.apellido_materno ?? ""}">

        </div>


        <div class="form-group">

            <label>Fecha Nacimiento</label>

            <input
                id="fecha_nacimiento"
                class="cubika-input"
                type="date"
                value="${trabajador?.fecha_nacimiento ?? ""}">

        </div>
        

        <div class="form-group">
        
            <label>Email</label>
        
            <input
                id="email"
                type="email"
                value="${trabajador?.email ?? ""}">
        
        </div>

    </div>


    <div class="form-grid-4">

        <div class="form-group">

            <label>Nacionalidad</label>

            <input
                id="nacionalidad"
                class="cubika-input"
                type="text"
                value="${trabajador?.nacionalidad ?? "Chilena"}">

        </div>



        <div class="form-group">

        <label>Sexo</label>

        <select id="sexo"
            class="cubika-select">
        
            <option value="">
                Seleccione
            </option>
        
            <option
                value="Masculino"
                ${trabajador?.sexo==="Masculino"
                    ?"selected":""
                }>
        
                Masculino
        
            </option>
        
            <option
                value="Femenino"
                ${trabajador?.sexo==="Femenino"
                    ?"selected":""
                }>
        
                Femenino
        
            </option>
        
        </select>

        </div>


        <div class="form-group">

                <label>Estado Civil</label>
            
                <select
                    id="estado_civil_id"
                    class="cubika-select"
                    required>
            
                    <option value="">
                        Seleccione
                    </option>
            
                    ${estadosCiviles.map(estado => `
                        <option
                            value="${estado.id}"
                            ${trabajador?.estado_civil_id === estado.id
                                ? "selected"
                                : ""}>
                            ${estado.nombre}
                        </option>
                    `).join("")}
            
                </select>
            
            </div>


        <div
            class="form-group">

            <label>Dirección</label>

            <input
                id="direccion"
                class="cubika-input"
                type="text"
                value="${trabajador?.direccion ?? ""}">

        </div>
        


        <div class="form-group">

            <label>Región</label>

            <select
                id="region_id"
                class="cubika-select">

                <option value="">
                    Seleccione una región
                </option>

            </select>

        </div>


        <div class="form-group">

            <label>Comuna</label>

            <select
                id="comuna_id"
                class="cubika-select">

                <option value="">
                    Seleccione una comuna
                </option>

            </select>

        </div>


        <div class="form-group">

            <label>AFP</label>

            <input
                id="afp"
                class="cubika-input"
                type="text"
                value="${trabajador?.afp ?? ""}">

        </div>


        <div class="form-group">

            <label>Salud</label>

            <input
                id="salud"
                class="cubika-input"
                type="text"
                value="${trabajador?.salud ?? ""}">

        </div>


        <div class="form-group">
            <label>Banco</label>
            <select id="banco_id" class="cubika-select" required>
                <option value="">Seleccione</option>
        
                ${bancos.map(banco => `
                    <option value="${banco.id}"
                        ${trabajador?.banco_id === banco.id ? "selected" : ""}>
                        ${banco.nombre}
                    </option>
                `).join("")}
            </select>
        </div>


        <div class="form-group">
            <label>Tipo de Cuenta</label>
            <select id="tipo_cuenta_id" class="cubika-select" required>
                <option value="">Seleccione</option>
        
                ${tiposCuenta.map(tipo => `
                    <option value="${tipo.id}"
                        ${trabajador?.tipo_cuenta_id === tipo.id ? "selected" : ""}>
                        ${tipo.nombre}
                    </option>
                `).join("")}
            </select>
        </div>


        <div
            class="form-group">

            <label>Número Cuenta</label>

            <input
                id="numero_cuenta"
                class="cubika-input"
                type="text"
                value="${trabajador?.numero_cuenta ?? ""}">

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



async function crearTrabajador() {

    const rut =
    document
        .getElementById("rut")
        .value
        .trim();
    

    const tipo_documento_id =
    document
        .getElementById("tipo_documento_id")
        .value || null;
    

    const nombres =
        document
            .getElementById("nombres")
            .value
            .trim();
    
    const apellido_paterno =
        document
            .getElementById("apellido_paterno")
            .value
            .trim();
    
    const apellido_materno =
        document
            .getElementById("apellido_materno")
            .value
            .trim();
    
    const direccion =
        document
            .getElementById("direccion")
            .value
            .trim();

    const sexo =
        document
            .getElementById("sexo")
            .value;
    
    
    const estado_civil_id =
    document
        .getElementById("estado_civil_id")
        .value || null;
    
    
    const email =
        document
            .getElementById("email")
            .value
            .trim();
        
        
    const region_id =
        document
            .getElementById("region_id")
            .value || null;
    
    const comuna_id =
        document
            .getElementById("comuna_id")
            .value || null;
    
    const fecha_nacimiento =
        document
            .getElementById("fecha_nacimiento")
            .value || null;
    
    const nacionalidad =
        document
            .getElementById("nacionalidad")
            .value
            .trim();
    
    const afp =
        document
            .getElementById("afp")
            .value
            .trim();
    
    const salud =
        document
            .getElementById("salud")
            .value
            .trim();
    
    const banco_id =
        document
            .getElementById("banco_id").value || null;
    
    const tipo_cuenta_id =
        document
            .getElementById("tipo_cuenta_id").value || null;
    
    const numero_cuenta =
        document
            .getElementById("numero_cuenta")
            .value
            .trim();


    // =========================
    // VALIDACIONES
    // =========================

    if (!nombres) {

        setModalError(
            "Debe ingresar los nombres del trabajador."
        );

        return false;

    }

    if (!apellido_paterno) {

        setModalError(
            "Debe ingresar el apellido paterno."
        );

        return false;

    }

    if (!rut) {

        setModalError(
            "Debe ingresar el RUT."
        );

        return false;

    }

    if (!tipo_documento_id) {

        setModalError(
            "Debe seleccionar el tipo de documento."
        );
    
        return false;
    
    }


    if (!estado_civil_id) {

        setModalError(
            "Debe seleccionar el estado civil."
        );
    
        return false;
    
    }

    if (!banco_id) {
        setModalError("Debe seleccionar el banco.");
        return false;
    }

    if (!tipo_cuenta_id) {
        setModalError("Debe seleccionar el tipo de cuenta.");
        return false;
    }
    

    try {

        setModalLoading(true);

       await workersService.create({

            rut,
            tipo_documento_id,
        
            nombres,
            apellido_paterno,
            apellido_materno,
            direccion,
            sexo,
            email,
            estado_civil_id,
            region_id,
            comuna_id,
            fecha_nacimiento,
        
            afp,
            salud,

            banco_id,
            tipo_cuenta_id,
            numero_cuenta,
        
            estado: "Activo"
        
        });

        await cargarTrabajadores();

        setModalLoading(false);

        return true;

    }

    catch (error) {

        console.error(error);

        setModalLoading(false);

        setModalError(
            "No fue posible guardar el trabajador."
        );

        return false;

    }

}


async function editarTrabajador(id) {

    const trabajador =
        await workersService.getById(id);

    if (!trabajador)
        return;

    showFormModal({

        title: "Editar Trabajador",

        content:

        
        
            
        await obtenerFormularioTrabajador(trabajador),


        submitText: "Actualizar",

        size: "large",

        onSubmit: () =>
            actualizarTrabajador(id)

    });

    await cargarRegiones(
        trabajador.region_id
        );
        
        
    await cargarComunas(
    
        trabajador.region_id,
    
        trabajador.comuna_id
    
    );
    
    
    document
    
        .getElementById("region_id")
    
        .addEventListener(
    
            "change",
    
            async e => {
    
                await cargarComunas(
                    e.target.value
                );
    
            }
    
        );

}


async function actualizarTrabajador(id) {

    const nombres =
        document
            .getElementById("nombres")
            .value
            .trim();

    const apellido_paterno =
        document
            .getElementById("apellido_paterno")
            .value
            .trim();

    const apellido_materno =
        document
            .getElementById("apellido_materno")
            .value
            .trim();

    const rut =
        document
            .getElementById("rut")
            .value
            .trim();

    const tipo_documento_id =
    document
        .getElementById("tipo_documento_id")
        .value || null;
    

    const direccion =
    document
        .getElementById("direccion")
        .value
        .trim();

    const sexo =
        document
            .getElementById("sexo")
            .value;
    
    const estado_civil_id =
        document
            .getElementById("estado_civil_id")
            .value || null;
    
    const email =
        document
            .getElementById("email")
            .value
            .trim();


    const region_id =
        document
            .getElementById("region_id")
            .value || null;
    
    
    const comuna_id =
        document
            .getElementById("comuna_id")
            .value || null;
    
    
    const fecha_nacimiento =
        document
            .getElementById("fecha_nacimiento")
            .value || null;
    
    
    const nacionalidad =
        document
            .getElementById("nacionalidad")
            .value
            .trim();
    
    
    const afp =
        document
            .getElementById("afp")
            .value
            .trim();
    
    
    const salud =
        document
            .getElementById("salud")
            .value
            .trim();
    
    
    const banco_id =
        document
            .getElementById("banco_id").value || null;
    
    
    const tipo_cuenta_id =
        document
            .getElementById("tipo_cuenta_id").value || null;
    
    
    const numero_cuenta =
        document
            .getElementById("numero_cuenta")
            .value
            .trim();


    // =========================
    // VALIDACIONES
    // =========================

    if (!nombres) {

        setModalError(
            "Debe ingresar los nombres del trabajador."
        );

        return false;

    }

    if (!apellido_paterno) {

        setModalError(
            "Debe ingresar el apellido paterno."
        );

        return false;

    }

    if (!rut) {

        setModalError(
            "Debe ingresar el RUT."
        );

        return false;

    }


    if (!tipo_documento_id) {

        setModalError(
            "Debe seleccionar el tipo de documento."
        );
    
        return false;
    
    }


    try {

        setModalLoading(true);

        await workersService.update(id, {

                rut,
                tipo_documento_id,
            
                nombres,
                apellido_paterno,
                apellido_materno,
                direccion,
            
                sexo,
                email,

                estado_civil_id,
            
                region_id,
                comuna_id,
                fecha_nacimiento,
            
                afp,
                salud,

                banco_id,
                tipo_cuenta_id,
                numero_cuenta,
            
                updated_at:
                    new Date()
                        .toISOString()
            
            });

        
        await cargarTrabajadores();

        setModalLoading(false);

        return true;

    }

    catch (error) {

        console.error(error);

        setModalLoading(false);

        setModalError(
            "No fue posible actualizar el trabajador."
        );

        return false;

    }

}


async function cambiarEstadoTrabajador(id) {

    const trabajador =
        await workerservice.getById(id);

    if (!trabajador)
        return;

    const nuevoEstado =
        trabajador.estado === "Activo"
            ? "Inactivo"
            : "Activo";

    showConfirmModal({

        title:
            nuevoEstado === "Activo"
                ? "Activar trabajador"
                : "Desactivar trabajador",

        message: `

            El trabajador

            <strong>

                ${trabajador.nombres}
                ${trabajador.apellido_paterno}

            </strong>

            será
            <strong>

                ${nuevoEstado.toLowerCase()}

            </strong>.

        `,

        onConfirm: async () => {

            try {

                await workersService.update(id, {

                    estado: nuevoEstado,

                    updated_at:
                        new Date().toISOString()

                });

                await cargarTrabajadores();

            }

            catch (error) {

                console.error(error);

                return false;

            }

        }

    });

}
