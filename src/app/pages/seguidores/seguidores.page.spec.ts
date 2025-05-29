import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeguidoresPage } from './seguidores.page';

describe('SeguidoresPage', () => {
  let component: SeguidoresPage;
  let fixture: ComponentFixture<SeguidoresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SeguidoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
