import "react-native-get-random-values";
import { Buffer } from "buffer";

declare global {
  // eslint-disable-next-line no-var
  var Buffer: typeof Buffer;
}

if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer;
}
