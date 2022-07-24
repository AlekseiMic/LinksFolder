import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-edit-link-form',
  styleUrls: ['./edit-link-form.component.scss'],
  templateUrl: './edit-link-form.component.html',
})
export class EditLinkFormComponent implements OnInit {
  @Input() id: number;

  @Input() link?: string;

  @Input() name?: string;

  @Output() onSubmit: EventEmitter<{ link: string; name: string }> =
    new EventEmitter();

  constructor(private formBuilder: UntypedFormBuilder) {}

  editLinkForm = this.formBuilder.group({
    link: '',
    name: '',
  });

  submit(): void {
    this.onSubmit.emit(this.editLinkForm.value);
  }

  ngOnInit(): void {
    this.editLinkForm.controls['link'].reset(this.link);
    this.editLinkForm.controls['name'].reset(this.name);
  }
}
