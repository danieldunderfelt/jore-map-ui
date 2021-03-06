import IError from '~/models/IError';
import { ErrorStore } from '../errorStore';

describe('errorStore.addError', () => {
    it('Adds one error to error store', () => {
        const errorStore = new ErrorStore();
        const errorMessage = 'This is a test error';

        errorStore.addError(errorMessage);

        expect(errorStore.errors.length).toEqual(1);
        expect(errorStore.latestError).toEqual(errorMessage);
    });

    it('Adds one error to error store, then removes it', () => {
        const errorStore = new ErrorStore();
        const errorMessage = 'This is a test error';

        errorStore.addError(errorMessage);

        expect(errorStore.errors.length).toEqual(1);

        const error = errorStore.pop();

        expect(error).toEqual(errorMessage);
        expect(errorStore.errors.length).toEqual(0);
    });

    it('Adds one error with exception to error store', () => {
        // tslint:disable:no-console
        // Mocks console.error
        const consoleError = console.error;
        global.console.error = jest.fn();

        const errorStore = new ErrorStore();
        const errorMessage = 'This is a test error';
        const exception: Error = {
            message: 'This is a test exception message',
            name: 'Test exception',
        };

        errorStore.addError(errorMessage, exception);

        expect(errorStore.errors.length).toEqual(1);
        expect(errorStore.latestError).toContain(errorMessage);
        expect(errorStore.latestError).toContain(exception.message);
        expect(console.error).toBeCalled();
        // Clean up console.error to be back to normal
        console.error = consoleError;
        // tslint:enable:no-console
    });

    it('Adds one error with http status description', () => {
        // tslint:disable:no-console
        // Mocks console.error
        const consoleError = console.error;
        global.console.error = jest.fn();

        const errorStore = new ErrorStore();
        const errorMessage = 'This is a test error';
        const exceptionMessage = 'This is a test exception message';
        const errorException: IError = {
            message: exceptionMessage,
            name: 'Test exception',
            errorCode: undefined,
        };

        errorStore.addError(errorMessage, errorException);

        expect(errorStore.errors.length).toEqual(1);

        const error = errorStore.pop();

        expect(error).toContain('This is a test exception message');
        expect(errorStore.errors.length).toEqual(0);
        expect(console.error).toBeCalled();
        // Clean up console.error to be back to normal
        console.error = consoleError;
        // tslint:enable:no-console
    });
});
