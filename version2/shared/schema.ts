import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with cycle tracking info
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  dateOfBirth: date("date_of_birth"),
  averageCycleLength: integer("average_cycle_length").default(28),
  averagePeriodLength: integer("average_period_length").default(5),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cycle tracking - stores each menstrual cycle
export const cycles = pgTable("cycles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  cycleLength: integer("cycle_length"),
  periodLength: integer("period_length"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Symptoms logged by users
export const symptoms = pgTable("symptoms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  cycleId: varchar("cycle_id").references(() => cycles.id, { onDelete: 'cascade' }),
  date: date("date").notNull(),
  symptomType: varchar("symptom_type").notNull(), // cramps, bloating, headache, fatigue, mood_swing, etc.
  severity: integer("severity").default(1), // 1-5 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat history for AI agent memory
export const chatHistory = pgTable("chat_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  cyclePhase: varchar("cycle_phase"), // menstrual, follicular, ovulation, luteal
  createdAt: timestamp("created_at").defaultNow(),
});

// Recipes for healthy snacks
export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  ingredients: text("ingredients").array(),
  instructions: text("instructions"),
  prepTime: integer("prep_time"), // in minutes
  calories: integer("calories"),
  phase: varchar("phase"), // menstrual, follicular, ovulation, luteal, all
  tags: text("tags").array(), // vegan, gluten-free, high-iron, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Meditation videos
export const meditationVideos = pgTable("meditation_videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  youtubeId: varchar("youtube_id").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  channelName: varchar("channel_name"),
  duration: varchar("duration"),
  category: varchar("category"), // relaxation, sleep, stress-relief, breathing, yoga
  phase: varchar("phase"), // menstrual, follicular, ovulation, luteal, all
  createdAt: timestamp("created_at").defaultNow(),
});

// Educational content
export const educationalContent = pgTable("educational_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: varchar("category").notNull(), // pregnancy, pms, menopause, sexual-wellness
  readTime: integer("read_time"), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
});

// User favorites for recipes and videos
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemType: varchar("item_type").notNull(), // 'recipe' or 'video'
  itemId: varchar("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User onboarding profile - stores questionnaire answers
export const userOnboarding = pgTable("user_onboarding", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  
  // Q1: First day of last menstrual period
  lastPeriodDate: date("last_period_date"),
  
  // Q2: Typical cycle length
  typicalCycleLength: varchar("typical_cycle_length"), // '21-25', '26-30', '31-35', '36-40', '>40', 'irregular', 'unknown'
  
  // Q3: Period duration
  periodDuration: varchar("period_duration"), // '2-4', '5-7', '8+', 'irregular'
  
  // Q4: Cycle variability
  cycleVariability: varchar("cycle_variability"), // 'rarely', 'sometimes', 'often', 'always_irregular'
  
  // Q5: Health conditions (stored as JSON array)
  healthConditions: jsonb("health_conditions").$type<string[]>(), // ['pcos', 'hormonal_imbalance', 'pregnant_ttc', 'contraceptives', 'menopause', 'none']
  
  // Q6: Fertility tracking methods (stored as JSON array)
  fertilityTracking: jsonb("fertility_tracking").$type<string[]>(), // ['bbt', 'cervical_mucus', 'ovulation_kit', 'none']
  
  // Q7: Track symptoms preference
  trackSymptoms: varchar("track_symptoms"), // 'yes', 'no', 'maybe'
  
  // Q8: Dynamic predictions preference
  dynamicPredictions: varchar("dynamic_predictions"), // 'yes', 'no', 'not_sure'
  
  // Q9: Lifestyle factors (optional)
  stressLevel: varchar("stress_level"), // 'low', 'medium', 'high'
  sleepPattern: varchar("sleep_pattern"), // 'regular', 'irregular'
  healthNotes: text("health_notes"),
  
  // Profile mode based on conditions
  profileMode: varchar("profile_mode").default('regular'), // 'regular', 'irregular', 'ttc', 'menopause'
  
  // Calculated fields
  isIrregular: boolean("is_irregular").default(false),
  showBufferDays: boolean("show_buffer_days").default(true),
  
  // Onboarding status
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  cycles: many(cycles),
  symptoms: many(symptoms),
  chatHistory: many(chatHistory),
  favorites: many(favorites),
  onboarding: one(userOnboarding),
}));

export const userOnboardingRelations = relations(userOnboarding, ({ one }) => ({
  user: one(users, {
    fields: [userOnboarding.userId],
    references: [users.id],
  }),
}));

export const cyclesRelations = relations(cycles, ({ one, many }) => ({
  user: one(users, {
    fields: [cycles.userId],
    references: [users.id],
  }),
  symptoms: many(symptoms),
}));

export const symptomsRelations = relations(symptoms, ({ one }) => ({
  user: one(users, {
    fields: [symptoms.userId],
    references: [users.id],
  }),
  cycle: one(cycles, {
    fields: [symptoms.cycleId],
    references: [cycles.id],
  }),
}));

export const chatHistoryRelations = relations(chatHistory, ({ one }) => ({
  user: one(users, {
    fields: [chatHistory.userId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCycleSchema = createInsertSchema(cycles).omit({
  id: true,
  createdAt: true,
});

export const insertSymptomSchema = createInsertSchema(symptoms).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatHistory).omit({
  id: true,
  createdAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
});

export const insertMeditationVideoSchema = createInsertSchema(meditationVideos).omit({
  id: true,
  createdAt: true,
});

export const insertEducationalContentSchema = createInsertSchema(educationalContent).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertUserOnboardingSchema = createInsertSchema(userOnboarding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertCycle = z.infer<typeof insertCycleSchema>;
export type Cycle = typeof cycles.$inferSelect;
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Symptom = typeof symptoms.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatHistory.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertMeditationVideo = z.infer<typeof insertMeditationVideoSchema>;
export type MeditationVideo = typeof meditationVideos.$inferSelect;
export type InsertEducationalContent = z.infer<typeof insertEducationalContentSchema>;
export type EducationalContent = typeof educationalContent.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertUserOnboarding = z.infer<typeof insertUserOnboardingSchema>;
export type UserOnboarding = typeof userOnboarding.$inferSelect;

// Menstrual phase type
export type MenstrualPhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

// Symptom types
export const SYMPTOM_TYPES = [
  'cramps',
  'bloating',
  'headache',
  'fatigue',
  'mood_swing',
  'breast_tenderness',
  'acne',
  'cravings',
  'nausea',
  'back_pain',
  'insomnia',
  'anxiety',
  'irritability',
  'depression',
] as const;

export type SymptomType = typeof SYMPTOM_TYPES[number];
