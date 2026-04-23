# Grid Component

## Purpose

Infrastructure for rendering and managing back-office data tables: column definitions, filters, row/bulk actions, query builders, data factories, and drag-and-drop position reordering. Does not contain any business data — each domain provides its own `GridDefinitionFactory` and Doctrine query builder.

## Layers

| Layer | Path |
|-------|------|
| Core contracts + factory | `src/Core/Grid/` |
| Column types, row/bulk actions | `src/Core/Grid/Column/`, `src/Core/Grid/Action/` |
| Query builder base | `src/Core/Grid/Query/AbstractDoctrineQueryBuilder.php` |
| Position updater | `src/Core/Grid/Position/` |
| Adapter utilities | `src/Adapter/Grid/` |

## Non-obvious patterns

- `AbstractGridDefinitionFactory` dispatches `action{GridId}GridDefinitionModifier` hook — modules add columns/actions without touching core code
- `SearchCriteriaInterface` is stored as a Symfony request attribute per grid, not a service — each grid type has its own `{Domain}Filters` class present in `src/Core/Search/Filters`
- For specific use cases a dedicated filter builder may be needed — see `src/Core/Search/Builder/TypedBuilder`
- Position updater (`GridPositionUpdater`) lives inside the Grid source tree but can be used by any entity that supports manual ordering, independent of grid rendering
- 60+ concrete query builders exist (one per domain grid) — all extend `AbstractDoctrineQueryBuilder` and implement `getSearchQueryBuilder()` + `getCountQueryBuilder()`

## Canonical examples

- `src/Core/Grid/Definition/Factory/AbstractGridDefinitionFactory.php` — base class showing the pattern every grid definition must follow
- `src/Core/Grid/Definition/Factory/ProductGridDefinitionFactory.php` — concrete implementation
- `src/Core/Grid/Query/LanguageQueryBuilder.php` — simple concrete query builder

## Factory trilogy (data flow)

Three factories work together to produce a renderable grid:

1. **`GridDefinitionFactory`** — defines structure: columns, filters, row actions, bulk actions. Each domain implements one extending `AbstractGridDefinitionFactory`. Hook `action{GridId}GridDefinitionModifier` allows modules to add columns/actions
2. **`GridDataFactory`** — retrieves data. `DoctrineGridDataFactory` delegates to a `DoctrineQueryBuilderInterface` implementation to execute SQL based on `SearchCriteria`. Returns `GridData` (RecordCollection + total count)
3. **`GridFactory`** — orchestrates: combines definition + data factory, resolves filters, dispatches hooks. This is what the controller calls: `$gridFactory->getGrid($filters)`

### GridDataFactory decoration

When grid data needs post-processing (e.g. resolving image URLs from IDs, formatting computed columns), decorate the `GridDataFactory` instead of modifying the query builder:

- Create a decorator implementing `GridDataFactoryInterface`
- Inject the original factory, call `getData()`, then transform the `RecordCollection`
- Register with `decorates:` in DI YAML

### SearchCriteria and {Domain}Filters

- `{Domain}Filters` (in `src/Core/Search/Filters/`) extends `Filters` which implements `SearchCriteriaInterface` — it is NOT a form type
- It defines defaults (grid ID, default sort column/direction, default limit)
- Injected into the controller's index action via argument resolver: `indexAction({Domain}Filters $filters)`
- Filter values come from the grid filter bar (saved in session by `CommonController::searchGridAction`)

## Related

- [Forms Component](../Forms/CONTEXT.md) — filter forms use `FormChoiceProviderInterface`
- [Hook Component](../Hook/CONTEXT.md) — `action{GridId}GridDefinitionModifier` hook for module extensibility
- [PositionUpdater Component](../PositionUpdater/CONTEXT.md) — drag-and-drop reordering sub-layer
