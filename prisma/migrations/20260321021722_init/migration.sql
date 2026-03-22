-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(126) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_projects" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "story_topic" TEXT,
    "video_genre" VARCHAR(100),
    "number_of_scenes" INTEGER,
    "status" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_generations" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "generation_no" INTEGER NOT NULL,
    "ai_model" VARCHAR(50),
    "resolution" VARCHAR(20),
    "aspect_ratio" VARCHAR(10),
    "voice_settings" JSONB,
    "status" VARCHAR(20),
    "output_url" TEXT,
    "thumbnail_url" TEXT,
    "duration_seconds" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_scenes" (
    "id" UUID NOT NULL,
    "generation_id" UUID NOT NULL,
    "scene_order" INTEGER NOT NULL,
    "prompt_text" TEXT,
    "image_url" TEXT,
    "audio_url" TEXT,

    CONSTRAINT "video_scenes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "video_projects_user_id_idx" ON "video_projects"("user_id");

-- CreateIndex
CREATE INDEX "video_generations_project_id_idx" ON "video_generations"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "video_generations_project_id_generation_no_key" ON "video_generations"("project_id", "generation_no");

-- CreateIndex
CREATE INDEX "video_scenes_generation_id_idx" ON "video_scenes"("generation_id");

-- CreateIndex
CREATE UNIQUE INDEX "video_scenes_generation_id_scene_order_key" ON "video_scenes"("generation_id", "scene_order");

-- AddForeignKey
ALTER TABLE "video_projects" ADD CONSTRAINT "video_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_generations" ADD CONSTRAINT "video_generations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "video_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_scenes" ADD CONSTRAINT "video_scenes_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "video_generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
