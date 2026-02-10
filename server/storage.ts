import {
  users,
  cycles,
  symptoms,
  chatHistory,
  recipes,
  meditationVideos,
  educationalContent,
  favorites,
  type User,
  type UpsertUser,
  type Cycle,
  type InsertCycle,
  type Symptom,
  type InsertSymptom,
  type ChatMessage,
  type InsertChatMessage,
  type Recipe,
  type InsertRecipe,
  type MeditationVideo,
  type InsertMeditationVideo,
  type EducationalContent,
  type InsertEducationalContent,
  type Favorite,
  type InsertFavorite,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;

  // Cycle operations
  getCycles(userId: string): Promise<Cycle[]>;
  getCycleById(id: string): Promise<Cycle | undefined>;
  createCycle(cycle: InsertCycle): Promise<Cycle>;
  updateCycle(id: string, data: Partial<InsertCycle>): Promise<Cycle | undefined>;

  // Symptom operations
  getSymptoms(userId: string): Promise<Symptom[]>;
  getSymptomsByDate(userId: string, date: string): Promise<Symptom[]>;
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  createSymptoms(symptoms: InsertSymptom[]): Promise<Symptom[]>;

  // Chat operations
  getChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Recipe operations
  getRecipes(): Promise<Recipe[]>;
  getRecipesByPhase(phase: string): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;

  // Meditation video operations
  getMeditationVideos(): Promise<MeditationVideo[]>;
  getMeditationVideosByCategory(category: string): Promise<MeditationVideo[]>;
  createMeditationVideo(video: InsertMeditationVideo): Promise<MeditationVideo>;

  // Educational content operations
  getEducationalContent(): Promise<EducationalContent[]>;
  getEducationalContentByCategory(category: string): Promise<EducationalContent[]>;
  createEducationalContent(content: InsertEducationalContent): Promise<EducationalContent>;

  // Favorites operations
  getFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, itemType: string, itemId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Cycle operations
  async getCycles(userId: string): Promise<Cycle[]> {
    return db
      .select()
      .from(cycles)
      .where(eq(cycles.userId, userId))
      .orderBy(desc(cycles.startDate));
  }

  async getCycleById(id: string): Promise<Cycle | undefined> {
    const [cycle] = await db.select().from(cycles).where(eq(cycles.id, id));
    return cycle;
  }

  async createCycle(cycle: InsertCycle): Promise<Cycle> {
    const [newCycle] = await db.insert(cycles).values(cycle).returning();
    return newCycle;
  }

  async updateCycle(id: string, data: Partial<InsertCycle>): Promise<Cycle | undefined> {
    const [cycle] = await db
      .update(cycles)
      .set(data)
      .where(eq(cycles.id, id))
      .returning();
    return cycle;
  }

  // Symptom operations
  async getSymptoms(userId: string): Promise<Symptom[]> {
    return db
      .select()
      .from(symptoms)
      .where(eq(symptoms.userId, userId))
      .orderBy(desc(symptoms.date));
  }

  async getSymptomsByDate(userId: string, date: string): Promise<Symptom[]> {
    return db
      .select()
      .from(symptoms)
      .where(and(eq(symptoms.userId, userId), eq(symptoms.date, date)));
  }

  async createSymptom(symptom: InsertSymptom): Promise<Symptom> {
    const [newSymptom] = await db.insert(symptoms).values(symptom).returning();
    return newSymptom;
  }

  async createSymptoms(symptomList: InsertSymptom[]): Promise<Symptom[]> {
    if (symptomList.length === 0) return [];
    return db.insert(symptoms).values(symptomList).returning();
  }

  // Chat operations
  async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    return db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.userId, userId))
      .orderBy(chatHistory.createdAt)
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatHistory).values(message).returning();
    return newMessage;
  }

  // Recipe operations
  async getRecipes(): Promise<Recipe[]> {
    return db.select().from(recipes).orderBy(recipes.title);
  }

  async getRecipesByPhase(phase: string): Promise<Recipe[]> {
    return db.select().from(recipes).where(eq(recipes.phase, phase));
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db.insert(recipes).values(recipe).returning();
    return newRecipe;
  }

  // Meditation video operations
  async getMeditationVideos(): Promise<MeditationVideo[]> {
    return db.select().from(meditationVideos).orderBy(meditationVideos.title);
  }

  async getMeditationVideosByCategory(category: string): Promise<MeditationVideo[]> {
    return db.select().from(meditationVideos).where(eq(meditationVideos.category, category));
  }

  async createMeditationVideo(video: InsertMeditationVideo): Promise<MeditationVideo> {
    const [newVideo] = await db.insert(meditationVideos).values(video).returning();
    return newVideo;
  }

  // Educational content operations
  async getEducationalContent(): Promise<EducationalContent[]> {
    return db.select().from(educationalContent).orderBy(educationalContent.title);
  }

  async getEducationalContentByCategory(category: string): Promise<EducationalContent[]> {
    return db.select().from(educationalContent).where(eq(educationalContent.category, category));
  }

  async createEducationalContent(content: InsertEducationalContent): Promise<EducationalContent> {
    const [newContent] = await db.insert(educationalContent).values(content).returning();
    return newContent;
  }

  // Favorites operations
  async getFavorites(userId: string): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, itemType: string, itemId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.itemType, itemType),
          eq(favorites.itemId, itemId)
        )
      );
  }
}

export const storage = new DatabaseStorage();
