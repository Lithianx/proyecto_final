import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventoInscritoPage } from './evento-inscrito.page';

describe('EventoInscritoPage', () => {
  let component: EventoInscritoPage;
  let fixture: ComponentFixture<EventoInscritoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventoInscritoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
