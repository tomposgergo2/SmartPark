import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tickets.component.html'
})
export class TicketsComponent {
  tickets = this.storage.getTickets();
  constructor(private storage: StorageService) {}
}
