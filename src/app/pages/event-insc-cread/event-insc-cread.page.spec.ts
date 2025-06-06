import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventInscCreadPage } from './event-insc-cread.page';

describe('EventInscCreadPage', () => {
  let component: EventInscCreadPage;
  let fixture: ComponentFixture<EventInscCreadPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventInscCreadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
