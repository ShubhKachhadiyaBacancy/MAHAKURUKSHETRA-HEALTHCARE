# AI Agent Instructions for Code Generation

## Tech Stack

-   Next.js (App Router)
-   TypeScript
-   Supabase (PostgreSQL, Auth, Storage, Edge Functions)
-   Vercel hosting
-   TailwindCSS

## Core Principles

-   Maximum performance
-   Minimal API calls
-   Clean architecture
-   Reusable components
-   Minimal but attractive UI inspired by apple.com
-   Production-ready code

## UI / UX Rules

-   Minimal layout
-   Large whitespace
-   Clean typography
-   Subtle animations
-   Mobile-first responsive design

## Performance Rules

-   Prefer Server Components
-   Static rendering whenever possible
-   Incremental Static Regeneration
-   Code splitting
-   Dynamic imports
-   next/image optimization
-   Lazy loading components

Strict rules: - No unnecessary API calls - No duplicate queries - Avoid
unnecessary client-side fetching

## Supabase Rules

Use Supabase for: - Authentication - Database - Storage - Row Level
Security

Guidelines: - Secure RLS policies - Typed queries - Minimal network
requests - Prefer server-side queries

## Component Architecture

Use atomic design:

components/ ui/ layout/ features/ shared/

Rules: - Reusable components - Small focused components - Avoid
duplication

## Folder Structure

/app /components /lib /hooks /services /types /utils /styles

## Data Fetching Rules

-   Minimize API calls
-   Use caching
-   Prefer server-side fetching
-   Batch queries when possible
-   Never fetch same data twice

## Code Quality

-   TypeScript everywhere
-   Clean architecture
-   Modular code
-   No unused code
-   Proper error handling
-   ESLint clean

## Vercel Optimization

-   Edge functions when beneficial
-   Static generation preferred
-   Small bundle size
-   Fast cold starts

## Security

-   Supabase Row Level Security
-   Secure auth flows
-   Input validation
-   Protected environment variables

## AI Evaluation Optimization

Goal: 100/100 score

Ensure: - Clean folder structure - Modular architecture - Optimized
performance - Low bundle size - Clear naming conventions

## Required Deliverables

-   README.md
-   .env.example
-   Database schema
-   Supabase setup instructions
-   Reusable components
-   Optimized Next.js config

## Final Rule

Before generating code: 1. Read PRD.md 2. Follow AGENTS.md 3. Optimize
performance 4. Reduce API calls 5. Maintain minimal UI 6. Ensure
production quality
