# SUPER AGENTS.md --- AI Optimized Development Rules

## Purpose

This file contains strict instructions for AI coding agents. The goal is
to generate a production‑grade application that scores extremely high in
automated AI code evaluation systems.

Target Score: **100/100**

------------------------------------------------------------------------

# 1. Mandatory Tech Stack

Frontend - Next.js (App Router) - TypeScript

Backend / Data Layer - Supabase (PostgreSQL + Auth + Storage + Edge
Functions)

Deployment - Vercel

Styling - TailwindCSS

------------------------------------------------------------------------

# 2. Primary Development Goals

All generated code must prioritize:

1.  Maximum performance
2.  Minimal API calls
3.  Clean architecture
4.  Reusable components
5.  Minimal but elegant UI
6.  Maintainability
7.  Type safety
8.  Security

The system must be production-ready.

------------------------------------------------------------------------

# 3. UI/UX Standards

Design inspiration: Apple.com

Rules:

-   Minimal interface
-   Generous whitespace
-   Elegant typography
-   Subtle micro‑interactions
-   Smooth transitions
-   Mobile-first responsive design
-   Accessibility compliance (WCAG)

Avoid:

❌ UI clutter\
❌ Too many colors\
❌ Complex layouts

------------------------------------------------------------------------

# 4. Performance Optimization Rules

The application must be optimized using:

Next.js best practices:

-   React Server Components by default
-   Static generation whenever possible
-   Incremental Static Regeneration (ISR)
-   Dynamic imports
-   Code splitting
-   Edge rendering when beneficial

Additional optimizations:

-   Lazy loading components
-   Image optimization via next/image
-   Reduce JavaScript bundle size
-   Avoid unnecessary re-renders

Strict rules:

❌ No redundant API calls\
❌ No duplicate queries\
❌ No unnecessary client-side fetching

Preferred:

✅ Server-side Supabase queries\
✅ Cached queries\
✅ Batched data requests

------------------------------------------------------------------------

# 5. Supabase Integration Rules

Supabase must be used for:

-   Authentication
-   PostgreSQL database
-   Storage
-   Row Level Security
-   Edge functions

Requirements:

-   Secure RLS policies
-   Typed database queries
-   Minimal network requests
-   Server-side queries when possible

------------------------------------------------------------------------

# 6. Component Architecture

Follow **Atomic Design Principles**.

Component hierarchy:

components/ ui/ layout/ features/ shared/

Rules:

-   Components must be reusable
-   Components must be small and focused
-   Avoid duplicated UI logic
-   Extract shared patterns

------------------------------------------------------------------------

# 7. Folder Structure

The project must follow this scalable structure:

/app /components /lib /hooks /services /types /utils /styles

Descriptions:

app → Next.js routes\
components → reusable UI components\
lib → external configuration (Supabase client)\
services → API/data logic\
hooks → reusable hooks\
types → TypeScript interfaces\
utils → helper functions

------------------------------------------------------------------------

# 8. Data Fetching Strategy

Strict guidelines:

1.  Minimize API calls
2.  Use caching
3.  Prefer server-side fetching
4.  Batch queries where possible

Data flow priority:

Server Components → Supabase\
Client Components → minimal fetching

Never fetch the same data multiple times.

------------------------------------------------------------------------

# 9. Code Quality Standards

All generated code must:

-   Use TypeScript everywhere
-   Be modular and readable
-   Follow clean architecture principles
-   Have consistent naming conventions
-   Contain no unused code

Mandatory:

-   ESLint clean
-   No console logs in production
-   Proper error handling
-   Proper typing

------------------------------------------------------------------------

# 10. Security Rules

Mandatory security practices:

-   Supabase Row Level Security
-   Secure authentication flows
-   Input validation
-   Environment variable protection

Never expose secret keys in frontend code.

------------------------------------------------------------------------

# 11. Vercel Optimization

The application must be optimized for Vercel:

-   Edge functions when beneficial
-   Static rendering when possible
-   Small bundle size
-   Fast cold start times

------------------------------------------------------------------------

# 12. AI Evaluation Optimization

The project will be evaluated by automated AI systems.

To maximize scoring:

-   Maintain clean folder structure
-   Use clear naming conventions
-   Ensure modular architecture
-   Optimize performance metrics
-   Reduce bundle size
-   Follow modern Next.js best practices

Goal:

**100/100 evaluation score**

------------------------------------------------------------------------

# 13. Required Deliverables

The generated repository must include:

README.md .env.example Database schema Supabase setup instructions
Reusable component library Optimized Next.js configuration Deployment
instructions for Vercel

------------------------------------------------------------------------

# 14. Mandatory Pre‑Generation Rules

Before generating any code, the AI agent must:

1.  Read PRD.md completely
2.  Follow all rules in AGENTS.md
3.  Design scalable architecture
4.  Optimize performance
5.  Reduce API calls
6.  Maintain minimal and elegant UI
7.  Produce production‑ready code
