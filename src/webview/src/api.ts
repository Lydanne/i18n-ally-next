interface VsCodeApi {
  getState: () => Record<string, unknown> | undefined
  setState: (state: Record<string, unknown>) => void
  postMessage: (message: Record<string, unknown>) => void
}

declare function acquireVsCodeApi(): VsCodeApi

export const vscode: VsCodeApi = acquireVsCodeApi()
