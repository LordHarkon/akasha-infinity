import { Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { pickRandom } from "#lib/utils";
import { MessageEmbed } from "discord.js";

export class UserEvent extends Listener<"mentionPrefixOnly"> {
    public async run(message: Message) {
        const { client } = this.container;
        const prefix = await client.fetchPrefix(message);
        const titles = [
            "I'm here to help!",
            "Lost your way, traveler?",
            "Forgot your way, traveler?",
            "Got lost, traveler?",
            "Lost your map, traveler?",
        ];

        const messages = [
            "Worry not! For **Infinity**, I'm here to **{{prefix}}help** solve your problems!",
            "Her Royal **Infinity** has arrived! **{{prefix}}help** is now just a message away!",
            "**Infinity** is here to help you! Use **{{prefix}}help** to get started!",
            "It is fine now. Why? Because **Infinity** is here to **{{prefix}}help** you!",
            "You are lost and scared, but I must **{{prefix}}help** you! Why? Because I am... The Symbol of **Infinity**!",
        ];

        const embed = new MessageEmbed()
            .setColor("#091C3F")
            .setThumbnail(client.user?.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setTitle(pickRandom(titles));

        const makeMessage = (prefix) => pickRandom(messages).replace("{{prefix}}", prefix);

        if (Array.isArray(prefix)) {
            embed.setDescription(makeMessage(prefix[0]));
        } else {
            embed.setDescription(makeMessage(prefix));
        }

        return message.reply({
            embeds: [embed],
        });
    }
}
