interface IDatabase {
	exec: (query: string, params?: any[]) => Promise<any[]>;
}

export interface Migration {
	name: string;
	script: string;
}

export class MigrationManager {
	private readonly table_name = 'migrations';
	constructor(private database: IDatabase) { }

	async migrate(migrations: Migration[]) {
		await this.init();

		try {
			await this.database.exec('BEGIN TRANSACTION');
			for (const migration of migrations) {
				await this.migrateOne(migration);
			}
			await this.database.exec('COMMIT');
		} catch (error) {
			await this.database.exec('ROLLBACK');
			throw error;
		}
	}

	private async init() {
		await this.database.exec(`CREATE TABLE IF NOT EXISTS ${this.table_name} (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	hash TEXT NOT NULL,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_migrations_name ON ${this.table_name} (name);`);
	}

	private async migrateOne(migration: Migration) {
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

async function hash(input: string) {
	const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
