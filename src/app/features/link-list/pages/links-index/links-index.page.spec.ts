import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinksIndexPage } from './links-index.page';

describe('LinkListIndexComponent', () => {
  let component: LinksIndexPage;
  let fixture: ComponentFixture<LinksIndexPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinksIndexPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinksIndexPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
