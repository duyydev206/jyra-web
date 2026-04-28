# Timeline Maintenance Notes

## Purpose

This document captures the current Timeline behavior and the refactor plan for making Timeline code cleaner, more maintainable, and more performant without changing the current user experience.

Read this before changing files under:

```text
src/features/editor/components/timeline
src/features/editor/lib/build-clip-layouts.ts
src/features/editor/lib/build-track-lane-layouts.ts
src/features/editor/lib/timeline-math.ts
src/features/editor/lib/timeline-zoom-engine.ts
src/features/editor/stores/editor.store.ts
```

## Non-Negotiable Rule

Keep current Timeline behavior working exactly as it does now unless the user explicitly requests a behavior change.

UI markup and Tailwind classes should be preserved unless a bug fix requires a minimal targeted edit.

## Current Behavior Contract

### Timeline Layout

- Timeline has a sticky ruler at the top of the scrollable timeline area.
- Track headers stay sticky on the left.
- Track corner must stay fixed at the top-left of the timeline viewport.
- Playhead viewport layer must stay fixed relative to the visible timeline viewport, not scroll vertically with content.
- Timeline content height is based on `RULER_HEIGHT + displayedLaneResult.totalHeight`.
- Ruler, clips, and playhead must share the same frame-to-pixel system from `timeline-math`.

### Ruler And Playhead

- Clicking or dragging the ruler seeks the shared player frame.
- Playhead can be scrubbed directly.
- Playhead can sit on the end boundary.
- Playhead line height must follow timeline layer height, not a hardcoded SVG path.
- Timeline panel resizing must not trigger ruler seek or playhead scrub.

### Zoom And Ruler Scale

- `computeTimelineZoom` is the single source of truth for `timelineWidth`, `visibleDurationInFrames`, `pixelsPerFrame`, and `tickFrames`.
- Timeline passes the measured scroll viewport width into `computeTimelineZoom`.
- At zoom `1x`, timeline content width fits the visible viewport area after the track header, so projects of different lengths start with all clips in view.
- Zooming above `1x` expands the timeline width from that measured viewport baseline by a duration-aware growth step.
- Short projects use a minimum growth step derived from viewport width, while longer projects grow by project seconds.
- Zoom width must keep increasing through zoom levels; do not cap width in a way that makes later zoom steps stop changing.
- Visible duration is project duration plus tail padding, then snapped to the selected tick unit.
- Tail padding scales with duration bucket: short projects get seconds of extra ruler space, long projects get minutes.
- Empty and very short projects always show at least 10 seconds of ruler space.
- Ruler tick unit is selected from real pixel density and a target marker density, not a fixed duration-to-zoom map. This prevents unreadably dense labels on long projects and allows finer ticks as zoom increases.
- Tick spacing has a practical readable range and tick unit should become finer as zoom grows, but tick density must not block timeline width growth.
- Supported whole-time tick units follow `1 / 5 / 10 / 30 / 60`, including seconds, minutes, and hours. Do not add `2x` or `15x` interval units.
- The `15f` ruler mode only shows each second boundary and the `+15f` marker for that second.
- Ruler labels use project duration, not visible padded duration: projects under 1 hour use `MM:SS`, projects from 1 hour use `HH:MM:SS`.
- Frame labels are only shown for very short projects when `15f` zoom detail is active; otherwise `15f` markers stay symbolic without full timecode labels.
- `15f` tick mode must not appear before zoom level 3.
- When `15f` tick mode is active, all ruler labels use `MM:SS:FF` without an `f` suffix so labels stay visually consistent.
- Symbolic `15f` markers are drawn halfway between two second markers. Their label is only a visual ruler hint and must not change frame-to-pixel math, seeking, playhead position, or preview sync.
- Ruler labels, clip width, drag frame math, and playhead position must all use the same `pixelsPerFrame`.

### Timeline Panel Resize

- Dragging the timeline resize handle changes timeline panel height.
- Resize handle captures pointer during resize.
- Ruler and playhead interactions are disabled while resizing.
- Resizing must not move the playhead.

### Clip Drag/Drop

- The real source clip is hidden while dragging to avoid transformed DOM overflow expanding the scroll container.
- The moving dragged clip is rendered through `DragOverlay`.
- The moving dragged clip should look like the real clip.
- The target ghost/placeholder is a rounded gray block without border.
- dnd-kit `autoScroll` stays disabled.
- Timeline uses custom bounded drag auto-scroll.

### Lane Creation Rules

- If timeline has only one lane, drag/drop must not create additional lanes.
- Dragging above the top lane can create a new lane only when there is more than one lane.
- Dragging below the bottom lane can create a new lane only when there is more than one lane.
- Top/bottom lane creation shows a temporary lane preview while dragging.
- Dragging between two existing lanes shows a blue gap line only when both adjacent lanes have at least one real clip.
- The dragged clip does not count as occupying its source lane while it is being dragged.
- Dropping on a valid between-lane gap creates a new lane at that position.
- After drop, empty lanes are cleaned up.

### Clip Movement Rules

