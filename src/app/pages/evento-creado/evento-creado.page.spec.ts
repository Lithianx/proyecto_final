import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventoCreadoPage } from './evento-creado.page';

describe('EventoCreadoPage', () => {
  let component: EventoCreadoPage;
  let fixture: ComponentFixture<EventoCreadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventoCreadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
