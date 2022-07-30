import { Component, Input, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { LinkService } from '../../services/link.service';

@Component({
  selector: 'app-link-form',
  styleUrls: ['./link.form.component.scss'],
  templateUrl: './link.form.component.html',
})
export class LinkFormComponent implements OnInit {
  ngOnInit(): void {}

  @Input() create?: (url: string) => void;

  @Input() showDescription?: boolean;

  @Input() createFolder?: (name: string) => void;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private linkService: LinkService
  ) {}

  newLinkForm = this.formBuilder.group({
    link: new FormControl('', [Validators.required, Validators.minLength(10), Validators.pattern(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)]),
  });

  onCreateLink(): void {
    const link = this.newLinkForm.value.link;
    this.linkService.addLink(link);
    this.newLinkForm.controls['link'].reset();
  }

  onSubmit(): void {
    // this.items.push(this.newLinkForm.value.link);
  }

  get lino() {
    const lin =  this.newLinkForm.get('link');
    console.log(lin);
    return lin;
  }
}
