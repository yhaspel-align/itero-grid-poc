export type GridHeaderAlign = 'left' | 'center' | 'right';

export interface ToggleFilterConfig {
  id: string;
  title: string;
  callback: (id: string, value: boolean) => void;
  align: GridHeaderAlign;
}

export interface SearchBarConfig {
  id: string;
  placeholder: string;
  callback: (id: string, value: string) => void;
  align: GridHeaderAlign;
}

export interface CustomButtonConfig {
  id: string;
  title: string;
  callback: (id: string) => void;
  align: GridHeaderAlign;
}

export interface CustomDropdownFilterConfig {
  id: string;
  field: string;
  options?: { label: string; value: any }[];
  callback: (id: string, value: any) => void;
  align: GridHeaderAlign;
}

export interface GridHeaderAction {
  id: string;
  type: 'toggle' | 'search' | 'button' | 'dropdown';
  value: any;
}
