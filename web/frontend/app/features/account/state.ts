import type { SectionAction, SectionState } from './types';

export const initialSectionState: SectionState = {
    usernameOpen: false,
    emailOpen: false,
    profileOpen: false,
    passwordOpen: false,
};

export const sectionReducer = (state: SectionState, action: SectionAction): SectionState => {
    switch (action.type) {
        case 'TOGGLE_USERNAME_VISIBILITY':
            return { ...initialSectionState, usernameOpen: !state.usernameOpen };
        case 'TOGGLE_EMAIL_VISIBILITY':
            return { ...initialSectionState, emailOpen: !state.emailOpen };
        case 'TOGGLE_PROFILE_VISIBILITY':
            return { ...initialSectionState, profileOpen: !state.profileOpen };
        case 'TOGGLE_PASSWORD_VISIBILITY':
            return { ...initialSectionState, passwordOpen: !state.passwordOpen };
        case 'CLOSE_ALL':
            return initialSectionState;
        default:
            return state;
    }
};
