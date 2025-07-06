import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventoFinalizadoPage } from './evento-finalizado.page';

describe('EventoFinalizadoPage', () => {
  let component: EventoFinalizadoPage;
  let fixture: ComponentFixture<EventoFinalizadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventoFinalizadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
