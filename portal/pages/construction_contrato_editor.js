import {
    constructorasService
}
from "../services/constructorasService.js";


import {
    estadosContratoService
}
from "../services/estadosContratoService.js";

import {
    documentNumberService
}
from "../services/documentNumberService.js";


import {
    contratosGeneradosService
}
from "../services/contratosGeneradosService.js";


import {

    construirVariables,
    reemplazarVariables,
    validarPlantilla,
    obtenerVariablesPlantilla

}
from "../modules/construccion/documentEngine.js";

import {
    workersService
}
from "../services/workersService.js";

import {
    empresasService
}
from "../services/empresasService.js";

import {
    mostrarFormularioNuevaEmpresa
}
from "./construction_empresas.js";

import {
    mostrarFormularioNuevaObra
} from "./construction_obras.js";

import {
    mostrarFormularioNuevoTrabajador
} from "./construction_trabajadores.js";

import {
    mostrarFormularioNuevoCargo
} from "./construction_cargos.js";

import {
    obrasService
}
from "../services/obrasService.js";

import {
    cargosService
}
from "../services/cargosService.js";

import {
    plantillasDocumentoService
}
from "../services/plantillasDocumentoService.js";

import {
    tiposContratoService
}
from "../services/tiposContratoService.js";

import {
    globalService
}
from "../services/globalService.js";


import {
    showFormModal,
    showConfirmModal,
    showResultModal,
    setModalLoading,
    setModalError
} from "../components/modal.js";


import { storageService } from "../js/services/storageService.js";


import {
    navigate
}

    
from "../router.js";


let pasoActual = 1;


let contratoActual = {

    worker_id: null,

    empresa_id: null,

    constructora_id: null,

    obra_id: null,

    cargo_id: null,

    plantilla_id: null,

    fecha_inicio: null,

    fecha_termino: null,

    sueldo: null,

    jornada_id: null,

    tipo_contrato_id:null,

    causal_termino:"",
    
    distribucion_horaria:"",
    
    observaciones:"",

    contenido: ""

    

};


export function nuevoContrato() {

    pasoActual = 1;

    contratoActual = {

        worker_id: null,

        empresa_id: null,

        constructora_id: null,

        obra_id: null,

        cargo_id: null,

        plantilla_id: null,

        fecha_inicio: null,

        fecha_termino: null,

        sueldo: null,

        jornada_id: null,

        tipo_contrato_id:null,
        
        causal_termino:"",
        
        distribucion_horaria:"",
        
        observaciones:"",

        contenido: ""

    };

}


export async function renderConstructionContratoEditor() {

    const content =
        document.querySelector(
            ".content"
        );


    content.innerHTML = `

        <div class="page-header">

            <div>

                <button
                    id="btnVolverContratos"
                    class="btn-secondary">

                    ← Volver

                </button>

            </div>


            <div class="editor-header">

                <p>

                    Complete la información
                    requerida para generar
                    un <strong>Nuevo Contrato</strong>.

                </p>

            </div>


            <div>

                <button
                    id="verPlantillas"
                    class="btn-secondary">

                    Ver Plantillas

                </button>

            </div>

        </div>



        <div class="editor-documento">


            <div class="wizard-steps">

                <div
                    class="
                        wizard-step
                        ${pasoActual === 1
                            ? "active"
                            : ""}
                    ">

                    1

                    <span>

                        Información Base

                    </span>

                </div>


                <div
                    class="
                        wizard-step
                        ${pasoActual === 2
                            ? "active"
                            : ""}
                    ">

                    2

                    <span>

                        Datos Contractuales

                    </span>

                </div>


                <div
                    class="
                        wizard-step
                        ${pasoActual === 3
                            ? "active"
                            : ""}
                    ">

                    3

                    <span>

                        Vista Previa

                    </span>

                </div>

            </div>



            <div id="contratoWizard">

            </div>


        </div>

    `;


    renderPasoActual();


    document

        .getElementById(
            "btnVolverContratos"
        )

        .addEventListener(

            "click",

            () => navigate(
                "construction_contratos"
            )

        );

    document
    
        .getElementById(
            "verPlantillas"
        )
        ?.addEventListener(
            "click",
            () => {
    
                window.open(
                    "./index.html?page=construction_plantillas",
                    "cubikaPlantillas",
                    "width=1200,height=800,resizable=yes,scrollbars=yes"
                );
    
            }
        );

}


function renderPasoActual() {

    const container =
        document.getElementById(
            "contratoWizard"
        );


    switch (pasoActual) {

        case 1:

            container.innerHTML =
                renderPaso1();

            break;


        case 2:

            container.innerHTML =
                renderPaso2();

            break;


        case 3:

            container.innerHTML =
                renderPaso3();

            break;

    }


     cargarDatosPaso();
    
    inicializarNavegacion();
   

}


