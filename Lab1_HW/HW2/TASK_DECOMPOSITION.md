# TASK DECOMPOSITION

## HW2: Drum Kit Engine (Contract-First)

### M1: HTML Data-Sound Contract
- Task M1-01: Create semantic drum kit structure.
- Task M1-02: Add drum pad buttons.
- Task M1-03: Define `data-sound` attributes.
- Task M1-04: Add audio source mappings.
- Commit: `feat(contract): define data-sound HTML contract`

### M2: Polyphonic Audio Engine
- Task M2-01: Read sound contract from DOM.
- Task M2-02: Implement independent audio playback.
- Task M2-03: Support overlapping sound playback.
- Task M2-04: Verify multiple sounds can play concurrently.
- Commit: `feat(audio): implement polyphonic playback engine`

### M3: Keyboard Input Engine
- Task M3-01: Define keyboard-to-sound bindings.
- Task M3-02: Add keydown event listener.
- Task M3-03: Ignore repeated keydown events.
- Task M3-04: Verify keyboard playback.
- Commit: `feat(input): add throttled keyboard controls`

### M4: FIFO Beat Recorder
- Task M4-01: Create timestamped event queue.
- Task M4-02: Record triggered drum events.
- Task M4-03: Preserve FIFO event order.
- Task M4-04: Verify recorded beat sequence.
- Commit: `feat(recorder): implement FIFO beat recorder`