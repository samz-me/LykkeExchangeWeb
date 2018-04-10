import {computed, observable, runInAction} from 'mobx';
import {AssetApi} from '../api/assetApi';
import {AssetModel, BalanceModel, InstrumentModel} from '../models/index';
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
        instrument.askPrice = AskPrice;
        instrument.bidPrice = BidPrice;
      }
    });
  };

  convert = (from: BalanceModel, to: AssetModel) => {
    const isSuitable = (base: AssetModel, quote: AssetModel) => (
      i: InstrumentModel
    ) =>
      i.baseAsset &&
      i.quoteAsset &&
      ((i.baseAsset.id === base.id && i.quoteAsset.id === quote.id) ||
        (i.baseAsset.id === quote.id && i.quoteAsset.id === base.id));
    const calc = (amount: number, base: AssetModel, i: InstrumentModel) => {
      if (i.askPrice === 0) {
        return 0;
      }
      return i.baseAsset.id === base.id
        ? amount * i.bidPrice
        : amount * (1 / i.askPrice);
    };

    if (from.assetId === to.id) {
      return from.balance;
    }

    const instrument = this.instruments.find(isSuitable(from.asset, to));

    let result = 0;
    if (!!instrument) {
      result = calc(from.balance, from.asset, instrument);
    } else {
      this.assets.forEach(a => {
        if (result === 0) {
          const instrumentFrom = this.instruments.find(
            isSuitable(from.asset, a)
          );
          const instrumentTo = this.instruments.find(isSuitable(a, to));

          if (
            !!instrumentFrom &&
            !!instrumentTo &&
            instrumentFrom.id !== 'no_use' &&
            instrumentTo.id !== 'no_use'
          ) {
            result = calc(
              calc(from.balance, from.asset, instrumentFrom),
              a,
              instrumentTo
            );
          }
        }
      });
    }

    return result;
  };
}
