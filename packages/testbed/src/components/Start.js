// @flow
import React from 'react';

import PageContent from './PageContent';
import Statistic from './Statistic';

const Start = () => (
  <div className="">
    <h1 className="page-title">Overview</h1>
    <div className="grid">
      <div className="cell column-6-medium column-3-large">
        <Statistic />
      </div>
      <div className="cell column-6-medium column-3-large">
        <Statistic label="Quality" title="8,2" description="46% from last period" />
      </div>
      <div className="cell column-6-medium column-3-large">
        <Statistic label="Volume" title="7,5" description="15% from last period" />
      </div>
      <div className="cell column-6-medium column-3-large">
        <Statistic label="Leadership" title="7,5" description="55% from last period" />
      </div>
      <div className="cell column-6 column-4-medium">
        <Statistic />
      </div>
      <div className="cell column-6 column-4-medium">
        <Statistic />
      </div>
      <div className="cell column-6 column-4-medium">
        <Statistic />
      </div>
      <div className="cell">
        <PageContent>
          <p>
            Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Maecenas faucibus mollis interdum. Sed posuere consectetur est at lobortis. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Curabitur blandit tempus porttitor. Nullam id dolor id nibh ultricies vehicula ut id elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
          </p>
          <p>
            Maecenas faucibus mollis <a href="/awd">interdum</a>. Donec id elit non mi porta gravida at eget metus. Aenean lacinia bibendum nulla sed consectetur. Etiam porta sem malesuada magna mollis euismod. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec id elit non mi porta gravida at eget metus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
          </p>
        </PageContent>
      </div>
    </div>
  </div>
);

export default Start;