function renderPaso1() {

    return ` 

        <div class="editor-section">

            <div class="form-grid-3">

                <div class="form-group">

                    <label>
                        Empresa Mandante
                    </label>

                    <select
                        id="empresa_id"
                        class="cubika-select">

                        <option value="">
                            Seleccione
                        </option>

                        <option value="__crear_nuevo__">
                            ＋ Crear nuevo mandante
                        </option>

                    </select>

                </div>


                <div class="form-group">
                
                    <label>
                        Empresa Constructora
                    </label>
                
                    <select
                        id="constructora_id"
                        class="cubika-select">
                
                        <option value="">
                            Seleccione
                        </option>

                        <option value="__crear_nuevo__">
                            ＋ Crear nueva constructora
                        </option>
                
                    </select>
                
                </div>


                <div class="form-group">

                    <label>
                        Obra
                    </label>

                    <select
                        id="obra_id"
                        class="cubika-select">

                        <option value="">
                            Seleccione
                        </option>

                        <option value="__crear_nuevo__">
                            ＋ Crear nueva obra
                        </option>

                    </select>

                </div>



                <div class="form-group">

                    <label>
                        Trabajador
                    </label>

                    <select
                        id="worker_id"
                        class="cubika-select">

                        <option value="">
                            Seleccione
                        </option>

                        <option value="__crear_nuevo__">
                            ＋ Crear nuevo trabajador
                        </option>

                    </select>

                </div>



                <div class="form-group">

                    <label>
                        Cargo
                    </label>

                    <select
                        id="cargo_id"
                        class="cubika-select">

                        <option value="">
                            Seleccione
                        </option>

                    </select>

                </div>

            </div>


            <div class="wizard-buttons">

                <button
                    id="btnSiguiente"
                    class="btn-primary">

                    Siguiente →

                </button>

            </div>

        </div>

    `;

}


function renderPaso2() {

    return `

        <div class="editor-section">

            <div class="form-grid-3">

                <div class="form-group">

                    <label>
                        Fecha Inicio
                    </label>
                
                    <input
                        id="fecha_inicio"
                        type="date"
                        class="cubika-input">
                
                </div>
                
                
                <div class="form-group">
                
                    <label>
                        Tipo Contrato
                    </label>
                
                    <select
                        id="tipo_contrato_id"
                        class="cubika-select">
                
                        <option value="">
                            Seleccione
                        </option>
                
                    </select>
                
                </div>
                
                
                <div class="form-group">
                
                    <label>
                        Información de Término
                    </label>
                
                    <div
                        id="campoDinamicoContrato">
                
                    </div>
                
                </div>


               <div class="form-group">

                    <div
                        style="
                            height: 17px;
                            display: flex;
                            align-items: center;
                            gap: 5px;
                        "
                    >
                
                        <label
                            style="
                                margin: 0;
                                line-height: 1;
                            "
                        >
                            Sueldo
                        </label>
                
                        <label
                            style="
                                display: flex;
                                align-items: center;
                                gap: 3px;
                                margin: 0;
                                font-weight: normal;
                                cursor: pointer;
                                
                            "
                        >
                
                            <input
                                id="sueldoMinimoLegal"
                                type="checkbox"
                                style="
                                    margin: 0;
                                "
                            >
                
                            Mínimo legal vigente
                
                        </label>
                
                    </div>
                
                    <input
                        id="sueldo"
                        class="cubika-input"
                    >
                
                </div>
                
                
                <div class="form-group">

                    <label>
                        Jornada
                    </label>
                
                    <select
                        id="jornada_id"
                        class="cubika-select">
                
                        <option value="">
                            Seleccione
                        </option>
                
                    </select>
                
                </div>
                
                
                

                <div class="form-group">

                    <label>
                        Plantilla de Contrato
                    </label>
                
                    <select
                        id="plantilla_id"
                        class="cubika-select">
                
                    </select>
                
                </div>


                <div class="form-group"
                    style="grid-column: span 2;">

                <label>
                    Distribución Horaria
                </label>
            
                <div
                    id="distribucionesHorarias">
            
                </div>
            
                <button
                    type="button"
                    id="btnAgregarDistribucion"
                    class="btn-secondary"
                    ">
            
                    + Agregar distribución
            
                </button>
            
            </div>
                
                
                <div
                    class="form-group"
                    style="display:none;"
                
                    <label>
                        Observaciones
                    </label>
                
                    <input
                        id="observaciones"
                        class="cubika-input">
                
                </div>
                
                </div>

            </div>


            <div class="wizard-buttons">

                <button
                    id="btnAnterior"
                    class="btn-secondary">

                    ← Anterior

                </button>


                <button
                    id="btnSiguiente"
                    class="btn-primary">

                    Siguiente →

                </button>

            </div>

        </div>

    `;

}


function renderPaso3() {

    return `

        <div class="editor-section">

            <div
                id="previewContrato"
                class="document-preview">

                <p>

                    La vista previa del contrato
                    aparecerá aquí.

                </p>

            </div>


            <div class="wizard-buttons">

                <button
                    id="btnAnterior"
                    class="btn-secondary">

                    ← Anterior

                </button>


                <button
                    id="btnGenerarContrato"
                    class="btn-cubika-green">

                    Aprobar y Generar

                </button>
                
            </div>

        </div>

    `;

}


