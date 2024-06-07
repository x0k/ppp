export enum Page {
  Main = "/",
  Problem = "/task",
}

export const TITLE = "Programming Patterns Practice";

export interface Position {
  x: number;
  y: number;
}

export interface SyncStorage<T> {
  load(): T
  save(data: T): void
  clear(): void
}
