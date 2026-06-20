# ADR-003: Supabase as the Backend

**Date:** 2026-06-20  
**Status:** Accepted  
**Deciders:** Product Architecture

---

## Context

The platform needs: a relational database, authentication, file storage, and a real-time-capable API — all with minimal backend infrastructure to maintain.

Options evaluated:
1. Supabase (PostgreSQL + Auth + Storage + RLS)
2. Firebase (Firestore + Auth + Storage)
3. PlanetScale + Clerk + S3
4. Custom Node.js/NestJS + PostgreSQL

## Decision

**Use Supabase as the complete backend.**

## Rationale

- Supabase provides PostgreSQL — the correct choice for relational expense data with complex queries
- Supabase Auth handles Google, Microsoft, and Magic Link out of the box
- Supabase Storage handles receipt files with access policies
- Row Level Security provides data isolation at the database layer — no app-layer filtering needed
- Supabase generates typed client libraries from the schema
- The project architect and development tooling (Claude Code) is optimized for this stack
- Vercel + Supabase is a well-documented, production-proven combination

## Consequences

**Positive:**
- Single vendor for database, auth, storage
- No backend API server to maintain
- RLS is enforced at database level — cannot be bypassed by application bugs
- Auto-generated TypeScript types from schema

**Negative:**
- Supabase vendor lock-in
- Cold start latency on free tier edge functions
- RLS complexity as the data model grows

## Constraints

- service_role keys must never be exposed to frontend code
- All table access must go through the typed client, not raw SQL from frontend
- RLS must be enabled on every table before launch

## Alternatives Considered

**Firebase:** Rejected. Firestore is document-oriented, poor fit for relational expense data with multi-table joins.

**Custom backend:** Rejected. Too much infrastructure overhead for MVP.
