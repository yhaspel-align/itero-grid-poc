import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IuiSlideToggleComponent } from '@itero/ui-components-angular/slide-toggle';
import { IuiButtonComponent } from '@itero/ui-components-angular/button';
import { IuiSelectComponent } from '@itero/ui-components-angular/select';
import { IuiTextInputComponent } from '@itero/ui-components-angular/text-input';
import {
  GridHeaderAlign,
  ToggleFilterConfig,
  SearchBarConfig,
  CustomButtonConfig,
  CustomDropdownFilterConfig,
  GridHeaderAction,
} from './grid-header.models';

@Component({
  selector: 'iui-grid-header',
  standalone: true,
  imports: [FormsModule, IuiSlideToggleComponent, IuiButtonComponent, IuiSelectComponent, IuiTextInputComponent],
  templateUrl: './grid-header.component.html',
  styleUrl: './grid-header.component.scss',
})
export class GridHeaderComponent {
  @Input() title = '';
  @Input() height = '60px';
  @Input() toggleFilters: ToggleFilterConfig[] = [];
  @Input() searchBar: SearchBarConfig | null = null;
  @Input() customButtons: CustomButtonConfig[] = [];
  @Input() customDropdownFilter: CustomDropdownFilterConfig[] = [];

  @Output() action = new EventEmitter<GridHeaderAction>();

  toggleStates: Record<string, boolean> = {};
  dropdownValues: Record<string, any> = {};
  searchInputValue = '';

  getDropdownOptionLabel = (opt: { label: string; value: any } | null | undefined): string =>
    opt?.label ?? '';

  getItemsByAlign<T extends { align: GridHeaderAlign }>(items: T[], align: GridHeaderAlign): T[] {
    return items.filter((item) => item.align === align);
  }

  hasSearchBar(align: GridHeaderAlign): boolean {
    return this.searchBar?.align === align;
  }

  onToggleChange(filter: ToggleFilterConfig): void {
    const value = !this.toggleStates[filter.id];
    this.toggleStates[filter.id] = value;
    filter.callback(filter.id, value);
    this.action.emit({ id: filter.id, type: 'toggle', value });
  }

  onSearchChange(value: string): void {
    if (!this.searchBar) return;
    this.searchBar.callback(this.searchBar.id, value);
    this.action.emit({ id: this.searchBar.id, type: 'search', value });
  }

  onButtonClick(button: CustomButtonConfig): void {
    button.callback(button.id);
    this.action.emit({ id: button.id, type: 'button', value: null });
  }

  onDropdownChange(dropdown: CustomDropdownFilterConfig): void {
    const selected = this.dropdownValues[dropdown.id];
    const value = selected != null && typeof selected === 'object' ? selected.value : selected;
    dropdown.callback(dropdown.id, value);
    this.action.emit({ id: dropdown.id, type: 'dropdown', value });
  }
}
