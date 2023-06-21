# @lambda-ui/slate-preact

`slate-react` ported to Preact and Deno.

> **Warning:** This is an extremely lazy port. Not sure if the random type check
> suppressions and half-hearted fixes break typings or even introduced some
> bugs. I hope the universe has mercy on me.

## Motivation

I build this as a workaround because I repeatedly failed to get `slate-react` to
work with Fresh. I managed to
[setup the import map](https://github.com/eibens/slate-preact) so that slate
works with Preact, but it still throws errors when used with Fresh. I'd wager
there is some use of React in the original repo that causes the issue, but have
yet to take time and nail that down. This repository works with Fresh, albeit it
is pretty annoying to manually port the whole package to Deno and Preact.

## Usage

Add the entries in `import_map.json` to your own import map. Then you can import
`slate-react` from `mod.ts`. While the `deno.json` file defines a `fix` task, it
is not currently working due to a bunch of type errors.

### Manual Steps

These steps are not comprehensive, but should give a rough idea what needs to be
done in case someone wants to update to a newer version of `slate-react`. To
really be sure, you can diff this repository against the original repo.

1. Clone the slate repository.

1. Copy `packages/slate-react/src` into root.

1. Add the original license file from the slate repository root.

1. Rename `index.ts` to `mod.ts`. Replace the first import with this:
   ```ts
   // Components
   export { DefaultPlaceholder, Editable } from "./components/editable.tsx"; // Components
   export type {
     RenderElementProps,
     RenderLeafProps,
     RenderPlaceholderProps,
   } from "./components/editable.tsx";
   ```

1. Add `https://esm.sh/slate` to import map with version from `package.json`.

1. Inject `.ts` file endings for local imports. In VSCode search:
   - Search for: `(from '\.?\./.+)'``
   - Replace with: `$1.ts`
   - Include fiels: `features/slate-react/`

1. Go into each `.ts` file and use `.tsx` for invalid imports.

1. Add all dependencies from `package.json` to import map.

1. Define `DebouncedFunc` type in
   `features/slate-react/hooks/android-import-manager.ts` and remove lodash
   import.
   ```ts
   type DebouncedFunc<F> = F & {
     cancel: () => void;
     flush: () => void;
   };
   ```

1. In `mod.ts` replace `import { useSlate } from "slate-react";` with:
   ```ts
   import { useSlate } from "./hooks/use-slate.ts";
   ```

1. In `components/restore-dom/restore-dom.tsx` add children to this type:
   ```ts
   type RestoreDOMProps = {
     receivedUserInput: RefObject<boolean>;
     node: RefObject<HTMLDivElement>;
     children?: ReactNode;
   };
   ```

1. Add `// deno-lint-ignore-file no-explicit-any` to files where necessary.

1. Add `// @ts-ignore` to remaining broken lines.
