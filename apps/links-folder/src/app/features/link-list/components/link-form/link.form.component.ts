import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ImportLinksDialog } from '../../dialogs/import-links-dialog/import-links.dialog';
import { LinkService } from '../../services/link.service';

const linkRegex =
  /^ *(?:(https?:\/\/(?:www\.)?[-\w@:%._\+~#=]{1,256}\.[\w()]{1,6}(?:[-\w()@:%_\+.~#?&/=]*)) *([-_@$!%^&*() \w]*)((?: *#[-\w_]+)*) *)*$/;

@Component({
  selector: 'app-link-form',
  styleUrls: ['./link.form.component.scss'],
  templateUrl: './link.form.component.html',
})
export class LinkFormComponent implements OnInit {
  ngOnInit(): void {}

  @Input() showDescription?: boolean;

  @Input() directory: { value: number; label: string }[] | null = null;

  @Input() hide = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private linkService: LinkService,
    private dialog: MatDialog
  ) {}

  newLinkForm = this.formBuilder.group({
    link: new FormControl('', [Validators.pattern(linkRegex)]),
    directory: null,
  });

  ngOnChanges(changes: SimpleChanges) {
    let newValue = changes['directory'].currentValue;
    if (newValue && newValue.length === 1) newValue = newValue[0].value;
    if (typeof newValue === 'number') {
      this.newLinkForm.controls['directory'].reset(newValue);
    }
  }

  openImportDialog() {
    this.dialog.open(ImportLinksDialog, {
      data: {
        dir: this.newLinkForm.value.directory,
      },
    });
  }

  onCreateLink(): void {
    if (!this.newLinkForm.valid) return;
    const directory = this.newLinkForm.value.directory;
    const link: string = this.newLinkForm.value.link;

    if (!directory || !link) return;

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

    this.linkService.addLinks(directory, links).subscribe((res) => {
      if (res) {
        this.newLinkForm.controls['link'].reset('');
        this.newLinkForm.controls['link'].setErrors(null);
      }
    });
  }

  get lino() {
    const lin = this.newLinkForm.get('link');
    return lin;
  }
}
