import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  documents: router({
    list: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) return [];
      return db.getUserDocuments(ctx.user.id);
    }),
    get: publicProcedure.input(z.object({ id: z.number() }))
      .query(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return db.getDocumentById(input.id, ctx.user.id);
      }),
    create: publicProcedure.input(z.object({
      title: z.string(),
      content: z.string(),
      contentType: z.enum(["url", "pdf", "text"]),
      originalUrl: z.string().optional(),
      readingTime: z.number().optional(),
    }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return db.createDocument({
          ...input,
          userId: ctx.user.id,
        });
      }),
    update: publicProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      readingProgress: z.number().optional(),
      isRead: z.number().optional(),
    }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const { id, ...updates } = input;
        return db.updateDocument(id, ctx.user.id, updates);
      }),
    delete: publicProcedure.input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return db.deleteDocument(input.id, ctx.user.id);
      }),
  }),

  highlights: router({
    list: publicProcedure.input(z.object({ documentId: z.number() }))
      .query(({ input }) => db.getDocumentHighlights(input.documentId)),
    create: publicProcedure.input(z.object({
      documentId: z.number(),
      text: z.string(),
      color: z.enum(["yellow", "red", "green"]),
      startOffset: z.number(),
      endOffset: z.number(),
    }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return db.createHighlight({
          ...input,
          userId: ctx.user.id,
        });
      }),
    delete: publicProcedure.input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return db.deleteHighlight(input.id, ctx.user.id);
      }),
  }),

  notes: router({
    list: publicProcedure.input(z.object({ documentId: z.number() }))
      .query(({ input }) => db.getDocumentNotes(input.documentId)),
    create: publicProcedure.input(z.object({
      documentId: z.number(),
      content: z.string(),
      offset: z.number(),
    }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return db.createNote({
          ...input,
          userId: ctx.user.id,
        });
      }),
    update: publicProcedure.input(z.object({
      id: z.number(),
      content: z.string(),
    }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return db.updateNote(input.id, ctx.user.id, input.content);
      }),
    delete: publicProcedure.input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return db.deleteNote(input.id, ctx.user.id);
      }),
  }),

  tags: router({
    list: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) return [];
      return db.getUserTags(ctx.user.id);
    }),
    create: publicProcedure.input(z.object({
      name: z.string(),
      color: z.string().optional(),
    }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return db.createTag({
          ...input,
          userId: ctx.user.id,
          color: input.color || "#3b82f6",
        });
      }),
    delete: publicProcedure.input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return db.deleteTag(input.id, ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
