import { Component } from '@angular/core';
import { AbiPruefung, Fach, Typ } from 'src/app/global/daten';
import { DataProviderService } from 'src/app/services/data-provider.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  download() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.dataProviderService.daten));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "export.json");
    dlAnchorElem.click();
  }
  open() {
    let inp = document.getElementById('inp') as HTMLInputElement;

    if (inp.files) {
      const file = inp.files?.item(0);
      file?.text().then(t => {
        try {
          this.dataProviderService.daten = JSON.parse(t);
          this.dataProviderService.speichern();
        } catch (e) {
          console.error(e);
        }
      })
    }
  }
  fachEntfernen(f: Fach) {
    if (confirm('Dieses Fach wirklich löschen?')) {
      const index = this.dataProviderService.daten.faecher.indexOf(f);
      if (index != -1) {
        this.dataProviderService.daten.faecher.splice(index, 1);
        this.dataProviderService.speichern();
      }
    }
  }

  constructor(public dataProviderService: DataProviderService) { }

  public fachHinzufuegen() {
    const name = prompt('Name?')
    const typ = prompt('Typ?')
    if (name && typ)
    this.dataProviderService.fachHinzufuegen({
      name: name,
      typ: typ as Typ,
      id: this.dataProviderService.getNewIdForFach(),
      leistungen: [],
      gewichtungen: [[], [], [], []]
    })
  }
}
