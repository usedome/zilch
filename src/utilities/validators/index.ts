import { SetMetadata } from '@nestjs/common';

export const IS_AUTH_GUARDED_KEY = 'unguardedAuth';

export const UnguardedAuthRoute = () => SetMetadata(IS_AUTH_GUARDED_KEY, true);
