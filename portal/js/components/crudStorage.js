/**
 * =====================================================
 * Cubika CRUD Storage
 * Manejo genérico de LocalStorage
 * =====================================================
 */

export class CrudStorage {

    constructor(storageKey) {
        this.storageKey = storageKey;
    }

    // Obtener todos los registros
    getAll() {

        const data = localStorage.getItem(this.storageKey);

        if (!data)
            return [];

        try {
            return JSON.parse(data);
        }
        catch {

            return [];

        }

    }

    // Guardar todos los registros
    saveAll(records) {

        localStorage.setItem(
            this.storageKey,
            JSON.stringify(records)
        );

    }

    // Agregar registro
    insert(record) {

        const records = this.getAll();

        record.id ??= crypto.randomUUID();

        record.createdAt = new Date().toISOString();

        records.push(record);

        this.saveAll(records);

        return record;

    }

    // Buscar por ID
    getById(id) {

        return this
            .getAll()
            .find(r => r.id === id);

    }

    // Actualizar
    update(id, newData) {

        const records = this.getAll();

        const index =
            records.findIndex(r => r.id === id);

        if (index < 0)
            return false;

        records[index] = {

            ...records[index],

            ...newData,

            updatedAt: new Date().toISOString()

        };

        this.saveAll(records);

        return true;

    }

    // Eliminar
    delete(id) {

        const records =
            this
                .getAll()
                .filter(r => r.id !== id);

        this.saveAll(records);

    }

    // Vaciar
    clear() {

        localStorage.removeItem(this.storageKey);

    }

}