function inicializarNavegacion() {

    document

        .getElementById(
            "btnAnterior"
        )

        ?.addEventListener(

            "click",

            () => {

                guardarPasoActual();

                pasoActual--;

                renderConstructionContratoEditor();

            }

        );


    document

        .getElementById(
            "btnSiguiente"
        )

        ?.addEventListener(

            "click",

            () => {

                guardarPasoActual();

                pasoActual++;

                renderConstructionContratoEditor();

            }

        );


    document
    .getElementById(
        "btnGenerarContrato"
    )
    ?.addEventListener(

        "click",

        aprobarYGenerarContrato

    );

    

}


function guardarPasoActual() {

    if (pasoActual === 1) {

        contratoActual.worker_id =

            document
                .getElementById(
                    "worker_id"
                )
                ?.value;


        contratoActual.empresa_id =

            document
                .getElementById(
                    "empresa_id"
                )
                ?.value;

        contratoActual.constructora_id =

            document
                .getElementById(
                    "constructora_id"
                )
                ?.value;


        contratoActual.obra_id =

            document
                .getElementById(
                    "obra_id"
                )
                ?.value;


        contratoActual.cargo_id =

            document
                .getElementById(
                    "cargo_id"
                )
                ?.value;

    }


    if (pasoActual === 2) {

        contratoActual.fecha_inicio =

            document
                .getElementById(
                    "fecha_inicio"
                )
                ?.value;

        contratoActual.tipo_contrato_id =
            document.getElementById(
                "tipo_contrato_id"
            ).value;
        
        
        const filasDistribucion =
            document.querySelectorAll(
                "#distribucionesHorarias .distribucion-horaria-row"
            );
        
        
        contratoActual.distribucion_horaria =
            Array.from(filasDistribucion)
                .map(fila => {
        
                    const input =
                        fila.querySelector(
                            ".distribucion-input"
                        );
        
                    const checkbox =
                        fila.querySelector(
                            ".distribucion-checkbox"
                        );
        
                    return {
        
                        texto:
                            input?.value?.trim()
                            ?? "",
        
                        colacion:
                            checkbox?.checked
                            ?? false
        
                    };
        
                })
                .filter(
                    distribucion =>
                        distribucion.texto !== ""
                );
        
        
        contratoActual
            .observaciones =
        
        document
            .getElementById(
                "observaciones"
            )
            ?.value;
        
        
        contratoActual
            .causal_termino =
        
        document
            .getElementById(
                "causal_termino"
            )
            ?.value;
        


        contratoActual.fecha_termino =

            document
                .getElementById(
                    "fecha_termino"
                )
                ?.value;


        contratoActual.sueldo =

            document
                .getElementById(
                    "sueldo"
                )
                ?.value;


        contratoActual.jornada_id =
        document
            .getElementById("jornada_id")
            .value || null;


        contratoActual.plantilla_id =

            document
                .getElementById(
                    "plantilla_id"
                )
                ?.value;

    }
    

}


async function cargarDatosPaso() {

    switch (pasoActual) {

        case 1:

            await cargarPaso1();

            break;

        case 2:

            await cargarPaso2();

            break;

        case 3:
            await cargarPaso3();
            break;

    }

}


