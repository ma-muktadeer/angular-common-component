import { Component, computed, EventEmitter, forwardRef, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ithouse-drop-down',
  standalone: false,
  templateUrl: './drop-down.html',
  styleUrl: './drop-down.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropDown),
      multi: true
    }
  ]
})
export class DropDown implements ControlValueAccessor {
  @Input() items: any[] = [];
  @Input() bindLabel: string = '';
  @Input() bindValue: string = '';
  @Input() multiple: boolean = false;
  @Input() placeholder: string = 'Search...';
  @Input() disabled: boolean = false;

  @Output() selectionChange = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  searchTerm = signal<string>('');
  filteredList = computed(() => {
    if (!this.searchTerm()) {
      return [...this.items];
    } else {
      return this.items.filter(item => {
        const label = this.getLabel(item).toLowerCase();
        return label.includes(this.searchTerm().toLowerCase());
      });
    }
  });
  selectedValue: any;
  selectedItems: any[] = [];

  onChange: any = () => { };
  onTouched: any = () => { };


  getLabel(item: any): string {
    if (!item) return '';
    if (this.bindLabel && typeof item === 'object') {
      return item[this.bindLabel] || '';
    }
    return item.toString();
  }

  getValue(item: any): any {
    if (this.bindValue && typeof item === 'object') {
      return item[this.bindValue];
    }
    return item;
  }

  toggleSelection(item: any) {
    if (this.disabled) return;
    const value = this.getValue(item);

    if (this.multiple) {
      const index = this.selectedItems.indexOf(value);
      if (index === -1) {
        this.selectedItems.push(value);
      } else {
        this.selectedItems.splice(index, 1);
      }
      this.selectedValue = [...this.selectedItems];
    } else {
      this.selectedValue = value;
      this.searchTerm.update(() => '');
      this.close.emit();
    }

    this.onChange(this.selectedValue);
    this.selectionChange.emit(this.selectedValue);
  }

  isSelected(item: any): boolean {
    const value = this.getValue(item);
    if (this.multiple) {
      return Array.isArray(this.selectedValue) && this.selectedValue.includes(value);
    }
    return this.selectedValue === value;
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.selectedValue = value;
    if (this.multiple) {
      this.selectedItems = Array.isArray(value) ? [...value] : [];
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
  }
}
