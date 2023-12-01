import { Tab } from '@headlessui/react';
import { FC } from 'react';
import BeerPostsByUser from './BeerPostsByUser';
import BreweryPostsByUser from './BreweryPostsByUser';

const UserPosts: FC = () => {
  return (
    <div className="mt-4">
      <div>
        <Tab.Group>
          <Tab.List className="tabs-boxed tabs items-center justify-center rounded-2xl">
            <Tab className="tab-xl tab w-1/2 uppercase ui-selected:tab-active">Beers</Tab>
            <Tab className="tab-xl tab w-1/2 uppercase ui-selected:tab-active">
              Breweries
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <BeerPostsByUser />
            </Tab.Panel>
            <Tab.Panel>
              <BreweryPostsByUser />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default UserPosts;
