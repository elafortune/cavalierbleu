CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"exerciseNumber" integer NOT NULL,
	"answerPgn" text,
	"answerText" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "correction_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"exerciseNumber" integer NOT NULL,
	"label" text NOT NULL,
	"body" text NOT NULL,
	"source" text,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "corrections" (
	"id" serial PRIMARY KEY NOT NULL,
	"attemptId" text NOT NULL,
	"status" text DEFAULT 'checked' NOT NULL,
	"autoCheck" jsonb,
	"suggestedGrade" text,
	"aiGrade" text,
	"aiText" text,
	"aiModel" text,
	"aiError" text,
	"finalGrade" text,
	"finalText" text,
	"edited" boolean,
	"reviewedBy" text,
	"publishedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "corrections_attemptId_unique" UNIQUE("attemptId")
);
--> statement-breakpoint
CREATE TABLE "course_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"moduleId" text NOT NULL,
	"dossierId" integer,
	"title" text NOT NULL,
	"fileName" text NOT NULL,
	"storageKey" text NOT NULL,
	"sizeBytes" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"isSample" boolean DEFAULT false NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dossiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"moduleId" text NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"position" integer NOT NULL,
	"firstExercise" integer NOT NULL,
	"lastExercise" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entitlements" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"moduleId" text NOT NULL,
	"source" text NOT NULL,
	"reference" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"number" integer PRIMARY KEY NOT NULL,
	"moduleId" text NOT NULL,
	"dossierId" integer NOT NULL,
	"indexInDossier" integer NOT NULL,
	"title" text,
	"prompt" text,
	"fen" text,
	"sideToMove" text,
	"referencePgn" text,
	"themes" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" text DEFAULT 'placeholder' NOT NULL,
	"source" text,
	"contentHash" text,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expertise" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"scope" text NOT NULL,
	"exerciseNumber" integer,
	"theme" text,
	"studentAnswer" text,
	"autoCheck" jsonb,
	"aiDraft" text,
	"grade" text,
	"text" text NOT NULL,
	"edited" boolean,
	"source" text NOT NULL,
	"correctionId" integer,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"startedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"report" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legacy_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"exerciseNumber" integer NOT NULL,
	"studentRef" text,
	"answeredAt" timestamp with time zone,
	"text" text NOT NULL,
	"grade" text,
	"source" text,
	"contentHash" text NOT NULL,
	CONSTRAINT "legacy_answers_contentHash_unique" UNIQUE("contentHash")
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL,
	"letter" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'student' NOT NULL,
	"legacyRef" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_exerciseNumber_exercises_number_fk" FOREIGN KEY ("exerciseNumber") REFERENCES "public"."exercises"("number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "correction_templates" ADD CONSTRAINT "correction_templates_exerciseNumber_exercises_number_fk" FOREIGN KEY ("exerciseNumber") REFERENCES "public"."exercises"("number") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_attemptId_attempts_id_fk" FOREIGN KEY ("attemptId") REFERENCES "public"."attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_reviewedBy_user_id_fk" FOREIGN KEY ("reviewedBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_documents" ADD CONSTRAINT "course_documents_moduleId_modules_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_documents" ADD CONSTRAINT "course_documents_dossierId_dossiers_id_fk" FOREIGN KEY ("dossierId") REFERENCES "public"."dossiers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_moduleId_modules_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_moduleId_modules_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_moduleId_modules_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_dossierId_dossiers_id_fk" FOREIGN KEY ("dossierId") REFERENCES "public"."dossiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expertise" ADD CONSTRAINT "expertise_exerciseNumber_exercises_number_fk" FOREIGN KEY ("exerciseNumber") REFERENCES "public"."exercises"("number") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expertise" ADD CONSTRAINT "expertise_correctionId_corrections_id_fk" FOREIGN KEY ("correctionId") REFERENCES "public"."corrections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "attempt_user_ex_idx" ON "attempts" USING btree ("userId","exerciseNumber");--> statement-breakpoint
CREATE UNIQUE INDEX "template_ex_label_uq" ON "correction_templates" USING btree ("exerciseNumber","label");--> statement-breakpoint
CREATE INDEX "correction_status_idx" ON "corrections" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "course_module_file_uq" ON "course_documents" USING btree ("moduleId","fileName");--> statement-breakpoint
CREATE UNIQUE INDEX "dossier_module_code_uq" ON "dossiers" USING btree ("moduleId","code");--> statement-breakpoint
CREATE UNIQUE INDEX "entitlement_email_module_uq" ON "entitlements" USING btree ("email","moduleId");--> statement-breakpoint
CREATE INDEX "exercise_dossier_idx" ON "exercises" USING btree ("dossierId");--> statement-breakpoint
CREATE INDEX "exercise_module_idx" ON "exercises" USING btree ("moduleId");--> statement-breakpoint
CREATE INDEX "expertise_ex_idx" ON "expertise" USING btree ("exerciseNumber");--> statement-breakpoint
CREATE INDEX "expertise_theme_idx" ON "expertise" USING btree ("theme");--> statement-breakpoint
CREATE INDEX "legacy_ex_idx" ON "legacy_answers" USING btree ("exerciseNumber");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("userId");