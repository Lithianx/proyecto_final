import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportarCuentaPage } from './reportar-cuenta.page';

describe('ReportarCuentaPage', () => {
  let component: ReportarCuentaPage;
  let fixture: ComponentFixture<ReportarCuentaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportarCuentaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
