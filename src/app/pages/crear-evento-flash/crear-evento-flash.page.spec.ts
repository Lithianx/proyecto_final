import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearEventoFlashPage } from './crear-evento-flash.page';

describe('CrearEventoFlashPage', () => {
  let component: CrearEventoFlashPage;
  let fixture: ComponentFixture<CrearEventoFlashPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearEventoFlashPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
