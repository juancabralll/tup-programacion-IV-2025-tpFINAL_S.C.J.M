import { useState } from "react";

export function Contador() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((count) => count + 1)}>
      La cuenta vale {count}
    </button>
  );
}
