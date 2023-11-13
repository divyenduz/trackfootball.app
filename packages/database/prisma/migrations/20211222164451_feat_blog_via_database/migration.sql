-- CreateTable
CREATE TABLE "Blog" (
    "id" SERIAL NOT NULL,
    "taxonomy" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "notionId" TEXT NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

INSERT INTO "public"."Blog" ("id", "taxonomy", "slug", "notionId") VALUES
(1, 'home', '', '00aa4f0a622c4fb58576ed0052ded287'),
(2, 'new', '', 'a732e1d86fd949e08e65515a34efc85f'),
(3, 'democratizing-football-science', '', '378ebb79c23d43e5a9cbdfef4e647c5e'),
(4, 'engineering', 'physical-world-test-cases', '221bcbcf3bb8494eb9fa91cf83b569b8'),
(5, 'engineering', 'rbac-react', '9170f42608344d548d15ef85b68b0af5'),
(6, 'engineering', 'end-to-end-type-safety', '39219423eb2f4e6fbf8f7a2ea2ba91d4'),
(7, 'privacy', 'gdpr', '29b28da7643346c983cc83ee4b8535d9');