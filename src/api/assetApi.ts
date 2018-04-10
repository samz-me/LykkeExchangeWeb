import {RestApi} from './index';
import {ApiResponse} from './types/index';

export interface AssetApi {
  fetchAssets: () => ApiResponse<any>;
  fetchAssetInstruments: () => ApiResponse<any>;
  fetchRates: () => ApiResponse<any>;
  fetchCategories: () => ApiResponse<any>;
}

export class RestAssetApi extends RestApi implements AssetApi {
  fetchAssets = () => this.get('/assets');
  fetchAssetInstruments = () => this.get('/assetpairs');
  fetchRates = () => this.get('/assetpairs/rates');

  fetchCategories = () => this.get('/assets/categories');
}

export default RestAssetApi;
