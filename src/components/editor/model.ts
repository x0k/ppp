export interface SurfaceApi {
  width: number;
  panelHeight: number;
  isPanelCollapsed: boolean;
  showPanel(height: number): boolean;
  hidePanel(): boolean;
  togglePanel(height: number): boolean;
}