- Clips can move horizontally by frame.
- Clips can move vertically between lanes.
- Drops onto overlapping clips walk forward to the next available non-overlapping frame.
- Moving a clip recalculates project duration.
- Moving a clip syncs layer indexes with track order so preview stacking matches timeline order.
- Locked clips or locked tracks should not move.

### Selection And Delete

- Clicking a clip selects it.
- Selected clips render selected styling.
- Delete/Backspace removes selected clips unless focus is in an editable element.
- Deleting clips removes empty tracks and recalculates project duration.

## Current Code Map

### Main Timeline Orchestrator

```text
src/features/editor/components/timeline/index.tsx
```

Current responsibilities:

- Reads project, clips, tracks, current timeline UI state.
- Computes zoom with `computeTimelineZoom`.
- Computes lane layouts with `buildTrackLaneLayouts`.
- Computes clip layouts with `buildClipLayouts`.
- Builds temporary preview tracks while dragging top/bottom lane insert targets.
- Computes drop previews for clip drag/drop.
- Implements drag auto-scroll.
- Handles dnd-kit drag lifecycle.
- Handles keyboard delete.
- Handles timeline panel resize.
- Renders toolbar, track headers, ruler, body, playhead layer.

This file is currently the main Timeline complexity hotspot.

### Timeline Pure Layout Logic

```text
src/features/editor/lib/build-track-lane-layouts.ts
src/features/editor/lib/build-clip-layouts.ts
src/features/editor/lib/timeline-math.ts
src/features/editor/lib/timeline-zoom-engine.ts
src/features/editor/lib/timeline-zoom-spec.ts
```

These are closer to reusable logic and should become the foundation for tests.

### Timeline Components

```text
src/features/editor/components/timeline/components/timeline-ruler.tsx
src/features/editor/components/timeline/components/timeline-toolbar.tsx
src/features/editor/components/timeline/components/timeline-body
src/features/editor/components/timeline/components/timeline-item
src/features/editor/components/timeline/components/timeline-track-headers
src/features/editor/components/timeline/components/timeline-playhead-viewport-layer.tsx
src/features/editor/components/timeline/components/playhead.tsx
```

These should remain mostly presentational after refactor. Interaction-heavy logic should move into hooks or pure helpers.

### Store Logic

```text
src/features/editor/stores/editor.store.ts
```

Timeline-related store responsibilities currently include:

- timeline zoom actions
- timeline viewport actions
- timeline toolbar toggles
- track mute/hide actions
- clip add/move/delete actions
- track creation during move
- empty track cleanup
- layer index sync

This should eventually be split into domain actions and pure helpers.

## Known Technical Debt

### `timeline/index.tsx` Is Too Large

It mixes rendering, layout derivation, drag/drop state, scroll math, panel resize, keyboard handling, and temporary lane preview logic.

Risk:

- Small changes can unintentionally break unrelated behavior.
- Performance tuning is harder because derived state and event handlers are tightly coupled.

Target:

- Keep `Timeline` as an orchestrator, but move logic into focused hooks/helpers.

### Drag/Drop Math Is Not Isolated

Drop preview computation currently lives inside `Timeline`.

Risk:

- Hard to test top/bottom insert, between-lane gap, occupied-lane rules, scroll delta, and overlap behavior.

Target:

- Extract drop target calculation into a pure helper.

### Auto-Scroll Is Inline

Custom bounded auto-scroll is necessary, but currently lives inline.

Risk:

- Hard to tune thresholds and verify scroll bounds.

Target:

- Extract to `useTimelineDragAutoScroll`.

### Temporary Track Preview Is Inline

Preview track insertion is currently built in `Timeline`.

Risk:

- Hard to reason about display tracks versus persisted tracks.

Target:

- Extract to `buildTimelinePreviewTracks`.

### Store Clip/Track Mutation Logic Is Too Centralized

`editor.store.ts` still contains track creation, empty track cleanup, overlap handling, and layer sync.

Risk:

- Timeline UI and project mutation rules are coupled through large store actions.

Target:

- Extract pure store helpers before adding more editing features.

## Performance Goals

Timeline must remain smooth for:

- many clips
- many tracks
- long projects measured in hours
- heavy media assets
- frequent drag, resize, scroll, scrub, and playback updates

Principles:

- Derived layout data should be memoized.
- Components should subscribe to narrow store slices.
- Continuous pointer interactions should avoid writing project state until commit where possible.
- Frame updates should not re-render the full timeline.
- Drag overlays and previews must not expand scrollable layout.
- Browser `scrollWidth` should not be trusted during drag if temporary absolute previews can affect overflow.
- Large projects will eventually need virtualization.

## Refactor Plan

### Phase 1: Extract Timeline Constants And Types

Goal:

- Reduce clutter in `timeline/index.tsx`.

Create:

```text
src/features/editor/components/timeline/timeline.constants.ts
src/features/editor/components/timeline/timeline-drag.types.ts
```

Move:

- panel height constants
- drag auto-scroll constants
- lane gap constants
- preview track id
- `ClipDropPreview` type
- `TimelineBoundaryScrollEvent` type

Behavior:

- No behavior change.

Verification:

- `npm run lint`
- `npm run build`

