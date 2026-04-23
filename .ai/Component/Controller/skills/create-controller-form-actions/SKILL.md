---
name: create-controller-form-actions
description: >
  Create the form page actions in the admin controller: create (add) and edit,
  plus any entity-specific actions. Uses FormBuilder/FormHandler pattern — never
  builds commands directly. Read Component/Controller/CONTEXT.md for controller
  conventions. Trigger: "create form actions for {Domain}", "create add/edit for {Domain}".
needs: [create-cqrs-commands, create-cqrs-queries, create-form-type, create-form-data-handling]
produces: "createAction, editAction, and entity-specific actions in {Domain}Controller.php"
---

# create-controller-form-actions

Read `@.ai/Component/Controller/CONTEXT.md` for controller conventions (base class, DI, security attributes, error mapping).
Read `@.ai/Component/Forms/CONTEXT.md` for form patterns (FormBuilder, FormHandler, FormDataProvider, FormDataHandler).

## 1. Create action

```php
#[AdminSecurity("is_granted('create', request.get('_legacy_controller'))")]
public function createAction(Request $request): Response
```

- GET: build form via `FormBuilder` service, render form template
- POST: handle request via `FormHandler` service — it internally calls `FormDataHandler::create()` which dispatches the Add command
- Never instantiate commands directly in the controller
- On success: flash message + redirect to index or edit page (return the new entity ID)
- On failure: re-render form with errors

**Reference:** `TaxController::createAction()`, `ManufacturerController::createAction()`

## 2. Edit action

```php
#[AdminSecurity("is_granted('update', request.get('_legacy_controller'))")]
public function editAction(int ${domain}Id, Request $request): Response
```

- GET: build form via `FormBuilder` with the entity ID — `FormDataProvider::getData($id)` is called internally to pre-fill the form
- POST: handle request via `FormHandler` — calls `FormDataHandler::update()` which dispatches Edit command
- Catch `{Domain}NotFoundException` → error flash, redirect to index (entity may have been deleted concurrently)

**Reference:** `TaxController::editAction()`, `ManufacturerController::editAction()`

## 3. Entity-specific actions

Some entities require additional actions beyond CRUD:

- **Image deletion:** `deleteCoverImageAction(int $id)` — dispatches a specific command
- **Export:** `exportAction(Request $request)` — generates CSV/PDF
- **View page:** `viewAction(int $id)` — read-only detail page (e.g. Customer, Order)
- **Position update:** `updatePositionAction(Request $request)` — handled by `PositionDefinition`

Follow the same conventions: security attributes, DI, exception handling, flash messages.

## Rules

- See `@.ai/Component/Controller/CONTEXT.md` for all controller conventions
- Never build commands manually — always go through FormBuilder/FormHandler
- FormDataProvider transforms query results into form-ready data, not the controller
- Catch NotFoundException on edit — the entity may have been deleted between page load and save
