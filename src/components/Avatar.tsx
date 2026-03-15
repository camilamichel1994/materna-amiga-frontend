import React, { useState, useEffect, useMemo } from 'react';

interface AvatarProps {
  src?: string | null;
  name: string;
  imgClassName?: string;
}

function toImgSrc(raw: string): string {
  if (raw.startsWith('http') || raw.startsWith('data:')) return raw;

  if (raw.startsWith('/9j/')) return `data:image/jpeg;base64,${raw}`;
  if (raw.startsWith('iVBOR')) return `data:image/png;base64,${raw}`;
  if (raw.startsWith('R0lGO')) return `data:image/gif;base64,${raw}`;
  if (raw.startsWith('UklGR')) return `data:image/webp;base64,${raw}`;

  return `data:image/jpeg;base64,${raw}`;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, imgClassName }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const imgSrc = useMemo(() => (src ? toImgSrc(src) : null), [src]);

  if (imgSrc && !failed) {
    return (
      <img
        src={imgSrc}
        alt=""
        className={imgClassName}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }

  return <span>{(name || '?').charAt(0).toUpperCase()}</span>;
};

export default Avatar;
