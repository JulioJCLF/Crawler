# Reliability

## Overview
Pure business logic functions and alerting rules for workflow reliability, detecting unexpected category drops and crawler run failures without external runtime side effects.

## Interface
- `CategoryCount`: Interface defining category metadata (`slug`, `label`, `count`).
- `CategoryDrop`: Interface representing detected drop anomaly (`slug`, `label`, `previousCount`, `currentCount`).
- `CATEGORY_DROP_MIN_PREVIOUS_COUNT: number = 10`: Minimum item count in previous snapshot required to trigger drop detection.
- `CATEGORY_DROP_RATIO: number = 0.5`: Fractional loss threshold (50%) qualifying as an abrupt drop.
- `detectCategoryDrops(currentCategories: CategoryCount[], previousCategories: CategoryCount[] | null): CategoryDrop[]`: Compares category counts against previous snapshot to identify abnormal drops.
- `FAILURE_ISSUE_LABEL: string = "alerta-execucao"`: GitHub label for workflow failure issues.
- `FAILURE_ISSUE_TITLE: string = "arsenal-watch: execução diária falhou"`: Title for workflow failure issues.
- `buildFailureIssueBody(runUrl: string, now: string): string`: Renders issue markdown description for workflow failure.
- `buildRecoveryComment(now: string): string`: Renders resolution message when workflow recovers.
- `FailureAction`: Discriminated union of issue lifecycle actions (`create`, `update`, `close`, `none`).
- `DecideFailureActionParams`: Input parameters for failure state transitions.
- `decideFailureAction(params: DecideFailureActionParams): FailureAction`: Pure state transition decider for failure issues.
- `CATEGORY_ALERT_LABEL: string = "alerta-categoria"`: GitHub label for category drop alert issues.
- `CATEGORY_ALERT_TITLE: string = "arsenal-watch: queda brusca de produtos numa categoria"`: Title for category drop issues.
- `buildCategoryAlertBody(drops: CategoryDrop[], now: string): string`: Formats markdown issue description for category drops.
- `buildCategoryRecoveryComment(now: string): string`: Formats resolution message when categories normalize.
- `CategoryAlertAction`: Discriminated union of category alert lifecycle actions (`create`, `update`, `close`, `none`).
- `DecideCategoryAlertActionParams`: Input parameters for category drop alert transitions.
- `decideCategoryAlertAction(params: DecideCategoryAlertActionParams): CategoryAlertAction`: Pure state transition decider for category drop issues.

## Invariants
- Functions are strictly pure and do not perform I/O, network calls, or direct GitHub CLI interactions.
- `detectCategoryDrops` returns an empty array if `previousCategories` is null (e.g. first execution with no prior snapshot).
- Only categories existing in both previous and current executions are evaluated; newly discovered categories never trigger drop alerts.
- A drop requires `previousCount >= CATEGORY_DROP_MIN_PREVIOUS_COUNT` (10) and either `currentCount === 0` or drop ratio `>= CATEGORY_DROP_RATIO` (0.5).
- Alert decision functions never duplicate open issues; they return `update` if an issue is already open and `create` only if none exists.
- An open alert is closed automatically on recovery with a descriptive comment.

## Side Effects
- None (pure computational functions).

## Verification
- Run: `cd backend && npm test`
