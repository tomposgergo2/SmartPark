import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-fines',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fines.component.html'
})
export class FinesComponent {
  fines = this.storage.getFines();
  constructor(private storage: StorageService) {}

  payFine(id: string): void {
    this.fines = this.fines.map(f => f.id === id ? { ...f, status: 'paid' } : f);
    this.storage.saveFines(this.fines);
  }
}
