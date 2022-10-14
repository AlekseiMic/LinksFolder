import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';

@Component({
  selector: 'app-create-subdir-form',
  styleUrls: ['./create-subdir-form.component.scss'],
  templateUrl: './create-subdir-form.component.html',
})
export class CreateSubdirFormComponent implements OnInit {
  @Output() onSubmit: EventEmitter<{ name: string }> = new EventEmitter();

  constructor(private formBuilder: UntypedFormBuilder) {}

  createSubdirForm = this.formBuilder.group({
    name: '',
  });

  submit(): void {
    this.onSubmit.emit(this.createSubdirForm.value);
  }

  ngOnInit(): void {
    this.createSubdirForm.controls['name'].reset('');
  }
}