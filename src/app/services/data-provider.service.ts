import { AbiPruefung, Gewichtung, Gewichtungen, Leistung } from './../global/daten';
import { Injectable } from '@angular/core';
import { Daten, Fach } from '../global/daten';

@Injectable({
  providedIn: 'root'
})
export class DataProviderService {
  leistungHinzufuegen(l: Leistung, f: Fach) {
    f.leistungen.push(l);
    this.speichern();
  }
  gewichtungHinzufuegen(gew: Gewichtungen, el: Gewichtung) {
    gew.push(el);
    this.speichern();
  }

  constructor() {
    const data = localStorage['d'];
    try {
      this.daten = JSON.parse(data);
    }
    catch {
      this.daten = { faecher: [], abiPruefungen: [undefined, undefined, undefined, undefined, undefined] };
    }
    this.speichern();
  }


  public getLeistungenForGewichtung(g: Gewichtung, f: Fach): Leistung[] {
    return f.leistungen.filter(i => i.kategorie === g.id);
  }

  public daten: Daten;

  public speichern() {
    localStorage['d'] = JSON.stringify(this.daten);
  }

  public getFachForId(id: number): Fach | undefined {
    for (let fach of this.daten.faecher) {
      if (fach.id === id) {
        return fach;
      }
    }
    return undefined;
  }

  public static getNewId<T>(n: T[], idProvider: (el: T) => number): number {
    let counter = 0;
    while (DataProviderService.where(n, i => idProvider(i) === counter)) {
      counter++;
    }

    return counter;
  }

  public static where<T>(n: T[], pred: (el: T) => boolean): boolean {
    for (let el of n) {
      if (pred(el)) {
        return true;
      }
    }
    return false;
  }

  public getNewIdForFach(): number {
    return DataProviderService.getNewId(this.daten.faecher, (f: Fach) => f.id);
  }

  public getNewIdForGewichtung(fach: Fach): number {
    const arr: Gewichtungen = [];
    for (let g of fach.gewichtungen) {
      arr.push(...g);
    }
    return DataProviderService.getNewId(arr, g => g.id)
  }

  public fachHinzufuegen(fach: Fach) {
    this.daten.faecher.push(fach);
    this.speichern();
  }

  public getNoteFuer(fach: number, hj: number, round: boolean = true, defaultValue: number = NaN, mapLeistungZuNote: (l: Leistung) => number = (i) => i.note): number {
    if (this.getFachForId(fach) === undefined) {
      return defaultValue;
    }

    const f = this.getFachForId(fach)!;
    if (hj === 1 && f.note1 !== undefined) {
      return f.note1;
    }
    if (hj === 2 && f.note2 !== undefined) {
      return f.note2;
    }
    if (hj === 3 && f.note3 !== undefined) {
      return f.note3;
    }
    if (hj === 4 && f.note4 !== undefined) {
      return f.note4;
    }
    const leistungen = f.leistungen.filter(i => i.halbjahr == hj);
    if (leistungen.length == 0) {
      return defaultValue;
    }

    const gewichtungen = f.gewichtungen[hj - 1];
    
    let summe = 0;
    let summeGewichtungen = 0;
    for (let g of gewichtungen) {
      const l = this.getLeistungenForGewichtung(g, f).filter(i => !i.auslassen && i.wertung !== 0);
      let s = 0;
      for (let i of l) {
        s += mapLeistungZuNote(i) * g.wertung * i.wertung;
      }
      if (l.length !== 0) {
        summeGewichtungen += g.wertung;
        s /= DataProviderService.sum(l, i => i.wertung);
        summe += s;
      }
    }

    if (summeGewichtungen === 0) {
      return defaultValue;
    }
    return round ? Math.round(summe / summeGewichtungen) : summe / summeGewichtungen;
  }

  public getPunkteBlock1(): number | undefined {
    return this.rechnePunkteBlock1(i => i, 0);
  }

