---
step: 7
title: "Form"
previous: step-06-routing.md
next: step-08-frontend.md
deliverable: "src/PrestaShopBundle/Form/Admin/ types + Core/Form/IdentifiableObject/ DataProvider and DataHandler, all wired in DI YAML"
---

# Step 7 — Form

Read `@.ai/Component/Forms/CONTEXT.md` for the IdentifiableObject pattern (FormBuilder, FormHandler, DataProvider, DataHandler) and form conventions.

## Micro-Skills

| Skill | Artifact | ⚠ |
|---|---|---|
| `create-form-type` | `Form/Admin/{Section}/{Domain}/{Domain}Type.php` + field types | — |
| `create-form-tab-layout` | `NavigationTabType`-based tab structure | if multi-tab form |
| `create-form-data-handling` | DataProvider + DataHandler + DI registration | — |

## Migration-specific guidance

The skills above cover the general form patterns. During migration, pay attention to:

### Mapping legacy form fields to Symfony types

Review every field from `renderForm()` in the legacy controller:

| Legacy field type | Symfony/PS form type |
|---|---|
| `text` | `TextType` |
| `text` with `lang => true` | `TranslatableType` wrapping `TextType` |
| `textarea` | `TextareaType` or `FormattedTextareaType` (rich text) |
| `bool` / checkbox | `SwitchType` (PS toggle switch) |
| `select` with static options | `ChoiceType` |
| `select` with DB options | `ChoiceType` + `ChoiceProvider` service |
| `file` / image | `FileType` with MIME constraints |
| `categories` / tree | `ChoiceTree` or `EntitySearchInputType` |
| `group access` | `EntitySearchInputType` with `multiple => true` |
| `shop association` | `ShopChoiceTreeType` |

### Form structure: simple vs tabs

- **Most forms are simple** — extend `TranslatorAwareType`, add all fields in `buildForm()`. No tabs needed.
- **Complex forms** with many fields use `NavigationTabType` via `getParent()` — see `create-form-tab-layout` skill. This is the exception, not the default.

### DataProvider array structure

The array returned by `getData()` must exactly match the form type structure. Map every DTO field:

- Nested arrays for tab sub-forms: `['general' => ['name' => ...], 'shipping' => [...]]`
- `getDefaultData()` must return the same structure with sensible defaults
- Multilingual fields: arrays keyed by integer language ID

### DataHandler: dispatching commands

- `create()`: build `Add{Domain}Command` from `$data`, dispatch, return new ID
- `update()`: build `Edit{Domain}Command` with setters for each field, dispatch
- Sub-resource commands dispatched separately after the main command
- Multiple commands from one `update()` is normal and expected

### Service registration

See `create-form-data-handling` skill for the DI YAML pattern. Key services:
- Form type (tagged `form.type`)
- DataProvider + DataHandler (autowired)
- FormBuilder + FormHandler (framework wrappers — see Forms CONTEXT.md)

## Checklist

- [ ] Form type created with appropriate fields mapped from legacy audit
- [ ] Tab layout used only if the form has many fields (NavigationTabType exception)
- [ ] DataProvider `getData()` maps every DTO field to the form's array structure
- [ ] DataProvider `getDefaultData()` returns sensible defaults matching the same structure
- [ ] DataHandler dispatches Add/Edit commands + sub-resource commands
- [ ] All services registered in DI YAML
