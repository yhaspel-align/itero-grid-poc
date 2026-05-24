import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TlkSlideToggleComponent } from '@itero/ui-components-angular/slide-toggle';
import { TlkButtonComponent } from '@itero/ui-components-angular/button';
import { TlkSelectComponent } from '@itero/ui-components-angular/select';
import { TlkTextInputComponent } from '@itero/ui-components-angular/text-input';
import {
  GridHeaderAlign,
  GridHeaderTheme,
  ToggleFilterConfig,
  SearchBarConfig,
  CustomButtonConfig,
  CustomDropdownFilterConfig,
  GridHeaderAction,
} from './grid-header.models';
import { GRID_HEADER_LIGHT_THEME } from './grid-header-themes';

@Component({
  selector: 'tlk-grid-header',
  standalone: true,
  imports: [NgStyle, FormsModule, TlkSlideToggleComponent, TlkButtonComponent, TlkSelectComponent, TlkTextInputComponent],
  templateUrl: './grid-header.component.html',
  styleUrl: './grid-header.component.scss',
})
export class GridHeaderComponent {
  @Input() title = '';
  @Input() height = '60px';
  @Input() theme: GridHeaderTheme = GRID_HEADER_LIGHT_THEME;
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

  get themeVars(): Record<string, string> {
    const t = this.theme;
    return {
      '--tlk-bg': t.backgroundColor,
      '--tlk-text': t.textColor,
      '--tlk-border': t.borderColor,
      '--tlk-font': t.fontFamily,
      '--tlk-input-bg': t.inputBackground,
      '--tlk-input-text': t.inputTextColor,
      '--tlk-input-border': t.inputBorderColor,
      '--tlk-input-border-focus': t.inputBorderFocusColor,
      '--tlk-input-focus-shadow': t.inputFocusShadow,
      '--tlk-placeholder': t.placeholderColor,
      '--tlk-btn-bg': t.buttonBackground,
      '--tlk-btn-text': t.buttonTextColor,
      '--tlk-btn-border': t.buttonBorderColor,
      '--tlk-btn-hover-bg': t.buttonHoverBackground,
      '--tlk-btn-hover-border': t.buttonHoverBorderColor,
      '--tlk-accent': t.accentColor,
    };
  }

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
