import {AssetModel} from './index';

export class InstrumentModel {
  id: string;
  name: string;
  baseAsset: AssetModel;
  quoteAsset: AssetModel;
  accuracy: number;
  invertedAccuracy: number;
  bidPrice: number;
  askPrice: number;

  constructor(asset: Partial<InstrumentModel>) {
    Object.assign(this, asset);
  }
}

export default InstrumentModel;
