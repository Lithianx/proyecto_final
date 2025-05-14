import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleEventoPage } from './detalle-evento.page';

describe('DetalleEventoPage', () => {
  let component: DetalleEventoPage;
  let fixture: ComponentFixture<DetalleEventoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleEventoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