### Phase 2: Extract Preview Track Builder

Goal:

- Separate temporary UI-only track derivation from rendering.

Create:

```text
src/features/editor/components/timeline/lib/build-timeline-preview-tracks.ts
```

Move:

- `getPreviewTrackKind`
- `getTracksWithInsertPreview`

Inputs:

- persisted tracks
- clips
- dragging clip id
- clip drop preview

Output:

- displayed tracks

Behavior:

- No behavior change.

### Phase 3: Extract Drop Preview Calculation

Goal:

- Make lane creation rules explicit and testable.

Create:

```text
src/features/editor/components/timeline/lib/get-clip-drop-preview.ts
```

Move logic for:

- effective drag delta
- requested frame clamp
- top boundary lane insert
- bottom boundary lane insert
- between-lane gap line eligibility
- occupied adjacent lane checks
- target lane lookup
- non-overlap visual frame walking

Important behavior to preserve:

- no lane creation if only one lane
- top/bottom create lane preview
- between occupied lanes show line
- dragged clip excluded from lane occupancy
- line drop creates lane on commit
- empty lanes cleanup after commit is still store responsibility

### Phase 4: Extract Drag Auto-Scroll Hook

Goal:

- Keep bounded custom drag auto-scroll but isolate it.

Create:

```text
src/features/editor/components/timeline/hooks/use-timeline-drag-auto-scroll.ts
```

Responsibilities:

- store drag start pointer and scroll origin
- compute effective drag delta after scroll changes
- scroll near viewport edges
- clamp horizontal scroll to canonical timeline width
- clamp vertical scroll to timeline content height

Important:

- Do not re-enable dnd-kit `autoScroll`.
- Do not use live `scrollWidth` as the source of truth during drag.

### Phase 5: Extract Timeline Panel Resize Hook

Goal:

- Keep panel resize isolated from ruler/playhead interactions.

Create:

```text
src/features/editor/components/timeline/hooks/use-timeline-panel-resize.ts
```

Responsibilities:

- pointer capture on resize handle
- calculate next panel height
- expose `isTimelinePanelResizing`
- cleanup pointer listeners

Behavior:

- Ruler and playhead interactions remain disabled while resizing.

### Phase 6: Extract Keyboard Shortcuts Hook

Goal:

- Remove global keydown wiring from `Timeline`.

Create:

```text
src/features/editor/components/timeline/hooks/use-timeline-keyboard-shortcuts.ts
```

Initial responsibility:

- Delete/Backspace selected clips unless editable target has focus.

Future:

- split
- copy/paste
- undo/redo
- frame step
- play/pause

### Phase 7: Add Tests For Pure Timeline Logic

Goal:

- Protect Timeline behavior before larger performance work.

Recommended tests:

- lane layout calculation
- clip layout calculation
- timeline zoom calculation
- top/bottom lane insert preview
- no lane creation with one lane
- between-lane gap only when both adjacent lanes are occupied
- dragged clip excluded from occupancy
- requested frame clamp
- non-overlap visual walking
- bounded drag auto-scroll clamp

### Phase 8: Performance Pass

Goal:

- Prepare for large projects.

Work:

- Audit broad store subscriptions in Timeline subtree.
- Avoid passing full `project` where smaller slices are enough.
- Memoize maps:
  - track by id
  - lane by track id
  - clip by id
  - clips by track id
- Reduce re-renders during drag by keeping transient drag state local.
- Consider rendering only visible clips in viewport.
- Plan virtualization for lanes and clips.

## Proposed Future File Structure

```text
src/features/editor/components/timeline/
  index.tsx
  timeline.constants.ts
  timeline-drag.types.ts
  hooks/
    use-timeline-drag-auto-scroll.ts
    use-timeline-panel-resize.ts
    use-timeline-keyboard-shortcuts.ts
    use-timeline-boundary-scroll.ts
  lib/
    build-timeline-preview-tracks.ts
    get-clip-drop-preview.ts
    get-timeline-lane-occupancy.ts
  components/
    timeline-ruler.tsx
    timeline-toolbar.tsx
    timeline-playhead-viewport-layer.tsx
    playhead.tsx
    timeline-body/
    timeline-item/
    timeline-track-headers/
```

## Refactor Safety Checklist

For every Timeline refactor:

- Keep UI behavior unchanged unless explicitly requested.
- Do not re-enable dnd-kit `autoScroll`.
- Do not move source clip DOM with dnd-kit transform while dragging.
- Keep `DragOverlay` for pointer-following dragged clip.
- Keep target ghost as gray no-border placeholder.
- Keep single-lane no-create rule.
- Keep empty lane cleanup after drop.
- Keep ruler/playhead disabled during panel resize.
- Run `npm run lint`.
- Run `npm run build`.
- Update `MAINTENANCE_PLAN.md` and this file if behavior, architecture, or risks change.

## Next Recommended Step

Start with Phase 1 and Phase 2 only:

1. Extract constants/types.
2. Extract preview track builder.
3. Run lint/build.
4. Confirm no visual behavior changed.

Do not start with drag/drop logic extraction first. It is the riskiest part and should be moved only after constants and preview track derivation are separated.
