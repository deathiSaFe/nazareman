# Nazareman End-to-End Testing Checklist

## Setup & Local Environment
1. Ensure PostgreSQL is running and `.env` contains a valid `DATABASE_URL` and `ADMIN_PASSWORD`.
2. Run migrations: `npx prisma migrate deploy`
3. Seed locations: `npm run db:seed`
4. Start dev server: `npm run dev`
5. Open `http://localhost:3000`

---

## Flow A: Topic Submission
- [ ] Navigate to `/add-topic`.
- [ ] Select a topic type (e.g., `business`).
- [ ] Enter a unique topic name (e.g., `رستوران تستی`).
- [ ] Press Enter to search, then click `ادامه`.
- [ ] Enter a description (at least 20 characters).
- [ ] Enter a city name (e.g., `تهران`).
- [ ] Click `ارسال برای بررسی`.
- **Expected Result:** 
  - Network tab shows a `201 Created` POST to `/api/topics/submit`.
  - Browser redirects to `/topic/[new-uuid]?focusComment=true`.

---

## Flow B: Admin Approval
- [ ] Navigate to `/admin`.
- [ ] If prompted, enter the `ADMIN_PASSWORD` from your `.env`.
- [ ] Click `بررسی موضوعات`.
- [ ] Locate the newly submitted topic.
- [ ] Click `تأیید` (Approve).
- **Expected Result:** 
  - The topic disappears from the pending list.
  - A success message appears briefly.

---

## Flow C: Public Visibility
- [ ] Navigate to `/topics`.
- **Expected Result:** 
  - The approved topic appears in the grid.
- [ ] Click on the topic card.
- **Expected Result:** 
  - Browser navigates to `/topic/[slug-or-uuid]`.
  - Topic details, city, and description render correctly.

---

## Flow D: Comments & Moderation
- [ ] On the public topic page (`/topic/[id]`), scroll to the comment form.
- [ ] Type a test comment (e.g., `نظر تستی برای بررسی`) and submit.
- **Expected Result:** 
  - Success message: `نظر شما برای بررسی ارسال شد.`
  - The comment does *not* appear in the public list yet.
- [ ] Navigate to `/admin/comments`.
- [ ] Find the test comment and click `تأیید`.
- [ ] Return to the public topic page and refresh.
- **Expected Result:** 
  - The approved comment is now visible in the comments section.