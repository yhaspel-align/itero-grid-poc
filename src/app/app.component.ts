import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, Theme, IDatasource, IGetRowsParams, type RowSelectionOptions, type RowHeightParams } from 'ag-grid-community';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { lightTheme } from './shared/themes/light-theme';
import { darkTheme } from './shared/themes/dark-theme';
import { MockDataService, DataFilters } from './services/mock-data.service';
import { AvatarCellRendererComponent } from './components/avatar-cell-renderer/avatar-cell-renderer.component';
import { ExpandCellRendererComponent } from './components/expand-cell-renderer/expand-cell-renderer.component';
import {
  GridHeaderComponent,
  ToggleFilterConfig,
  SearchBarConfig,
  CustomButtonConfig,
  CustomDropdownFilterConfig,
  GridHeaderAction,
  GridHeaderTheme,
  GRID_HEADER_LIGHT_THEME,
  GRID_HEADER_DARK_THEME,
} from 'tlk-grid-header';

function formatDate(params: { value: string | null }): string {
  if (!params.value) return '';
  const d = new Date(params.value);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export interface GridFeature {
  key: string;
  label: string;
  enabled: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AgGridAngular, GridHeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  private mockDataService = inject(MockDataService);

  isDarkTheme = false;
  currentTheme: Theme = lightTheme;
  gridHeaderTheme: GridHeaderTheme = GRID_HEADER_LIGHT_THEME;
  showFeaturesPanel = false;

  /** Infinite row model configuration */
  rowModelType: 'infinite' = 'infinite';
  cacheBlockSize = 20;
  maxBlocksInCache = 10;
  datasource!: IDatasource;

  activeFilters: DataFilters = {
    doctorId: 11374268,
  };

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  gridFeatures: GridFeature[] = [
    { key: 'avatarColumn', label: 'Avatar Column', enabled: true },
    { key: 'rowExpansion', label: 'Row Expansion', enabled: true },
    { key: 'columnHoverHighlight', label: 'Column Hover', enabled: false },
    { key: 'animateRows', label: 'Animate Rows', enabled: true },
    { key: 'rowSelection', label: 'Row Selection', enabled: false },
    { key: 'floatingFilter', label: 'Floating Filters', enabled: false },
    { key: 'enableCellTextSelection', label: 'Cell Text Selection', enabled: false },
    { key: 'wrapHeaderText', label: 'Wrap Header Text', enabled: false },
    { key: 'autoSizeColumns', label: 'Auto-Size Columns', enabled: false },
    { key: 'suppressMovableColumns', label: 'Lock Column Order', enabled: false },
  ];

  expandedRowIds = new Set<number>();

  columnHoverHighlight = false;
  animateRows = true;
  rowSelection: RowSelectionOptions | 'single' | 'multiple' | undefined = undefined;
  enableCellTextSelection = false;
  suppressMovableColumns = false;

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 120,
  };

  colDefs: ColDef[] = [
    {
      colId: 'expand',
      headerName: '',
      width: 50,
      maxWidth: 50,
      sortable: false,
      filter: false,
      resizable: false,
      suppressHeaderMenuButton: true,
      cellRenderer: ExpandCellRendererComponent,
      cellRendererParams: {
        expandedRowIds: this.expandedRowIds,
        onToggleExpand: (id: number) => this.toggleRowExpansion(id),
      },
    },
    {
      colId: 'avatar',
      headerName: '',
      width: 60,
      maxWidth: 60,
      sortable: false,
      filter: false,
      resizable: false,
      suppressHeaderMenuButton: true,
      cellRenderer: AvatarCellRendererComponent,
    },
    { field: 'id', headerName: 'Order ID', filter: 'agNumberColumnFilter', width: 140 },
    { field: 'patientName', headerName: 'Patient Name', filter: 'agTextColumnFilter', width: 200 },
    { field: 'chartNumber', headerName: 'Chart #', filter: 'agTextColumnFilter', width: 120 },
    { field: 'scanDate', headerName: 'Scan Date', filter: 'agDateColumnFilter', valueFormatter: formatDate, width: 200 },
    { field: 'status', headerName: 'Status', filter: 'agTextColumnFilter', width: 140 },
    { field: 'caseTypeDescription', headerName: 'Case Type', filter: 'agTextColumnFilter', width: 200 },
    { field: 'procedureDescription', headerName: 'Procedure', filter: 'agTextColumnFilter', width: 200 },
    { field: 'doctorId', headerName: 'Doctor ID', filter: 'agNumberColumnFilter', width: 140 },
    { field: 'orderCode', headerName: 'Order Code', filter: 'agTextColumnFilter', width: 140 },
    { field: 'dateModified', headerName: 'Last Modified', filter: 'agDateColumnFilter', valueFormatter: formatDate, width: 200 },
  ];

  private gridApi: any;

  headerToggleFilters: ToggleFilterConfig[] = [
    {
      id: 'toggle-show-all',
      title: 'Show All',
      callback: (_id, value) => {
        this.activeFilters = {
          ...this.activeFilters,
          doctorId: value ? undefined : 11374268,
        };
        this.refreshDatasource();
      },
      align: 'left',
    },
  ];

  headerSearchBar: SearchBarConfig = {
    id: 'search-orders',
    placeholder: 'Search orders...',
    callback: (_id, value) => this.searchSubject.next(value),
    align: 'right',
  };

  headerCustomButtons: CustomButtonConfig[] = [
    {
      id: 'btn-alert',
      title: 'Alert',
      callback: () => alert('Button clicked!'),
      align: 'right',
    },
  ];

  headerDropdownFilters: CustomDropdownFilterConfig[] = [
    {
      id: 'dropdown-status',
      field: 'Status',
      options: [
        { label: 'All', value: '' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Ortho Modeling', value: 'Ortho Modeling' },
      ],
      callback: (_id, value) => {
        this.activeFilters = { ...this.activeFilters, status: value || undefined };
        this.refreshDatasource();
      },
      align: 'right',
    },
    {
      id: 'dropdown-procedure',
      field: 'Procedure',
      options: [
        { label: 'All', value: '' },
        { label: 'Study Model/iRecord', value: 'Study Model/iRecord' },
        { label: 'Fixed Restorative', value: 'Fixed Restorative' },
        { label: 'Invisalign | Vivera', value: 'Invisalign | Vivera' },
      ],
      callback: (_id, value) => {
        this.activeFilters = { ...this.activeFilters, procedure: value || undefined };
        this.refreshDatasource();
      },
      align: 'right',
    },
    {
      id: 'dropdown-casetype',
      field: 'Case Type',
      options: [
        { label: 'All', value: '' },
        { label: 'Invisalign + iRecord', value: 'Invisalign + iRecord' },
        { label: 'iRecord', value: 'iRecord' },
        { label: 'iCast', value: 'iCast' },
        { label: 'Invisalign', value: 'Invisalign' },
        { label: 'Restorative', value: 'Restorative' },
      ],
      callback: (_id, value) => {
        this.activeFilters = { ...this.activeFilters, caseType: value || undefined };
        this.refreshDatasource();
      },
      align: 'right',
    },
  ];

  onGridHeaderAction(event: GridHeaderAction): void {
    console.log('Grid header action:', event);
  }

  ngOnInit(): void {
    this.datasource = this.createDatasource();

    this.searchSub = this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((text) => {
        this.activeFilters = {
          ...this.activeFilters,
          searchText: text || undefined,
        };
        this.refreshDatasource();
      });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.searchSubject.complete();
  }

  getRowHeight = (params: RowHeightParams): number | undefined => {
    if (this.expandedRowIds.has(params.data?.id)) {
      return 120;
    }
    return undefined;
  };

  onGridReady(params: any): void {
    this.gridApi = params.api;
  }

  toggleRowExpansion(id: number): void {
    const expanding = !this.expandedRowIds.has(id);
    if (expanding) {
      this.expandedRowIds.add(id);
    } else {
      this.expandedRowIds.delete(id);
    }
    if (this.gridApi) {
      const rowNodes: any[] = [];
      this.gridApi.forEachNode((node: any) => {
        if (node.data?.id === id) {
          node.setRowHeight(expanding ? 120 : undefined);
          rowNodes.push(node);
        }
      });
      this.gridApi.onRowHeightChanged();
      if (rowNodes.length) {
        setTimeout(() => this.gridApi.redrawRows({ rowNodes }));
      }
    }
  }

  private createDatasource(): IDatasource {
    return {
      getRows: (params: IGetRowsParams) => {
        this.mockDataService
          .fetchPage({
            startRow: params.startRow,
            endRow: params.endRow,
            filters: this.activeFilters,
          })
          .subscribe({
            next: (result) => {
              const lastRow =
                result.totalCount <= params.endRow ? result.totalCount : -1;
              params.successCallback(result.rows, lastRow);
            },
            error: () => params.failCallback(),
          });
      },
    };
  }

  private refreshDatasource(): void {
    if (this.gridApi) {
      this.gridApi.setGridOption('datasource', this.createDatasource());
    }
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.currentTheme = this.isDarkTheme ? darkTheme : lightTheme;
    this.gridHeaderTheme = this.isDarkTheme ? GRID_HEADER_DARK_THEME : GRID_HEADER_LIGHT_THEME;
  }

  toggleFeaturesPanel(): void {
    this.showFeaturesPanel = !this.showFeaturesPanel;
  }

  onFeatureToggle(feature: GridFeature): void {
    feature.enabled = !feature.enabled;

    switch (feature.key) {
      case 'avatarColumn':
        if (this.gridApi) {
          this.gridApi.setColumnsVisible(['avatar'], feature.enabled);
        }
        break;
      case 'rowExpansion':
        if (this.gridApi) {
          this.gridApi.setColumnsVisible(['expand'], feature.enabled);
          if (!feature.enabled && this.expandedRowIds.size > 0) {
            this.expandedRowIds.clear();
            this.gridApi.resetRowHeights();
            setTimeout(() => this.gridApi.redrawRows());
          }
        }
        break;
      case 'columnHoverHighlight':
        this.columnHoverHighlight = feature.enabled;
        break;
      case 'animateRows':
        this.animateRows = feature.enabled;
        break;
      case 'rowSelection':
        this.rowSelection = feature.enabled ? { mode: 'multiRow', checkboxes: true } : undefined;
        break;
      case 'enableCellTextSelection':
        this.enableCellTextSelection = feature.enabled;
        break;
      case 'suppressMovableColumns':
        this.suppressMovableColumns = feature.enabled;
        break;
      case 'floatingFilter':
        this.defaultColDef = {
          ...this.defaultColDef,
          floatingFilter: feature.enabled,
        };
        break;
      case 'wrapHeaderText':
        this.defaultColDef = {
          ...this.defaultColDef,
          wrapHeaderText: feature.enabled,
          autoHeaderHeight: feature.enabled,
        };
        break;
      case 'autoSizeColumns':
        if (feature.enabled && this.gridApi) {
          this.gridApi.autoSizeAllColumns();
        } else if (!feature.enabled && this.gridApi) {
          this.gridApi.sizeColumnsToFit();
        }
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.features-dropdown')) {
      this.showFeaturesPanel = false;
    }
  }
}
