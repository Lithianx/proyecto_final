import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesPublicacionPersonalPage } from './detalles-publicacion-personal.page';

describe('DetallesPublicacionPersonalPage', () => {
  let component: DetallesPublicacionPersonalPage;
  let fixture: ComponentFixture<DetallesPublicacionPersonalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetallesPublicacionPersonalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
