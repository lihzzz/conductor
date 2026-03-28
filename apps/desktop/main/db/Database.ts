import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export class AppDatabase {
  private readonly database: Database.Database;

  constructor(dbFilePath: string) {
    this.database = new Database(dbFilePath);
    this.database.pragma("journal_mode = WAL");
    this.applySchema();
  }

  get db(): Database.Database {
    return this.database;
  }

  close(): void {
    this.database.close();
  }

  private applySchema(): void {
    const candidates = [
      path.resolve(process.cwd(), "apps/desktop/main/db/schema.sql"),
      path.resolve(__dirname, "schema.sql"),
    ];
    const schemaPath = candidates.find((candidate) => fs.existsSync(candidate));
    if (!schemaPath) {
      throw new Error("schema.sql not found.");
    }
    const schema = fs.readFileSync(schemaPath, "utf-8");
    this.database.exec(schema);
  }
}
