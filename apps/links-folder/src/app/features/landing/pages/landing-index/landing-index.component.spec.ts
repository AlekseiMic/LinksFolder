import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingIndexComponent } from './landing-index.component';

describe('LandingIndexComponent', () => {
  let component: LandingIndexComponent;
  let fixture: ComponentFixture<LandingIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandingIndexComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
