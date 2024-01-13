import { Component } from '@angular/core';
import { DataProviderService } from 'src/app/services/data-provider.service';

@Component({
  selector: 'app-abi',
  templateUrl: './abi.component.html',
  styleUrls: ['./abi.component.css']
})
export class AbiComponent {
  constructor(public readonly daten: DataProviderService) {}
}
