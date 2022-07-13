import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { LinkService } from '../../services/link.service';

@Component({
  selector: 'app-link-form',
  styleUrls: ['./link.form.component.scss'],
  templateUrl: './link.form.component.html',
})
export class LinkFormComponent implements OnInit {
  ngOnInit(): void {}

  @Input() create?: (url: string) => void;

  @Input() createFolder?: (name: string) => void;

  constructor(
    private formBuilder: FormBuilder,
    private linkService: LinkService
  ) {}

  newLinkForm = this.formBuilder.group({
    link: '',
  });

  onCreateLink(): void {
    const link = this.newLinkForm.value.link;
    this.linkService.addLink(link);
    this.newLinkForm.controls['link'].reset();
  }

  onSubmit(): void {
    // this.items.push(this.newLinkForm.value.link);
  }
}
