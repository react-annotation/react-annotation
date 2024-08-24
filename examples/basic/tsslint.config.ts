import { defineConfig } from "@tsslint/config";
import { create } from "@react-annotation/tsslint";

export default defineConfig({
  rules: {
    "react-annotation": create(),
  },
  // plugins: [
  //   ({ typescript: ts }) => ({
  //     resolveDiagnostics(_fileName, diagnostics) {
  //       for (const diagnostic of diagnostics) {
  //         if (diagnostic.code === "no-console") {
  //           diagnostic.category = ts.DiagnosticCategory.Error;
  //         }
  //       }
  //       return diagnostics;
  //     },
  //   }),
  // ],
});
