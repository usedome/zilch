import { SetMetadata } from '@nestjs/common';

export const IS_GUARDED_KEY = 'unguarded';

export const UnguardedRoute = () => SetMetadata(IS_GUARDED_KEY, true);
