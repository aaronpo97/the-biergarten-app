// Success never reaches the component as action data - every intent redirects
// back to this route (with a `?toast=` message) instead of returning a
// payload, so the only shape an action can hand back here is an error.
export interface ActionResult {
    intent: 'username' | 'email' | 'profile' | 'password' | 'delete';
    error: string;
}

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
    result: ActionResult | undefined;
}
