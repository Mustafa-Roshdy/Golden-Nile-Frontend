import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface UserAvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src?: string | null;
    alt?: string;
    className?: string;
    name?: string;
}

const UserAvatar = ({ src, alt = "User", className, name, ...props }: UserAvatarProps) => {
    const [imgSrc, setImgSrc] = useState<string | null>(src || null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(src || null);
        setHasError(false);
    }, [src]);

    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || "User")}`;

    return (
        <img
            {...props}
            src={!hasError && imgSrc ? imgSrc : defaultAvatar}
            alt={alt}
            className={cn("object-cover rounded-full", className)}
            onError={() => setHasError(true)}
        />
    );
};

export default UserAvatar;
