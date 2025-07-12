// hooks.js

function useLocalStorageState(key, defaultValue) {
    const { useState, useEffect } = React;
    const [state, setState] = useState(() => {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            try {
                return JSON.parse(storedValue);
            } catch (e) {
                return defaultValue;
            }
        }
        return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (e) {
            console.error(`Error setting localStorage key "${key}":`, e);
        }
    }, [key, state]);

    return [state, setState];
}

function useDebounce(value, delay) {
    const { useState, useEffect } = React;
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}