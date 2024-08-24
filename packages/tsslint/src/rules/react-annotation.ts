/* eslint-disable no-restricted-syntax */
import type { Rule } from "@tsslint/types";
import type * as ts from "typescript";

export type Options = Parameters<typeof create>;

// TODO: Implement the PoC
// TODO: Implement the MVP
// TODO: Implement the rule
// TODO: Add documentation
// TODO: Add tests
export function create(): Rule {
  return ({ languageService, reportWarning: report, sourceFile, typescript: ts }) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const program = languageService.getProgram()!;
    const checker = program.getTypeChecker();
    const components = new Map<
      ts.JSDocTag,
      [node: ts.Node, renders: string | ts.NodeArray<ts.JSDocComment> | undefined]
    >();
    const props = new Map<ts.JSDocTag, [node: ts.Node, renders: string | ts.NodeArray<ts.JSDocComment> | undefined]>();
    ts.forEachChild(sourceFile, function cb(node: ts.Node): void {
      if (ts.isJsxAttribute(node)) {
        // console.log(node.getChildren());
      }
      const allTags = ts.getJSDocTags(node);
      const componentTag = allTags.find(tag => tag.tagName.escapedText === "component");
      // const componentValue = componentTag?.comment;
      const rendersTag = allTags.find(tag => tag.tagName.escapedText === "renders");
      const rendersValue = rendersTag?.comment;
      if (componentTag) {
        components.set(componentTag, [node, rendersValue]);
      } else if (rendersTag) {
        props.set(rendersTag, [node, rendersValue]);
      }
      ts.forEachChild(node, cb);
    });
    // console.log(components);
    // console.log(props);
  };
}
