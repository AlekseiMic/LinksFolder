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
    link: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.pattern(
        /^ *([-\w/]*?\/?https?:\/\/(www\.)?[-\w@:%._\+~#=]{1,256}\.[\w()]{1,6}\b([-\w()@:%_\+.~#?&/=]*)([-_@$!%^&*() \w]*?)\b( #[-\w_]*)* *)+$/
      ),
    ]),
  });

  onCreateLink(): void {
    if (!this.newLinkForm.valid) return;
    const link: string = this.newLinkForm.value.link;
    let links = link.split(';');
    let prefix = '';

    if (links.length === 1) {
      prefix = 'http';
      links = link.split('http');
    }
    const clearLinks = links
      .filter((el) => el !== '')
      .map((el) => {
        let str = (prefix + el).trim();
        let [url, ...name] = str.split(' ');
        const text = name.map((el) => el.trim()).join(' ');
        return { url, text: text || url };
      });

    this.linkService.addLinks(clearLinks);
    this.newLinkForm.controls['link'].reset('');
  }

  onSubmit(): void {
    // this.items.push(this.newLinkForm.value.link);
  }

  get lino() {
    const lin = this.newLinkForm.get('link');
    return lin;
  }
}
