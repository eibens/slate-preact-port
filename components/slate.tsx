import type { VNode } from "preact";
import { useCallback, useEffect, useRef, useState } from "react";
import { Descendant, Editor, Node, Scrubber } from "slate";
import { FocusedContext } from "../hooks/use-focused.ts";
import { useIsomorphicLayoutEffect } from "../hooks/use-isomorphic-layout-effect.ts";
import {
  SlateSelectorContext,
  useSelectorContext,
} from "../hooks/use-slate-selector.tsx";
import { EditorContext } from "../hooks/use-slate-static.tsx";
import { SlateContext, SlateContextValue } from "../hooks/use-slate.tsx";
import { ReactEditor } from "../plugin/react-editor.ts";
import { IS_REACT_VERSION_17_OR_ABOVE } from "../utils/environment.ts";
import { EDITOR_TO_ON_CHANGE } from "../utils/weak-maps.ts";

/**
 * A wrapper around the provider to handle `onChange` events, because the editor
 * is a mutable singleton so it won't ever register as "changed" otherwise.
 */

export const Slate = (props: {
  editor: ReactEditor;
  initialValue: Descendant[];
  children: VNode;
  onChange?: (value: Descendant[]) => void;
}) => {
  const { editor, children, onChange, initialValue, ...rest } = props;
  const unmountRef = useRef(false);

  const [context, setContext] = useState<SlateContextValue>(() => {
    if (!Node.isNodeList(initialValue)) {
      throw new Error(
        `[Slate] initialValue is invalid! Expected a list of elements but got: ${
          Scrubber.stringify(
            initialValue,
          )
        }`,
      );
    }
    if (!Editor.isEditor(editor)) {
      throw new Error(
        `[Slate] editor is invalid! You passed: ${Scrubber.stringify(editor)}`,
      );
    }
    editor.children = initialValue;
    Object.assign(editor, rest);
    return { v: 0, editor };
  });

  const {
    selectorContext,
    onChange: handleSelectorChange,
  } = useSelectorContext(editor);

  const onContextChange = useCallback(() => {
    if (onChange) {
      onChange(editor.children);
    }

    setContext((prevContext) => ({
      v: prevContext.v + 1,
      editor,
    }));
    handleSelectorChange(editor);
  }, [editor, handleSelectorChange, onChange]);

  useEffect(() => {
    EDITOR_TO_ON_CHANGE.set(editor, onContextChange);

    return () => {
      EDITOR_TO_ON_CHANGE.set(editor, () => {});
      unmountRef.current = true;
    };
  }, [editor, onContextChange]);

  const [isFocused, setIsFocused] = useState(ReactEditor.isFocused(editor));

  useEffect(() => {
    setIsFocused(ReactEditor.isFocused(editor));
  }, [editor]);

  useIsomorphicLayoutEffect(() => {
    const fn = () => setIsFocused(ReactEditor.isFocused(editor));
    if (IS_REACT_VERSION_17_OR_ABOVE) {
      // In React >= 17 onFocus and onBlur listen to the focusin and focusout events during the bubbling phase.
      // Therefore in order for <Editable />'s handlers to run first, which is necessary for ReactEditor.isFocused(editor)
      // to return the correct value, we have to listen to the focusin and focusout events without useCapture here.
      document.addEventListener("focusin", fn);
      document.addEventListener("focusout", fn);
      return () => {
        document.removeEventListener("focusin", fn);
        document.removeEventListener("focusout", fn);
      };
    } else {
      document.addEventListener("focus", fn, true);
      document.addEventListener("blur", fn, true);
      return () => {
        document.removeEventListener("focus", fn, true);
        document.removeEventListener("blur", fn, true);
      };
    }
  }, []);

  return (
    <SlateSelectorContext.Provider value={selectorContext}>
      <SlateContext.Provider value={context}>
        <EditorContext.Provider value={context.editor}>
          <FocusedContext.Provider value={isFocused}>
            {children}
          </FocusedContext.Provider>
        </EditorContext.Provider>
      </SlateContext.Provider>
    </SlateSelectorContext.Provider>
  );
};
