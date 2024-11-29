import { boolean, doublePrecision, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createId} from "@paralleldrive/cuid2"
import { float } from "drizzle-orm/mysql-core";
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const villageTileTable = pgTable("village_tile", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  color: varchar({ length: 255 }).notNull(),
  height: doublePrecision().notNull(),
  isBuilding: boolean().notNull(),
  x: doublePrecision().notNull(),
  y: doublePrecision().notNull(),
  z: doublePrecision().notNull(),
  q: doublePrecision().notNull(),
  r: doublePrecision().notNull(),
  s: doublePrecision().notNull(),
  resources: doublePrecision().notNull(),
  lastHarvested: integer().notNull(),
  buildingRotation: doublePrecision(),
  type: varchar({ length: 255 }).notNull(),
})