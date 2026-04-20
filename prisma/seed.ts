import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbUrl = `file:${path.join(process.cwd(), "dev.db")}`;
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Members
  const alex = await prisma.member.upsert({ where: { email: "alex@uw.edu" }, update: {}, create: { name: "Alex Chen", email: "alex@uw.edu", role: "Mechanical Lead" } });
  const maya = await prisma.member.upsert({ where: { email: "maya@uw.edu" }, update: {}, create: { name: "Maya Patel", email: "maya@uw.edu", role: "Software Engineer" } });
  const jordan = await prisma.member.upsert({ where: { email: "jordan@uw.edu" }, update: {}, create: { name: "Jordan Lee", email: "jordan@uw.edu", role: "Project Manager" } });
  const sam = await prisma.member.upsert({ where: { email: "sam@uw.edu" }, update: {}, create: { name: "Sam Rivera", email: "sam@uw.edu", role: "Electrical Engineer" } });

  // Meeting
  const meeting = await prisma.meeting.create({
    data: {
      title: "Week 3 Design Review",
      date: new Date("2026-04-10T14:00:00"),
      location: "EEB 026",
      status: "COMPLETED",
      agenda: "1. Review motor selection\n2. Discuss power budget\n3. Assign prototype tasks",
      notes: "Team agreed on stepper motors after comparing cost, torque, and availability. Budget approved for prototyping phase.",
    },
  });

  // Attendance
  await prisma.attendance.createMany({
    data: [
      { meetingId: meeting.id, memberId: alex.id, status: "PRESENT" },
      { meetingId: meeting.id, memberId: maya.id, status: "PRESENT" },
      { meetingId: meeting.id, memberId: jordan.id, status: "LATE" },
      { meetingId: meeting.id, memberId: sam.id, status: "EXCUSED" },
    ],
  });

  // Decision
  const decision = await prisma.decision.create({
    data: {
      meetingId: meeting.id,
      summary: "Chose NEMA 17 stepper motors over servo motors",
      rationale: "Steppers offer better position control at our torque requirements, are cheaper in bulk, and have strong library support. Servos were ruled out due to cost and complexity.",
      madeBy: "Alex Chen, Maya Patel",
    },
  });

  // Design Spec
  const spec = await prisma.designSpec.create({
    data: {
      title: "Wheelchair Joystick Controller v1",
      version: "1.0",
      status: "APPROVED",
      problemStatement: "Users with limited hand mobility need a reliable, low-latency joystick interface to control a motorized wheelchair attachment.",
      constraints: "- Must operate on 12V DC\n- Max total weight: 500g\n- Cost under $150 for components\n- Compatible with existing chair frame",
      successMetrics: "- Joystick response latency < 50ms\n- Motor holds position within ±2° under load\n- Continuous operation for 4 hours on a charge",
      proposedSolution: "Use a dual NEMA 17 stepper setup driven by A4988 drivers, controlled by an ESP32 reading a hall-effect joystick.",
      risks: "- Driver heat dissipation at max current\n- Joystick drift over time",
      sourceDecisions: { connect: [{ id: decision.id }] },
    },
  });

  // Action Item → Task
  const actionItem = await prisma.actionItem.create({
    data: {
      meetingId: meeting.id,
      description: "Order NEMA 17 steppers and A4988 drivers",
      ownerId: alex.id,
      dueDate: new Date("2026-04-17"),
      status: "DONE",
    },
  });

  const task = await prisma.task.create({
    data: {
      title: "Order NEMA 17 steppers and A4988 drivers",
      status: "DONE",
      priority: "HIGH",
      ownerId: alex.id,
      sourceMeetingId: meeting.id,
      sourceDecisionId: decision.id,
      sourceSpecId: spec.id,
      sourceActionItemId: actionItem.id,
      dueDate: new Date("2026-04-17"),
    },
  });

  await prisma.task.create({
    data: {
      title: "Prototype motor mount bracket in CAD",
      status: "IN_PROGRESS",
      priority: "HIGH",
      ownerId: alex.id,
      sourceMeetingId: meeting.id,
      sourceSpecId: spec.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Flash ESP32 with joystick read + serial output",
      status: "TODO",
      priority: "MEDIUM",
      ownerId: maya.id,
      sourceSpecId: spec.id,
    },
  });

  // Order
  await prisma.order.create({
    data: {
      itemName: "NEMA 17 Stepper Motor (2-pack)",
      vendor: "Amazon",
      quantity: 1,
      unitCostCents: 2499,
      totalCostCents: 2499,
      status: "RECEIVED",
      requestedBy: "Alex Chen",
      sourceMeetingId: meeting.id,
      sourceDecisionId: decision.id,
      sourceSpecId: spec.id,
      sourceTaskId: task.id,
    },
  });

  await prisma.order.create({
    data: {
      itemName: "A4988 Stepper Driver Module (5-pack)",
      vendor: "Amazon",
      quantity: 1,
      unitCostCents: 999,
      totalCostCents: 999,
      status: "ORDERED",
      requestedBy: "Alex Chen",
      sourceSpecId: spec.id,
    },
  });

  console.log("✓ Seed data created successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
