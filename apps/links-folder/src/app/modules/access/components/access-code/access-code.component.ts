import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccessRule } from 'app/types';
import { Location } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';

type EventPayload = { dir: number; code: AccessRule };

@Component({
  selector: 'app-access-code',
  templateUrl: './access-code.component.html',
  styleUrls: ['./access-code.component.scss'],
})
export class AccessCode implements OnInit {
  @Input('code') code: AccessRule;

  @Input('editable') editable: boolean = false;

  @Input('directory') dir: number;

  @Output() onEdit = new EventEmitter<EventPayload>();

  @Output() onCopy = new EventEmitter<EventPayload>();

  @Output() onProlong = new EventEmitter<EventPayload>();

  constructor(private clipboard: Clipboard, readonly location: Location) {}

  ngOnInit(): void {}

  edit() {
    this.onEdit.emit({ dir: this.dir, code: this.code });
  }

  prolong() {
    this.onProlong.emit({ dir: this.dir, code: this.code });
  }

  copy(code: string) {
    if (this.clipboard.copy(this.makeUrl(code))) {
      this.onCopy.emit({ dir: this.dir, code: this.code });
    }
  }

  makeUrl(code: string) {
    const origin = document.location.origin;
    return origin + this.location.prepareExternalUrl(code);
  }
}
