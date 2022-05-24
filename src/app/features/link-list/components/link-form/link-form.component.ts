import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";


@Component({
  selector: 'app-link-form',
  templateUrl: './link-form.component.html',
})
export class LinkFormComponent implements OnInit {
  ngOnInit(): void {}

  @Input() create?: (url: string) => void;

  @Input() createFolder?: (name: string) => void;

  constructor(private formBuilder: FormBuilder) { }

  newLinkForm = this.formBuilder.group({
    link: '',
    folder: '',
  });

  onCreateLink(): void {
    if (this.create) {
      this.create(this.newLinkForm.value.link);
      this.newLinkForm.controls['link'].reset();
    }
  }

  onCreateFolder(): void {
    if (this.createFolder) {
      this.createFolder(this.newLinkForm.value.folder);
      this.newLinkForm.controls['folder'].reset();
    }
  }

  onSubmit(): void {
    // this.items.push(this.newLinkForm.value.link);
  }

}
