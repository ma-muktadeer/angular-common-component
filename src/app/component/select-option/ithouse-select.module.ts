import { NgModule } from "@angular/core";
import { IthouseSelect } from "./ithouse-select/ithouse-select";
import { DropDown } from "./drop-down/drop-down";
import { FormsModule } from "@angular/forms";



@NgModule({
    declarations: [
        IthouseSelect,
        DropDown,
    ],
    imports: [
        FormsModule
    ],
    exports: [
        IthouseSelect
    ]
})
export class IthouseSelectModule { }
