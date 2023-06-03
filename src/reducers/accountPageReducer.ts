export interface AccountPageState {
  accountInfoOpen: boolean;
  securityOpen: boolean;
  deleteAccountOpen: boolean;
}

export type AccountPageAction =
  | { type: 'TOGGLE_ACCOUNT_INFO_VISIBILITY' }
  | { type: 'TOGGLE_SECURITY_VISIBILITY' }
  | { type: 'TOGGLE_DELETE_ACCOUNT_VISIBILITY' }
  | { type: 'CLOSE_ALL' };

const accountPageReducer = (
  state: AccountPageState,
  action: AccountPageAction,
): AccountPageState => {
  switch (action.type) {
    case 'TOGGLE_ACCOUNT_INFO_VISIBILITY': {
      return {
        accountInfoOpen: !state.accountInfoOpen,
        securityOpen: false,
        deleteAccountOpen: false,
      };
    }
    case 'TOGGLE_DELETE_ACCOUNT_VISIBILITY': {
      return {
        accountInfoOpen: false,
        securityOpen: false,
        deleteAccountOpen: !state.deleteAccountOpen,
      };
    }
    case 'TOGGLE_SECURITY_VISIBILITY': {
      return {
        accountInfoOpen: false,
        securityOpen: !state.securityOpen,
        deleteAccountOpen: false,
      };
    }
    case 'CLOSE_ALL': {
      return {
        accountInfoOpen: false,
        securityOpen: false,
        deleteAccountOpen: false,
      };
    }
    default: {
      throw new Error('Invalid action type.');
    }
  }
};

export default accountPageReducer;
