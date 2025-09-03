import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmListComponent } from './farm-list.component';

describe('FarmListComponent', () => {
  let component: FarmListComponent;
  let fixture: ComponentFixture<FarmListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
