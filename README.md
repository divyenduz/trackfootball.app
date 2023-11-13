# Introduction

Repository for code of TrackFootball.app

# Contributing

1. Copy `.env-sample` to `.env`
2. `yarn`
3. `yarn dev`
   (and more)

# Specification

Spec: https://www.notion.so/zoid/TrackFootball-app-3863993bbc6149e194b55b7cdf608bcc

# SQL

## Fix Sequences

```sql
SELECT SETVAL('public."User_id_seq"', COALESCE(MAX(id), 1)) FROM public."User";
SELECT SETVAL('public."Field_id_seq"', COALESCE(MAX(id), 1)) FROM public."Field";
SELECT SETVAL('public."Post_id_seq"', COALESCE(MAX(id), 1)) FROM public."Post";
SELECT SETVAL('public."SocialLogin_id_seq"', COALESCE(MAX(id), 1)) FROM public."SocialLogin";
```

## Fix Indexes

```sql
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");
CREATE UNIQUE INDEX "SocialLogin.platformId_unique" ON "SocialLogin"("platformId");
CREATE UNIQUE INDEX "User.auth0Sub_unique" ON "User"("auth0Sub");
CREATE UNIQUE INDEX "Post.key_type_unique" ON "Post"("key", "type");
```

## Functions

```sql
CREATE OR REPLACE FUNCTION jsonb_array_max(arr jsonb)
	RETURNS integer
	IMMUTABLE
	LANGUAGE plpgsql
	AS $$
BEGIN
	RETURN (WITH el AS (
		SELECT
			max(jsonb_array_elements::int)
		FROM
			jsonb_array_elements(arr)
)
SELECT
	*
FROM
	el LIMIT 1 );
END;
$$;
```

```sql
CREATE OR REPLACE FUNCTION jsonb_array_avg(arr jsonb)
	RETURNS integer
	IMMUTABLE
	LANGUAGE plpgsql
	AS $$
BEGIN
	RETURN (WITH el AS (
		SELECT
			avg(jsonb_array_elements::int)
		FROM
			jsonb_array_elements(arr)
)
SELECT
	*
FROM
	el LIMIT 1 );
END;
$$;
```
