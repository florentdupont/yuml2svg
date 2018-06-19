export as namespace yuml2svg;

export default function yuml2svg(
  src: string,
  options?: {
    isDark?: boolean;
    dotHeaderOverrides?: {
      graph?: any;
      node?: any;
      edge?: any;
    };
    type?:
      | "class"
      | "usecase"
      | "activity"
      | "state"
      | "sequence"
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
