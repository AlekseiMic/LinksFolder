import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-dir-access-form',
  styleUrls: ['./dir-access-form.component.scss'],
  templateUrl: './dir-access-form.component.html',
})
export class DirAccessForm implements OnInit {
  @Input() code?: string;

  @Input() username?: string;

  @Input() expires?: Date;

  @Output() onSubmit: EventEmitter<{ code?: string, username?: string, expires: Date }> = new EventEmitter();

  constructor(private formBuilder: UntypedFormBuilder) {}

  dirAccessForm = this.formBuilder.group({
    code: '',
    username: '',
    expires: new Date(),
  });

  submit(): void {
    this.onSubmit.emit(this.dirAccessForm.value);
  }

  ngOnInit(): void {
    this.dirAccessForm.controls['code'].reset(this.code);
    this.dirAccessForm.controls['username'].reset(this.username);
    this.dirAccessForm.controls['expires'].reset(this.expires);
  }
}
