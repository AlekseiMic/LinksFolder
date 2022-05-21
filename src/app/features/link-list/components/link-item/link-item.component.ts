import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-link-item',
  templateUrl: './link-item.component.html',
  styleUrls: ['./link-item.component.scss'],
})
export class LinkItemComponent implements OnInit {
  @Input() text: string = '';

  @Input() id?: number;

  @Input() delete?: (id: number) => void;

  @Input() edit?: (id: number) => void;

  onDelete() {
    if (this.id === undefined || !this.delete) return;
    this.delete(this.id);
  }

  onEdit() {
    if (this.id === undefined || !this.edit) return;
    this.edit(this.id);
  }

  ngOnInit(): void {}
}
