# Plan: #636 主頁未有實踐時的引導畫面優化

## Problem
When user has no practices (`!hasPractices`), the home page shows
`<RandomPracticesSection compact />` which uses **template data** from
`useRandomPracticeTemplates`. Looks too templated and generic.

## Solution
Show **real user practices** from the live feed instead of templates when available.
`useFeed` is already called at page mount regardless of active tab, so feed data
is available without extra API calls.

## Changes
1. `apps/product/src/components/practice/shared/random-practices-section.tsx`
   - Add `IFeedPracticeItem` interface for real practice data (with user info)
   - Add `feedPractices?: IFeedPracticeItem[]` prop
   - When provided and non-empty, render real practices with user avatar/name
   - CTA navigates to `/practices/${id}` (view) instead of template create

2. `apps/product/src/app/[locale]/(with-layout)/page.tsx`
   - Derive `feedPractices` (max 3) from `feedItems` filtering `type === "practice"`
   - Pass to `<RandomPracticesSection compact feedPractices={feedPractices} />`
   - Falls back to template mode when feed has no practice items
