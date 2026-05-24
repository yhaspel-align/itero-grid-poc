import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { IuiButtonComponent } from '@itero/ui-components-angular/button';

export interface RowAction {
  id: string;
  label: string;
  visibleWhen: (data: any) => boolean;
  action: (data: any) => void;
}

export const ROW_ACTIONS: RowAction[] = [
  {
    id: 'open-file',
    label: 'Open File',
    visibleWhen: (d) => d?.canOpenFile,
    action: (d) => console.log('Open file:', d?.openFileLink),
  },
  {
    id: 'export',
    label: 'Export',
    visibleWhen: (d) => d?.canExportFile,
    action: (d) => console.log('Export:', d?.exportFileLink),
  },
  {
    id: 'view-rx',
    label: 'View Rx',
    visibleWhen: (d) => d?.canViewRx,
    action: (d) => console.log('View Rx for order:', d?.id),
  },
  {
    id: 'web-export',
    label: 'Web Export',
    visibleWhen: (d) => d?.canWebExport,
    action: (d) => console.log('Web export for order:', d?.id),
  },
  {
    id: 'export-gallery',
    label: 'Export Gallery',
    visibleWhen: (d) => d?.canExportGallery,
    action: (d) => console.log('Export gallery for order:', d?.id),
  },
  {
    id: 'outcome-sim',
    label: 'Outcome Simulator',
    visibleWhen: (d) => d?.outcomeSimulatorEnabled,
    action: (d) => console.log('Outcome sim:', d?.outcomeSimulatorLink),
  },
  {
    id: 'progress-assessment',
    label: 'Progress Assessment',
    visibleWhen: (d) => d?.progressAssessmentEnabled,
    action: (d) => console.log('Progress assessment:', d?.progressAssessmentLink),
  },
];

export interface ExpandCellRendererParams extends ICellRendererParams {
  expandedRowIds: Set<number>;
  onToggleExpand: (id: number) => void;
  /** Left offset for the detail buttons panel (default: 100) */
  detailPanelOffsetLeft?: number;
}

@Component({
  selector: 'app-expand-cell',
  standalone: true,
  imports: [IuiButtonComponent],
  templateUrl: './expand-cell-renderer.component.html',
  styleUrl: './expand-cell-renderer.component.scss',
})
export class ExpandCellRendererComponent implements ICellRendererAngularComp {
  isExpanded = false;
  visibleActions: RowAction[] = [];
  detailPanelOffsetLeft = 100;
  private params!: ExpandCellRendererParams;

  agInit(params: ExpandCellRendererParams): void {
    this.params = params;
    this.detailPanelOffsetLeft = params.detailPanelOffsetLeft ?? 100;
    this.updateState();
  }

  refresh(params: ExpandCellRendererParams): boolean {
    this.params = params;
    this.detailPanelOffsetLeft = params.detailPanelOffsetLeft ?? 100;
    this.updateState();
    return true;
  }

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    const id = this.params.data?.id;
    if (id != null) {
      this.params.onToggleExpand(id);
    }
  }

  onAction(event: MouseEvent, action: RowAction): void {
    event.stopPropagation();
    action.action(this.params.data);
  }

  private updateState(): void {
    const id = this.params.data?.id;
    this.isExpanded = id != null && this.params.expandedRowIds?.has(id);
    if (this.isExpanded) {
      this.visibleActions = ROW_ACTIONS.filter((a) => a.visibleWhen(this.params.data));
    } else {
      this.visibleActions = [];
    }
  }
}
