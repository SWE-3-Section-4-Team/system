import clsx from "clsx";
import React from "react";
import cls from './Tabs.module.scss';

interface Item {
    value: string;
    label: string;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    items: Item[];
    label?: string;
    className?: string;
}

export const Tabs: React.FC<Props> = ({ value, onChange, items, className, label }) => {
    const getClickHandler = React.useCallback((value: string) => () => onChange(value), [onChange]);

    return (
        <div className={clsx(cls.root, className)}>
            {label ? <label className={cls.label}>{label}</label> : null}
            <div className={cls.tabs}>
                {items.map(item => (
                    <button
                        key={item.value}
                        className={cls.tab}
                        onClick={getClickHandler(item.value)}
                        data-selected={item.value === value}
                        type="button"
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
