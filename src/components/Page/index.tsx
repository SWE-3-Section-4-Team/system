import clsx from "clsx";
import React from "react";
import cls from './Page.module.scss';

export const Page: React.FC<React.ComponentProps<'div'>> = ({ children, className, ...props }) => {
    return (
        <div {...props} className={clsx(cls.root, className)}>
            {children}
        </div>
    )
}
