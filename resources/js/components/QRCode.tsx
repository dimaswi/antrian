import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeProps {
    value: string;
    size?: number;
    className?: string;
    options?: {
        errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
        margin?: number;
        color?: {
            dark?: string;
            light?: string;
        };
    };
}

export default function QRCodeComponent({ 
    value, 
    size = 100,
    className = "",
    options = {}
}: QRCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current && value) {
            QRCode.toCanvas(canvasRef.current, value, {
                width: size,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M',
                ...options
            }).catch((error) => {
                console.error('Error generating QR code:', error);
            });
        }
    }, [value, size, options]);

    return (
        <canvas 
            ref={canvasRef} 
            className={className}
            width={size}
            height={size}
        />
    );
}
