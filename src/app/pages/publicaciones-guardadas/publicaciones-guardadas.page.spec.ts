import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicacionesGuardadasPage } from './publicaciones-guardadas.page';

describe('PublicacionesGuardadasPage', () => {
  let component: PublicacionesGuardadasPage;
  let fixture: ComponentFixture<PublicacionesGuardadasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicacionesGuardadasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
