import { ApiClient } from '@twurple/api';

import { authProvider } from '../auth';

export const helix = new ApiClient({ authProvider });
