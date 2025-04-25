import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatPrivadoPage } from './chat-privado.page';

describe('ChatPrivadoPage', () => {
  let component: ChatPrivadoPage;
  let fixture: ComponentFixture<ChatPrivadoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatPrivadoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
