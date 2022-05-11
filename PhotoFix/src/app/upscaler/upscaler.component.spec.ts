import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpscalerComponent } from './upscaler.component';

describe('UpscalerComponent', () => {
  let component: UpscalerComponent;
  let fixture: ComponentFixture<UpscalerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpscalerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpscalerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
