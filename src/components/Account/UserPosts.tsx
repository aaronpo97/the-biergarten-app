import { Tab } from '@headlessui/react';
import { FC } from 'react';
import BeerPostsByUser from './BeerPostsByUser';
import BreweryPostsByUser from './BreweryPostsByUser';

const UserPosts: FC = () => {
  return (
    <div className="mt-4">
      <div>
        <Tab.Group>
          <Tab.List className="tabs-boxed tabs grid grid-cols-2">
            <Tab className="tab uppercase ui-selected:tab-active">Beers</Tab>
            <Tab className="tab uppercase ui-selected:tab-active">Breweries</Tab>
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
