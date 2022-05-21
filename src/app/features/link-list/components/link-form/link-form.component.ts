import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";


@Component({
  selector: 'app-link-form',
  templateUrl: './link-form.component.html',
})
export class LinkFormComponent implements OnInit {
  ngOnInit(): void {}

  constructor(private formBuilder: FormBuilder) { }

  newLinkForm = this.formBuilder.group({
    link: '',
  });

  onSubmit(): void {
    console.log(this.newLinkForm);
    // this.items.push(this.newLinkForm.value.link);
  }

}
