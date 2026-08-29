/**
 * Componente Modal
 * Maneja la presentación de modales de confirmación
 * Refactorización de: portal/components/modal.js
 */

export class Modal {
    
    constructor() {
        this.overlay = document.getElementById("modalOverlay");
        this.modal = this.overlay?.querySelector(".modal");
        this.titleElement = document.getElementById("modalTitle");
        this.bodyElement = document.getElementById("modalBody");
        this.confirmBtn = document.getElementById("modalConfirm");
        this.cancelBtn = document.getElementById("modalCancel");
        this.onConfirmCallback = null;
        this.setupEventListeners();
    }
    
    /**
     * Configura los event listeners del modal
     */
    setupEventListeners() {
        if (this.confirmBtn) {
            this.confirmBtn.addEventListener("click", () => this.confirm());
        }
        
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener("click", () => this.close());
        }
        
        if (this.overlay) {
            this.overlay.addEventListener("click", (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });
        }
    }
    
    /**
     * Muestra el modal con un título, mensaje y callback
     * @param {Object} config - Configuración del modal
     * @param {string} config.title - Título del modal
     * @param {string} config.message - Mensaje del modal
     * @param {Function} config.onConfirm - Callback al confirmar
     */
    show(config) {
        if (!config || typeof config !== "object") {
            console.error("Configuración del modal inválida");
            return;
        }
        
        const { title = "Confirmación", message = "", onConfirm } = config;
        
        this.onConfirmCallback = onConfirm;
        
        this.updateContent(title, message);
        this.open();
    }
    
    /**
     * Actualiza el contenido del modal
     * @param {string} title - Título
     * @param {string} message - Mensaje
     */
    updateContent(title, message) {
        if (this.titleElement) {
            this.titleElement.textContent = title;
        }
        
        if (this.bodyElement) {
            this.bodyElement.innerHTML = `<p>${message}</p>`;
        }
    }
    
    /**
     * Abre el modal
     */
    open() {
        if (this.overlay) {
            this.overlay.style.display = "flex";
        }
    }
    
    /**
     * Cierra el modal
     */
    close() {
        if (this.overlay) {
            this.overlay.style.display = "none";
        }
        
        if (this.bodyElement) {
            this.bodyElement.innerHTML = "";
        }
        
        if (this.confirmBtn) {
            this.confirmBtn.disabled = false;
            this.confirmBtn.textContent = "Confirmar";
        }
        
        this.onConfirmCallback = null;
    }
    
    /**
     * Confirma la acción del modal
     */
    async confirm() {
        if (this.onConfirmCallback) {
            try {
                const result = await this.onConfirmCallback();
                if (result !== false) {
                    this.close();
                }
            } catch (error) {
                console.error("Error al ejecutar callback del modal:", error);
            }
        } else {
            this.close();
        }
    }
    
    /**
     * Habilita/deshabilita el estado de carga
     * Extraído de: portal/components/modal.js (lineas 297-334)
     * @param {boolean} loading - Estado de carga
     * @param {string} text - Texto mientras carga
     */
    setLoading(loading = true, text = "Guardando...") {
        if (!this.confirmBtn) return;
        
        this.confirmBtn.disabled = loading;
        
        if (loading) {
            this.confirmBtn.dataset.originalText = this.confirmBtn.textContent;
            this.confirmBtn.textContent = text;
        } else {
            this.confirmBtn.textContent = this.confirmBtn.dataset.originalText || "Confirmar";
        }
    }
    
    /**
     * Muestra/oculta un error en el modal
     * Extraído de: portal/components/modal.js (lineas 338-354)
     * @param {string} message - Mensaje de error
     */
    setError(message = "") {
        let errorBox = document.getElementById("modalFormError");
        
        if (!errorBox) return;
        
        errorBox.textContent = message;
        errorBox.style.display = message ? "block" : "none";
    }
}

export const modal = new Modal();

/**
 * Función helper para mostrar modal de confirmación
 * Compatibilidad con código existente
 * @param {Object} config - Configuración del modal
 */
export function showConfirmModal(config) {
    modal.show(config);
}

/**
 * Función helper para mostrar modal de resultado
 * Extraído de: portal/components/modal.js (lineas 145-214)
 * @param {Object} config - Configuración del modal
 */
export function showResultModal(config) {
    const {
        title = "Confirmación",
        message = "",
        primaryText = "Continuar",
        onPrimary = null
    } = config;
    
    if (modal.titleElement) {
        modal.titleElement.textContent = title;
    }
    
    if (modal.bodyElement) {
        modal.bodyElement.innerHTML = `
            <div style="text-align:center; line-height:1.6;">
                ${message}
            </div>
        `;
    }
    
    if (modal.confirmBtn) {
        modal.confirmBtn.textContent = primaryText;
    }
    
    modal.onConfirmCallback = onPrimary;
    modal.open();
}

/**
 * Función helper para mostrar modal con formulario
 * Extraído de: portal/components/modal.js (lineas 219-293)
 * @param {Object} config - Configuración del modal
 */
export function showFormModal(config) {
    const {
        title = "Confirmación",
        content = "",
        onSubmit = null,
        submitText = "Guardar",
        size = "normal"
    } = config;
    
    // Remueve clase 'large' si existe
    if (modal.modal) {
        modal.modal.classList.remove("large");
        if (size === "large") {
            modal.modal.classList.add("large");
        }
    }
    
    if (modal.titleElement) {
        modal.titleElement.textContent = title;
    }
    
    if (modal.bodyElement) {
        modal.bodyElement.innerHTML = content;
    }
    
    if (modal.confirmBtn) {
        modal.confirmBtn.textContent = submitText;
    }
    
    modal.setError("");
    modal.onConfirmCallback = onSubmit;
    modal.open();
}
