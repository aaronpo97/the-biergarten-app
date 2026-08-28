import { useState } from 'react';
import { data, Link } from 'react-router';
import RouteErrorState from '../../../components/ui/error/RouteErrorState';
import { getOptionalAuth } from '../../auth/auth.server';
import { getBreweryById } from '../breweries.server';
import BreweryHeaderCard from '../components/BreweryHeaderCard';
import YourRatingCard from '../components/YourRatingCard';
import BeerListCard from '../components/BeerListCard';
import CommentsCard from '../components/CommentsCard';
import LocationCard from '../components/LocationCard';
import BreweryDetailsCard from '../components/BreweryDetailsCard';
import BeerStyleBreakdownCard from '../components/BeerStyleBreakdownCard';
import CommunityStatsCard from '../components/CommunityStatsCard';
import { FILLER_BEERS, FILLER_BREWERY_META, FILLER_COMMENTS } from '../utils/filler-brewery-detail';
import type { Route } from './+types/brewery-detail';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const [brewery, auth] = await Promise.all([
        getBreweryById(params.id),
        getOptionalAuth(request),
    ]);

    if (!brewery) {
        throw data('Brewery not found.', { status: 404, statusText: 'Not Found' });
    }

    return {
        brewery,
        loggedIn: auth !== null,
        username: auth?.username ?? null,
    };
};

const initials = (username: string) => username.slice(0, 2).toUpperCase();

const BreweryDetail = ({ loaderData }: Route.ComponentProps) => {
    const { brewery, loggedIn, username } = loaderData;

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(FILLER_BREWERY_META.likeCount);
    const [yourRating, setYourRating] = useState(0);
    const [ratingsCount, setRatingsCount] = useState(FILLER_BREWERY_META.ratingsCount);
    const [comments, setComments] = useState(FILLER_COMMENTS);

    const handleToggleLike = () => {
        setLiked((prev) => !prev);
        setLikeCount((prev) => prev + (liked ? -1 : 1));
    };

    const handleRatingChange = (next: number) => {
        setRatingsCount((prev) => prev + (next === 0 ? -1 : yourRating === 0 ? 1 : 0));
        setYourRating(next);
    };

    const handleAddComment = (text: string) => {
        setComments((prev) => [
            {
                id: crypto.randomUUID(),
                user: username ?? 'you',
                initials: username ? initials(username) : 'YO',
                rating: yourRating,
                time: 'just now',
                text,
                likes: 0,
                liked: false,
            },
            ...prev,
        ]);
    };

    const handleToggleCommentLike = (id: string) => {
        setComments((prev) =>
            prev.map((comment) =>
                comment.id === id ? { ...comment, liked: !comment.liked } : comment,
            ),
        );
    };

    return (
        <div className="min-h-screen bg-base-200">
            <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">
                <Link
                    to="/breweries"
                    className="link link-hover text-sm text-base-content/60 mb-4 inline-block"
                >
                    &larr; Back to breweries
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_19rem] gap-5 items-start">
                    <div className="flex flex-col gap-5">
                        <BreweryHeaderCard
                            brewery={brewery}
                            foundedYear={FILLER_BREWERY_META.foundedYear}
                            liked={liked}
                            likeCount={likeCount}
                            avgRating={FILLER_BREWERY_META.avgRating}
                            ratingsCount={ratingsCount}
                            onToggleLike={handleToggleLike}
                        />
                        <YourRatingCard value={yourRating} onChange={handleRatingChange} />
                        <BeerListCard beers={FILLER_BEERS} />
                        <CommentsCard
                            comments={comments}
                            loggedIn={loggedIn}
                            currentUserInitials={username ? initials(username) : 'YO'}
                            onAddComment={handleAddComment}
                            onToggleCommentLike={handleToggleCommentLike}
                        />
                    </div>

                    <div className="flex flex-col gap-5">
                        {brewery.location && (
                            <LocationCard
                                breweryName={brewery.breweryName}
                                location={brewery.location}
                                website={FILLER_BREWERY_META.website}
                            />
                        )}
                        <BreweryDetailsCard
                            foundedYear={FILLER_BREWERY_META.foundedYear}
                            type={FILLER_BREWERY_META.type}
                            beerCount={FILLER_BEERS.length}
                        />
                        <BeerStyleBreakdownCard beers={FILLER_BEERS} />
                        <CommunityStatsCard
                            likeCount={likeCount}
                            ratingsCount={ratingsCount}
                            commentCount={comments.length}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BreweryDetail;

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => (
    <RouteErrorState error={error} />
);
