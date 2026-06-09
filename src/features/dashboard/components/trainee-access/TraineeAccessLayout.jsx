import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ToggleGroup, ToggleGroupItem } from '../../../../shared/ui';

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isDesktop;
};

const TraineeAccessLayout = ({ tr, categoryPanel, videoPanel }) => {
  const isDesktop = useIsDesktop();
  const [activeTab, setActiveTab] = useState('categories');

  if (isDesktop) {
    return (
      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(240px,34%)_1fr]"
        data-testid="access-split-layout"
      >
        {categoryPanel}
        {videoPanel}
      </div>
    );
  }

  return (
    <div data-testid="access-tab-layout">
      <ToggleGroup
        type="single"
        value={activeTab}
        onValueChange={(val) => val && setActiveTab(val)}
        className="mb-4 w-full"
        data-testid="access-mobile-tabs"
      >
        <ToggleGroupItem value="categories" className="flex-1" data-testid="access-tab-categories">
          {tr('trainee-access-tab-categories')}
        </ToggleGroupItem>
        <ToggleGroupItem value="videos" className="flex-1" data-testid="access-tab-videos">
          {tr('trainee-access-tab-videos')}
        </ToggleGroupItem>
      </ToggleGroup>
      {activeTab === 'categories' ? categoryPanel : videoPanel}
    </div>
  );
};

TraineeAccessLayout.propTypes = {
  tr: PropTypes.func.isRequired,
  categoryPanel: PropTypes.node.isRequired,
  videoPanel: PropTypes.node.isRequired,
};

export default TraineeAccessLayout;
