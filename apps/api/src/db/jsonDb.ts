import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { CollectionName, DatabaseSchema, EntityForCollection } from "../types/entities";

type EntityWithoutMetadata<T extends { id: string; createdAt: string; updatedAt: string }> = Omit<
  T,
  "id" | "createdAt" | "updatedAt"
>;

type EntityUpdates<T extends { id: string; createdAt: string; updatedAt: string }> = Partial<
  Omit<T, "id" | "createdAt" | "updatedAt">
>;

const defaultDatabase: DatabaseSchema = {
  users: [],
  suppliers: [],
  projects: [],
  bids: []
};

export class JsonDb {
  private readonly filePath: string;
  private writeQueue: Promise<void> = Promise.resolve();

  public constructor(filePath = path.resolve(__dirname, "../../db.json")) {
    this.filePath = filePath;
  }

  public async read(): Promise<DatabaseSchema> {
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      return this.normalize(JSON.parse(raw) as Partial<DatabaseSchema>);
    } catch (error) {
      if (this.isMissingFileError(error)) {
        await this.write(defaultDatabase);
        return { ...defaultDatabase };
      }

      throw error;
    }
  }

  public async write(data: DatabaseSchema): Promise<void> {
    const normalized = this.normalize(data);
    const serialized = `${JSON.stringify(normalized, null, 2)}\n`;

    this.writeQueue = this.writeQueue.then(async () => {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, serialized, "utf8");
    });

    return this.writeQueue;
  }

  public async insert<K extends CollectionName>(
    collection: K,
    entity: EntityWithoutMetadata<EntityForCollection<K>>
  ): Promise<EntityForCollection<K>> {
    const database = await this.read();
    const now = new Date().toISOString();
    const record = {
      ...entity,
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
    updates: EntityUpdates<EntityForCollection<K>>
  ): Promise<EntityForCollection<K> | undefined> {
    const database = await this.read();
    const records = database[collection] as EntityForCollection<K>[];
    const index = records.findIndex((entity) => entity.id === id);

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

  private normalize(data: Partial<DatabaseSchema>): DatabaseSchema {
    return {
      users: Array.isArray(data.users) ? data.users : [],
      suppliers: Array.isArray(data.suppliers) ? data.suppliers : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      bids: Array.isArray(data.bids) ? data.bids : []
    };
  }

  private isMissingFileError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: unknown }).code === "ENOENT"
    );
  }
}

export const db = new JsonDb();
