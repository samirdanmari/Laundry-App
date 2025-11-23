import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ordersettings } from './ordersettings';

describe('Ordersettings', () => {
  let component: Ordersettings;
  let fixture: ComponentFixture<Ordersettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ordersettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ordersettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
