# Public user profile: data requirements

Covers `/users/:id` (`routes/user-profile.tsx`). Mirrors the format of
`../breweries/BREWERY_HANDOFF.md`.

## Status legend

- ✅ **Available**: real data, wired up.
- ⚠️ **Partial**: reads real data, but a related gap remains (see the Gap column).
- ❌ **Missing**: no backend support; page shows filler or local-only state.

## Header & sidebar

| Field                                    | Status | Source                                                    | Gap                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------- | ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Username, name, joined date              | ✅     | `GET /api/user/{id}/profile` (`PublicUserProfileDto`)     |                                                                                                                                                                                                                                                                                                                                             |
| `isOwnProfile`                           | ✅     | Compares the session's `userAccountId` to the route param |                                                                                                                                                                                                                                                                                                                                             |
| Bio                                      | ✅     | `GET /api/user/{id}/profile` (`PublicUserProfileDto`)     | Reads `Social.UserProfile.Biography` via the left join in `UserListRepository.GetByIdAsync`; an account with no profile row yet returns an empty string.                                                                                                                                                                                    |
| Location                                 | ❌     | `FILLER_PROFILE_META.location`                            | No location field on `UserAccount` or `UserProfile`.                                                                                                                                                                                                                                                                                        |
| Avatar photo                             | ⚠️     | `GET /api/user/{id}/profile` (`PublicUserProfileDto`)     | Reads the current `Social.UserAvatar` photo via the left joins in `UserListRepository.GetByIdAsync` and signs it into `avatarUrl`; an account with no avatar returns an empty string and `ProfileAvatar` shows initials. `UploadAvatarCommand` has no HTTP route yet, so only accounts created by `Database.Seed` have one — see (4) below. |
| Cover photo                              | ❌     | Flat `bg-base-300` block                                  | No cover-photo concept anywhere in the schema.                                                                                                                                                                                                                                                                                              |
| Following / Followers counts             | ❌     | `FILLER_PROFILE_META.following` / `.followers`            | `Social.UserFollow` table exists but is unused by any query/controller — needs count queries (`WHERE UserAccountID = ?` / `WHERE FollowingID = ?`).                                                                                                                                                                                         |
| Breweries visited / Ratings given counts | ❌     | `FILLER_PROFILE_META.breweriesVisited` / `.ratingsGiven`  | Blocked on the same like/rating gaps called out in `BREWERY_HANDOFF.md`.                                                                                                                                                                                                                                                                    |

## Follow action

| Field                         | Status | Source                                                 | Gap                                                                                                                               |
| ----------------------------- | ------ | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Follow / unfollow the profile | ❌     | Local component state                                  | `Social.UserFollow` has no command/query/controller (create, delete, "am I following them" check) — mirrors the brewery-like gap. |
| Edit profile (own profile)    | ✅     | Links to `/account`, the existing profile-edit surface |                                                                                                                                   |

## Profile links from other pages

| Field                                          | Status | Source                                                       | Gap                                                                                                                                                                               |
| ---------------------------------------------- | ------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commenter name links (brewery detail comments) | ⚠️     | `CommentItem` links only when `comment.userAccountId` is set | `FILLER_COMMENTS` has no backing accounts, so those rows render as plain text; a comment added during the session by a signed-in user does carry a real GUID and links correctly. |
| Following-list person links (profile page)     | ⚠️     | `FollowingTab` links only when `f.userAccountId` is set      | Same gap as above — `FILLER_FOLLOWING`'s two person rows have no backing accounts, so they render as plain text until real follow data exists.                                    |

Both components already support linking (see `CommentItem.stories.tsx`'s `WithLinkedAccount` story); what's missing is real account IDs on the filler rows, which can't be faked without recreating the 404 this was fixed for. This resolves itself once (3) below closes and comments/follows are loader-backed.

## Activity / Following / Liked tabs

| Field                                  | Status | Source                                    | Gap                                                                                                                                                       |
| -------------------------------------- | ------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Activity feed (ratings/likes/comments) | ❌     | `FILLER_ACTIVITY`                         | No unified activity/timeline concept. Needs a query that unions ratings, likes, and comments across brewery/beer posts for a given user, ordered by time. |
| Following list (people + breweries)    | ❌     | `FILLER_FOLLOWING`                        | Needs a query over `Social.UserFollow` joined to `Auth.UserAccount`, plus (once the like/rating gaps close) a way to follow breweries specifically.       |
| Liked list                             | ❌     | `FILLER_LIKED`                            | Blocked on the `BreweryPostLike`/`BeerPostLike` gap in `BREWERY_HANDOFF.md`.                                                                              |
| Unfollow from the Following tab        | ❌     | Local component state (optimistic toggle) | Same `Social.UserFollow` gap as the header Follow action.                                                                                                 |

## Summary of backend work

1. A location field on `UserAccount` or `UserProfile`, and a cover-photo storage concept.
2. `Social.UserFollow` command/query/controller: follow, unfollow, "is following" check, and follower/following counts.
3. An activity/timeline query unioning ratings, likes, and comments for a user, ordered by time — depends on the like/rating/comment tables called out in `BREWERY_HANDOFF.md` existing first.
4. An avatar-upload endpoint: `UploadAvatarCommand`/`UploadAvatarHandler` exist and `Database.Seed` sends them, but no controller action does, so a signed-in user has no way to set their own avatar. Needs a `multipart/form-data` route on the authenticated caller's own account (`IFormFile`, same validation the seeder's uploads pass through).
5. Once (2) and the like/rating gaps close, swap `FILLER_PROFILE_META` / `FILLER_ACTIVITY` / `FILLER_FOLLOWING` / `FILLER_LIKED` (`utils/filler-user-profile.ts`) and the local `useState` in `routes/user-profile.tsx` for loader data and `authorizedRequest`-based mutations (see `auth.server.ts`). Swapping in real (possibly empty) arrays is also what makes the Activity/Following `EmptyState`s reachable from the actual route — today they're only exercised by the `Empty` Storybook stories, since the filler arrays are never empty.
