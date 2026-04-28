"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

export type AuthState = { errors?: { name?: string; email?: string; password?: string; form?: string } } | undefined;

export async function register(state: AuthState, formData: FormData): Promise<AuthState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string)?.trim();

  const errors: NonNullable<AuthState>["errors"] = {};
  if (!name || name.length < 2) errors.name = "Name must be at least 2 characters.";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email.";
  if (!password || password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (Object.keys(errors).length) return { errors };

  const existing = await prisma.member.findUnique({ where: { email } });
  if (existing) return { errors: { email: "This email is already registered." } };

  const passwordHash = await bcrypt.hash(password, 12);
  const member = await prisma.member.create({
    data: { name, email, role: role || "Member", passwordHash },
  });

  await createSession({ userId: member.id, name: member.name, email: member.email, role: member.role });
  redirect("/");
}

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) return { errors: { form: "Email and password are required." } };

  const member = await prisma.member.findUnique({ where: { email } });
  if (!member?.passwordHash) return { errors: { form: "Invalid email or password." } };

  const valid = await bcrypt.compare(password, member.passwordHash);
  if (!valid) return { errors: { form: "Invalid email or password." } };

  await createSession({ userId: member.id, name: member.name, email: member.email, role: member.role });
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
