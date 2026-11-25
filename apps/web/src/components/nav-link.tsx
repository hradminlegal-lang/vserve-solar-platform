import Link from 'next/link';
import type { LinkLike } from '@vserve/ui';

/** next/link adapted to the LinkLike prop used by @vserve/ui navigation components. */
export const NavLink = Link as unknown as LinkLike;
