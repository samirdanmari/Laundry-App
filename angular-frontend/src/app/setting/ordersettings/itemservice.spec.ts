import { TestBed } from '@angular/core/testing';

import { Itemservice } from './itemservice';

describe('Itemservice', () => {
  let service: Itemservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Itemservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
