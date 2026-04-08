CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- recipes
CREATE TABLE
    IF NOT EXISTS recipes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        ingredients JSONB NOT NULL,
        steps JSONB NOT NULL,
        image_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

-- comments
CREATE TABLE
    IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

-- likes
CREATE TABLE
    IF NOT EXISTS likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
        fingerprint TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uniq_recipe_fingerprint UNIQUE (recipe_id, fingerprint)
    );

CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_recipe_id_created_at ON comments (recipe_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_recipe_id ON likes (recipe_id);