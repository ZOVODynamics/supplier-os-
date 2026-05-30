import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { CollectionName, DatabaseSchema, EntityForCollection } from "./types";

type StoredEntity = { id: string; createdAt: string; updatedAt: string };
type InsertInput<T extends StoredEntity> = Omit<T, "id" | "createdAt" | "updatedAt">;
type UpdateInput<T extends StoredEntity> = Partial<Omit<T, "id" | "createdAt" | "updatedAt">>;

const seedPath = path.join(process.cwd(), "data", "db.json");
const writablePath = process.env.VERCEL ? path.join("/tmp", "zovo-db.json") : seedPath;

const emptyDatabase: DatabaseSchema = {
  users: [],
  suppliers: [],
  projects: [],
  bids: []
};

class JsonDb {
  private writeQueue: Promise<void> = Promise.resolve();

  public async read(): Promise<DatabaseSchema> {
    await this.ensureWritableDatabase();
    const raw = await fs.readFile(writablePath, "utf8");
    return this.normalize(JSON.parse(raw) as Partial<DatabaseSchema>);
  }

  public async write(data: DatabaseSchema): Promise<void> {
    const normalized = this.normalize(data);
    const serialized = `${JSON.stringify(normalized, null, 2)}\n`;

    this.writeQueue = this.writeQueue.then(async () => {
      await fs.mkdir(path.dirname(writablePath), { recursive: true });
      await fs.writeFile(writablePath, serialized, "utf8");
    });

    return this.writeQueue;
  }

  public async insert<K extends CollectionName>(
    collection: K,
    input: InsertInput<EntityForCollection<K>>
  ): Promise<EntityForCollection<K>> {
    const database = await this.read();
    const now = new Date().toISOString();
    const record = {
      ...input,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now
    } as EntityForCollection<K>;
    const records = database[collection] as EntityForCollection<K>[];

    records.push(record);
    database[collection] = records as DatabaseSchema[K];
    await this.write(database);

    return record;
  }

  public async find<K extends CollectionName>(
    collection: K,
    predicate?: (entity: EntityForCollection<K>) => boolean
  ): Promise<EntityForCollection<K>[]> {
    const database = await this.read();
    const records = database[collection] as EntityForCollection<K>[];
    return predicate ? records.filter(predicate) : records;
  }

  public async update<K extends CollectionName>(
    collection: K,
    id: string,
    updates: UpdateInput<EntityForCollection<K>>
  ): Promise<EntityForCollection<K> | undefined> {
    const database = await this.read();
    const records = database[collection] as EntityForCollection<K>[];
    const index = records.findIndex((record) => record.id === id);

    if (index === -1) {
      return undefined;
    }

    const updated = {
      ...records[index],
      ...updates,
      id: records[index].id,
      createdAt: records[index].createdAt,
      updatedAt: new Date().toISOString()
    } as EntityForCollection<K>;

    records[index] = updated;
    database[collection] = records as DatabaseSchema[K];
    await this.write(database);

    return updated;
  }

  private async ensureWritableDatabase(): Promise<void> {
    try {
      await fs.access(writablePath);
    } catch {
      const seed = await this.readSeed();
      await fs.mkdir(path.dirname(writablePath), { recursive: true });
      await fs.writeFile(writablePath, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
    }
  }

  private async readSeed(): Promise<DatabaseSchema> {
    try {
      const raw = await fs.readFile(seedPath, "utf8");
      return this.normalize(JSON.parse(raw) as Partial<DatabaseSchema>);
    } catch {
      return emptyDatabase;
    }
  }

  private normalize(data: Partial<DatabaseSchema>): DatabaseSchema {
    return {
      users: Array.isArray(data.users) ? data.users : [],
      suppliers: Array.isArray(data.suppliers) ? data.suppliers : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      bids: Array.isArray(data.bids) ? data.bids : []
    };
  }
}

export const db = new JsonDb();
