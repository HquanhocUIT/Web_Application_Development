# AI Failure Audit

This report records real issues found in the project. It separates application and documentation mistakes from browser and tooling limits. The accessibility issue below remains unverified after the code change.

## Case 1: Horizontal scrolling also moved the search field

### 1. AI prompt or requirement

The responsive requirement asked for horizontal scrolling inside the table area on small screens while keeping the search control usable.

### 2. AI-generated code with the problem

Before M7-01, `.data-grid-container` had `overflow-x: auto` and contained both `.data-grid-search` and the table. This is visible in the M6 version of `src/components/DataGrid.css` and `src/components/DataGrid.tsx`.

### 3. Problem and risk

Horizontal scrolling the wide table also scrolled the search field out of view. On a small screen, users could lose access to search while inspecting later columns.

### 4. How it was found

During M7-01, source review showed that the search and table were descendants of the same horizontal scroll container. The requested viewport review identified that this structure did not confine scrolling to the table. A browser screenshot was unavailable, so the visual effect was not measured directly.

### 5. Fix

The horizontal overflow was moved to a wrapper around only the table:

```tsx
<div className="data-grid-table-scroll">
  <table className="data-grid-table" role="grid">
    {/* semantic table content */}
  </table>
</div>
```

```css
.data-grid-table-scroll {
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
}
```

### 6. Result and evidence

Vite SSR assertions confirmed the table scroll wrapper is rendered. `npm run build`, `npm run lint`, and `git diff --check` passed. The change is in the current M7 diff. Actual scrolling at 320, 375, 768, and 1280 CSS pixels remains unverified because the browser could not start.

## Case 2: Row selection was not exposed in the Accessibility Tree

### 1. AI prompt or requirement

M6-02 required selection with Enter and Space and an accessible selected state. M6-03 asked to verify that screen readers could detect the selected row.

### 2. AI-generated code with the problem

An intermediate implementation set `aria-selected` on the row, but Chrome inspection reported that the Accessibility Tree did not expose the row as selected. The relevant state is represented by:

```tsx
<tr aria-selected={isSelected}>
```

### 3. Problem and risk

If the selected state is missing from the accessibility representation, screen-reader users may not know which row is selected. The exact browser mapping cause was not isolated.

### 4. How it was found

The issue was reported during the M6 accessibility review: the DOM showed `aria-selected="true"`, while the Accessibility Tree did not show selected. WBS records this check as unresolved.

### 5. Code change made

The M6 implementation added explicit grid roles while keeping the semantic table and row selection state:

```tsx
<table role="grid">
  <tr role="row" aria-selected={isSelected}>
    <td role="gridcell">...</td>
  </tr>
</table>
```

This was a remediation attempt; it is not claimed as a confirmed fix.

### 6. Result and evidence

Vite SSR confirms the grid and row markup, and confirms `aria-selected="false"` for the initial page. It cannot exercise a selected row or inspect an Accessibility Tree. Edge headless exited with a GPU error, so the selected state after the role change remains **unverified**. M6 stays in verification status. The implementation is in commit `bdf9076` (`feat: implement keyboard navigation and accessibility`); the verification limitation is recorded in `TASK_DECOMPOSITION.md`.

## Case 3: WBS milestone status was inconsistent

### 1. AI prompt or requirement

The WBS was meant to track completed milestones and their Git commits accurately.

### 2. AI-generated section with the problem

The milestone summary marked M4 complete, but the detailed heading said `M4: Sorting và Filtering — Đang thực hiện`.

### 3. Problem and risk

The conflicting status could make the student repeat completed work or misunderstand the current milestone.

### 4. How it was found

The inconsistency was found by comparing the two WBS status entries with Git history. Commit `0b7ef99` is titled `feat: implement sorting and filtering`, while the summary row already said M4 was complete.

### 5. Fix

The detailed WBS heading now says `M4: Sorting và Filtering — Hoàn thành`, matching the summary and commit history.

### 6. Result and evidence

The two M4 status entries now agree. `git diff --check` passed after the correction. This was a documentation error, not an application defect.

## Environment limits (not AI failures)

Edge headless exited with `GPU process isn't usable` and did not create a screenshot. The Lighthouse CLI was not installed, and an offline package lookup failed with `ENOTCACHED`. These are environment/tooling limits, not application defects. No Lighthouse scores, viewport screenshots, browser-console results, or post-fix Accessibility Tree results are claimed.
