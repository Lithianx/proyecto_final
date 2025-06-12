import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminReportePage } from './admin-reporte.page';

describe('AdminReportePage', () => {
  let component: AdminReportePage;
  let fixture: ComponentFixture<AdminReportePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminReportePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
