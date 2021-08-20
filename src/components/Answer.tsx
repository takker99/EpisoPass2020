/// <reference no-default-lib="true"/>
/// <reference lib="esnext"/>
/// <reference lib="dom"/>

/** @jsx h */
import { h } from "https://esm.sh/preact@10.5.14";

export type AnswerProps = {
  text: string;
  onSelect: () => void;
  onTextChange: (answer: string) => void;
};
export const Answer = (
  { text, onSelect, onTextChange }: AnswerProps,
) => (
  <span class="answer">
    <input
      class="answer"
      type="text"
      autocomplete="off"
      value={text}
      onClick={onSelect}
      onInput={(e) => onTextChange(e.currentTarget.value)}
    />
  </span>
);
