---
step: 8
title: "Frontend"
previous: step-07-form.md
next: step-09-twig-templates.md
deliverable: "admin-dev/themes/new-theme/js/pages/{domain}/ with TS entry points and optional Vue components"
---

# Step 8 — Frontend

Read `@.ai/Component/Javascript/CONTEXT.md` for the JS architecture (entry points, `initComponents`, grid extensions, Vue exception).

## Micro-Skills

| Skill | Artifact | ⚠ |
|---|---|---|
| `create-ts-entry-point` | `js/pages/{domain}/index.ts` + `form.ts` + webpack entry | — |
| `init-grid-extensions` | Grid JS extensions in listing entry point | — |
| `init-js-components` | `initComponents()` calls in form entry point | — |
| `create-vue-component` | Vue SFC for complex UI sections | only if Vue needed |

## Standard case (most pages)

**Most pages need NO custom Vue components.** The standard pattern is:

1. **Listing page** (`index.ts`): create Grid instance + add extensions — see `init-grid-extensions`
2. **Form page** (`form.ts`): call `initComponents()` with the components this form needs — see `init-js-components`
3. **Register both** in webpack config — see `create-ts-entry-point`

This covers Tax, Manufacturer, Category, Employee, and most other admin pages.

## Exception: Vue components (complex pages only)

Vue is needed only when a section of the page requires rich interactivity that standard form types and JS components cannot provide:

- Dynamic multi-row tables (e.g. carrier shipping ranges per zone)
- Interactive components with real-time cross-field synchronization
- Custom modals with multi-step workflows

See `create-vue-component` skill for the integration pattern (mount on a DOM section, communicate via EventEmitter, sync via hidden fields).

**Reference:** `admin-dev/themes/new-theme/js/pages/product/combination/` — combination listing with Vue filters and generator

## Checklist

- [ ] Listing entry point (`index.ts`) created with grid extensions
- [ ] Form entry point (`form.ts`) created with `initComponents()` for needed components
- [ ] Both entry points registered in webpack config
- [ ] Twig templates include the compiled bundles (see Step 9)
- [ ] If Vue needed: Vue SFC created, mounted on specific DOM section, synced to hidden fields
