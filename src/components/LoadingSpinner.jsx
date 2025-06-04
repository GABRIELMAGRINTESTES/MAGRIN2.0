import PropTypes from 'prop-types';

export default function LoadingSpinner({ fullscreen = false }) {
  return (
    <div className={`flex items-center justify-center ${fullscreen ? 'h-screen' : 'h-full'}`}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}

LoadingSpinner.propTypes = {
  fullscreen: PropTypes.bool
};