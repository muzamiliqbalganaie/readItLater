import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Documents table - stores articles, PDFs, and pasted text
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content").notNull(),
  originalUrl: varchar("originalUrl", { length: 2048 }),
  contentType: mysqlEnum("contentType", ["url", "pdf", "text"]).notNull(),
  readingTime: int("readingTime"), // in minutes
  isRead: int("isRead").default(0).notNull(),
  readingProgress: int("readingProgress").default(0).notNull(), // percentage 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Tags table - for organizing documents
 */
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).default("#3b82f6").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

/**
 * Document tags junction table
 */
export const documentTags = mysqlTable("documentTags", {
  documentId: int("documentId").notNull().references(() => documents.id),
  tagId: int("tagId").notNull().references(() => tags.id),
});

/**
 * Highlights table - for text highlights with colors
 */
export const highlights = mysqlTable("highlights", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull().references(() => documents.id),
  userId: int("userId").notNull().references(() => users.id),
  text: text("text").notNull(),
  color: mysqlEnum("color", ["yellow", "red", "green"]).notNull(),
  startOffset: int("startOffset").notNull(),
  endOffset: int("endOffset").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Highlight = typeof highlights.$inferSelect;
export type InsertHighlight = typeof highlights.$inferInsert;

/**
 * Notes table - for margin notes and annotations
 */
export const notes = mysqlTable("notes", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull().references(() => documents.id),
  userId: int("userId").notNull().references(() => users.id),
  content: text("content").notNull(),
  offset: int("offset").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;