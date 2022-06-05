import { send } from "@sapphire/plugin-editable-commands";
import { ColorResolvable, Message, MessageEmbed, User } from "discord.js";
import { Canvas, Image, resolveImage } from "canvas-constructor/skia";
import { RandomLoadingMessage } from "./constants";
import path from "path";
import * as colors from "#assets/data/colors.json";

/**
 * Picks a random item from an array
 * @param array The array to pick a random item from
 * @example
 * const randomEntry = pickRandom([1, 2, 3, 4]) // 1
 */
export function pickRandom<T>(array: readonly T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Send a message to the channel and add a loading message to it
 * @param {Message} message - The message to send.
 * @returns A Promise.
 */
export function sendLoadingMessage(message: Message): Promise<typeof message> {
    return send(message, {
        embeds: [new MessageEmbed().setDescription(pickRandom(RandomLoadingMessage)).setColor("#FF0000")],
    });
}

/**
 * Generate a random number between a minimum and maximum value
 * @param {number} min - the minimum value of the range.
 * @param {number} max - The maximum value of the random number.
 * @returns A random number between the min and max values.
 */
export function randomRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format a number with commas
 * @param {number} num - The number to be formatted.
 * @returns a string.
 */
export function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Remove all instances of a value from an array
 * @param array - The array to remove the value from.
 * @param value - The value to remove from the array.
 * @returns An array.
 */
export function arrayRemove<T>(array: T[], value: T): T[] {
    return array.filter((ele) => {
        return ele != value;
    });
}

/**
 * Given a number and a total, return the percentage of the total that the number represents
 * @param {number} num - The number you want to calculate the percentage of.
 * @param {number} total - The total number of items in the collection.
 * @returns The percentage of the total.
 */
export function percentage(num: number, total: number, decimals: number = 1): number {
    return parseFloat(((num / total) * 100).toFixed(decimals));
}

/**
 * Remove duplicate items from an array
 * @param {T[]} array - The array to remove duplicates from.
 * @returns An array.
 */
export function removeDuplicates<T>(array: T[]): T[] {
    return array.filter((item, index) => {
        return array.indexOf(item) === index;
    });
}

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function wrap(value: string, wrapper: string): string {
    return wrapper + value + wrapper;
}

/**
 * Converts milliseconds to a human readable string
 * @param {number} ms - The number of milliseconds to convert to a human readable string.
 * @returns A human readable string.
 */
export function convertTime(ms: number): string {
    const s = Math.floor(ms / 1000);

    const years = Math.floor(s / (3600 * 24 * 365));
    const months = Math.floor(s / (3600 * 24 * 30));
    const weeks = Math.floor(s / (3600 * 24 * 7));
    const days = Math.floor(s / (3600 * 24));
    const hours = Math.floor((s % (3600 * 24)) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = Math.floor(s % 60);

    let result: string = "";

    if (years > 0) result += `${years} year${years > 1 ? "s " : " "}`;
    if (months > 0) result += `${months} month${months > 1 ? "s " : " "}`;
    if (weeks > 0) result += `${weeks} week${weeks > 1 ? "s " : " "}`;
    if (days > 0) result += `${days} day${days > 1 ? "s " : " "}`;
    if (hours > 0) result += `${hours} hour${hours > 1 ? "s " : " "}`;
    if (minutes > 0) result += `${minutes} minute${minutes > 1 ? "s " : " "}`;
    if (seconds > 0) result += `${seconds} second${seconds > 1 ? "s " : " "}`;

    if (!result) return "now";
    else return result.trim();
}

export const imageSizes = [16, 32, 56, 64, 96, 128, 256, 300, 512, 600, 1024, 2048, 4096];

export function isValidImageSize(size: number): boolean {
    return imageSizes.includes(size);
}

export const imageFormats = ["png", "jpg", "jpeg", "webp", "gif"];

export function isValidImageFormat(format: string): boolean {
    return imageFormats.includes(format);
}

export function getColor(id: string): ColorResolvable {
    let hash = 0;
    let color = "#";

    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += ("00" + value.toString(16)).substring(-2);
    }

    return color as ColorResolvable;
}

type NameResult = [string, string, boolean];
type HSLResult = number[];
type RGBResult = number[];

export const nameThatColor = {
    init: function () {
        let color: string, rgb, hsl;
        for (let i = 0; i < nameThatColor.names.length; i++) {
            color = "#" + nameThatColor.names[i][0];
            rgb = nameThatColor.rgb(color);
            hsl = nameThatColor.hsl(color);
            nameThatColor.names[i].push(rgb[0], rgb[1], rgb[2], hsl[0], hsl[1], hsl[2]);
        }
    },
    name: function (color: string): NameResult {
        color = color.toUpperCase();

        if (color.length < 3 || color.length > 7) {
            return ["#000000", `Invalid Color: ${color}`, false];
        }
        if (color.length % 3 === 0) {
            color = "#" + color;
        }
        if (color.length === 4) {
            color =
                "#" +
                color.substring(1, 1) +
                color.substring(1, 1) +
                color.substring(2, 1) +
                color.substring(2, 1) +
                color.substring(3, 1) +
                color.substring(3, 1);
        }

        let rgb = nameThatColor.rgb(color);
        let r = rgb[0],
            g = rgb[1],
            b = rgb[2];
        let hsl = nameThatColor.hsl(color);
        let h = hsl[0],
            s = hsl[1],
            l = hsl[2];
        let ndf1 = 0,
            ndf2 = 0,
            ndf = 0;
        let cl = -1,
            df = -1;

        for (let i = 0; i < nameThatColor.names.length; i++) {
            if (color === `#${nameThatColor.names[i][0]}`) {
                return [`#${nameThatColor.names[i][0]}`, nameThatColor.names[i][1], true];
            }

            let name = nameThatColor.names[i];

            ndf1 = Math.pow(r - name[2], 2) + Math.pow(g - name[3], 2) + Math.pow(b - name[4], 2);
            ndf2 = Math.pow(h - name[5], 2) + Math.pow(s - name[6], 2) + Math.pow(l - name[7], 2);

            ndf = ndf1 + ndf2 * 2;

            if (df < 0 || df > ndf) {
                df = ndf;
                cl = i;
            }
        }

        return cl < 0 ? ["#000000", `Invalid Color: ${color}`, false] : [`#${nameThatColor.names[cl][0]}`, nameThatColor.names[cl][1], false];
    },
    hsl: function (color: string): HSLResult {
        let rgb = [
            parseInt("0x" + color.substring(1, 3)) / 255,
            parseInt("0x" + color.substring(3, 5)) / 255,
            parseInt("0x" + color.substring(5, 7)) / 255,
        ];
        let min, max, delta, h, s, l;
        let r = rgb[0],
            g = rgb[1],
            b = rgb[2];

        min = Math.min(r, Math.min(g, b));
        max = Math.max(r, Math.max(g, b));
        delta = max - min;
        l = (min + max) / 2;

        s = 0;
        if (l > 0 && l < 1) s = delta / (l < 0.5 ? 2 * l : 2 - 2 * l);

        h = 0;
        if (delta > 0) {
            if (max === r && max !== g) h += (g - b) / delta;
            if (max === g && max !== b) h += 2 + (b - r) / delta;
            if (max === b && max !== r) h += 4 + (r - g) / delta;
            h /= 6;
        }

        return [h * 255, s * 255, l * 255];
    },
    rgb: function (color: string): RGBResult {
        return [parseInt("0x" + color.substring(1, 3)), parseInt("0x" + color.substring(3, 5)), parseInt("0x" + color.substring(5, 7))];
    },
    names: Object.assign([], colors),
};

nameThatColor.init();

export async function generateLevelUpImage(
    user: User,
    oldLevel: number,
    newLevel: number,
    lowerBoundExperience: number,
    upperBoundExperience: number,
    currentExperience: number,
): Promise<Buffer> {
    const background: Image = await resolveImage(path.join(__dirname, "../assets/images/levelup/Background.png"));
    const levelFrame: Image = await resolveImage(path.join(__dirname, "../assets/images/levelup/LevelFrame.png"));
    const rightArrow: Image = await resolveImage(path.join(__dirname, "../assets/images/levelup/RightArrow.png"));
    const levelUpBackground: Image = await resolveImage(path.join(__dirname, "../assets/images/levelup/LevelUpBackground.png"));

    const width: number = 2400;
    const height: number = 600;

    const avatar: Image = await resolveImage(user.displayAvatarURL({ format: "png", size: 4096 }));

    const experinceBarWidthTopDifference: number = 30;
    const experinceBarWidthBottom: number = 285;
    const currentExperiencePercentage: number = percentage(currentExperience, upperBoundExperience - lowerBoundExperience, 0) / 100;

    return await new Canvas(width, height)
        .printImage(background, 0, 0, width, height)
        .printImage(levelUpBackground, 185, 65, 758, 120)
        // Border of the experience bar
        .setColor("#000000")
        .beginPath()
        .moveTo(292, 185)
        .lineTo(609, 185)
        .lineTo(579, 219)
        .lineTo(292, 219)
        .lineTo(292, 185)
        .closePath()
        .fill()
        // Empty experience bar
        .setColor("#C4C4C4")
        .beginPath()
        .moveTo(293, 185)
        .lineTo(608, 185)
        .lineTo(578, 218)
        .lineTo(293, 218)
        .lineTo(293, 185)
        .closePath()
        .fill()
        // Filled part of the experience bar
        .setColor("#E7EC00")
        .beginPath()
        .moveTo(293, 185)
        .lineTo(293 + experinceBarWidthBottom * (currentExperiencePercentage + 0.01) + experinceBarWidthTopDifference, 185)
        .lineTo(293 + experinceBarWidthBottom * (currentExperiencePercentage + 0.01), 218)
        .lineTo(293, 218)
        .lineTo(293, 185)
        .closePath()
        .fill()
        // Experience bar percentage text
        .setTextFont("20px Irish Grover")
        .setTextBaseline("top")
        .setColor("#000000")
        .printText(currentExperiencePercentage * 100 + "%", 430, 188)
        // Avatar
        .save()
        .beginPath()
        .arc(173, 173, 130, 0, Math.PI * 2, false)
        .setStroke("#000000")
        .stroke()
        .clip()
        .printImage(avatar, 45, 45, 256, 256)
        .closePath()
        .restore()
        // Old level frame
        .printImage(levelFrame, 978, 52, 444, 496)
        // Arrow between frames
        .printImage(rightArrow, 1510, 242, 231, 116)
        // New level frame
        .printImage(levelFrame, 1830, 52, 444, 496)
        // LEVEL UP text
        .setTextFont("96px Irish Grover")
        .setTextBaseline("top")
        .setColor("#d6d7ff")
        .printText("LEVEL UP", 360, 65)
        // The old and new level texts
        .setTextFont("bold 230px Istok Web")
        .setTextAlign("center")
        .printText(oldLevel.toString(), 1195, 150)
        .printText(newLevel.toString(), 2052, 150)
        // Buffer the resultant image
        .toBuffer("image/png");
}
