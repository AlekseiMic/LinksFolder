import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { linkRegexComplex } from '../../linkRegex';

type Link = { url: string; text: string; tags?: string[] };

@Component({
  selector: 'app-link-form',
  styleUrls: ['link.form.component.scss'],
  templateUrl: 'link.form.component.html',
})
export class LinkFormComponent {
  @Input('roundedLeft') roundedLeft = 10;

  @Input('roundedRight') roundedRight = 10;

  @Input('height') height = 38;

  @Input('showExample') showExample = false;

  @Output() onSubmit: EventEmitter<Link[]> = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {}

  formGroup = this.formBuilder.group({
    field: ['', [Validators.pattern(linkRegexComplex)]],
  });

  get errors() {
    return Object.entries(this.formGroup.controls['field'].errors ?? {});
  }

  get errorMapper() {
    return { pattern: 'Wrong url, example: "http://example.com Example Link"' };
  }

  onCreateLink(): void {
    const link = this.formGroup.controls['field'].value as string;
    if (!this.formGroup.valid || !link) return;

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

    this.formGroup.controls['field'].reset('');
    this.formGroup.controls['field'].setErrors(null);

    this.onSubmit.emit(links);
  }
}
