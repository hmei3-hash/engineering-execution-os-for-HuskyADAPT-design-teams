-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "location" TEXT,
    "agenda" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "rationale" TEXT,
    "madeBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Decision_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ownerId" TEXT,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActionItem_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActionItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DesignSpec" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "problemStatement" TEXT NOT NULL,
    "constraints" TEXT NOT NULL,
    "successMetrics" TEXT NOT NULL,
    "proposedSolution" TEXT,
    "risks" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'BACKLOG',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" DATETIME,
    "ownerId" TEXT,
    "sourceMeetingId" TEXT,
    "sourceDecisionId" TEXT,
    "sourceSpecId" TEXT,
    "sourceActionItemId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_sourceMeetingId_fkey" FOREIGN KEY ("sourceMeetingId") REFERENCES "Meeting" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_sourceDecisionId_fkey" FOREIGN KEY ("sourceDecisionId") REFERENCES "Decision" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_sourceSpecId_fkey" FOREIGN KEY ("sourceSpecId") REFERENCES "DesignSpec" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_sourceActionItemId_fkey" FOREIGN KEY ("sourceActionItemId") REFERENCES "ActionItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemName" TEXT NOT NULL,
    "description" TEXT,
    "vendor" TEXT,
    "partNumber" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitCostCents" INTEGER,
    "totalCostCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "requestedBy" TEXT,
    "orderedAt" DATETIME,
    "receivedAt" DATETIME,
    "notes" TEXT,
    "sourceMeetingId" TEXT,
    "sourceDecisionId" TEXT,
    "sourceSpecId" TEXT,
    "sourceTaskId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_sourceMeetingId_fkey" FOREIGN KEY ("sourceMeetingId") REFERENCES "Meeting" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_sourceDecisionId_fkey" FOREIGN KEY ("sourceDecisionId") REFERENCES "Decision" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_sourceSpecId_fkey" FOREIGN KEY ("sourceSpecId") REFERENCES "DesignSpec" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_sourceTaskId_fkey" FOREIGN KEY ("sourceTaskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attendance_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_DecisionToSpec" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DecisionToSpec_A_fkey" FOREIGN KEY ("A") REFERENCES "Decision" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DecisionToSpec_B_fkey" FOREIGN KEY ("B") REFERENCES "DesignSpec" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Task_sourceActionItemId_key" ON "Task"("sourceActionItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_meetingId_memberId_key" ON "Attendance"("meetingId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "_DecisionToSpec_AB_unique" ON "_DecisionToSpec"("A", "B");

-- CreateIndex
CREATE INDEX "_DecisionToSpec_B_index" ON "_DecisionToSpec"("B");
