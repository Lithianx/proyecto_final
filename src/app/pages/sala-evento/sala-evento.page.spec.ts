import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalaEventoPage } from './sala-evento.page';

describe('SalaEventoPage', () => {
  let component: SalaEventoPage;
  let fixture: ComponentFixture<SalaEventoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SalaEventoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
