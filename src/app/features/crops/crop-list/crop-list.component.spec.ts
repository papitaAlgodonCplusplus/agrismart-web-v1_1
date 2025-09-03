import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropListComponent } from './crop-list.component';

describe('CropListComponent', () => {
  let component: CropListComponent;
  let fixture: ComponentFixture<CropListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CropListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CropListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
