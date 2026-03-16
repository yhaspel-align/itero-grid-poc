import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

const AVATAR_COLORS = [
  '#4A90D9', '#E57373', '#81C784', '#FFB74D', '#BA68C8',
  '#4DB6AC', '#F06292', '#7986CB', '#A1887F', '#90A4AE',
  '#FF8A65', '#AED581', '#64B5F6', '#DCE775', '#4DD0E1',
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

@Component({
  selector: 'app-avatar-cell',
  standalone: true,
  templateUrl: './avatar-cell-renderer.component.html',
  styleUrl: './avatar-cell-renderer.component.scss',
})
export class AvatarCellRendererComponent implements ICellRendererAngularComp {
  initials = '';
  bgColor = AVATAR_COLORS[0];
  fullName = '';

  agInit(params: ICellRendererParams): void {
    this.updateFromParams(params);
  }

  refresh(params: ICellRendererParams): boolean {
    this.updateFromParams(params);
    return true;
  }

  private updateFromParams(params: ICellRendererParams): void {
    const name: string = params.data?.patientName ?? '';
    this.fullName = name.trim();
    const parts = name.split(',').map((s: string) => s.trim());
    const lastName = parts[0] ?? '';
    const firstName = parts[1] ?? '';
    this.initials = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase();
    this.bgColor = AVATAR_COLORS[hashName(this.fullName) % AVATAR_COLORS.length];
  }
}
