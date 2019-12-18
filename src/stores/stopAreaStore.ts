import _ from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import TransitType from '~/enums/transitType';
import { IStopArea } from '~/models';
import { IStopItem } from '~/models/IStop';
import stopAreaValidationModel, {
    IStopAreaValidationModel
} from '~/models/validationModels/stopAreaValidationModel';
import ValidationStore from './validationStore';

export interface UndoState {
    stopArea: IStopArea;
}

export class StopAreaStore {
    @observable private _stopArea: IStopArea | null;
    @observable private _oldStopArea: IStopArea | null;
    @observable private _stopItems: IStopItem[];
    @observable private _isEditingDisabled: boolean;
    private _validationStore: ValidationStore<IStopArea, IStopAreaValidationModel>;

    constructor() {
        this._stopArea = null;
        this._oldStopArea = null;
        this._stopItems = [];
        this._isEditingDisabled = true;

        this._validationStore = new ValidationStore();

        reaction(() => this._isEditingDisabled, this.onChangeIsEditingDisabled);
    }

    @computed
    get stopArea() {
        return this._stopArea!;
    }

    @computed
    get oldStopArea() {
        return this._oldStopArea!;
    }

    @computed
    get stopItems() {
        return this._stopItems;
    }

    @computed
    get isDirty() {
        return this._stopArea && !_.isEqual(this._stopArea, this._oldStopArea);
    }

    @computed
    get isEditingDisabled() {
        return this._isEditingDisabled;
    }

    @computed
    get invalidPropertiesMap() {
        return this._validationStore.getInvalidPropertiesMap();
    }

    @computed
    get isFormValid() {
        return this._validationStore.isValid();
    }

    @action
    public init = ({
        stopArea,
        isNewStopArea
    }: {
        stopArea: IStopArea;
        isNewStopArea: boolean;
    }) => {
        this.clear();

        const oldStopArea = _.cloneDeep(stopArea);
        const newStopArea = _.cloneDeep(stopArea);

        this._stopArea = newStopArea;

        this.setOldStopArea(oldStopArea);

        this._isEditingDisabled = !isNewStopArea;
        this._validationStore.init(this._stopArea, stopAreaValidationModel);
    };

    @action
    public setOldStopArea = (stopArea: IStopArea) => {
        this._oldStopArea = _.cloneDeep(stopArea);
    };

    @action
    public setStopItems = (stopItems: IStopItem[]) => {
        this._stopItems = stopItems;
    };

    @action
    public updateStopAreaProperty = (
        property: keyof IStopArea,
        value: string | Date | TransitType
    ) => {
        (this._stopArea as any)[property] = value;
        this._validationStore.updateProperty(property, value);
    };

    @action
    public setIsEditingDisabled = (isEditingDisabled: boolean) => {
        this._isEditingDisabled = isEditingDisabled;
    };

    @action
    public toggleIsEditingDisabled = () => {
        this._isEditingDisabled = !this._isEditingDisabled;
    };

    @action
    public clear = () => {
        this._stopArea = null;
        this._oldStopArea = null;
        this._isEditingDisabled = true;
        this._stopItems = [];
        this._validationStore.clear();
    };

    @action
    public resetChanges = () => {
        if (this._oldStopArea) {
            this.init({ stopArea: this._oldStopArea, isNewStopArea: false });
        }
    };

    private onChangeIsEditingDisabled = () => {
        if (this._isEditingDisabled) {
            this.resetChanges();
        } else {
            this._validationStore.validateAllProperties();
        }
    };
}

const observableStopAreaStore = new StopAreaStore();

export default observableStopAreaStore;
