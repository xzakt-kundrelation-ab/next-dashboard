// @flow

import cookies from 'next-cookies';

import errorReporter from './errorReporter';

import type { InitialPropsContext } from './nextTypes';

let btoa;
let atob;
if (typeof window === 'undefined') {
  /* eslint-disable global-require */
  btoa = require('btoa');
  atob = require('atob');
  /* eslint-enable global-require */
} else {
  ({ btoa, atob } = window);
}

export type JSONSerializable =
  | string
  | boolean
  | number
  | null
  | $ReadOnlyArray<empty>
  | {};

export default function createPersistentState<
  PersistentState: ?JSONSerializable,
>(
  cookieName: string,
  version?: number,
): {
  getInitialState(ctx: InitialPropsContext | string): PersistentState | null,
  persist(state: PersistentState): void,
  serialize(state: PersistentState): string,
} {
  let latestState: PersistentState | void;
  let debouncing: boolean = false;

  return {
    getInitialState(ctx: InitialPropsContext | string): PersistentState | null {
      try {
        if (typeof ctx === 'string') {
          const dashboardState = JSON.parse(ctx);
          if (dashboardState.version !== version) return null;
          return dashboardState.data;
        }
        const { [cookieName]: dashboardB64 } = cookies(ctx);
        if (!dashboardB64) return null;
        const dashboardJson = atob(dashboardB64);
        const dashboardState = JSON.parse(dashboardJson);
        if (dashboardState.version !== version) return null;
        return dashboardState.data;
      } catch (err) {
        errorReporter.emit('error', err);
        return null;
      }
    },

    persist(state: PersistentState) {
      if (typeof window === 'undefined' || !window.setTimeout) return;
      if (!debouncing) {
        try {
          window.document.cookie = `${cookieName}=${escape(
            btoa(JSON.stringify({ version, data: state })),
          )}; path=/`;
        } catch (err) {
          errorReporter.emit('error', err);
        }
        debouncing = true;
        const debounce = () => {
          const curState = latestState;
          latestState = undefined;
          if (curState === undefined) {
            debouncing = false;
            return;
          }
          try {
            window.document.cookie = `${cookieName}=${escape(
              btoa(JSON.stringify({ version, data: curState })),
            )}; path=/`;
          } catch (err) {
            errorReporter.emit('error', err);
          }
          window.setTimeout(debounce, 100);
        };
        window.setTimeout(debounce, 100);
      } else {
        latestState = state;
      }
    },

    serialize(state: PersistentState): string {
      return JSON.stringify({ version, data: state });
    },
  };
}
