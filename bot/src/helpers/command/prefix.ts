import { env } from '@synopsis/env/node';

export const prefix = env.NODE_ENV === 'development' ? 'sbdev ' : 'sb ';
