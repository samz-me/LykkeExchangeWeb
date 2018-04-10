import {AssetStore, RootStore} from '.';
import {BalanceModel} from '../models';

const mockApi = {
  fetchAssetInstruments: () => ({
    AssetPairs: [
      {
        Accuracy: 3,
        BaseAssetId: 'BTC',
        Id: 'BTCUSD',
        InvertedAccuracy: 8,
        IsDisabled: false,
        Name: 'BTC/USD',
        QuotingAssetId: 'USD',
        Source: null,
        Source2: null
      },
      {
        Accuracy: 5,
        BaseAssetId: 'USD',
        Id: 'USDCHF',
        InvertedAccuracy: 5,
        IsDisabled: false,
        Name: 'USD/CHF',
        QuotingAssetId: 'CHF',
        Source: null,
        Source2: null
      }
    ]
  }),
  fetchAssets: () => ({
    Assets: [
      {
        Accuracy: 8,
        BankCardsDepositEnabled: false,
        BlockchainDepositEnabled: true,
        CategoryId: 'dd99af06-d1c9-4e6a-821c-10cb16a5cc5d',
        DisplayId: 'BTC',
        HideDeposit: false,
        HideWithdraw: false,
        IconUrl: null,
        Id: 'BTC',
        IsBase: true,
        KycNeeded: false,
        Name: 'BTC',
        SwiftDepositEnabled: false
      },
      {
        Accuracy: 2,
        BankCardsDepositEnabled: true,
        BlockchainDepositEnabled: false,
        CategoryId: '72698be5-fb91-46e2-9003-e3ce949bc97a',
        DisplayId: 'USD',
        HideDeposit: false,
        HideWithdraw: false,
        IconUrl: null,
        Id: 'USD',
        IsBase: true,
        KycNeeded: true,
        Name: 'USD',
        SwiftDepositEnabled: true
      },
      {
        Accuracy: 2,
        BankCardsDepositEnabled: false,
        BlockchainDepositEnabled: false,
        CategoryId: '72698be5-fb91-46e2-9003-e3ce949bc97a',
        DisplayId: 'CHF',
        HideDeposit: false,
        HideWithdraw: false,
        IconUrl: null,
        Id: 'CHF',
        IsBase: true,
        KycNeeded: true,
        Name: 'CHF',
        SwiftDepositEnabled: true
      },
      {
        Accuracy: 8,
        BankCardsDepositEnabled: false,
        BlockchainDepositEnabled: true,
        CategoryId: 'dd99af06-d1c9-4e6a-821c-10cb16a5cc5d',
        DisplayId: 'ETH',
        HideDeposit: false,
        HideWithdraw: false,
        IconUrl: null,
        Id: 'ETH',
        IsBase: true,
        KycNeeded: false,
        Name: 'ETH',
        SwiftDepositEnabled: false
      }
    ]
  }),
  fetchCategories: () => ({
    AssetCategories: [
      {
        AndroidIconUrl: null,
        Id: 'dd99af06-d1c9-4e6a-821c-10cb16a5cc5d',
        IosIconUrl: null,
        Name: 'Bitcoin',
        SortOrder: 1
      }
    ]
  }),
  fetchRates: () => ({
    AssetPairRates: [
      {
        AskPrice: 7000,
        AskPriceTimestamp: '2018-04-10T06:32:30.713Z',
        AssetPair: 'BTCUSD',
        BidPrice: 6000,
        BidPriceTimestamp: '2018-04-10T06:32:30.713Z'
      },
      {
        AskPrice: 2,
        AskPriceTimestamp: '2018-04-10T06:32:30.713Z',
        AssetPair: 'USDCHF',
        BidPrice: 1.5,
        BidPriceTimestamp: '2018-04-10T06:32:30.713Z'
      }
    ]
  })
};
const rootStore = new RootStore();
const assetStore = new AssetStore(rootStore, mockApi);

