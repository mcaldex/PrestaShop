---
step: 5
title: "Symfony Controller"
previous: step-04-grid.md
next: step-06-routing.md
deliverable: "src/PrestaShopBundle/Controller/Admin/.../XxxController.php with all actions wired to the command/query bus"
---

# Step 5 — Symfony Controller

Read `@.ai/Component/Controller/CONTEXT.md` for controller conventions (base class, DI, security attributes, error mapping, FormBuilder/FormHandler pattern).

## Micro-Skills

| Skill | Artifact | ⚠ |
|---|---|---|
| `create-controller-listing` | Listing actions (index, delete, toggle, bulk) | — |
| `create-controller-form-actions` | Form actions (create, edit) | — |

> **The controller must be committed together with `create-admin-routing` and `register-feature-flag`** — routes referencing an unregistered feature flag cause a 500.

## Migration-specific guidance

The skills above cover the general controller patterns. During migration, pay attention to:

### Mapping legacy actions to Symfony actions

| Legacy method | Symfony action | Notes |
|---|---|---|
| `renderList()` | `indexAction({Domain}Filters $filters)` | See `create-controller-listing` |
| `renderForm()` | `createAction()` / `editAction()` | See `create-controller-form-actions` |
| `processDelete()` | `deleteAction(int $id)` | |
| `processBulkDelete()` | `bulkDeleteAction(Request $request)` | |
| `processBulkEnableSelection()` | `bulkEnableStatusAction(Request $request)` | |
| `processStatus()` | `toggleStatusAction(int $id)` | Returns JSON |
| position update (if any) | `updatePositionAction(Request $request)` | Returns JSON |

### Error message mapping

Map every domain exception to a translatable flash message. Check the legacy controller's error handling to ensure all user-facing messages are preserved:

```php
private function getErrorMessages(): array
{
    return [
        {Domain}NotFoundException::class => $this->trans(
            '{Domain} not found.', [], 'Admin.Notifications.Error'
        ),
        CannotDelete{Domain}Exception::class => $this->trans(
            'Cannot delete this {domain}.', [], 'Admin.Notifications.Error'
        ),
        {Domain}ConstraintException::class => [
            {Domain}ConstraintException::INVALID_NAME => $this->trans(
                'Invalid name.', [], 'Admin.Notifications.Error'
            ),
        ],
    ];
}
```

### Position update action (if entity is reorderable)

```php
public function updatePositionAction(Request $request): JsonResponse
{
    // Use PositionDefinition service + PositionUpdateFactory
    // Returns JSON for the grid JS extension
}
```

## Checklist

- [ ] Controller extends `PrestaShopAdminController`
- [ ] All actions have `#[AdminSecurity]` and `#[DemoRestricted]` attributes
- [ ] Listing actions: index, delete, toggle, bulk (per grid definition)
- [ ] Form actions: create, edit (using FormBuilder/FormHandler)
- [ ] Toggle and position actions return JSON
- [ ] `getErrorMessages()` maps all domain exceptions
- [ ] Controller, routing, and feature flag committed together
