import { pgTable, text, timestamp, boolean, uuid, pgEnum } from 'drizzle-orm/pg-core';

export const eventTypeEnum = pgEnum('event_type', ['work', 'personal']);

// Public Profiles table (mirrors Supabase Auth Users)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // This will match Supabase user.id
  fullName: text('full_name'),
  email: text('email').notNull(),
  avatarUrl: text('avatar_url'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  time: text('time'),
  category: text('category').default('Quick'),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  time: text('time').notNull(),
  date: text('date').notNull(),
  type: eventTypeEnum('type').default('work').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  content: text('content'),
  date: text('date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  size: text('size'),
  date: text('date'),
  url: text('url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
