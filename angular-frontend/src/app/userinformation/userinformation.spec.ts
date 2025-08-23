import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Userinformation } from './userinformation';

describe('Userinformation', () => {
  let component: Userinformation;
  let fixture: ComponentFixture<Userinformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Userinformation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Userinformation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
