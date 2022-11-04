import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Option, SimpleLink } from '../../types';

@Component({
  selector: 'app-not-simple-link-form',
  templateUrl: 'not-simple-link-form.component.html',
})
export class NotSimpleLinkFormComponent implements OnInit {
  @Input('directories') directories: Option[] = [];

  @Output() onSubmit: EventEmitter<{ dir: number; links: SimpleLink[] }> =
    new EventEmitter();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    const defaultDir = this.directories?.[0];
    if (defaultDir)
      this.directoryForm.controls['directory'].reset(defaultDir.value);
  }

  directoryForm = this.formBuilder.group({
    directory: new FormControl<string | number | null>(null, {
      validators: [Validators.required],
    }),
  });

  ngOnChanges(changes: SimpleChanges) {
    const newValue = changes['directories']?.currentValue;
    const currentDir = this.directoryForm.controls['directory']?.value;
    if (newValue?.length && !currentDir) {
      this.directoryForm.controls['directory'].reset(newValue[0].value);
    }
  }

  public raiseOnSubmit(links: SimpleLink[]) {
    const currentDir = this.directoryForm.controls['directory']?.value;
    const dir = Number(currentDir);
    if (Number.isNaN(dir) || !this.directoryForm.valid) return;
    this.onSubmit.emit({ dir, links });
  }

  public raiseImportEvent() {}
}
