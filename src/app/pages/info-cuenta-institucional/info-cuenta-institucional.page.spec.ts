import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoCuentaInstitucionalPage } from './info-cuenta-institucional.page';

describe('InfoCuentaInstitucionalPage', () => {
  let component: InfoCuentaInstitucionalPage;
  let fixture: ComponentFixture<InfoCuentaInstitucionalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoCuentaInstitucionalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
