import { useEffect, useRef } from "react";

type PinInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  masked?: boolean;
};

export function PinInput({ value, onChange, length = 4, autoFocus, masked = true }: PinInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, length);
    onChange(digits);
  }

  return (
    <div className="pin-input" onClick={() => inputRef.current?.focus()}>
      <input
        ref={inputRef}
        className="pin-input__hidden"
        type="tel"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={value}
        onChange={handleChange}
        aria-label="PIN code"
      />
      {Array.from({ length }).map((_, i) => {
        const filled = i < value.length;
        const active = i === value.length;
        return (
          <span
            key={i}
            className={`pin-input__cell${filled ? " is-filled" : ""}${active ? " is-active" : ""}`}
            aria-hidden="true"
          >
            {filled ? (masked ? "•" : value[i]) : ""}
          </span>
        );
      })}
    </div>
  );
}
