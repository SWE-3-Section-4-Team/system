import clsx from 'clsx';
import React from 'react';

import { Size } from '../../types/size';

import cls from './Container.module.scss';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    size?: Size;
    center?: boolean;
}

export const Container: React.FC<Props> = ({ className, size = 'md', center = true, ...props }) => (
    <div data-size={size} className={clsx(cls.root, className, { [cls.center!]: center })} {...props} />
);