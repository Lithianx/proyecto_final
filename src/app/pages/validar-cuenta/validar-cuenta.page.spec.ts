import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidarCuentaPage } from './validar-cuenta.page';

describe('ValidarCuentaPage', () => {
  let component: ValidarCuentaPage;
  let fixture: ComponentFixture<ValidarCuentaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidarCuentaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