async function cargarPaso1() {

    const trabajadores =
        await workersService.getAll();

    const empresas =
        await empresasService.getAll();

    const constructoras =
        await constructorasService.getAll();

    const cargos =
        await cargosService.getAll();


    cargarSelect(
        "worker_id",
        trabajadores,
        t =>
            `${t.nombres}
             ${t.apellido_paterno}
             ${t.apellido_materno ?? ""}`,
        contratoActual.worker_id,
    );

    const selectTrabajador =
            document.getElementById(
                "worker_id"
            );
        
        if (selectTrabajador) {
        
            selectTrabajador.innerHTML += `
                <option value="__crear_trabajador__">
                    ＋ Crear nuevo trabajador
                </option>
            `;
        
            selectTrabajador.onchange =
                async e => {
        
                    if (
                        e.target.value ===
                        "__crear_trabajador__"
                    ) {
        
                        await mostrarFormularioNuevoTrabajador(
        
                            async nuevoTrabajador => {
        
                                if (!nuevoTrabajador)
                                    return;
        
                                contratoActual.worker_id =
                                    nuevoTrabajador.id;
        
                                const trabajadoresActualizados =
                                    await workersService.getAll();
        
                                cargarSelect(
                                    "worker_id",
                                    trabajadoresActualizados,
        
                                    trabajador =>
                                        `${trabajador.nombres}
                                         ${trabajador.apellido_paterno}
                                         ${trabajador.apellido_materno ?? ""}`,
        
                                    nuevoTrabajador.id
                                );
        
                                const select =
                                    document.getElementById(
                                        "worker_id"
                                    );
        
                                if (select) {
        
                                    select.innerHTML += `
                                        <option value="__crear_trabajador__">
                                            ＋ Crear nuevo trabajador
                                        </option>
                                    `;
        
                                }
        
                            },
        
                            true
        
                        );
        
                        return;
                    }
        
                    contratoActual.worker_id =
                        e.target.value;
        
                };
        
        }

    cargarSelect(
        "empresa_id",
        empresas,
        e => e.nombre,
        contratoActual.empresa_id
    );


    const selectEmpresa =
        document.getElementById(
            "empresa_id"
        );
    
    if (selectEmpresa) {
    
        selectEmpresa.onchange =
            async e => {
    
                if (
                    e.target.value !==
                    "__crear_nuevo__"
                ) {
    
                    contratoActual.empresa_id =
                        e.target.value;
    
                    return;
    
                }
    
    
                await mostrarFormularioNuevaEmpresa(
                
                    async nuevaEmpresa => {
                
                        if (!nuevaEmpresa)
                            return;
                
                
                        contratoActual.empresa_id =
                            nuevaEmpresa.id;
          
                        const empresasActualizadas =
                            await empresasService.getAll();
                
                
                        cargarSelect(
                            "empresa_id",
                            empresasActualizadas,
                            empresa =>
                                empresa.nombre,
                            nuevaEmpresa.id
                        );
                
                    },
                
                    true
                
                );
                                
            };
    
    }


    cargarSelect(
        "constructora_id",
        constructoras,
        c => c.nombre,
        contratoActual.constructora_id
    );


    cargarSelect(
        "cargo_id",
        cargos,
        c => c.nombre,
        contratoActual.cargo_id
       
    );

    const selectCargo =
        document.getElementById(
            "cargo_id"
        );
    
    if (selectCargo) {
    
        selectCargo.innerHTML += `
            <option value="__crear_cargo__">
                ＋ Crear nuevo cargo
            </option>
        `;
    
        selectCargo.onchange =
            async e => {
    
                if (
                    e.target.value ===
                    "__crear_cargo__"
                ) {
    
                    await mostrarFormularioNuevoCargo(
                        null,
    
                        async nuevoCargo => {
    
                            if (!nuevoCargo)
                                return;
    
                            contratoActual.cargo_id =
                                nuevoCargo.id;
    
                            const cargosActualizados =
                                await cargosService.getAll();
    
                            cargarSelect(
                                "cargo_id",
                                cargosActualizados,
                                cargo =>
                                    cargo.nombre,
                                nuevoCargo.id
                            );
    
                            const select =
                                document.getElementById(
                                    "cargo_id"
                                );
    
                            if (select) {
    
                                select.innerHTML += `
                                    <option value="__crear_cargo__">
                                        ＋ Crear nuevo cargo
                                    </option>
                                `;
    
                            }
    
                        },
    
                        true
                    );
    
                    return;
                }
    
                contratoActual.cargo_id =
                    e.target.value;
    
            };
    
    }

    await cargarObrasPorConstructora(
        contratoActual.constructora_id,
        contratoActual.obra_id
    );


    const selectConstructora =
        document.getElementById(
            "constructora_id"
        );
    
    if (selectConstructora) {
    
        selectConstructora.innerHTML += `
    
            <option value="__crear_constructora__">
    
                ＋ Crear nueva constructora
    
            </option>
    
        `;
    
    
        selectConstructora.onchange =
            async e => {
        
                if (
                    e.target.value ===
                    "__crear_constructora__"
                ) {
        
                    await mostrarFormularioNuevaEmpresa(
                        async nuevaConstructora => {
        
                            if (!nuevaConstructora)
                                return;
        
                            contratoActual.constructora_id =
                                nuevaConstructora.id;
        
                            const constructorasActualizadas =
                                await constructorasService.getAll();
        
                            cargarSelect(
                                "constructora_id",
                                constructorasActualizadas,
                                constructora =>
                                    constructora.nombre,
                                nuevaConstructora.id
                            );
        
                            const select =
                                document.getElementById(
                                    "constructora_id"
                                );
        
                            if (select) {
        
                                select.innerHTML += `
        
                                    <option value="__crear_constructora__">
        
                                        ＋ Crear nueva constructora
        
                                    </option>
        
                                `;
        
                            }
        
                            contratoActual.obra_id =
                                null;
        
                            await cargarObrasPorConstructora(
                                nuevaConstructora.id
                            );
        
                        },
                        true,
                        "constructora"
                    );
        
                    return;
                }
        
        
                contratoActual.constructora_id =
                    e.target.value;
        
                contratoActual.obra_id =
                    null;
        
                await cargarObrasPorConstructora(
                    e.target.value
                );
        
            };
    
    }


    const selectObra =
        document.getElementById(
            "obra_id"
        );
    
    if (selectObra) {
    
        selectObra.onchange =
            async e => {
    
                if (
                    e.target.value ===
                    "__crear_obra__"
                ) {
    
                    const constructoraId =
                        contratoActual.constructora_id;
    
                    if (!constructoraId) {
    
                        e.target.value = "";
    
                        return;
    
                    }
    
    
                    await mostrarFormularioNuevaObra(

                        async nuevaObra => {
                    
                            if (!nuevaObra)
                                return;
                    
                            contratoActual.obra_id =
                                nuevaObra.id;
                    
                            await cargarObrasPorConstructora(
                                constructoraId,
                                nuevaObra.id
                            );
                    
                        },
                    
                        constructoraId
                    
                    );
    
                    return;
    
                }
    
    
                contratoActual.obra_id =
                    e.target.value;
    
            };
    
    }
    
}



