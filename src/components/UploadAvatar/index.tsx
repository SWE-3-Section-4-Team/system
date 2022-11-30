import { CameraIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import React from "react";
import { useDropzone } from "react-dropzone";

import cls from './UploadAvatar.module.scss';

interface UploadAvatarProps {
    onChange?: (value: string) => void;
    className?: string;
}

const getBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
        res(reader.result as string);
    };

    reader.onerror = () => {
        rej();
    }
});

export const UploadAvatar: React.FC<UploadAvatarProps> = ({ onChange, className }) => {
    const [base64, setBase64] = React.useState('');

    const onDrop = React.useCallback((files: File[]) => {
        const file = files[0];
        if (!file) {
            return;
        }

        getBase64(file).then((str) => {
            setBase64(str);
            onChange?.(str);
        });
    }, [onChange]);

    const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
    });

    return (
        <div className={clsx(cls.root, className)}>
            <div data-border={!base64} data-accept={isDragAccept} className={cls.avatar} {...getRootProps()}>
                <input {...getInputProps()} />
                {base64 ? (
                    <img src={base64} alt="Avatar" className={cls.preview} />
                ) : (
                    <CameraIcon className={cls.icon} />
                )}
            </div>
        </div>
    )
}