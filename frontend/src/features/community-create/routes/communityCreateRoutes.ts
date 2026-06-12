import { createElement } from 'react';
import type { RouteObject } from 'react-router-dom';
import { CommunityCreatePage } from '../pages/CommunityCreatePage';
import { CommunityReadPage } from '../pages/CommunityReadPage';

export const communityCreateRoutes: RouteObject[] = [
  {
    path: '/create-community',
    element: createElement(CommunityCreatePage)
  },
  {
    path: '/communities/:communityId',
    element: createElement(CommunityReadPage)
  }
];
