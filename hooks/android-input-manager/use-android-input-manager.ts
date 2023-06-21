import { RefObject, useState } from "react";
import { IS_ANDROID } from "../../utils/environment.ts";
import { EDITOR_TO_SCHEDULE_FLUSH } from "../../utils/weak-maps.ts";
import { useIsMounted } from "../use-is-mounted.tsx";
import { useMutationObserver } from "../use-mutation-observer.ts";
import { useSlateStatic } from "../use-slate-static.tsx";
import {
  createAndroidInputManager,
  CreateAndroidInputManagerOptions,
} from "./android-input-manager.ts";

type UseAndroidInputManagerOptions =
  & {
    node: RefObject<HTMLElement>;
  }
  & Omit<
    CreateAndroidInputManagerOptions,
    "editor" | "onUserInput" | "receivedUserInput"
  >;

const MUTATION_OBSERVER_CONFIG: MutationObserverInit = {
  subtree: true,
  childList: true,
  characterData: true,
};

export const useAndroidInputManager = !IS_ANDROID
  ? () => null
  : ({ node, ...options }: UseAndroidInputManagerOptions) => {
    if (!IS_ANDROID) {
      return null;
    }

    const editor = useSlateStatic();
    const isMounted = useIsMounted();

    const [inputManager] = useState(() =>
      createAndroidInputManager({
        editor,
        ...options,
      })
    );

    useMutationObserver(
      node,
      inputManager.handleDomMutations,
      MUTATION_OBSERVER_CONFIG,
    );

    EDITOR_TO_SCHEDULE_FLUSH.set(editor, inputManager.scheduleFlush);
    if (isMounted) {
      inputManager.flush();
    }

    return inputManager;
  };
