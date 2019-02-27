const commonConstants = {
    MAP_LAYERS_MIN_ZOOM_LEVEL: 15,
    NEW_OBJECT_TAG: 'new',
};

const developmentConstants = {
    ...commonConstants,
    isLoginRequired: false,
    FADE_DIALOG_TIMEOUT: 500, // milliseconds
};

const productionConstants = {
    ...commonConstants,
    isLoginRequired: true,
    FADE_DIALOG_TIMEOUT: 2500, // milliseconds
};

const isDevelopment = (process.env.NODE_ENV === 'development');

export default isDevelopment ? developmentConstants : productionConstants;