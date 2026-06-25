import { pgTable, text, jsonb, serial, real, timestamp, boolean } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  number: text("number").notNull(),
  clientName: text("client_name").notNull(),
  year: text("year").notNull(),
  role: text("role").notNull(),
  services: jsonb("services").$type<string[]>().notNull(),
  description: text("description").notNull(),
  tagline: text("tagline").notNull(),
  href: text("href").notNull(),
  coverImage: text("cover_image").notNull(),
  coverSrcSet: text("cover_srcset").notNull(),
  swiperImages: jsonb("swiper_images").$type<string[]>().notNull(),
  imageCaptions: jsonb("image_captions").$type<string[]>().notNull(),
  bgImage: text("bg_image").notNull(),
  bgSrcSet: text("bg_srcset"),
});

export const services = pgTable("services", {
  id: text("id").primaryKey(),
  num: text("num").notNull(),
  title: text("title").notNull(),
  count: text("count").notNull(),
  description: text("description").notNull(),
  image1: text("image1").notNull(),
  image2: text("image2").notNull(),
});

export const visitors = pgTable("visitors", {
  id: serial("id").primaryKey(),
  ip_hash: text("ip_hash").unique().notNull(),
  country: text("country"),
  city: text("city"),
  visited_at: timestamp("visited_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  read: boolean("read").default(false).notNull(),
});

