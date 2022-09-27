import { Component, Input, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { LinkService } from '../../services/link.service';

const linkRegex =
  /^ *(?:(https?:\/\/(?:www\.)?[-\w@:%._\+~#=]{1,256}\.[\w()]{1,6}(?:[-\w()@:%_\+.~#?&/=]*)) *([-_@$!%^&*() \w]*)((?: *#[-\w_]+)*) *)+$/;

@Component({
  selector: 'app-link-form',
  styleUrls: ['./link.form.component.scss'],
  templateUrl: './link.form.component.html',
})
export class LinkFormComponent implements OnInit {
  ngOnInit(): void {}

  @Input() showDescription?: boolean;

  @Input() directory: number | null = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private linkService: LinkService
  ) {}

  newLinkForm = this.formBuilder.group({
    link: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.pattern(linkRegex),
    ]),
  });

  onCreateLink(): void {
    if (!this.newLinkForm.valid || this.directory === null) return;
    const link: string = this.newLinkForm.value.link;
    const reg = new RegExp(linkRegex);

    const links: { url: string; text: string; tags?: string[] }[] = [];
    link
      .split('http')
      .filter((el) => el.trim() !== '')
      .forEach((el) => {
        const str = 'http' + el;
        const match = reg.exec(str);
        if (!match) return;
        const url = match[1];
        const text = match[2]?.trim();
        const tags = match[3]
          ?.trim()
          .split('#')
          .filter((el) => el !== '')
          .map((el) => el.trim());
        links.push({ url, text: text || url, tags });
      });

    this.linkService.addLinks(this.directory, links).subscribe((res) => {
      if (res) {
        this.newLinkForm.controls['link'].reset('');
      }
    });
  }

  onSubmit(): void {
    // this.items.push(this.newLinkForm.value.link);
  }

  get lino() {
    const lin = this.newLinkForm.get('link');
    return lin;
  }
}
