/// <reference no-default-lib="true"/>
/// <reference lib="esnext"/>
/// <reference lib="dom"/>

/** @jsx h */
import { h } from "https://esm.sh/preact@10.5.14";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "https://esm.sh/preact@10.5.14/hooks";
import { crypt } from "../crypt.ts";

export type PasswordProps = {
  seed: string;
  onSeedChange: (seed: string) => void;
  secretString: string;
};
function usePassword(props: PasswordProps) {
  const convert = useCallback(
    (text: string) => crypt(text, props.secretString),
    [
      props.secretString,
    ],
  );

  const password = useMemo(() => convert(props.seed), [props.seed]);
  const setPassword = useCallback(
    (text: string) => props.onSeedChange(convert(text)),
    [props.onSeedChange, convert],
  );
  return [{ password, seed: props.seed }, {
    setPassword,
    setSeed: props.onSeedChange,
  }] as const;
}

export function Password(props: PasswordProps) {
  const [{ seed, password }, { setSeed, setPassword }] = usePassword(
    props,
  );
  return (
    <div style={{ fontSize: 18, width: "600px" }}>
      <b>Seed</b>:<input
        id="seed"
        class="seedpass"
        type="text"
        width="100"
        value={seed}
        onInput={(e) => setSeed(e.currentTarget.value)}
      />{" "}
      <b>⇔</b> <b>Password</b>:<input
        id="pass"
        class="seedpass"
        type="text"
        width="100"
        value={password}
        onInput={(e) => setPassword(e.currentTarget.value)}
      />
    </div>
  );
}
