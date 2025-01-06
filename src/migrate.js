import MIGRATIONS_TABLE from './migrations_table.sql?raw';
export class MigrationManager {
    constructor(database) {
        Object.defineProperty(this, "database", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: database
        });
    }
    async migrate(migrations) {
        await this.init();
        try {
            await this.database.exec('BEGIN TRANSACTION');
            for (const migration of migrations) {
                await this.migrateOne(migration);
            }
            await this.database.exec('COMMIT');
        }
        catch (error) {
            await this.database.exec('ROLLBACK');
            throw error;
        }
    }
    async init() {
        await this.database.exec(MIGRATIONS_TABLE);
    }
    async migrateOne(migration) {
        const hashValue = await hash(migration.script);
        const [row] = await this.database.exec('SELECT hash FROM migrations WHERE name = ?', [
            migration.name
        ]);
        if (row && row.hash !== hashValue) {
            throw new Error(`Migration ${migration.name} has been modified`);
        }
        if (!row) {
            await this.database.exec(migration.script);
            await this.database.exec('INSERT INTO migrations (name, hash) VALUES (?, ?)', [
                migration.name,
                hashValue
            ]);
        }
    }
}
async function hash(input) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
