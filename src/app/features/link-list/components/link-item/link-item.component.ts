import { Component, Input, OnInit } from "@angular/core";


@Component({
  selector: 'app-link-item',
  templateUrl: './link-item.component.html',
  styleUrls: ['./link-item.component.scss']
})
export class LinkItemComponent implements OnInit {
  @Input() text:string='';

  ngOnInit(): void {}
}
