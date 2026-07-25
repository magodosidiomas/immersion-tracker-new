# Navigation pattern — overlays vs. `navigate()`

## The rule

**If a screen has in-progress state worth keeping (a draft), any subflow
opened from inside it must be an overlay — never `navigate()`.**

`navigate()` swaps `screen` and unmounts everything currently rendered.
That's correct when the person is genuinely leaving (Home → Settings). It's
wrong when they're briefly stepping into a side task — "gerenciar séries",
"adicionar série", "vincular sessão" — and expect to land back exactly where
they were, with whatever they'd already typed still there.

An overlay renders on top of the current screen without unmounting it, so
the draft underneath is never touched.

## How it works (`overlayStack` in `App.jsx`)

Every overlay in the app — link-content, link-session, manual-session,
manual-content, manage (séries/filmes/livros), session — is one entry in a
single array:

```js
const [overlayStack, setOverlayStack] = useState([])
```

Three functions are the entire mechanism:

- `pushOverlay(layer)` — appends `{ type, ...payload }` and pushes a browser
  history entry carrying the whole stack.
- `replaceTopOverlay(layer)` — same, but swaps the last entry instead of
  adding one (used only when drilling further into a layer that has no
  draft of its own worth keeping, e.g. Gerenciar séries → sessões).
- `closeOverlay()` — always just `window.history.back()`.

`navigate()` and `navigateSettingsWindow()` reset the stack to `[]`. The
single `popstate` listener mirrors `history.state.overlayStack` straight
back into state. That's it — there is no per-overlay boolean, no per-overlay
entry in the popstate listener, and no per-overlay reset line in `navigate()`.

## Adding a new subflow

1. Give it a `type` string.
2. Call `pushOverlay({ type: 'whatever', ...anyPayload })` from wherever it
   opens.
3. Add one render clause in `App.jsx` reading
   `overlayStack.find((l) => l.type === 'whatever')`.
4. Close it with `closeOverlay()` (wrap it if you need a side effect, like
   bumping a refresh tick — see `closeManageOverlay`).

Nothing else changes. `navigate()`, `navigateSettingsWindow()`, and the
`popstate` listener are already generic — that's the whole point of this
pattern. If you find yourself adding a new `useState` next to `overlayStack`
for a subflow's open/closed status, that's the sign to use `pushOverlay`
instead.

## Why this exists

Before this, each overlay (`pickerScreen`, `manualSessionOverlay`,
`manualContentOverlay`, `manageOverlay`, `sessionOverlay`) was its own
`useState`, each requiring the same four manual steps wired in three
different places (its own open function, a reset line inside `navigate()`,
and a restore line inside the `popstate` listener). Missing any one of
those steps — easy to do, since two of them live far from where you're
actually adding the feature — is what caused the "subflow loses the parent
draft on back" bug repeatedly. Consolidating into one array removes the
possibility of forgetting a step, because there's no longer a step to add
outside of the overlay's own render clause.