async function cargarPaso2() {


    const tiposContrato =
        await tiposContratoService
            .getAll();
    

    const plantillas =
        await plantillasDocumentoService
            .getAll();

    const tiposJornada =
        await globalService
            .getTiposJornada();

    cargarSelect(

        "tipo_contrato_id",
    
        tiposContrato,
    
        t => t.nombre,
    
        contratoActual
            .tipo_contrato_id
    
    );

    cargarSelect(

        "jornada_id",
    
        tiposJornada,
    
        j => j.nombre,
    
        contratoActual.jornada_id
    
    );
    

     document
        .getElementById(
            "tipo_contrato_id"
        )
        ?.addEventListener("change", actualizarCampoContrato);

    
    actualizarCampoContrato(); 
  


    cargarSelect(

        "plantilla_id",

        plantillas,

        p => p.nombre,

        contratoActual.plantilla_id

    );


    document
        .getElementById(
            "fecha_inicio"
        )
        .value =

        contratoActual.fecha_inicio
        ?? "";


    const fechaTermino =
        
            document.getElementById(
                "fecha_termino"
            );
        
        if (fechaTermino) {
        
            fechaTermino.value =
        
                contratoActual
                    .fecha_termino
                ?? "";
        
        }


    const causalTermino =

        document.getElementById(
            "causal_termino"
        );
    
    if (causalTermino) {
    
        causalTermino.value =
    
            contratoActual.causal_termino
            ?? "";
    
    }

    document
    .getElementById(
        "sueldo"
    )
    .value =

    contratoActual.sueldo
    ?? "";
    
    const checkboxSueldoMinimo =
        document.getElementById(
            "sueldoMinimoLegal"
        );
    
    const inputSueldo =
        document.getElementById(
            "sueldo"
        );
    
    
    checkboxSueldoMinimo
        ?.addEventListener(
            "change",
            async () => {
    
                if (
                    !checkboxSueldoMinimo.checked
                ) {
                    return;
                }
    
    
                try {
    
                    const parametro =
                        await globalService
                            .getParametroVigente(
                                "INGRESO_MINIMO_MENSUAL"
                            );
    
    
                    inputSueldo.value =
                        parametro.valor;
    
    
                    contratoActual.sueldo =
                        parametro.valor;
    
    
                }
                catch (error) {
    
                    console.error(
                        "Error obteniendo ingreso mínimo vigente:",
                        error
                    );
    
    
                    checkboxSueldoMinimo.checked =
                        false;
    
                }
    
            }
        );

    inputSueldo
    ?.addEventListener(
        "input",
        () => {

            checkboxSueldoMinimo.checked =
                false;

        }
    );



   const contenedorDistribuciones =
        document.getElementById(
            "distribucionesHorarias"
        );
    
    if (contenedorDistribuciones) {
    
        contenedorDistribuciones.innerHTML = "";
    
    
        if (
            Array.isArray(
                contratoActual
                    .distribucion_horaria
            )
            &&
            contratoActual
                .distribucion_horaria
                .length > 0
        ) {
    
            contratoActual
                .distribucion_horaria
                .forEach(
                    distribucion => {
    
                        agregarDistribucionHoraria(
    
                            distribucion.texto
                                ?? "",
    
                            distribucion.colacion
                                ?? false
    
                        );
    
                    }
                );
    
        }
        else {
    
            agregarDistribucionHoraria();
    
        }
    
    }


    document
    .getElementById(
        "btnAgregarDistribucion"
    )
    ?.addEventListener(
        "click",
        () => {

            agregarDistribucionHoraria();

        }
    );

    
    document
        .getElementById(
            "observaciones"
        )
        .value =
        contratoActual
            .observaciones
        ?? "";


}


function cargarSelect(

    id,

    items,

    getLabel,

    selected = null

) {

    const select =
        document.getElementById(id);

    if (!select)
        return;


    select.innerHTML = `

        <option value="">

            Seleccione

        </option>

    `;


    items.forEach(item => {

        select.innerHTML += `

            <option

                value="${item.id}"

                ${item.id == selected
                    ? "selected"
                    : ""}>

                ${getLabel(item)}

            </option>

        `;

    });


    /*
     * Opción especial:
     * Crear nuevo registro
     */

    if (id === "empresa_id") {

        select.innerHTML += `

            <option value="__crear_nuevo__">

                ＋ Crear nuevo mandante

            </option>

        `;

    }

}


function actualizarCampoContrato() {

    const selectTipoContrato =
        document.getElementById(
            "tipo_contrato_id"
        );

    if (!selectTipoContrato) {
        return;
    }

    const tipo =
        selectTipoContrato
            .selectedOptions[0]
            ?.textContent
            ?.trim();
    

    const box =
        document
            .getElementById(
                "campoDinamicoContrato"
            );
    

    if (!box)
        return;


    if (
        tipo === "Término Indefinido"
    ) {

        box.innerHTML = `
            <label class="cubika-label"
                     style="font-weight: normal;"
                     "align-items: center;">

                Sin fecha de Término

            </label>
        `;

        return;

    }



    if (
        tipo === "Plazo Fijo"
    ) {

        box.innerHTML = `
            <input
                id="fecha_termino"
                type="date"
                class="cubika-input">
        `;

        return;

    }

    

     if (
        tipo === "Por Obra o Faena"
    ) {

    box.innerHTML =`
        <input
            id="causal_termino"
            class="cubika-input"
            placeholder="Ej: Término de la unidad 55-A">
    `;

         return;
}

}


