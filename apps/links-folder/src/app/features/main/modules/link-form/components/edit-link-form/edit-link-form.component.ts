import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { linkRegex } from 'app/linkRegex';
import { SimpleLink } from 'app/types';

@Component({
  selector: 'app-edit-link-form',
  templateUrl: './edit-link-form.component.html',
})
export class EditLinkForm implements OnInit {
  @Input() link: SimpleLink;

  @Output() onSubmit: EventEmitter<SimpleLink> = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {}

  editLinkForm = this.formBuilder.group({
    url: ['', [Validators.required, Validators.pattern(linkRegex)]],
    text: ['', [Validators.required, Validators.minLength(4)]],
  });

  submit(): void {
    const url = this.editLinkForm.controls.url.value;
    const text = this.editLinkForm.controls.text.value;
    if (!url || !text) return;
    this.onSubmit.emit({ url, text });
  }

  ngOnInit(): void {
    this.editLinkForm.controls['url'].reset(this.link.url);
    this.editLinkForm.controls['text'].reset(this.link.text);
  }
}
