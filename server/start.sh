#!/bin/sh
set -e

echo "⚙️  Running Prisma DB push..."
npx prisma db push --accept-data-loss

echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️  Seed skipped or already seeded."

echo "🚀 Starting server..."
exec node dist/server.js
