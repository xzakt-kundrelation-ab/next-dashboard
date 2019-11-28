// @flow

import React, { Component } from 'react';
import Router from 'next/router';

import type { NextComponent, InitialPropsContext } from './nextTypes';
import type { DataProvider, DataType, Theme, SiteMessageType } from './types';
import displayNameOf from './displayNameOf';

import { getInitialState, persist } from './persistentState';
import DashboardContext, {
  type DashboardContextType,
} from './dashboardContext';

export type WrappedProps<P: {}> =
  | {
      ...P,
      __RENDER_ERROR__: false | void,
      __INITIAL_STATE__: { [string]: any },
      __INITIAL_DATA__: { [string]: DataType },
      __COMP__: NextComponent<P>,
      __ERR_PROPS__: void,
    }
  | {
      __RENDER_ERROR__: true,
      __INITIAL_STATE__: void,
      __INITIAL_DATA__: void,
      __COMP__: void,
      __ERR_PROPS__: {},
    };

type State = {
  data: { [string]: DataType },
  persistentState: { [string]: any },
  siteMessages: SiteMessageType[],
};

function makeStatusError(
  statusCode: number,
  message?: string,
): Error & { statusCode: number } {
  // eslint-disable-next-line flowtype/no-weak-types
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export type Config = {
  unauthedRoute?: string,
  needAuthDefault: boolean,
  errorComponent?: NextComponent<any>,
  themes?: Theme[],
};

type ExtraCTX = {
  needAuth: boolean,
  Comp: NextComponent<any>,
};

function compareSitemessages(
  m1: SiteMessageType,
  m2: SiteMessageType,
): boolean {
  if (m1.status !== m2.status) return false;
  if (m1.title !== m2.title) return false;
  if (m1.message !== m2.message) return false;
  return true;
}

export default function createDashboardHOC<D: DataProvider>(
  dataProvider: D,
  {
    needAuthDefault,
    unauthedRoute,
    errorComponent: ErrorComp,
    themes: confThemes,
  }: Config,
): <U: {}>(Comp: NextComponent<U>, needAuth?: boolean) => NextComponent<U> {
  const themes: Theme[] = confThemes || [
    { name: 'Light', class: 'default' },
    { name: 'Dark', class: 'dark' },
  ];
  const context: $Shape<DashboardContextType> = {
    ...dataProvider,
    themes,
  };
  class Dashboard<P: {}> extends Component<WrappedProps<P>, State> {
    state: State;

    constructor(props: WrappedProps<P>) {
      super(props);
      // eslint-disable-next-line no-underscore-dangle
      const { __INITIAL_STATE__, __INITIAL_DATA__ } = props;
      this.state = {
        persistentState: __INITIAL_STATE__ || {},
        data: __INITIAL_DATA__ || {},
        siteMessages: context.siteMessages || [],
      };
    }

    static async getInitialProps(
      ctx: InitialPropsContext,
      { needAuth, Comp }: ExtraCTX,
    ): Promise<{}> {
      const { pathname, query, asPath } = ctx;
      const authenticated =
        dataProvider &&
        (await dataProvider.isAuthorizedForRoute(pathname, asPath, query));
      if (needAuth && !authenticated) {
        const { res } = ctx;
        if (unauthedRoute) {
          if (res) {
            res.writeHead(302, { Location: unauthedRoute });
            res.end();
            return {};
          }
          Router.push(unauthedRoute);
          return {};
        }

        const statusCode = 401;
        if (res) res.statusCode = 401;
        const err: Error & { statusCode: number } = makeStatusError(
          statusCode,
          'Unauthorized, please log in.',
        );

        if (ErrorComp) {
          const errCtx = { ...ctx, err };
          const retProps = {
            errProps:
              (ErrorComp.getInitialProps
                ? await ErrorComp.getInitialProps(errCtx)
                : null) || {},
            __RENDER_ERROR__: true,
          };
          return retProps;
        }
        throw err;
      }

      return {
        ...((Comp.getInitialProps ? await Comp.getInitialProps(ctx) : null) ||
          {}),
        __INITIAL_STATE__: getInitialState(ctx),
        __INITIAL_DATA__: dataProvider.getCurrentData(),
      };
    }

    getPersistentState: <T>(key: string, defaultValue: T) => T = (
      key,
      defaultValue,
    ) => {
      const { persistentState } = this.state;
      if (typeof persistentState[key] !== 'undefined')
        return persistentState[key];
      return (defaultValue /*:any */);
    };

    setPersistentState: <T>(key: string, value: T) => void = (key, value) => {
      this.setState(curState => {
        if (curState.persistentState[key] === value) return {};
        const newPersistentState = {
          ...curState.persistentState,
          [key]: value,
        };
        persist(newPersistentState);
        return {
          persistentState: newPersistentState,
        };
      });
    };

    dismissSiteMessage: (siteMessage: SiteMessageType) => void = (
      siteMessage: SiteMessageType,
    ) => {
      this.setState(state => {
        const newMessages = state.siteMessages.filter(
          m => !compareSitemessages(m, siteMessage),
        );
        return {
          siteMessages: newMessages,
        };
      });
    };

    registerSiteMessage: (siteMessage: SiteMessageType | Error) => void = (
      siteMessage: SiteMessageType | Error,
    ) => {
      if (siteMessage instanceof Error) {
        return this.registerSiteMessage({
          title: siteMessage.constructor.name,
          status: 'error',
          message: siteMessage.message,
        });
      }
      this.setState(state => {
        const existingMessage = state.siteMessages.find(m =>
          compareSitemessages(m, siteMessage),
        );
        if (existingMessage) {
          existingMessage.count =
            existingMessage.count != null ? existingMessage.count : 1;
          existingMessage.count += 1;
          return {
            siteMessages: [...state.siteMessages],
          };
        }
        return {
          siteMessages: [...state.siteMessages, siteMessage],
        };
      });

      // Incase we want to return something
      // later from this method, I returned
      // the recursive call earlier. Eslint then
      // complained about consistent returns
      // hence `return undefined`
      return undefined;
    };

    render() {
      const { state, props } = this;
      // eslint-disable-next-line no-underscore-dangle,react/destructuring-assignment
      if (props.__RENDER_ERROR__) {
        const { __ERR_PROPS__: errProps } = props;
        if (ErrorComp) {
          return <ErrorComp {...errProps} />;
        }
        return null;
      }
      const { persistentState } = state;
      const theme: Theme = themes.find(
        t => t.class === persistentState.theme,
      ) ||
        themes[0] || { name: 'Default', class: 'default' };
      const { __RENDER_ERROR__: _, __COMP__: Comp, ...rest } = props;
      context.getState = this.getPersistentState;
      context.setState = this.setPersistentState;
      context.registerSiteMessage = this.registerSiteMessage;
      context.dismissSiteMessage = this.dismissSiteMessage;
      context.theme = theme;
      context.data = state.data;
      context.siteMessages = [...state.siteMessages];
      return (
        Comp != null && (
          <DashboardContext.Provider value={context}>
            <Comp {...rest} />
          </DashboardContext.Provider>
        )
      );
    }
  }

  function withDashboard<P: {}>(
    Comp: NextComponent<P>,
    needAuth?: boolean,
  ): NextComponent<P> {
    if (process.env.NODE_ENV === 'development') {
      const { prototype } = (Comp: any) || {};
      if (prototype && prototype instanceof React.PureComponent) {
        console.warn(
          `Please don't use PureComponent for dashboard root components, Use regular Component instead. Component: ${displayNameOf(
            Comp,
          )}`,
        );
      }
    }
    // eslint-disable-next-line no-param-reassign
    const parsedNeedAuth = needAuth == null ? needAuthDefault : needAuth;

    function WrappedComp(
      props: P,
    ): React$Element<React$AbstractComponent<WrappedProps<P>, Dashboard<P>>> {
      const Dash: any = Dashboard;
      return <Dash {...props} __COMP__={Comp} />;
    }

    WrappedComp.getInitialProps = (ctx: InitialPropsContext) => {
      return Dashboard.getInitialProps(ctx, {
        needAuth: parsedNeedAuth,
        Comp,
      });
    };

    WrappedComp.displayName = `withDashboard(${displayNameOf(Comp)})`;

    return WrappedComp;
  }

  return withDashboard;
}