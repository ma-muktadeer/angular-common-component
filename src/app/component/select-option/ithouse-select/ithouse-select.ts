import { Component, ElementRef, forwardRef, HostListener, Input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'ithouse-select',
    standalone: false,
    templateUrl: './ithouse-select.html',
    styleUrl: './ithouse-select.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IthouseSelect),
            multi: true
        }
    ]
})

export class IthouseSelect implements ControlValueAccessor {
    @Input() items: any[] = [];
    @Input() bindLabel: string = '';
    @Input() bindValue: string = '';
    @Input() multiple: boolean = false;
    @Input() placeholder: string = 'Select item';
    @Input() dropdownPlaceholder: string = 'Search...';
    @Input() disabled: boolean = false;

    value: any;
    isOpen = signal<boolean>(false);

    onChange: any = () => { };
    onTouched: any = () => { };

    constructor(private eRef: ElementRef) { }

    toggleDropdown() {
        if (this.disabled) return;
        this.isOpen.update(v => !v);
        if (this.isOpen()) {
            this.onTouched();
        }
    }

    @HostListener('document:click', ['$event'])
    clickout(event: any) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.isOpen.update(v => false);
        }
    }

    onSelectionChange(value: any) {
        this.value = value;
        this.onChange(value);
    }

    onDropdownClose() {
        if (!this.multiple) {
            this.isOpen.update(v => false);
        }
    }

    get displayValue(): string {
        if (this.multiple) {
            if (Array.isArray(this.value) && this.value.length > 0) {
                return this.value.map(val => this.getLabelFromValue(val)).join(', ');
            }
        } else {
            if (this.value) {
                return this.getLabelFromValue(this.value);
            }
        }
        return this.placeholder;
    }

    private getLabelFromValue(val: any): string {
        const item = this.items.find(i => this.getValue(i) === val);
        if (item) {
            return this.getLabel(item);
        }
        return val?.toString() || '';
    }

    private getLabel(item: any): string {
        if (this.bindLabel && typeof item === 'object') {
            return item[this.bindLabel] || '';
        }
        return item?.toString() || '';
    }

    private getValue(item: any): any {
        if (this.bindValue && typeof item === 'object') {
            return item[this.bindValue];
        }
        return item;
    }

    // ControlValueAccessor implementation
    writeValue(value: any): void {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
