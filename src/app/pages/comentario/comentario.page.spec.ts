import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComentarioPage } from './comentario.page';

describe('ComentarioPage', () => {
  let component: ComentarioPage;
  let fixture: ComponentFixture<ComentarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ComentarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
