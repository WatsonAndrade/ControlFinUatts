import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumoAnualComponent } from './resumo-anual.component';

describe('ResumoAnualComponent', () => {
  let component: ResumoAnualComponent;
  let fixture: ComponentFixture<ResumoAnualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumoAnualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumoAnualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
