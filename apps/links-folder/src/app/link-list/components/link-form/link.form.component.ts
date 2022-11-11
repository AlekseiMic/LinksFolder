import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { linkRegexComplex } from '../../linkRegex';

type Link = { url: string; text: string; tags?: string[] };

@Component({
  selector: 'app-link-form',
  styleUrls: ['link.form.component.scss'],
  templateUrl: 'link.form.component.html',
})
export class LinkFormComponent implements OnInit {
  @Input('roundedLeft') roundedLeft = 10;

  @Input('roundedRight') roundedRight = 10;

  @Input('height') height = 38;

  @Output() onSubmit: EventEmitter<Link[]> = new EventEmitter();

  formControl: FormControl;

  ngOnInit(): void {
    this.formControl = new FormControl('', {
      validators: [Validators.pattern(linkRegexComplex)],
    });
  }

  get errors() {
    return Object.entries(this.formControl.errors ?? {});
  }

  onCreateLink(): void {
    const link = this.formControl.value as string;
    if (!this.formControl.valid || !link) return;

    const links = link
      .split('http')
      .filter((el) => el.trim() !== '')
      .reduce((acc: Link[], el) => {
        const match = linkRegexComplex.exec('http' + el);
        if (!match) return acc;
        const url = match[1].trim();
        const text = match[2]?.trim() ?? url;
        acc.push({ url, text });
        return acc;
      }, []);

    this.formControl.reset('');
    this.formControl.setErrors(null);

    this.onSubmit.emit(links);
  }
}
