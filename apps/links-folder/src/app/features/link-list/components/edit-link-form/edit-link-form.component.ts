import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-edit-link-form',
  styleUrls: ['./edit-link-form.component.scss'],
  templateUrl: './edit-link-form.component.html',
})
export class EditLinkFormComponent implements OnInit {
  @Input() id: number;

  @Input() url?: string;

  @Input() text?: string;

  @Output() onSubmit: EventEmitter<{ url: string; text: string }> =
    new EventEmitter();

  constructor(private formBuilder: UntypedFormBuilder) {}

  editLinkForm = this.formBuilder.group({
    url: '',
    text: '',
  });

  submit(): void {
    this.onSubmit.emit(this.editLinkForm.value);
  }

  ngOnInit(): void {
    this.editLinkForm.controls['url'].reset(this.url);
    this.editLinkForm.controls['text'].reset(this.text);
  }
}
