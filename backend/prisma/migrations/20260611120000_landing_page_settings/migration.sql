-- CreateTable
CREATE TABLE "landing_page_settings" (
    "domain" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_page_settings_pkey" PRIMARY KEY ("domain")
);
