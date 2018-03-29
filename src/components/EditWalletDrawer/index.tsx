// import Modal from 'antd/lib/modal/Modal';
import {Dialog} from 'lykke-react-components';
import {inject, observer} from 'mobx-react';
import * as React from 'react';
import {RootStoreProps} from '../../App';
import {WalletModel} from '../../models';
import {RootStore} from '../../stores';
import Drawer from '../Drawer';
import EditWalletForm from '../EditWalletForm/index';

import './style.css';

interface EditWalletDrawerProps extends RootStoreProps {
  wallet?: WalletModel;
  show?: boolean;
}

export const EditWalletDrawer: React.SFC<EditWalletDrawerProps> = ({
  rootStore,
  wallet = null,
  show = false
}) => {
  const toggleConfirmDelete = () => {
    rootStore!.uiStore.toggleConfirmDeleteWallet();
  };
  const handleDeleteWalletClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    toggleConfirmDelete();
  };
  const handleDeleteWallet = async () => {
    rootStore!.uiStore.toggleConfirmDeleteWallet();
    rootStore!.uiStore.toggleEditWalletDrawer();
    rootStore!.uiStore.startRequest();
    await wallet!.delete();
    rootStore!.uiStore.finishRequest();
  };

  return (
    wallet && (
      <Drawer
        title="Edit Wallet"
        show={show}
        overlayed={rootStore!.uiStore.drawerOverlayed}
      >
        <div className="drawer__title">
          <h2>{wallet.title}</h2>
          <h3>API Wallet</h3>
        </div>
        <div className="step_title">
          <h4>Name and description</h4>
          <a className="drawer__action" onClick={handleDeleteWalletClick}>
            <img
              src={`${process.env.PUBLIC_URL}/images/icons/delete-icn.svg`}
              height="24"
            />
            Delete wallet
          </a>
        </div>
        <EditWalletForm />
        <Dialog
          className="confirm-delete-wallet"
          visible={rootStore!.uiStore.showConfirmDeleteWallet}
          onCancel={toggleConfirmDelete}
          onConfirm={handleDeleteWallet}
          confirmButton={{text: 'Yes, delete Wallet'}}
          cancelButton={{text: 'No, Back to Wallet'}}
          title="Delete wallet?"
          description={
            <span>
              Are you sure you want to delete the wallet{' '}
              <strong>{wallet.title}</strong>?
            </span>
          }
        />
      </Drawer>
    )
  );
};

export default inject(({rootStore}: {rootStore: RootStore}) => ({
  rootStore,
  show: rootStore.uiStore.showEditWalletDrawer,
  wallet: rootStore.walletStore.selectedWallet
}))(observer(EditWalletDrawer));
