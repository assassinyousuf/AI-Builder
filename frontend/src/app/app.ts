import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DynamicCursorComponent } from './shared/components/dynamic-cursor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DynamicCursorComponent],
  template: `
    <app-dynamic-cursor />
    <router-outlet />
  `,
})
export class App {}
