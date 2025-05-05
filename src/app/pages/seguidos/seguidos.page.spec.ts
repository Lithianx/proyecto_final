import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeguidosPage } from './seguidos.page';

describe('SeguidosPage', () => {
  let component: SeguidosPage;
  let fixture: ComponentFixture<SeguidosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SeguidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
