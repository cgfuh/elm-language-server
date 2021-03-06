import * as Path from "path";
import { URI } from "vscode-uri";
import Parser, { Tree } from "web-tree-sitter";
import { IElmWorkspace } from "../../src/elmWorkspace";
import { Forest, IForest } from "../../src/forest";
import { Imports } from "../../src/imports";
import { container } from "tsyringe";
import { TypeCache } from "../../src/util/types/typeCache";

export const baseUri = Path.join(__dirname, "../sources/src/");

export class MockElmWorkspace implements IElmWorkspace {
  private imports: Imports;
  private forest: IForest = new Forest();
  private parser: Parser;
  private typeCache = new TypeCache();

  constructor(sources: { [K: string]: string }) {
    this.parser = container.resolve("Parser");
    this.imports = new Imports();

    for (const key in sources) {
      if (Object.prototype.hasOwnProperty.call(sources, key)) {
        this.parseAndAddToForest(key, sources[key]);
      }
    }

    for (const key in sources) {
      if (Object.prototype.hasOwnProperty.call(sources, key)) {
        const uri = URI.file(baseUri + key).toString();
        const tree = this.forest.getTree(uri);

        if (tree) {
          this.imports.updateImports(uri, tree, this.forest);
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  init(progressCallback: (percent: number) => void): void {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hasDocument(uri: URI): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hasPath(uri: URI): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPath(uri: URI): string | undefined {
    return;
  }

  getForest(): Forest {
    return this.forest;
  }

  getImports(): Imports {
    return this.imports;
  }

  getRootPath(): URI {
    return URI.file(Path.join(__dirname, "sources"));
  }

  getTypeCache(): TypeCache {
    return this.typeCache;
  }

  private parseAndAddToForest(fileName: string, source: string): void {
    const tree: Tree | undefined = this.parser.parse(source);
    this.forest.setTree(
      URI.file(baseUri + fileName).toString(),
      true,
      true,
      tree,
      true,
    );
  }
}
