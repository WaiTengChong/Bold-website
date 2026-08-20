---
name: enterprise-user-dashboard-ux
description: >
  Enterprise logged-in dashboard UX: persistent shell, KPI-first hierarchy,
  quick actions, exception banners, empty states, and loading skeletons.
  Use when building or improving admin consoles, member dashboards, back-office
  home screens, or any data-heavy facility/ops dashboard.
---

# Enterprise user dashboard UX

Apply these patterns to dashboard home screens. Keep the host product's visual
tokens. Do not import a foreign theme, motion library, or icon set.

## Shell

- Sidebar (or nav) stays mounted. Switching sections updates the main pane only.
- Header names the current section. Do not repeat that as a competing page H1.
- No public-site marketing footer inside an authenticated console.

## Hierarchy (dashboard home)

1. Context: date + role/greeting (one line, not a second title)
2. Exceptions: one banner for what needs attention now
3. KPIs: the numbers operators check first
4. Quick actions: jumps to real tasks (book, schedule, members, inventory)
5. Operational detail: courts, queues, recent records
6. Previews: a few recent rows + "view all", not the full management table

## States

- Loading: skeleton in the shell, not a blank "please wait" void
- Empty / no results: dashed block + what to do next
- Error / maintenance: one-line banner with a jump to the fixing screen

## Don't

- Dump every table onto the home view
- Add new UI libraries for cards, motion, or icons
- Copy another product's colors, type, or component source
