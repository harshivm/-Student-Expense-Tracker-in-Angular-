import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Dashboard } from "./dashboard/dashboard"; // Add this
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; // ADD THESE
@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Dashboard,ReactiveFormsModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('studentexp');
}
