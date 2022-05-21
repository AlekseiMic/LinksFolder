import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";


@Component({
  selector: 'app-link-form',
  templateUrl: './link-form.component.html',
})
export class LinkFormComponent implements OnInit {
  ngOnInit(): void {}

  @Input() create?: (url: string) => void;

  constructor(private formBuilder: FormBuilder) { }

  newLinkForm = this.formBuilder.group({
    link: '',
  });

  onSubmit(): void {
    if (this.create) {
      this.create(this.newLinkForm.value.link);
    }
    // this.items.push(this.newLinkForm.value.link);
  }

}
