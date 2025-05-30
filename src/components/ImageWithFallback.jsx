import PropTypes from 'prop-types';
import { useState } from 'react';

export default function ImageWithFallback({
  src,
  alt,
  fallback = '/imagem-padrao.jpg',
  className,
  ...props
}) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc || fallback}
      alt={alt}
      className={className}
      onError={() => setImgSrc(fallback)}
      {...props}
    />
  );
}

ImageWithFallback.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  fallback: PropTypes.string,
  className: PropTypes.string,
};
