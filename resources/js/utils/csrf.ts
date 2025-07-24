/**
 * CSRF Utility for making authenticated requests
 */

export function getCSRFToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

export async function fetchWithCSRF(url: string, options: RequestInit = {}): Promise<Response> {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCSRFToken(),
        'X-Requested-With': 'XMLHttpRequest',
    };

    const mergedOptions: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: 'same-origin',
    };

    return fetch(url, mergedOptions);
}
