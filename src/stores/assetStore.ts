import {computed, observable, runInAction} from 'mobx';
import {AssetApi} from '../api/assetApi';
import {AssetModel, InstrumentModel} from '../models/index';
import {RootStore} from './index';

export class AssetStore {
  @observable assets: AssetModel[] = [];
  @observable instruments: InstrumentModel[] = [];
  @computed
  get baseAssets() {
    return this.assets.filter(x => x.isBase);
  }
  @observable categories: any[] = [];

  constructor(readonly rootStore: RootStore, private api: AssetApi) {}

  getById = (id: string) => this.assets.find(a => a.id === id);

  getInstrumentById = (id: string) =>
    this.instruments.find(x => x.id.toLowerCase().includes(id.toLowerCase()));

  fetchAssets = async () => {
    await this.fetchCategories();
    const resp = await this.api.fetchAssets();
    runInAction(() => {
      this.assets = resp.Assets.map(
        ({
          Id: id,
          Name,
          DisplayId: name,
          CategoryId,
          Accuracy: accuracy,
          IconUrl: iconUrl,
          BankCardsDepositEnabled: isBankDepositEnabled,
          IsBase
        }: any) => {
          const category = this.categories.find(x => x.Id === CategoryId) || {
            Name: 'Other'
          };
          const asset = new AssetModel({
            accuracy,
            category: category.Name,
            iconUrl,
            id,
            isBankDepositEnabled,
            name: name || Name
          });
          asset.isBase = IsBase;
          return asset;
        }
      );
    });
  };

  fetchCategories = async () => {
    const resp = await this.api.fetchCategories();
    runInAction(() => {
      this.categories = resp.AssetCategories;
    });
  };

  fetchInstruments = async () => {
    const resp = await this.api.fetchAssetInstruments();
    runInAction(() => {
      this.instruments = resp.AssetPairs.map(
        (ap: any) =>
          new InstrumentModel({
            accuracy: ap.Accuracy,
            baseAsset: this.getById(ap.BaseAssetId),
            id: ap.Id,
            invertedAccuracy: ap.InvertedAccuracy,
            name: ap.Name,
            quoteAsset: this.getById(ap.QuotingAssetId)
          })
      );
    });
  };

  fetchRates = async () => {
    const resp = await this.api.fetchRates();

    resp.AssetPairRates.forEach(({AssetPair, BidPrice, AskPrice}: any) => {
      const instrument = this.getInstrumentById(AssetPair);
      if (instrument) {
        instrument.ask = AskPrice;
        instrument.bid = BidPrice;
      }
    });
  };
}
