import { action, computed, observable } from 'mobx';
import { ILine } from '../models';

export class LineStore {
    @observable private _filters: string[];
    @observable private _allLines: ILine[];
    private _linesLoading: boolean;

    constructor() {
        this._allLines = [];
        this._linesLoading = true;
    }

    @computed get filters(): string[] {
        return this._filters;
    }

    set filters(filters: string[]) {
        this._filters = filters;
    }

    @computed get allLines(): ILine[] {
        return this._allLines;
    }

    public lineByLineId(lineId: string) {
        return this._allLines.find(line => line.lineId === lineId);
    }

    @action
    public setAllLines(lines: ILine[]) {
        this._allLines = lines;
    }

    @computed get linesLoading(): boolean {
        return this._linesLoading;
    }

    set linesLoading(value: boolean) {
        this._linesLoading = value;
    }
}

const observableLineStore = new LineStore();

export default observableLineStore;
