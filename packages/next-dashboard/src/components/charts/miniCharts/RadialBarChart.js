// @flow
import React from 'react';
/*:: import * as R from 'react'; */

import {
  Legend,
  RadialBar,
  RadialBarChart as RechartRadialBarChart,
  ResponsiveContainer,
  PolarAngleAxis,
  Tooltip,
  Customized,
} from 'recharts';
import WrapChart from '../WrapChart';
import PageChart from '../PageChart';
import TextComp, { type StyledText } from './TextComp';
import type { Plot } from './types';

import {
  PADDING,
  INNER_RADIUS,
  OUTER_RADIUS,
  radius,
  getCenter,
  renderCustomLegend,
} from '../utils';

type Props<T: Plot> = {
  plots: $ReadOnlyArray<T>,
  children?: R.Node,
  maxValue?: number,
  offsetAngle?: number,
  angularSize?: number,
  valueFormatter?: (number, T, boolean) => ?string | number,
  centerText?: StyledText | [StyledText, StyledText],
};

const getTooltipFormatter = valueFormatter => (value, name, { payload }) => [
  (valueFormatter && valueFormatter(value, payload, true)) || value,
  payload.name,
];

const NO_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };

export default function RadialBarChart<T: Plot>({
  plots,
  children,
  maxValue,
  offsetAngle,
  angularSize,
  valueFormatter,
  centerText,
}: Props<T>): R.Element<typeof PageChart> {
  const startAngle = 90 - (offsetAngle || 0);
  const endAngle = startAngle - (angularSize != null ? angularSize : 360);
  const domain = [0, maxValue != null ? maxValue : 'auto'];
  return (
    <PageChart>
      <ResponsiveContainer>
        <WrapChart hoffset={PADDING.BOTTOM}>
          {(width, height) => (
            <RechartRadialBarChart
              startAngle={startAngle}
              endAngle={endAngle}
              data={plots}
              {...getCenter(width, height)}
              innerRadius={radius(INNER_RADIUS, width, height) * 1.2}
              outerRadius={radius(OUTER_RADIUS, width, height) * 1.2}
              width={width}
              height={height}
              margin={NO_MARGIN}
              barCategoryGap="25%"
            >
              {children}
              <Tooltip
                labelFormatter={() => null}
                formatter={getTooltipFormatter(valueFormatter)}
                isAnimationActive={false}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ bottom: -14 }}
                content={renderCustomLegend}
              />
              <PolarAngleAxis type="number" tick={false} domain={domain} />
              <RadialBar
                dataKey="value"
                background={{ fill: 'rgba(0,0,0,0.2)' }}
                cornerRadius="50%"
                forceCornerRadius
                nameKey="name"
              />
              {centerText && (
                <Customized
                  component={() => (
                    <TextComp
                      text={centerText}
                      width={width}
                      height={height}
                      radius={radius(INNER_RADIUS, width, height)}
                    />
                  )}
                  key="RadialBarChartCustomizedElement"
                />
              )}
            </RechartRadialBarChart>
          )}
        </WrapChart>
      </ResponsiveContainer>
    </PageChart>
  );
}
