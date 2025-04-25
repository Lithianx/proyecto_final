import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaChatPage } from './lista-chat.page';

describe('ListaChatPage', () => {
  let component: ListaChatPage;
  let fixture: ComponentFixture<ListaChatPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
