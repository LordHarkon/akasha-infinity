import Experience from "#lib/database/Experience";
import User from "#lib/database/User";
import { envParseArray } from "#lib/env-parser";
import { formatNumber, percentage } from "#lib/utils";
import { Command } from "#lib/structures/Command";
import type { CommandOptions } from "#typings/index";
import { ApplyOptions } from "@sapphire/decorators";
import type { Args } from "@sapphire/framework";
import { resolveKey, sendLocalized } from "@sapphire/plugin-i18next";
import { Canvas, resolveImage } from "canvas-constructor/skia";
import type { GuildMember, Message } from "discord.js";
import path from "path";
import type { Image } from "skia-canvas/lib";

@ApplyOptions<CommandOptions>({
    examples: ["status", "status user", "status @user#0001"],
    usage: "[member]",
    preconditions: [
        {
            name: "CustomCooldown",
            context: {
                delay: 10000,
                premiumDelay: 4000,
            },
        },
    ],
    requiredClientPermissions: ["ATTACH_FILES"],
})
export class StatusCommand extends Command {
    public async messageRun(message: Message, args: Args): Promise<void> {
        const member: GuildMember = await args.pick("member").catch(() => message.member);
        const msg = await sendLocalized(message, "commands/status:generating");
        // Neccesary images
        const background: Image = await resolveImage(path.join(__dirname, "../../assets/images/status/background.png"));
        const avatar: Image = await resolveImage(member.user.displayAvatarURL({ format: "png", size: 4096 }));

        const width: number = 1600;
        const height: number = 965;
        // const height: number = 2100 - 1100;

        const experience = new Experience(member.user, message.guild);
        await experience.initialize();
        const user = new User(member.user, message.guild);
        await user.init();

        const currentExperiencePercentage: number = percentage(experience.currentExperience, experience.uppperBound, 0) / 100;

        const colors = {
            white: "#FFFFFF",
            black: "#000000",
            gold: "#FFD700",
            purple: "#9B00FB",
            bloodRed: "#880808",
            gray: "#AFAEAE",
            slate: "#0F172A",
            red: "#7F1D1D",
            blue: "#1e3a8a",
        };

        let rankColor: string;

        // Check if the user's id is in the owner list
        if (envParseArray("OWNERS").includes(member.user.id)) {
            rankColor = colors.black;
            // Check if the user is the server owner
        } else if (member.user.id === message.guild.ownerId) {
            rankColor = colors.gold;
            // Check if the user has administrator permissions
        } else if (member.permissions.has("ADMINISTRATOR")) {
            rankColor = colors.bloodRed;
            // Else just use the default color
        } else {
            rankColor = colors.blue;
        }

        // TODO: Add level to the lower right corner of the avatar and make it round for the future. Replace the Lv stat with Money

        const res: Buffer = await new Canvas(width, height)
            .printImage(background, 0, 0, width, height)
            .setStroke(rankColor + "80")
            .setStrokeWidth(4)
            .beginPath()
            .moveTo(5, 5)
            .lineTo(width - 5, 5)
            .lineTo(width - 5, height - 5)
            .lineTo(5, height - 5)
            .lineTo(5, 5)
            .stroke()
            .closePath()
            // Username background
            .setColor(colors.black)
            .setStroke(colors.black)
            .setStrokeWidth(2)
            .beginPath()
            .moveTo(506, 137)
            .lineTo(506 + 981, 137)
            .lineTo(506 + 981 - 134, 137 + 120)
            .lineTo(506, 137 + 120)
            .lineTo(506, 137)
            .closePath()
            .stroke()
            .setColor(rankColor + "BF")
            .fill()
            // Username
            .setColor(colors.white)
            .setTextAlign("center")
            .setTextBaseline("middle")
            .setTextFont("bold 96px Inter")
            .setStroke(colors.black)
            .setLineWidth(8)
            .printStrokeText(member.user.username, 970, 197, 780)
            .printText(member.user.username, 970, 197, 780)
            // Empty experience bar
            .setColor(colors.black)
            .setStroke(colors.black)
            .setStrokeWidth(2)
            .beginPath()
            .moveTo(578, 257) // Upper left corner
            .lineTo(578 + 488, 257) // Upper right corner
            .lineTo(578 + 488 - 48, 257 + 57) // Lower right corner
            .lineTo(578, 257 + 57) // Lower left corner
            .lineTo(578, 257) // Upper left corner
            .closePath()
            .stroke()
            .setColor(colors.gray)
            .fill()
            // Filled part of the experience bar
            .setColor(colors.black)
            .setStroke(colors.black)
            .setStrokeWidth(2)
            .beginPath()
            .moveTo(578, 257) // Upper left corner
            .lineTo(578 + 488 * currentExperiencePercentage, 257) // Upper right corner
            .lineTo(578 + 488 * currentExperiencePercentage - 48, 257 + 57) // Lower right corner
            // FIXME: Lower left corner goes too much left without reason.
            .lineTo(578, 257 + 57) // Lower left corner
            .lineTo(578, 257) // Upper left corner
            .closePath()
            .stroke()
            .setColor(colors.gold)
            .fill()
            // Experience bar percentage text
            .setColor(colors.black)
            .setTextAlign("center")
            .setTextBaseline("middle")
            .setTextFont("bold 40px Inter")
            .printText(currentExperiencePercentage * 100 + "%", 806, 286)
            // Avatar border
            .setStroke(colors.black)
            .beginPath()
            .arc(328, 328, 258.5, 0, Math.PI * 2, false)
            .fill()
            .closePath()
            .setLineWidth(4)
            .setStroke(rankColor)
            .stroke()
            // Avatar
            .save()
            .beginPath()
            .arc(328, 328, 257.5, 0, Math.PI * 2, false)
            .clip()
            .printImage(avatar, 70, 70, 515, 515)
            .closePath()
            .restore()
            // Stats title badge
            .setColor(rankColor + "80")
            .printRectangle(665, 598, 270, 50)
            .setStroke(rankColor)
            .setStrokeWidth(5)
            .beginPath()
            .moveTo(665, 598)
            .lineTo(665 + 270, 598)
            .lineTo(665 + 270, 598 + 50)
            .lineTo(665, 598 + 50)
            .lineTo(665, 598)
            .closePath()
            .stroke()
            .setColor(colors.white)
            .setStroke(colors.black)
            .setLineWidth(5)
            .printStrokeText("Stats", 665 + 270 / 2, 598 + 50 / 2)
            .printText("Stats", 665 + 270 / 2, 598 + 50 / 2)
            // Stats border
            .beginPath()
            .setStroke(rankColor)
            .setStrokeWidth(5)
            .moveTo(61, 648)
            .lineTo(61 + 1478, 648)
            .lineTo(61 + 1478, 648 + 260)
            .lineTo(61, 648 + 260)
            .lineTo(61, 648)
            .closePath()
            .stroke()
            // Stats
            .setColor(rankColor)
            .printRectangle(70, 656, 709, 100) // Level
            .printRectangle(823, 656, 709, 100) // XP
            .printRectangle(70, 800, 709, 100) // Msg
            .printRectangle(823, 800, 709, 100) // Role
            .setColor(colors.white)
            .setStroke(colors.black)
            .setTextAlign("center")
            .setTextBaseline("middle")
            .setLineWidth(6)
            // Left side
            .setTextFont("bold 64px Inter")
            .printStrokeText("LVL", 147, 708)
            .printText("LVL", 147, 708)
            .printStrokeText("MSG", 152, 854)
            .printText("MSG", 152, 854)
            // Right side
            .printStrokeText("EXP", 903, 708)
            .printText("EXP", 903, 708)
            .printStrokeText("ROL", 903, 854)
            .printText("ROL", 903, 854)
            .setTextAlign("left")
            .setTextBaseline("top")
            .setTextFont("bold 64px Inter")
            // Left side
            .printStrokeText(experience.level.toString(), 225 + 12, 670)
            .printText(experience.level.toString(), 225 + 12, 670)
            .printStrokeText(formatNumber(user.guildUser.stats.messages), 225 + 12, 812)
            .printText(formatNumber(user.guildUser.stats.messages), 225 + 12, 812)
            // Right side
            .printStrokeText(formatNumber(experience.experience), 986 + 6, 670)
            .printText(formatNumber(experience.experience), 986 + 6, 670)
            .printStrokeText(member.roles.highest.name, 986 + 6, 812)
            .printText(member.roles.highest.name, 986 + 6, 812)
            .toBuffer("image/png");

        msg.edit({
            content: await resolveKey(message, "commands/status:generated", { user: `<@${message.author.id}>` }),
            files: [
                {
                    attachment: res,
                    name: "status.png",
                },
            ],
        });
    }
}
