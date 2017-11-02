import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryFoodListingsFiltersComponent } from './delivery-food-listings-filters.component';

describe('DeliveryFoodListingsFiltersComponent', () => {
  let component: DeliveryFoodListingsFiltersComponent;
  let fixture: ComponentFixture<DeliveryFoodListingsFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryFoodListingsFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryFoodListingsFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
