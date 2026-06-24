# UI Structure Breakdown

Derived from the 8 reference screenshots (login + 7 authenticated pages).

## Design tokens

| Token | Value | Where used |
|-------|-------|------------|
| Brand maroon | `#7E1A33` (mapped to Tailwind `maroon-600`) | Sidebar active state, buttons, accent underline, badges |
| Heading typeface | Serif (Source Serif 4 / Georgia fallback) | All page titles, "Good day, Marian.", card headings |
| Body/UI typeface | Sans (Inter) | Nav labels, table text, form labels, body copy |
| Hairline | `#E6E2DD` | All borders, table dividers, card outlines |
| Sidebar background | `#FAFAF8` | Sidebar panel only |
| Eyebrow label | 0.7rem, uppercase, letter-spacing 0.14em, maroon | "CAMPUS LIFE", "ACCOUNT", "DIRECTORY", "RESOURCES", "BULLETIN", "ACADEMICS" |

## Persistent shell (every authenticated page)

```
┌────────────────────────────────────────────────────────────────┐
│ [S] Smart Campus Integrated Services      [• STUDENT] [MR Name▾]│  ← TopBar
│     UNIVERSITY PORTAL · SCISP                                    │
├───────────────┬──────────────────────────────────────────────────┤
│ PORTAL         │                                                   │
│ SERVICES       │   <page content>                                 │
│                │                                                   │
│ ▣ Overview     │                                                   │
│ ◎ Student      │                                                   │
│   Profile      │                                                   │
│ 📅 Class       │                                                   │
│   Schedule     │                                                   │
│ 📣 Announce-   │                                                   │
│   ments        │                                                   │
│ 📖 Library     │                                                   │
│ 👥 Faculty     │                                                   │
│   Directory    │                                                   │
│ 🎫 Events      │                                                   │
└───────────────┴──────────────────────────────────────────────────┘
```
- Sidebar item active state: maroon left border (2px) + light background fill.
- Sidebar collapses to a hamburger-triggered overlay below the `sm` breakpoint.

## Page-by-page breakdown

**Login** — split-screen. Left 50%: maroon panel, "VERITAS IN ACADEMIA" eyebrow,
serif display headline ("Smart Campus Integrated Services Portal"), supporting
paragraph, copyright footer. Right 50%: white panel, "AUTHENTICATION" eyebrow,
"Sign in to your account" serif heading + maroon underline rule, two labeled
inputs (Student ID/Email, Password), full-width maroon submit button, "Create
one" link.

**Overview (Dashboard)** — eyebrow "WELCOME, STUDENT", serif greeting headline,
4-column stat grid (Enrolled Subjects / Pending Announcements / Library Loans /
Upcoming Events — large serif numerals), two-column lower section: "Recent
announcements" list (category badge + serif title + relative timestamp) and a
"Quick access" link list with icons.

**Student Profile** — two-column. Left: card with circular avatar (initials or
photo) + upload button overlay, name, ID, role badge, then a stacked read-only
summary. Right: "Personal Information" card with an Edit toggle; 2×3 label/value
grid (Full Name, Student ID, Course, Year Level, Email, Contact).

**Class Schedule** — eyebrow "ACADEMICS", subtitle line ("First Semester ·
AY · N units enrolled"), right-aligned search box, 5-column table (Subject
Code, Description, Schedule, Room, Instructor), footer copyright line.

**Announcements** — eyebrow "BULLETIN", stacked list (not cards): each entry
has a bordered category tag, date + posting office on one line, serif headline,
body paragraph, separated by hairline dividers.

**Library** — eyebrow "RESOURCES", search box, 4-column table (Title, Author,
Category, Availability) with a colored dot + label for AVAILABLE/ON LOAN status.

**Faculty Directory** — eyebrow "DIRECTORY", search box, 4-column responsive
card grid: circular initials avatar, serif name, maroon rank label, department,
hairline divider, email + consultation hours rows with icons.

**Events** — eyebrow "CAMPUS LIFE", 2-column card grid: serif event name,
description paragraph, hairline divider, date/venue/organizer rows with maroon
icons, full-width maroon "REGISTER FOR EVENT" button per card.

## Responsive behavior
- **Desktop (≥1024px)**: sidebar always visible, multi-column grids as shown above.
- **Tablet (640–1023px)**: sidebar visible, card grids drop to 2 columns.
- **Mobile (<640px)**: sidebar becomes a slide-in overlay triggered by a
  hamburger button under the header; all grids collapse to 1 column; tables
  scroll horizontally within a bordered container rather than overflowing the page.
