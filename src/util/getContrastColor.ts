interface Rgb {
    red: number;
    green: number;
    blue: number;
}

function hex2rgb(color: string): Rgb {
    const hex = color.startsWith('#') ? color.substring(1) : color;

    return {
        red: parseInt(hex.substring(0, 2), 16),
        green: parseInt(hex.substring(2, 4), 16),
        blue: parseInt(hex.substring(4, 6), 16),
    };
}

export default function getContrastColor(color?: string): string {
    if (!color) return '#000000';

    // about half of 256. Lower threshold equals more dark text on dark background
    const threshold = 130;
    const { red, green, blue } = hex2rgb(color);
    const brightness = ((red * 299) + (green * 587) + (blue * 114)) / 1000;

    if (brightness > threshold) return '#000000';
    return '#ffffff';
}
