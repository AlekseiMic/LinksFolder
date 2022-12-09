import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Variant, SimpleLink } from 'app/types';

@Component({
  selector: 'app-user-link-form',
  templateUrl: 'user-link-form.component.html',
})
export class UserLinkForm implements OnInit {
  @Input('directories') directories: Variant[] = [];

  @Output() onSubmit = new EventEmitter<{ dir: number; links: SimpleLink[] }>();

  @Output() onImport = new EventEmitter<number>();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    const defaultDir = this.directories?.[0];
    if (!defaultDir) return;
    this.directoryForm.controls['directory'].reset(defaultDir.value);
  }

  directoryForm = this.formBuilder.group({
    directory: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
  });

  ngOnChanges(changes: SimpleChanges) {
    const newValue = changes['directories']?.currentValue as Variant[];
    const currentDir = this.directoryForm.controls['directory']?.value;
    if (
      newValue?.length &&
      (!currentDir || newValue.findIndex((v) => v.value === currentDir) === -1)
    ) {
      this.directoryForm.controls['directory'].reset(newValue[0].value);
    }
  }

  public raiseOnSubmit(links: SimpleLink[]) {
    const currentDir = this.directoryForm.controls['directory']?.value;
    const dir = Number(currentDir);
    if (Number.isNaN(dir) || !this.directoryForm.valid) return;
    this.onSubmit.emit({ dir, links });
  }

  public raiseImportEvent() {
    const value = this.directoryForm.controls['directory'].value;
    if (!value) return;
    this.onImport.emit(value);
  }
}