describe('Asset Store', () => {
  it('should hold strongly typed ref to the root store', () => {
    expect(assetStore).toHaveProperty('rootStore');
    expect(assetStore.rootStore).toBeDefined();
    expect(assetStore.rootStore).toBeInstanceOf(RootStore);
  });

  it('should fetch assets from api', async () => {
    expect(assetStore.categories.length).toBe(0);
    expect(assetStore.assets.length).toBe(0);
    await assetStore.fetchAssets();
    expect(assetStore.categories.length).toBeGreaterThan(0);
    expect(assetStore.assets.length).toBeGreaterThan(0);
    expect(assetStore.assets[0].accuracy).toBe(8);
    expect(assetStore.assets[0].category).toBe('Bitcoin');
    expect(assetStore.assets[0].iconUrl).toBeNull();
    expect(assetStore.assets[0].id).toBe('BTC');
    expect(assetStore.assets[0].isBankDepositEnabled).toBeFalsy();
    expect(assetStore.assets[0].isBase).toBeTruthy();
    expect(assetStore.assets[0].name).toBe('BTC');
  });

  it('getById should return Asset by its Id', () => {
    expect(assetStore.getById('BTC')).toBe(assetStore.assets[0]);
  });

  it('should fetch instruments and rates from api', async () => {
    expect(assetStore.instruments.length).toBe(0);
    await assetStore.fetchInstruments();
    expect(assetStore.instruments.length).toBeGreaterThan(0);
    expect(assetStore.instruments[0].accuracy).toBe(3);
    expect(assetStore.instruments[0].askPrice).toBeUndefined();
    expect(assetStore.instruments[0].baseAsset).toBe(assetStore.getById('BTC'));
    expect(assetStore.instruments[0].bidPrice).toBeUndefined();
    expect(assetStore.instruments[0].id).toBe('BTCUSD');
    expect(assetStore.instruments[0].invertedAccuracy).toBe(8);
    expect(assetStore.instruments[0].name).toBe('BTC/USD');
    expect(assetStore.instruments[0].quoteAsset).toBe(
      assetStore.getById('USD')
    );
    await assetStore.fetchRates();
    expect(assetStore.instruments[0].askPrice).toBe(7000);
    expect(assetStore.instruments[0].bidPrice).toBe(6000);
  });

  it('should convert A -> B', () => {
    const balance = new BalanceModel(rootStore.balanceStore);
    balance.asset = assetStore.getById('BTC')!;
    balance.assetId = 'BTC';
    balance.balance = 1;

    expect(assetStore.convert(balance, assetStore.getById('USD')!)).toBe(6000);
  });

  it('should convert B -> A', () => {
    const balance = new BalanceModel(rootStore.balanceStore);
    balance.asset = assetStore.getById('USD')!;
    balance.assetId = 'USD';
    balance.balance = 7000;

    expect(assetStore.convert(balance, assetStore.getById('BTC')!)).toBe(1);
  });

  it('should convert A -> B -> C', () => {
    const balance = new BalanceModel(rootStore.balanceStore);
    balance.asset = assetStore.getById('BTC')!;
    balance.assetId = 'BTC';
    balance.balance = 1;

    expect(assetStore.convert(balance, assetStore.getById('CHF')!)).toBe(9000);
  });

  it('should convert C -> B -> A', () => {
    const balance = new BalanceModel(rootStore.balanceStore);
    balance.asset = assetStore.getById('CHF')!;
    balance.assetId = 'CHF';
    balance.balance = 14000;

    expect(assetStore.convert(balance, assetStore.getById('BTC')!)).toBe(1);
  });

  it('should return 0 when convert path not found', () => {
    const balance = new BalanceModel(rootStore.balanceStore);
    balance.asset = assetStore.getById('BTC')!;
    balance.assetId = 'BTC';
    balance.balance = 1;

    expect(assetStore.convert(balance, assetStore.getById('ETH')!)).toBe(0);
  });
});
