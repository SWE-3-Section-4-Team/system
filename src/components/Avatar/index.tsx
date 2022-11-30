import React, { type HTMLAttributes } from 'react';
import clsx from 'clsx';
import * as AvatarBase from '@radix-ui/react-avatar';
import { PersonIcon } from '@radix-ui/react-icons';

import { Loader } from '../Loader';
import type { Size } from '../../types/size';

import cls from './Avatar.module.scss';
import { env } from '../../env/client.mjs';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  image?: string;
  pin?: string;
  name?: string;
  size?: Size;
  loading?: boolean;
}

const getInitials = (name: string) => name.split(' ').map((n) => n[0]?.toUpperCase() || '').join('');

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ image, name, size = 'sm', className, loading, pin, ...props }, ref) => (
    <AvatarBase.Root
      ref={ref}
      className={clsx(className, cls.root)}
      data-size={size}
      {...props}
    >
      {loading ? (
        <div className={cls.loading}>
          <Loader />
        </div>
      ) : (
        <>
          <AvatarBase.AvatarImage
            src={pin ? `${env.NEXT_PUBLIC_S3_ENDPOINT}/${env.NEXT_PUBLIC_S3_BUCKET_NAME}/avatars/${pin}` : image}
            alt={name}
            className={cls.img}
          />
          <AvatarBase.AvatarFallback
            delayMs={600}
            className={cls.fallback}
          >
            {name ? getInitials(name) : <PersonIcon />}
          </AvatarBase.AvatarFallback>
        </>
      )}
    </AvatarBase.Root>
  )
);

Avatar.displayName = 'Avatar';
