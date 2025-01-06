# @agnosticeng/migrate

A lightweight SQL migration manager for TypeScript/JavaScript applications.

## Installation

```bash
npm install @agnosticeng/migrate
```

## Usage

```typescript
import { MigrationManager } from '@agnosticeng/migrate';

const database = {
  // Your database implementation that satisfies IDatabase interface
  exec: async (query: string, params?: any[]) => { /* ... */ }
};

const migrations = [
  {
    name: '001-initial',
    script: 'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);'
  },
  // ... more migrations
];

const migrationManager = new MigrationManager(database);
await migrationManager.migrate(migrations);
```

## Features

- Transaction-based migrations
- Migration integrity verification using SHA-256 hashing
- Prevents modified migrations from being re-run
- TypeScript support
- Browser compatible

## API

### `MigrationManager`

```typescript
interface IDatabase {
  exec: (query: string, params?: any[]) => Promise<any[]>;
}

interface Migration {
  name: string;
  script: string;
}

class MigrationManager {
  constructor(database: IDatabase);
  migrate(migrations: Migration[]): Promise<void>;
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add some amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2024 Agnostic

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
