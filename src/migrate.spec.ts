import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MigrationManager, type Migration } from './migrate'

describe('MigrationManager', () => {
	let mockDatabase: {
		exec: ReturnType<typeof vi.fn>
		queries: string[]
		params: any[][]
	}
	let manager: MigrationManager

	beforeEach(() => {
		mockDatabase = {
			exec: vi.fn(),
			queries: [],
			params: []
		}

		mockDatabase.exec.mockImplementation(async (query: string, params: any[] = []) => {
			mockDatabase.queries.push(query)
			mockDatabase.params.push(params)
			return []
		})

		manager = new MigrationManager(mockDatabase)
	})

	it('should create migrations table on initialization', async () => {
		const migrations: Migration[] = []
		await manager.migrate(migrations)

		expect(mockDatabase.queries[0]).toContain('CREATE TABLE IF NOT EXISTS migrations')
	})

	it('should execute new migrations in transaction', async () => {
		const migrations: Migration[] = [
			{ name: 'test1', script: 'CREATE TABLE test1 (id INT);' },
			{ name: 'test2', script: 'CREATE TABLE test2 (id INT);' }
		]

		await manager.migrate(migrations)

		expect(mockDatabase.queries).toContain('BEGIN TRANSACTION')
		expect(mockDatabase.queries).toContain(migrations[0].script)
		expect(mockDatabase.queries).toContain(migrations[1].script)
		expect(mockDatabase.queries).toContain('COMMIT')
	})

	it('should skip already executed migrations', async () => {
		const migrations: Migration[] = [
			{ name: 'test1', script: 'CREATE TABLE test1 (id INT);' }
		]

		mockDatabase.exec.mockImplementationOnce(async () => [])  // init
			.mockImplementationOnce(async () => [])  // begin transaction
			.mockImplementationOnce(async () => [{   // select hash
				hash: 'e82b033649c9156192bd92b6fa3b011c8f57a68dca51e0aa28bef349c7614ab7'
			}])

		await manager.migrate(migrations)

		expect(mockDatabase.queries).not.toContain(migrations[0].script)
	})

	it('should throw error on modified migrations', async () => {
		const migrations: Migration[] = [
			{ name: 'test1', script: 'CREATE TABLE test1 (id INT);' }
		]

		mockDatabase.exec.mockImplementationOnce(async () => [])  // init
			.mockImplementationOnce(async () => [])  // begin transaction
			.mockImplementationOnce(async () => [{   // select hash
				hash: 'different-hash'
			}])

		await expect(manager.migrate(migrations)).rejects.toThrow('has been modified')
	})

	it('should rollback transaction on error', async () => {
		const migrations: Migration[] = [
			{ name: 'test1', script: 'INVALID SQL' }
		]

		mockDatabase.exec.mockImplementationOnce(async () => [])  // init
			.mockImplementationOnce(async () => [])  // begin transaction
			.mockImplementationOnce(async () => [])  // select hash
			.mockImplementationOnce(async () => { throw new Error('SQL Error') })

		await expect(manager.migrate(migrations)).rejects.toThrow('SQL Error')
		expect(mockDatabase.queries).toContain('ROLLBACK')
	})
})
