export interface SurfaceApi {
  isPanelCollapsed: boolean;
  showPanel(height: number): boolean;
  hidePanel(): boolean;
  togglePanel(height: number): boolean;
}
