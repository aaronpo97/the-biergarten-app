import { Tab, TabGroup, TabList } from '@headlessui/react';

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

const ProfileTabs = ({ activeTab, onChange }: ProfileTabsProps) => {
    const selectedIndex = TABS.findIndex((tab) => tab.id === activeTab);

    return (
        <TabGroup selectedIndex={selectedIndex} onChange={(index) => onChange(TABS[index].id)}>
            <TabList className="flex gap-6 border-b border-base-300">
                {TABS.map((tab) => (
                    <Tab
                        key={tab.id}
                        className="-mb-px border-b-2 border-transparent py-3 text-sm font-semibold text-base-content/60 transition-colors hover:text-base-content focus:outline-none data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-primary data-[selected]:border-primary data-[selected]:text-primary"
                    >
                        {tab.label}
                    </Tab>
                ))}
            </TabList>
        </TabGroup>
    );
};

export default ProfileTabs;
