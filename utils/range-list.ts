import { Range } from "slate";
import { PLACEHOLDER_SYMBOL } from "./weak-maps.ts";

// deno-lint-ignore ban-types
export const shallowCompare = (obj1: {}, obj2: {}) =>
  Object.keys(obj1).length === Object.keys(obj2).length &&
  Object.keys(obj1).every(
    // @ts-ignore - MIGRATION
    // deno-lint-ignore no-prototype-builtins
    (key) => obj2.hasOwnProperty(key) && obj1[key] === obj2[key],
  );

const isDecorationFlagsEqual = (range: Range, other: Range) => {
  const { anchor: _rangeAnchor, focus: _rangeFocus, ...rangeOwnProps } = range;
  const { anchor: _otherAnchor, focus: _otherFocus, ...otherOwnProps } = other;

  return (
    // @ts-ignore - MIGRATION
    range[PLACEHOLDER_SYMBOL] === other[PLACEHOLDER_SYMBOL] &&
    shallowCompare(rangeOwnProps, otherOwnProps)
  );
};

/**
 * Check if a list of decorator ranges are equal to another.
 *
 * PERF: this requires the two lists to also have the ranges inside them in the
 * same order, but this is an okay constraint for us since decorations are
 * kept in order, and the odd case where they aren't is okay to re-render for.
 */

export const isElementDecorationsEqual = (
  list: Range[],
  another: Range[],
): boolean => {
  if (list.length !== another.length) {
    return false;
  }

  for (let i = 0; i < list.length; i++) {
    const range = list[i];
    const other = another[i];

    if (!Range.equals(range, other) || !isDecorationFlagsEqual(range, other)) {
      return false;
    }
  }

  return true;
};

/**
 * Check if a list of decorator ranges are equal to another.
 *
 * PERF: this requires the two lists to also have the ranges inside them in the
 * same order, but this is an okay constraint for us since decorations are
 * kept in order, and the odd case where they aren't is okay to re-render for.
 */

export const isTextDecorationsEqual = (
  list: Range[],
  another: Range[],
): boolean => {
  if (list.length !== another.length) {
    return false;
  }

  for (let i = 0; i < list.length; i++) {
    const range = list[i];
    const other = another[i];

    // compare only offsets because paths doesn't matter for text
    if (
      range.anchor.offset !== other.anchor.offset ||
      range.focus.offset !== other.focus.offset ||
      !isDecorationFlagsEqual(range, other)
    ) {
      return false;
    }
  }

  return true;
};
