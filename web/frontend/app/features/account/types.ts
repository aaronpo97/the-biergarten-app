export type ActionResult =
    | { intent: 'username'; success: true; username: string }
    | { intent: 'username'; success: false; error: string }
    | { intent: 'email'; success: true; email: string; emailConfirmed: boolean }
    | { intent: 'email'; success: false; error: string }
    | {
          intent: 'profile';
          success: true;
          firstName: string;
          lastName: string;
          dateOfBirth: string;
      }
    | { intent: 'profile'; success: false; error: string }
    | { intent: 'password'; success: true }
    | { intent: 'password'; success: false; error: string }
    | { intent: 'delete'; success: false; error: string };

export interface SectionState {
    usernameOpen: boolean;
    emailOpen: boolean;
    profileOpen: boolean;
    passwordOpen: boolean;
}

export type ActionType =
    | 'TOGGLE_USERNAME_VISIBILITY'
    | 'TOGGLE_EMAIL_VISIBILITY'
    | 'TOGGLE_PROFILE_VISIBILITY'
    | 'TOGGLE_PASSWORD_VISIBILITY'
    | 'CLOSE_ALL';

export interface SectionAction {
    type: ActionType;
}

export interface SectionProps {
    open: boolean;
    onToggle: () => void;
    onSuccess: () => void;
    result: ActionResult | undefined;
}
