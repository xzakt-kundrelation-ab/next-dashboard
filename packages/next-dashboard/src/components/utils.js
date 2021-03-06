// @flow
import React from 'react';

const PlaceholderMessage = ({ message }: { message: string }) => (
  <h3
    className="line-chart-title-container h3-size"
    style={{ paddingTop: 10, paddingBottom: 38 }}
  >
    {message}
  </h3>
);

export const DataNotFound = () => (
  <PlaceholderMessage message="No data found" />
);

export const DataIsLoading = () => <PlaceholderMessage message="Loading" />;
