import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbiComponent } from './abi.component';

describe('AbiComponent', () => {
  let component: AbiComponent;
  let fixture: ComponentFixture<AbiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbiComponent]
    });
    fixture = TestBed.createComponent(AbiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
