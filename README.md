# StackUp

StackUp is a developer-event discovery app built with Next.js, React, TypeScript, MongoDB, and Mongoose. Visitors can browse demo events, open event details, and reserve a spot using their email address.

## Features

- Browse events and open event detail pages.
- Find related events by shared tags.
- Submit a booking with email validation and duplicate-booking protection.
- Store event and booking records in MongoDB.
- Upload event images to ImageKit through a protected server endpoint.
- Run automated type checks, unit tests, lint, build, and production dependency audits.

## Tech stack

- Next.js 16 App Router and React 19
- TypeScript
- MongoDB and Mongoose
- Tailwind CSS 4
- ImageKit for event media
- ESLint 9 and TypeScript compiler checks

## Run locally

### Requirements

- Node.js 20 or newer
- A MongoDB database, local or hosted
- ImageKit credentials if you want to use the event creation API

### Install

\`\`\`bash
git clone https://github.com/MOHAMMADYASSINE23/StackUp.git
cd StackUp
npm ci
\`\`\`

### Configure environment variables

Copy \`.env.example\` to \`.env.local\` and replace placeholders with your own values.

- \`MONGODB_URI\` points to your MongoDB database.
- \`NEXT_PUBLIC_BASE_URL\` is the absolute base URL used by server-side page requests. Use \`http://localhost:3000\` locally and your deployed origin in production.
- \`NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY\`, \`NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT\`, and \`IMAGEKIT_PRIVATE_KEY\` configure ImageKit.
- \`EVENT_ADMIN_API_KEY\` protects \`POST /api/events\`. Generate a long random value and keep it server-side. Never expose it in a \`NEXT_PUBLIC_*\` variable or browser code.

The app does not currently include an administrator dashboard or sign-in flow. The event creation API is intentionally unavailable unless its server-side key is configured. Do not call it directly from public client-side code with a privileged key.

### Run

\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:3000.

### Seed demo data

\`\`\`bash
npm run seed
\`\`\`

The seed script upserts the sample events by slug and does not delete existing event records. Treat the seeded entries as demo content, not authoritative real-world event listings.

## Quality checks

\`\`\`bash
npm run typecheck
npm test
npm run lint
npm run build
npm audit --omit=dev
\`\`\`

GitHub Actions runs these checks for pushes and pull requests to \`main\`. The CI build uses placeholder environment values and does not send real email or connect to a production database.

## Current limitations

- Bookings are identified by email and event, not by a signed-in user account.
- No administrator dashboard or public event creation form is included.
- The event creation API requires a server-side bearer key and ImageKit configuration.
- Demo event dates can become outdated. Verify real event details before relying on them.
- Before deploying, configure production secrets and test booking, duplicate booking, image upload, and database failure cases in a staging environment.
