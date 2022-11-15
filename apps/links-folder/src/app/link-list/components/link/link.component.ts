import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Link as LinkType } from '../../types';

type EventPayload = LinkType;

@Component({
  selector: 'app-link',
  templateUrl: 'link.component.html',
  styleUrls: ['link.component.scss'],
})
export class Link {
  @Input() editable: boolean;

  @Input() owned: boolean;

  @Input() selectable: boolean;

  @Input() selected: boolean;

  @Input() link: LinkType;

  @Output() onEdit = new EventEmitter<EventPayload>();

  @Output() onDelete = new EventEmitter<EventPayload>();

  @Output() onSelect = new EventEmitter<EventPayload>();

  @Output() onUnselect = new EventEmitter<EventPayload>();

  checkboxHandler(event: Event) {
    if ((event.target as HTMLInputElement).checked) {
      this.onSelect.emit(this.link);
    } else {
      this.onUnselect.emit(this.link);
    }
  }

  edit() {
    this.onEdit.emit(this.link);
  }

  delete() {
    this.onDelete.emit(this.link);
  }
}
