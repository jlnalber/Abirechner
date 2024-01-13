import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Fach, Gewichtung, Gewichtungen, Leistung } from 'src/app/global/daten';
import { DataProviderService } from 'src/app/services/data-provider.service';

@Component({
  selector: 'app-fach',
  templateUrl: './fach.component.html',
  styleUrls: ['./fach.component.css']
})
export class FachComponent {
  abiPruefungEntfernen() {
    if (confirm('Abiturprüfung wirklich löschen?'))
    for (let i = 0; i < this.daten.daten.abiPruefungen.length; i++) {
      if (this.daten.daten.abiPruefungen[i] !== undefined && this.fach && this.daten.daten.abiPruefungen[i]!.fach === this.fach.id) {
        this.daten.daten.abiPruefungen[i] = undefined;
        break;
      }
    }
    this.daten.speichern();
  }
  abiPruefungHinzufuegen() {
    for (let i = 0; i < this.daten.daten.abiPruefungen.length; i++) {
      if (!this.daten.daten.abiPruefungen[i] && this.fach) {
        this.daten.daten.abiPruefungen[i] = {
          note: 0,
          schonGeschrieben: false,
          fach: this.fach.id
        }
        break;
      }
    }
    this.daten.speichern();
  }
  gewichtungEntfernen(g: Gewichtung, hj: number) {
    if (this.fach && confirm('Diese Gewichtung wirklich löschen?')) {
      const index = this.fach.gewichtungen[hj - 1].indexOf(g);
      if (index != -1) {
        this.fach.gewichtungen[hj - 1].splice(index, 1);
        const l = this.daten.getLeistungenForGewichtung(g, this.fach);
        for (let i of l) {
          this.leistungEntfernen(i);
        }
        this.daten.speichern();
      }
    }
  }
  leistungEntfernen(l: Leistung) {
    if (this.fach) {
      const index = this.fach.leistungen.indexOf(l);
      if (index != -1) {
        this.fach.leistungen.splice(index, 1);
        this.daten.speichern();
      }
    }
  }
  addLeistung(gew: Gewichtung, hj: number) {
    const name = prompt('Name?')
    if (name && this.fach) {
      this.daten.leistungHinzufuegen({
        kategorie: gew.id,
        halbjahr: hj as 1 | 2 | 3 | 4,
        note: 0,
        name,
        auslassen: false,
        wertung: 1
      }, this.fach)
    }
  }

  addGewichtung(hj: number) {
    const name = prompt('Name?');
    if (name && this.fach)
    this.daten.gewichtungHinzufuegen(this.fach.gewichtungen[hj - 1], {
      name,
      wertung: 1,
      id: this.daten.getNewIdForGewichtung(this.fach)
    })
  }

  hatAbiPruefung(): boolean {
    for (let n of this.daten.daten.abiPruefungen) {
      if (n) {
        if (n.fach === this.fach?.id) {
          return true;
        }
      }
    }
    return false;
  }

  hatPlatzFuerAbipruefung(): boolean {
    for (let n of this.daten.daten.abiPruefungen) {
      if (!n) {
        return true;
      }
    }
    return false;
  }
  
  constructor(private route: ActivatedRoute, public daten: DataProviderService) {
    route.params.subscribe(p => {
      this.fach = daten.getFachForId(Number.parseInt(p['id']))
      if (this.fach) {
        this.noten = [this.fach.note1 ?? 0, this.fach.note2 ?? 0, this.fach.note3 ?? 0, this.fach.note4 ?? 0];
        this.notenUeberschreiben = [this.fach.note1 !== undefined, this.fach.note2 !== undefined, this.fach.note3 !== undefined, this.fach.note4 !== undefined]
      }
    })
  }

  public fach: Fach | undefined;

  public get halbjahre() {
    return this.daten.getHalbjahreForFach(this.fach?.typ);
  }

  public getLeistungenForGewichtung(g: Gewichtung): Leistung[] {
    if (!this.fach) return [];
    return this.daten.getLeistungenForGewichtung(g, this.fach);
  }

  public noten = [0, 0, 0, 0]
  public notenUeberschreiben = [false, false, false, false]

  public ueberschreibenSpeichern() {
    if (this.fach)
    for (let i of this.halbjahre) {
      if (this.notenUeberschreiben[i - 1]) {
        switch (i) {
          case 1: this.fach.note1 = this.noten[i - 1]; break;
          case 2: this.fach.note2 = this.noten[i - 1]; break;
          case 3: this.fach.note3 = this.noten[i - 1]; break;
          case 4: this.fach.note4 = this.noten[i - 1]; break;
        }

      } else {
        switch (i) {
          case 1: this.fach.note1 = undefined; break;
          case 2: this.fach.note2 = undefined; break;
          case 3: this.fach.note3 = undefined; break;
          case 4: this.fach.note4 = undefined; break;
        }
      }
    }
    this.daten.speichern();
  }

}