async function cargarPaso3() {

    await generarVistaPrevia();

}


async function construirContrato() {

    const empresa =
        await empresasService.getById(
            contratoActual.empresa_id
        );

    const constructora =
        await constructorasService.getById(
            contratoActual.constructora_id
        );

    const trabajador =
        await workersService.getByIdForDocument(
            contratoActual.worker_id
        );

    const obra =
        await obrasService.getById(
            contratoActual.obra_id
        );

    const cargo =
        await cargosService.getById(
            contratoActual.cargo_id
        );

    const plantilla =
        await plantillasDocumentoService.getById(
            contratoActual.plantilla_id
        );

    const tipoJornada =
        await globalService.getTipoJornadaById(
            contratoActual.jornada_id
        );

    const variables =
    construirVariables({

        empresa,
        constructora,
        trabajador,
        obra,
        cargo,

        contrato: {
            ...contratoActual,
            jornada: tipoJornada?.nombre ?? ""
        }

    });

    
    const tipoContrato =
        await tiposContratoService.getById(
            contratoActual.tipo_contrato_id
        );

    variables.TIPO_CONTRATO =
        tipoContrato?.nombre ?? "";

    if (variables.TIPO_CONTRATO === "Término Indefinido") {

        variables.FECHA_TERMINO =
            "Sin fecha de término";

        variables.FECHA_TERMINO_TEXTO =
            "Sin fecha de término";

    }

    const contenidoHtml =
        reemplazarVariables(
            plantilla.contenido,
            variables
        );

    return {

        plantilla,

        variables,

        contenidoHtml

    };

}


let documentPrintCss = null;


async function obtenerDocumentPrintCss() {

    if (documentPrintCss) {
        return documentPrintCss;
    }

    const response =
        await fetch(
            "/portal/css/document-print.css"
        );

    if (!response.ok) {
        throw new Error(
            "No fue posible cargar document-print.css"
        );
    }

    documentPrintCss =
        await response.text();

    return documentPrintCss;
}


async function construirDocumentoHtml(
    contenido
) {

    const css =
        await obtenerDocumentPrintCss();

    return `
<!DOCTYPE html>

<html lang="es">

<head>

    <meta charset="UTF-8">

    <title>Documento Cubika</title>

    <style>

        ${css}

    </style>

</head>

<body>

    <main class="document-print">

        ${contenido}

    </main>

</body>

</html>
    `.trim();

}


async function generarVistaPrevia() {

    const contrato =
        await construirContrato();

    contratoActual.contenido =
        contrato.contenidoHtml;

    const preview =
        document.getElementById(
            "previewContrato"
        );

    if (!preview) {
        return;
    }

    const documentHtml =
        await construirDocumentoHtml(
            contrato.contenidoHtml
        );

    const parser =
        new DOMParser();

    const documento =
        parser.parseFromString(
            documentHtml,
            "text/html"
        );

    const estilos =
        documento.querySelector("style");

    const contenido =
        documento.querySelector(
            ".document-print"
        );

    preview.innerHTML = "";

    if (estilos) {

        const style =
            document.createElement("style");

        style.textContent =
            estilos.textContent;

        preview.appendChild(style);
    }

    if (contenido) {
        preview.appendChild(
            contenido.cloneNode(true)
        );
    }

}



async function aprobarYGenerarContrato() {

    console.log(
        "Aprobar y Generar"
    );

    const numeroContrato =
        await documentNumberService
            .generarNumeroDocumento(
                "CON"
            );

    const estadoGenerado =
        await estadosContratoService
            .getByCodigo(
                "GENERADO"
            );

    const contratoConstruido =
        await construirContrato();

    const contratoGuardar = {

        numero_contrato:
            numeroContrato,

        worker_id:
            contratoActual.worker_id,

        empresa_id:
            contratoActual.empresa_id,

        obra_id:
            contratoActual.obra_id,

        cargo_id:
            contratoActual.cargo_id,

        plantilla_id:
            contratoActual.plantilla_id,

        tipo_contrato_id:
            contratoActual.tipo_contrato_id,

        fecha_inicio:
            contratoActual.fecha_inicio,

        fecha_termino:
            contratoActual.fecha_termino,

        sueldo:
            contratoActual.sueldo,

        jornada_id:
            contratoActual.jornada_id,

        distribucion_horaria:
            contratoActual.distribucion_horaria,

        causal_termino:
            contratoActual.causal_termino,

        observaciones:
            contratoActual.observaciones,

        contenido_html:
            contratoConstruido.contenidoHtml,

        variables:
            contratoConstruido.variables,

        estado_id:
            estadoGenerado.id
    };


    try {

        const contratoGenerado =
            await contratosGeneradosService
                .create(
                    contratoGuardar
                );


        showResultModal({

            title:
                "Contrato generado correctamente",

            message: `

                <div
                    style="
                        font-size:15px;
                    "
                >

                    El contrato

                    <strong>
                        ${contratoGenerado.numero_contrato}
                    </strong>

                    fue generado y guardado
                    correctamente.

                </div>

            `,

            primaryText:
                "Obtener PDF",

            onPrimary: async () => {
            
                console.log(
                    "Obtener PDF:",
                    contratoGenerado.id
                );
            
                await mostrarModalSeleccionDocumentos(
                    contratoGenerado
                );
            
            }

        });

    }
    catch (error) {

        console.error(
            "Error al generar contrato:",
            error
        );

        alert(
            "No fue posible generar el contrato."
        );

    }

}


