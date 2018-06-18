export as module yuml2svg;

export default function yuml2svg(
  src: string,
  options?: {
    isDark?: boolean;
    type?:
      | "class"
      | "usecase"
      | "activity"
      | "state"
      | "deployment"
      | "package";
    dir?: "TB" | "LR" | "RL";
  },
  vizOptions?:
    | { workerURL: string }
    | { worker: Worker }
    | {
        Module: () => any;
        render: (instance: any, src: string, options: object) => string;
      },
  renderOptions?: {
    engine?: "circo" | "dot" | "fdp" | "neato" | "osage" | "twopi";
    format?: "svg";
    images?: object[];
    files?: object[];
  }
): Promise<string>;
