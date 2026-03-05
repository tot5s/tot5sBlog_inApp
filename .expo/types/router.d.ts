/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/post/create`; params?: Router.UnknownInputParams; } | { pathname: `/post/[id]`, params: Router.UnknownInputParams & { id: string | number; } } | { pathname: `/post/edit/[id]`, params: Router.UnknownInputParams & { id: string | number; } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/post/create`; params?: Router.UnknownOutputParams; } | { pathname: `/post/[id]`, params: Router.UnknownOutputParams & { id: string; } } | { pathname: `/post/edit/[id]`, params: Router.UnknownOutputParams & { id: string; } };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `/post/create${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/post/create`; params?: Router.UnknownInputParams; } | `/post/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ''}` | `/post/edit/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ''}` | { pathname: `/post/[id]`, params: Router.UnknownInputParams & { id: string | number; } } | { pathname: `/post/edit/[id]`, params: Router.UnknownInputParams & { id: string | number; } };
    }
  }
}
