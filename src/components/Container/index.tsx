import clsx from 'clsx';
import React from 'react';

import type { Size } from '../../types/size';

import cls from './Container.module.scss';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    size?: Size;
    center?: boolean;
    fullHeight?: boolean;
}

export const Container: React.FC<Props> = ({ className, size = 'md', center = true, fullHeight = false, ...props }) => (
    <div data-size={size} className={clsx(cls.root, className, { [cls.center!]: center, [cls.fullHeight!]: fullHeight })} {...props} />
);
