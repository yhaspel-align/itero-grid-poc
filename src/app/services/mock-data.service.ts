import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map, shareReplay } from 'rxjs';

export interface FetchPageParams {
  startRow: number;
  endRow: number;
  filters: DataFilters;
}

export interface DataFilters {
  status?: string;
  procedure?: string;
  caseType?: string;
  searchText?: string;
  doctorId?: number;
}

export interface FetchPageResult {
  rows: any[];
  totalCount: number;
}

const SEARCHABLE_FIELDS = [
  'patientName',
  'status',
  'caseTypeDescription',
  'procedureDescription',
  'orderCode',
];

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private http = inject(HttpClient);

  pageSize = 20;

  private data$: Observable<any[]> = this.http
    .get<any[]>('api/data.json')
    .pipe(shareReplay(1));

  fetchPage(params: FetchPageParams): Observable<FetchPageResult> {
    return this.data$.pipe(
      map((allData) => {
        const filtered = this.applyFilters(allData, params.filters);
        const rows = filtered.slice(params.startRow, params.endRow);
        return { rows, totalCount: filtered.length };
      }),
      delay(500),
    );
  }

  private applyFilters(data: any[], filters: DataFilters): any[] {
    let result = data;

    if (filters.doctorId != null) {
      result = result.filter((r) => r.doctorId === filters.doctorId);
    }

    if (filters.status) {
      result = result.filter((r) => r.status === filters.status);
    }

    if (filters.procedure) {
      result = result.filter(
        (r) => r.procedureDescription === filters.procedure,
      );
    }

    if (filters.caseType) {
      result = result.filter(
        (r) => r.caseTypeDescription === filters.caseType,
      );
    }

    if (filters.searchText) {
      const term = filters.searchText.toLowerCase();
      result = result.filter((r) =>
        SEARCHABLE_FIELDS.some((field) => {
          const val = r[field];
          return val != null && String(val).toLowerCase().includes(term);
        }),
      );
    }

    return result;
  }
}
