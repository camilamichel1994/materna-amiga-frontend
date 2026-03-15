import React, { useState, useEffect } from 'react';

interface AvatarProps {
  src?: string | null;
  name: string;
  imgClassName?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, imgClassName }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
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
