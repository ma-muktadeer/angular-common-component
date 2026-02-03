import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: '[ithouseTemplate]'
})
export class IthouseTemplateDirective {
    @Input('ithouseTemplate') name: string;

    constructor(public template: TemplateRef<any>) { }
}
