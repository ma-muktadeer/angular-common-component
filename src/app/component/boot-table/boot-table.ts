import { Component, computed, ContentChildren, EventEmitter, Input, OnChanges, Output, QueryList, signal, SimpleChanges, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'checkbox' | 'action' | 'input' | 'serial' | 'select' | 'image' | 'template';
  width?: string;
  align?: 'left' | 'center' | 'right';
  filter?: boolean;
  sortable?: boolean;
  selectOptions?: { label: string; value: any }[];
}

export interface TableAction {
  title: string;
  type: string;
  icon: string;
  class?: string;
  label?: string;
  inTableEdit?: boolean;
}

export interface TableState {
  page: number;
  pageSize: number;
  sortColumn: string;
  sortDirection: 'asc' | 'desc' | '';
  filters: { [key: string]: string };
}

export interface CustomPagination {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  pageSizeOption: number[];
}

import { IthouseTemplateDirective } from './table-template.directive';

@Component({
  selector: 'ithouse-boot-table',
  imports: [FormsModule, CommonModule],
  templateUrl: './boot-table.html',
  styleUrl: './boot-table.scss',
})
export class BootTable implements OnChanges {
  @ContentChildren(IthouseTemplateDirective) templates: QueryList<IthouseTemplateDirective>;

  @Input({ required: true }) data: any[] = [];
  @Input({ required: true }) columns: TableColumn[] = [];

  @Input() custPagenarion = signal<CustomPagination>(null);
  @Input() title: string = 'List';
  @Input() totalLabel: string = 'Total Found';
  @Input() enableSerial: boolean = true;
  @Input() actions: TableAction[];

  readonly tableSaveAction: TableAction = { title: 'Save', type: 'save4table', icon: 'bi-save', class: 'text-success' };

  @Output() actionClick = new EventEmitter<{ type: string, item: any }>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() pageChange = new EventEmitter<TableState>();
  @Output() process = new EventEmitter<void>();
  @Output() cellChange = new EventEmitter<{ column: TableColumn, item: any, value: any }>();

  // State
  isAllSelected = false;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' | '' = '';
  filterValues: { [key: string]: string } = {};
  currentPage: number;
  pageSize: number;
  pageSizeOptions: number[] = [5, 10, 20, 50];

  // Derived data
  filteredData = signal<any[]>([]);
  readonly _enablePagination = computed(() => {
    if (this.custPagenarion()) {
      this.currentPage = this.custPagenarion().pageNumber;
      this.pageSize = this.custPagenarion().pageSize;
      this.totalPages = this.custPagenarion().totalPages;
      this.pageSizeOptions = this.custPagenarion().pageSizeOption;
    }
    return !!this.custPagenarion();
  });
  // paginatedData: any[] = [];
  totalPages: number = 0;

  ngOnInit(): void {
    if (this.enableSerial) {
      // this.columns.unshift({ key: 'index', label: 'SL', type: 'serial', width: '50px' });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['columns']) {
      this.applyLogic();
    }
  }

  toggleSort(column: TableColumn) {
    if (!column.sortable) return;

    if (this.sortColumn === column.key) {
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = '';
        this.sortColumn = '';
      }
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }
    this.applyLogic();
    // this.emitState();
  }

  onFilterInput(key: string, value: string) {
    this.filterValues[key] = value;
    this.currentPage = this.custPagenarion()?.pageNumber;
    this.applyLogic();
    // this.emitState();
  }

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyLogic();
    this.emitState();
  }

  onPageSizeChange(size: any) {
    this.pageSize = +size;
    this.currentPage = this.custPagenarion()?.pageNumber;
    this.applyLogic();
    this.emitState();
  }

  applyLogic() {
    this.filteredData.update(() => this.data.filter(item => {
      return Object.keys(this.filterValues).every(key => {
        const filterVal = this.filterValues[key]?.toLowerCase();
        if (!filterVal) return true;
        const itemVal = String(item[key] || '').toLowerCase();
        return itemVal.includes(filterVal);
      });
    }));

    if (this.sortColumn && this.sortDirection) {
      this.filteredData.update((data) => data.sort((a, b) => {
        const aVal = a[this.sortColumn];
        const bVal = b[this.sortColumn];
        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      }));
    }

    // this.totalPages = Math.ceil(this.filteredData().length / this.pageSize);
    // if (this.currentPage > this.totalPages && this.totalPages > 0) {
    //   this.currentPage = this.totalPages;
    // }
    // const start = (this.currentPage - 1) * this.pageSize;
    // this.paginatedData = this.filteredData().slice(start, start + this.pageSize);

    this.updateSelectAllState();
  }

  toggleAll(event: any) {
    const checked = event.target.checked;
    this.isAllSelected = checked;
    this.filteredData().map((item: any) => item.selected = checked);
    this.emitSelection();
  }

  onRowSelect() {
    this.updateSelectAllState();
    this.emitSelection();
  }

  updateSelectAllState() {
    this.isAllSelected = this.filteredData().length > 0 && this.filteredData().every(item => item.selected);
  }

  emitSelection() {
    const selected = this.data.filter(item => item.selected);
    this.selectionChange.emit(selected);
  }

  emitState() {
    this.pageChange.emit({
      page: this.currentPage,
      pageSize: this.pageSize,
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection,
      filters: this.filterValues
    });
  }

  onActionClick(action: TableAction, item: any) {
    if (action.inTableEdit) {
      item.isEdit = !item.isEdit;
    }
    else {
      this.actionClick.emit({ type: action.type, item });
    }
  }

  onProcess() {
    this.process.emit();
  }

  onCellChange(column: TableColumn, item: any, value: any) {
    this.cellChange.emit({ column, item, value });
  }

  getAlignmentClass(column: TableColumn): string {
    switch (column.align) {
      case 'center': return 'text-center';
      case 'right': return 'text-end';
      default: return 'text-start';
    }
  }

  getSortIcon(column: TableColumn): string {
    if (!column.sortable) return '';
    if (this.sortColumn !== column.key) return 'bi-arrow-down-up text-muted small ms-1';
    return this.sortDirection === 'asc' ? 'bi-arrow-up text-primary ms-1' : 'bi-arrow-down text-primary ms-1';
  }

  getTemplate(name: string): TemplateRef<any> | null {
    return this.templates?.find(t => t.name === name)?.template || null;
  }
}