  public rechnePunkteBlock1(getNote: (note: number, fach: Fach) => number, defaultValue: number, mapLeistungZuNote: (l: Leistung) => number = (i) => i.note): number | undefined {
    let p = 0;

    // Zuerst die Leistungsfächer
    const lfs = this.daten.faecher.filter(f => f.typ === 'lf');
    if (lfs.length !== 3) {
      return undefined;
    }
    const punkteLfs = lfs.map(f => DataProviderService.sum(this.getHalbjahreForFach(f.typ).map(hj => getNote(this.getNoteFuer(f.id, hj, true, defaultValue, mapLeistungZuNote), f)), i => i)).sort();
    p += punkteLfs[0] + 2 * (punkteLfs[1] + punkteLfs[2])

    // Jetzt den Rest
    const rest = this.daten.faecher.filter(f => f.typ !== 'lf');
    const anrechnungsPflichtig: number[] = [];
    let anderePunkte: number[] = [];
    for (let fach of rest) {
      const noten = this.getHalbjahreForFach(fach.typ).map(hj => getNote(this.getNoteFuer(fach.id, hj, true, defaultValue, mapLeistungZuNote), fach)).sort();
      if (fach.typ === 'bf4') {
        anrechnungsPflichtig.push(...noten);
      }
      else if (fach.typ === 'bf2') {
        anrechnungsPflichtig.push(noten[2], noten[3]);
        anderePunkte.push(noten[0], noten[1]);
      }
      else {
        anderePunkte.push(...noten);
      }
    }

    if (anderePunkte.length + anrechnungsPflichtig.length < 28) {
      return undefined;
    }

    anderePunkte = anderePunkte.sort().reverse();
    p += DataProviderService.sum(anrechnungsPflichtig, i => i);
    p += DataProviderService.sum(anderePunkte.slice(0, 28 - anrechnungsPflichtig.length), i => i)

    return Math.round(p * 40 / 48);
  }

  public getPunkteBlock1Prognose(): number | undefined {
    return this.rechnePunkteBlock1((note: number, fach: Fach) => {
      if (!isNaN(note)) {
        return note;
      }

      const schnitt = this.schnittFach(fach);
      if (schnitt && !isNaN(schnitt)) {
        return schnitt;
      }
      return 0;
    }, NaN)
  }

  public getPunkteBlock2(): number | undefined {
    return 4 * DataProviderService.sum(this.daten.abiPruefungen.filter(i => i).map(abi => abi && abi.schonGeschrieben ? abi.note : 0), i => i)
  }

  public getPunkteBlock2Prognose(): number | undefined {
    return 4 * DataProviderService.sum(this.daten.abiPruefungen.filter(i => i).map(abi => abi && abi.schonGeschrieben ? abi.note : this.schnittFach(this.getFachForAbiturpruefung(abi))), i => i)
  }

  public schnittFach(fach: Fach | undefined | null): number {
    if (!fach) {
      return 0;
    }
    const noten = this.getHalbjahreForFach(fach.typ).map(hj => this.getNoteFuer(fach.id, hj, false, NaN)).filter(i => !Number.isNaN(i));
    if (noten.length === 0) {
      return NaN;
    }
    return Math.round(DataProviderService.sum(noten, i => i) / noten.length);
  }

  public getPunkteInsgesamt(): number | undefined {
    const i = this.getPunkteBlock1();
    const ii = this.getPunkteBlock2();
    if (i !== undefined && ii !== undefined) {
      return i + ii;
    }
    return undefined;
  }

  public getPunkteInsgesamtPrognose(): number | undefined {
    const i = this.getPunkteBlock1Prognose();
    const ii = this.getPunkteBlock2Prognose();
    if (i !== undefined && ii !== undefined) {
      return i + ii;
    }
    return undefined;
  }

  public getVerlorenePunkteBlock1(): number | undefined {
    const res = this.rechnePunkteBlock1((note: number, fach: Fach) => {
      if (!isNaN(note)) {
        return note;
      }

      return 15;
    }, NaN, (l: Leistung) => {
      if (l.nochNichtErhalten === true) {
        return 15;
      }
      return l.note;
    })

    if (res === undefined) {
      return undefined;
    }

    return 600 - res;
  }

