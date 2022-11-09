import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { SimpleLink } from '../../types';

@Component({
  selector: 'app-edit-link-form',
  templateUrl: './edit-link-form.component.html',
})
export class EditLinkForm implements OnInit {
  @Input() link: SimpleLink;

  @Output() onSubmit: EventEmitter<SimpleLink> = new EventEmitter();

  constructor(private formBuilder: UntypedFormBuilder) {}

  editLinkForm = this.formBuilder.group({
    url: '',
    text: '',
  });

  submit(): void {
    this.onSubmit.emit(this.editLinkForm.value);
  }

  ngOnInit(): void {
    this.editLinkForm.controls['url'].reset(this.link.url);
    this.editLinkForm.controls['text'].reset(this.link.text);
  }
}
