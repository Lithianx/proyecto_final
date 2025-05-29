import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuscarPersonaPage } from './buscar-persona.page';

describe('BuscarPersonaPage', () => {
  let component: BuscarPersonaPage;
  let fixture: ComponentFixture<BuscarPersonaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarPersonaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