  public getVerlorenePunkteBlock2(): number | undefined {
    return 300 - 4 * DataProviderService.sum(this.daten.abiPruefungen.map(abi => abi && abi.schonGeschrieben ? abi.note : 15), i => i)
  }

  public getVerlorenePunkteInsgesamt(): number | undefined {
    const i = this.getVerlorenePunkteBlock1();
    const ii = this.getVerlorenePunkteBlock2();
    if (i !== undefined && ii !== undefined) {
      return i + ii;
    }
    return undefined;
  }

  public getSchnitt(): string {
    return this.getSchnittFuerPunkte(this.getPunkteInsgesamt())
  }

  public getSchnittPrognose(): string {
    return this.getSchnittFuerPunkte(this.getPunkteInsgesamtPrognose())
  }

  public getSchnittFuerPunkte(punkte: number | undefined | null): string {
    if (punkte) {
      if (punkte === 300) return '4,0';
      if (301 <= punkte && punkte <= 318) return '3,9';
      if (319 <= punkte && punkte <= 336) return '3,8';
      if (337 <= punkte && punkte <= 354) return '3,7';
      if (355 <= punkte && punkte <= 372) return '3,6';
      if (373 <= punkte && punkte <= 390) return '3,5';
      if (391 <= punkte && punkte <= 408) return '3,4';
      if (409 <= punkte && punkte <= 426) return '3,3';
      if (427 <= punkte && punkte <= 444) return '3,2';
      if (445 <= punkte && punkte <= 462) return '3,1';
      if (463 <= punkte && punkte <= 480) return '3,0';
      if (481 <= punkte && punkte <= 498) return '2,9';
      if (499 <= punkte && punkte <= 516) return '2,8';
      if (517 <= punkte && punkte <= 534) return '2,7';
      if (535 <= punkte && punkte <= 552) return '2,6';
      if (553 <= punkte && punkte <= 570) return '2,5';
      if (571 <= punkte && punkte <= 588) return '2,4';
      if (589 <= punkte && punkte <= 606) return '2,3';
      if (607 <= punkte && punkte <= 624) return '2,2';
      if (625 <= punkte && punkte <= 642) return '2,1';
      if (643 <= punkte && punkte <= 660) return '2,0';
      if (661 <= punkte && punkte <= 678) return '1,9';
      if (679 <= punkte && punkte <= 696) return '1,8';
      if (697 <= punkte && punkte <= 714) return '1,7';
      if (715 <= punkte && punkte <= 732) return '1,6';
      if (733 <= punkte && punkte <= 750) return '1,5';
      if (751 <= punkte && punkte <= 768) return '1,4';
      if (769 <= punkte && punkte <= 786) return '1,3';
      if (787 <= punkte && punkte <= 804) return '1,2';
      if (805 <= punkte && punkte <= 822) return '1,1';
      if (823 <= punkte && punkte <= 900) return '1,0';
    }
    return '';
  }

  public static sum<T>(arr: T[], fn: (el: T) => number) {
    let sum = 0;
    for (let el of arr) {
      sum += fn(el);
    }
    return sum;
  }

  public getHalbjahreForFach(typ: string | undefined) {
    if (typ === 'wf2') return [1, 2]
    return [1, 2, 3, 4]
  }

  public getFachForAbiturpruefung(abi: AbiPruefung | undefined | null): Fach | undefined {
    if (!abi) return undefined;
    for (let f of this.daten.faecher) {
      if (f.id === abi.fach) {
        return f;
      }
    }
    return undefined;
  }

  public getNoteFuerAbi(abi: AbiPruefung): number {
    return abi.schonGeschrieben ? abi.note : NaN;
  }
  public getNameFuerAbi(abi: AbiPruefung): string {
    const fach = this.getFachForAbiturpruefung(abi);
    if (fach) {
      return fach.name + (fach.typ === 'lf' ? ' (schriftlich)' : ' (mündlich)');
    }
    return '';
  }
}
