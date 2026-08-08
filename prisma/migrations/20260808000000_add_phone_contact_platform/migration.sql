-- Phone becomes a repeatable TopicLink row (like website/social), so a page
-- can hold multiple numbers. The enum value must be added in its own migration
-- because PostgreSQL refuses to use a freshly-added enum value inside the same
-- transaction.
ALTER TYPE "ContactPlatform" ADD VALUE 'PHONE';
