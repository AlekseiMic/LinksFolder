import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: 'app-link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.scss']
})
export class LinkListComponent implements OnInit {

  @Input() items: string[]=[];

  @Input() drop: (event:CdkDragDrop<string[], any, any>) => void = () =>{};

  ngOnInit(): void {

  }
}
