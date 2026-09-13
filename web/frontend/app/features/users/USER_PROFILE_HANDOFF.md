# Public user profile: data requirements

Covers `/users/:id` (`routes/user-profile.tsx`). Mirrors the format of
`../breweries/BREWERY_HANDOFF.md`.

## Status legend

- ✅ **Available**: real data, wired up.
- ⚠️ **Partial**: schema/repository exists but no public read endpoint.
- ❌ **Missing**: no backend support; page shows filler or local-only state.

## Header & sidebar

| Field                                    | Status | Source                                                    | Gap                                                                                                                                                                                                                   |
| ---------------------------------------- | ------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Username, name, joined date              | ✅     | `GET /api/user/{id}/profile` (`PublicUserProfileDto`)      |                                                                                                                                                                                                                       |
| `isOwnProfile`                           | ✅     | Compares the session's `userAccountId` to the route param |                                                                                                                                                                                                                       |
| Bio                                      | ⚠️     | `FILLER_PROFILE_META.bio`                                 | `Social.UserProfile.Biography` exists (`IUserProfileRepository`, `UpdateBiographyHandler`) but there's no query/controller route to read another user's profile — only a write path for the authenticated user's own. |
| Location                                 | ❌     | `FILLER_PROFILE_META.location`                            | No location field on `UserAccount` or `UserProfile`.                                                                                                                                                                  |
| Avatar photo                             | ⚠️     | Initials placeholder (`avatar-placeholder`)               | `Social.UserAvatar` + `UploadAvatarHandler` exist but there's no GET endpoint to read a user's stored avatar back.                                                                                                    |
| Cover photo                              | ❌     | Flat `bg-base-300` block                                  | No cover-photo concept anywhere in the schema.                                                                                                                                                                        |
| Following / Followers counts             | ❌     | `FILLER_PROFILE_META.following` / `.followers`            | `Social.UserFollow` table exists but is unused by any query/controller — needs count queries (`WHERE UserAccountID = ?` / `WHERE FollowingID = ?`).                                                                   |
| Breweries visited / Ratings given counts | ❌     | `FILLER_PROFILE_META.breweriesVisited` / `.ratingsGiven`  | Blocked on the same like/rating gaps called out in `BREWERY_HANDOFF.md`.                                                                                                                                              |

## Follow action

| Field                         | Status | Source                                                 | Gap                                                                                                                               |
| ----------------------------- | ------ | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Follow / unfollow the profile | ❌     | Local component state                                  | `Social.UserFollow` has no command/query/controller (create, delete, "am I following them" check) — mirrors the brewery-like gap. |
| Edit profile (own profile)    | ✅     | Links to `/account`, the existing profile-edit surface |                                                                                                                                   |

## Activity / Following / Liked tabs

| Field                                  | Status | Source                                    | Gap                                                                                                                                                       |
| -------------------------------------- | ------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Activity feed (ratings/likes/comments) | ❌     | `FILLER_ACTIVITY`                         | No unified activity/timeline concept. Needs a query that unions ratings, likes, and comments across brewery/beer posts for a given user, ordered by time. |
| Following list (people + breweries)    | ❌     | `FILLER_FOLLOWING`                        | Needs a query over `Social.UserFollow` joined to `Auth.UserAccount`, plus (once the like/rating gaps close) a way to follow breweries specifically.       |
| Liked list                             | ❌     | `FILLER_LIKED`                            | Blocked on the `BreweryPostLike`/`BeerPostLike` gap in `BREWERY_HANDOFF.md`.                                                                              |
| Unfollow from the Following tab        | ❌     | Local component state (optimistic toggle) | Same `Social.UserFollow` gap as the header Follow action.                                                                                                 |

## Summary of backend work

1. A public query + controller route to read a user's `Social.UserProfile.Biography` by `UserAccountId` (the write path already exists; only the public read is missing).
2. A public query + controller route to read a user's stored `Social.UserAvatar`.
3. A location field on `UserAccount` or `UserProfile`, and a cover-photo storage concept (mirrors the avatar gap).
4. `Social.UserFollow` command/query/controller: follow, unfollow, "is following" check, and follower/following counts.
5. An activity/timeline query unioning ratings, likes, and comments for a user, ordered by time — depends on the like/rating/comment tables called out in `BREWERY_HANDOFF.md` existing first.
6. Once (4) and the like/rating gaps close, swap `FILLER_PROFILE_META` / `FILLER_ACTIVITY` / `FILLER_FOLLOWING` / `FILLER_LIKED` (`utils/filler-user-profile.ts`) and the local `useState` in `routes/user-profile.tsx` for loader data and `authorizedRequest`-based mutations (see `auth.server.ts`).
