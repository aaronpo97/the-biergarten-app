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
| Avatar photo                             | ⚠️     | `GET /api/user/{id}/profile` (`PublicUserProfileDto`)     | Reads the current `Social.UserAvatar` photo via the left joins in `UserListRepository.GetByIdAsync` and signs it into `avatarUrl`; an account with no avatar returns an empty string and `ProfileAvatar` shows initials. `UploadAvatarCommand` has no HTTP route yet, so only accounts created by `Database.Seed` have one — see (3) below. |
| Cover photo                              | ❌     | Flat `bg-base-300` block                                  | No cover-photo concept anywhere in the schema.                                                                                                                                                                                                                                                                                              |
| Following / Followers counts             | ✅     | `GET /api/user/{id}/profile` (`PublicUserProfileDto`)     | `followingCount` and `followerCount` are counted from `Social.UserFollow` in `UserListRepository`'s queries.                                                                                                                                                                                                                                |
| Breweries visited / Ratings given counts | ❌     | `FILLER_PROFILE_META.breweriesVisited` / `.ratingsGiven`  | Blocked on the same like/rating gaps called out in `BREWERY_HANDOFF.md`.                                                                                                                                                                                                                                                                    |

## Follow action

| Field                         | Status | Source                                                                     | Gap                                                                                                                                                            |
| ----------------------------- | ------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Follow / unfollow the profile | ✅     | `PUT` / `DELETE /api/user/{id}/follow`, `GET /api/user/{id}/follow-status` | The route's `action` calls `setFollowing` in `users.server.ts`; the loader reads the viewer's follow status for signed-in visitors on other people's profiles. |
| Edit profile (own profile)    | ✅     | Links to `/account`, the existing profile-edit surface                     |                                                                                                                                                                |

## Profile links from other pages

| Field                                          | Status | Source                                                       | Gap                                                                                                                                                                               |
| ---------------------------------------------- | ------ | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commenter name links (brewery detail comments) | ⚠️     | `CommentItem` links only when `comment.userAccountId` is set | `FILLER_COMMENTS` has no backing accounts, so those rows render as plain text; a comment added during the session by a signed-in user does carry a real GUID and links correctly. |
| Following-list person links (profile page)     | ✅     | `FollowingTab` links every row to `/users/{userAccountId}`   |                                                                                                                                                                                   |

Both components already support linking (see `CommentItem.stories.tsx`'s `WithLinkedAccount` story); what's missing is real account IDs on the filler rows, which can't be faked without recreating the 404 this was fixed for. This resolves itself once (2) below closes and comments/follows are loader-backed.

## Activity / Following / Liked tabs

| Field                                  | Status | Source                         | Gap                                                                                                                                                       |
| -------------------------------------- | ------ | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Activity feed (ratings/likes/comments) | ❌     | `FILLER_ACTIVITY`              | No unified activity/timeline concept. Needs a query that unions ratings, likes, and comments across brewery/beer posts for a given user, ordered by time. |
| Following list (people)                | ✅     | `GET /api/user/{id}/following` | Public and paged (`limit`, `offset`). Brewery follows are deferred until a backend exists for following breweries.                                        |
| Liked list                             | ❌     | `FILLER_LIKED`                 | Blocked on the `BreweryPostLike`/`BeerPostLike` gap in `BREWERY_HANDOFF.md`.                                                                              |
| Unfollow from the Following tab        | ✅     | `DELETE /api/user/{id}/follow` | Shown on the viewer's own profile only.                                                                                                                   |

## Summary of backend work

1. A location field on `UserAccount` or `UserProfile`, and a cover-photo storage concept.
2. An activity/timeline query unioning ratings, likes, and comments for a user, ordered by time — depends on the like/rating/comment tables called out in `BREWERY_HANDOFF.md` existing first.
3. An avatar-upload endpoint: `UploadAvatarCommand`/`UploadAvatarHandler` exist and `Database.Seed` sends them, but no controller action does, so a signed-in user has no way to set their own avatar. Needs a `multipart/form-data` route on the authenticated caller's own account (`IFormFile`, same validation the seeder's uploads pass through).
4. Once (2) and the like/rating gaps close, swap `FILLER_PROFILE_META` / `FILLER_ACTIVITY` / `FILLER_LIKED` (`utils/filler-user-profile.ts`) for loader data. Swapping in real (possibly empty) arrays is also what makes the Activity `EmptyState` reachable from the actual route — today it is only exercised by the `Empty` Storybook story, since the filler array is never empty.