async function construirDocumentoComplementario(
    complemento,
    contratoGenerado
) {

    if (!complemento)
        throw new Error(
            "No se recibió la plantilla del complemento."
        );


    if (!contratoGenerado)
        throw new Error(
            "No se recibió el contrato generado."
        );


    const variablesSolicitadas =
        obtenerVariablesPlantilla(
            complemento.contenido
        );


    const variablesDisponibles =
        contratoGenerado.variables || {};


    const variablesFaltantes =
        variablesSolicitadas.filter(
            variable =>
                !Object.prototype.hasOwnProperty.call(
                    variablesDisponibles,
                    variable
                )
        );


    if (variablesFaltantes.length > 0) {

        throw new Error(
            `El complemento "${complemento.nombre}" utiliza variables que no están disponibles: ${variablesFaltantes.join(", ")}`
        );

    }


    const contenidoHtml =
        reemplazarVariables(
            complemento.contenido,
            variablesDisponibles
        );


    return {

        plantilla:
            complemento,

        variables:
            variablesDisponibles,

        contenidoHtml

    };

}



async function mostrarModalSeleccionDocumentos(
    contratoGenerado
) {

    let complementos;

    try {

        complementos =
            await plantillasDocumentoService
                .getComplementos();

    }
    catch (error) {

        console.error(
            "Error cargando complementos:",
            error
        );

        alert(
            "No fue posible cargar los documentos complementarios."
        );

        return;

    }


    const complementosHtml =
        complementos.length > 0

            ? complementos.map(
                complemento => `

                    <label
                        style="
                            display:flex;
                            align-items:flex-start;
                            gap:10px;
                            padding:12px;
                            border:1px solid #e5e7eb;
                            border-radius:8px;
                            cursor:pointer;
                            margin-bottom:8px;
                        "
                    >

                        <input
                            type="checkbox"
                            class="complemento-documento"
                            value="${complemento.id}"
                            style="margin-top:3px;"
                        >

                        <div>

                            <div
                                style="
                                    font-weight:600;
                                "
                            >
                                ${complemento.nombre}
                            </div>

                            ${
                                complemento.descripcion
                                    ? `
                                        <div
                                            style="
                                                font-size:13px;
                                                color:#6b7280;
                                                margin-top:3px;
                                            "
                                        >
                                            ${complemento.descripcion}
                                        </div>
                                    `
                                    : ""
                            }

                        </div>

                    </label>

                `
            ).join("")

            : `
                <div
                    style="
                        padding:16px;
                        text-align:center;
                        color:#6b7280;
                        font-size:14px;
                        border:1px dashed #d1d5db;
                        border-radius:8px;
                    "
                >
                    No hay documentos complementarios
                    disponibles.
                </div>
            `;


    showFormModal({

        title:
            "Documentos para descargar",

        content: `

            <div
                style="
                    font-size:14px;
                    line-height:1.5;
                "
            >

                <p
                    style="
                        margin-top:0;
                        margin-bottom:18px;
                    "
                >
                    Seleccione los documentos que desea
                    descargar junto con el contrato.
                </p>


                <div
                    style="
                        margin-bottom:18px;
                    "
                >

                    <div
                        style="
                            font-weight:600;
                            margin-bottom:8px;
                        "
                    >
                        Documento principal
                    </div>


                    <label
                        style="
                            display:flex;
                            align-items:center;
                            gap:10px;
                            padding:12px;
                            background:#f3f4f6;
                            border-radius:8px;
                            cursor:not-allowed;
                        "
                    >

                        <input
                            type="checkbox"
                            checked
                            disabled
                        >

                        <div>

                            <div
                                style="
                                    font-weight:600;
                                "
                            >
                                Contrato
                            </div>

                            <div
                                style="
                                    font-size:13px;
                                    color:#6b7280;
                                "
                            >
                                ${contratoGenerado.numero_contrato}
                            </div>

                        </div>

                    </label>

                </div>


                <div>

                    <div
                        style="
                            font-weight:600;
                            margin-bottom:8px;
                        "
                    >
                        Documentos complementarios
                    </div>

                    ${complementosHtml}

                </div>

            </div>

        `,

       submitText:
            "Continuar",
        
        onSubmit: async () => {

            const seleccionados =
                Array.from(
                    document.querySelectorAll(
                        ".complemento-documento:checked"
                    )
                ).map(
                    checkbox =>
                        checkbox.value
                );
        
        
            console.log(
                "Complementos seleccionados:",
                seleccionados
            );
        
        
            try {
        
                /*
                 * 1. Construir documento HTML
                 */
        
                const documentoHtml =
                    await construirDocumentoHtml(
                        contratoGenerado.contenido_html
                    );
        
        
                /*
                 * 2. Generar PDF
                 */
        
                const response =
                    await fetch(
                        "https://api.cubika.cl/api/pdf",
                        {
                            method: "POST",
        
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
        
                            body: JSON.stringify({
                                html:
                                    documentoHtml
                            })
                        }
                    );
        
        
                if (!response.ok) {
        
                    const errorText =
                        await response.text();
        
                    throw new Error(
                        `Error generando PDF (${response.status}): ${errorText}`
                    );
        
                }
        
        
                const pdfBlob =
                    await response.blob();
        
        
                /*
                 * 3. Guardar contrato en Storage
                 */
        
                const upload =
                    await storageService
                        .uploadContrato({
        
                            empresaId:
                                contratoGenerado.empresa_id,
        
                            workerId:
                                contratoGenerado.worker_id,
        
                            contratoId:
                                contratoGenerado.id,
        
                            pdfBlob
        
                        });
        
        
                console.log(
                    "PDF subido a Storage:",
                    upload.path
                );
        
        
                /*
                 * 4. Crear Signed URL
                 */
        
                const pdfUrl =
                    await storageService
                        .createSignedUrl(
                            upload.path
                        );
        
        
                /*
                 * 5. Guardar URL en contrato
                 */
        
                await contratosGeneradosService
                    .update(
                        contratoGenerado.id,
                        {
                            pdf_url:
                                pdfUrl
                        }
                    );
        
        
                console.log(
                    "pdf_url actualizado correctamente."
                );
        
        
                /*
                 * 6. Descargar contrato
                 */
        
                const downloadUrl =
                    URL.createObjectURL(
                        pdfBlob
                    );
        
        
                const link =
                    document.createElement(
                        "a"
                    );
        
        
                link.href =
                    downloadUrl;
        
        
                link.download =
                    `contrato-${contratoGenerado.numero_contrato}.pdf`;
        
        
                document.body.appendChild(
                    link
                );
        
        
                link.click();
        
        
                link.remove();
        
        
                URL.revokeObjectURL(
                    downloadUrl
                );
        
        
                console.log(
                    "Contrato descargado correctamente."
                );
        
        
                /*
                 * 7. Por ahora solamente dejamos
                 * registrada la selección.
                 */
        
                console.log(
                    "Complementos pendientes de generación:",
                    seleccionados
                );

                navigate("construction_contratos");
        
            }
            catch (error) {
        
                console.error(
                    "Error al obtener/guardar PDF:",
                    error
                );
        
                alert(
                    "El contrato fue creado, pero no fue posible generar o guardar el PDF."
                );
        
            }
        
        }
    });

}



