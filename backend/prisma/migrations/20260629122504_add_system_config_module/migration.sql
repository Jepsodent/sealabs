-- CreateTable
CREATE TABLE "system_cofig" (
    "id" TEXT NOT NULL DEFAULT 'time_config',
    "virtualTimeOffsetDays" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_cofig_pkey" PRIMARY KEY ("id")
);
