export type Daten = {
    faecher: Fach[],
    abiPruefungen: [AbiPruefung | undefined, AbiPruefung | undefined, AbiPruefung | undefined, AbiPruefung | undefined, AbiPruefung | undefined]
};

export type AbiPruefung = {
    note: number,
    fach: number,
    schonGeschrieben: boolean
}

export type Fach = {
    name: string,
    id: number
    gewichtungen: [Gewichtungen, Gewichtungen, Gewichtungen, Gewichtungen],
    leistungen: Leistung[],
    typ: Typ,
    note1?: number,
    note2?: number,
    note3?: number
    note4?: number,
}

export type Typ = 'lf' | 'bf4' | 'bf2' | 'bf0' | 'wf2' | 'wf4'

export type Gewichtungen = Gewichtung[]

export type Gewichtung = {
    name: string,
    wertung: number,
    id: number
}

export type Leistung = {
    note: number,
    kategorie: number,
    halbjahr: 1 | 2 | 3 | 4,
    name: string,
    auslassen: boolean,
    wertung: number
}