async function cargarObrasPorConstructora(
    constructoraId,
    obraSeleccionada = null
) {

    const select =
        document.getElementById(
            "obra_id"
        );

    if (!select)
        return;


    select.innerHTML = `

        <option value="">
            Seleccione una obra
        </option>

    `;


    if (!constructoraId)
        return;


    const obras =
        await obrasService.getAll();


    const obrasFiltradas =
        obras.filter(
            obra =>
                obra.constructora_id ===
                constructoraId
        );


    obrasFiltradas.forEach(
        obra => {

            select.innerHTML += `

                <option
                    value="${obra.id}"
                    ${
                        obra.id === obraSeleccionada
                            ? "selected"
                            : ""
                    }
                >

                    ${obra.nombre}

                </option>

            `;

        }
    );

    select.innerHTML += `
        <option value="__crear_obra__">
            ＋ Crear nueva obra
        </option>
    `;

}


function agregarDistribucionHoraria(
    texto = "",
    colacion = false
) {

    const contenedor =
        document.getElementById(
            "distribucionesHorarias"
        );

    if (!contenedor)
        return;


    const id =
        `distribucion_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 7)}`;


    const fila =
        document.createElement("div");

    fila.className =
        "distribucion-horaria-row";


    fila.dataset.id = id;


    fila.innerHTML = `

        <input
            type="text"
            class="cubika-input distribucion-input"
            value="${texto}"
            placeholder="Ej: Lunes a Viernes - 08:00 a 18:00 Hrs"
        >


        <label
            class="distribucion-colacion">

            <input
                type="checkbox"
                class="distribucion-checkbox"
                ${colacion ? "checked" : ""}>

            + Hora de Colación

        </label>


        <button
            type="button"
            class="btn-secondary distribucion-eliminar">

            ×

        </button>

    `;


    contenedor.appendChild(
        fila
    );


    fila
        .querySelector(
            ".distribucion-eliminar"
        )
        .addEventListener(
            "click",
            () => {

                fila.remove();

            }
        );

}


