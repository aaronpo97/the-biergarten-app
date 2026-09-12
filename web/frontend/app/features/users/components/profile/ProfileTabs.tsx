export type ProfileTab = 'activity' | 'following' | 'liked';

const TABS: { id: ProfileTab; label: string }[] = [
    { id: 'activity', label: 'Activity' },
    { id: 'following', label: 'Following' },
    { id: 'liked', label: 'Liked' },
];

interface ProfileTabsProps {
    activeTab: ProfileTab;
    onChange: (tab: ProfileTab) => void;
}

const ProfileTabs = ({ activeTab, onChange }: ProfileTabsProps) => (
    <div className="flex gap-6 border-b border-base-300" role="tablist">
        {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
                <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onChange(tab.id)}
                    className={`py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                        active
                            ? 'text-primary border-primary'
                            : 'text-base-content/60 border-transparent hover:text-base-content'
                    }`}
                >
                    {tab.label}
                </button>
            );
        })}
    </div>
);

export default ProfileTabs;
