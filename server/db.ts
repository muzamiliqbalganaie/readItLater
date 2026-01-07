import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  documents,
  InsertDocument,
  highlights,
  InsertHighlight,
  notes,
  InsertNote,
  tags,
  InsertTag,
  documentTags,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Document queries
 */
export async function getUserDocuments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.userId, userId));
}

export async function getDocumentById(documentId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDocument(doc: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documents).values(doc);
  return result;
}

export async function updateDocument(
  documentId: number,
  userId: number,
  updates: Partial<InsertDocument>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(documents)
    .set(updates)
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));
}

export async function deleteDocument(documentId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // First, verify the document belongs to the user
  const doc = await getDocumentById(documentId, userId);
  if (!doc) throw new Error("Document not found or access denied");

  // Delete related records first (to avoid foreign key constraint errors)
  // Delete highlights
  await db.delete(highlights).where(eq(highlights.documentId, documentId));

  // Delete notes
  await db.delete(notes).where(eq(notes.documentId, documentId));

  // Delete document tags
  await db.delete(documentTags).where(eq(documentTags.documentId, documentId));

  // Finally, delete the document
  return db
    .delete(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));
}

/**
 * Highlight queries
 */
export async function getDocumentHighlights(documentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(highlights)
    .where(eq(highlights.documentId, documentId));
}

export async function createHighlight(highlight: InsertHighlight) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(highlights).values(highlight);
}

export async function deleteHighlight(highlightId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .delete(highlights)
    .where(and(eq(highlights.id, highlightId), eq(highlights.userId, userId)));
}

/**
 * Note queries
 */
export async function getDocumentNotes(documentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notes).where(eq(notes.documentId, documentId));
}

export async function createNote(note: InsertNote) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(notes).values(note);
}

export async function updateNote(
  noteId: number,
  userId: number,
  content: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(notes)
    .set({ content })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}

export async function deleteNote(noteId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}

/**
 * Tag queries
 */
export async function getUserTags(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tags).where(eq(tags.userId, userId));
}

export async function createTag(tag: InsertTag) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(tags).values(tag);
}

export async function deleteTag(tagId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .delete(tags)
    .where(and(eq(tags.id, tagId), eq(tags.userId, userId)));
}
