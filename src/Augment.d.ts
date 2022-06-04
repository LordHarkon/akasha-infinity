import type { CustomCooldownContext } from "../preconditions/CustomCooldown";

declare module "@sapphire/framework" {
    interface Preconditions {
        AdminOnly: never;
        CustomCooldown: CustomCooldownContext;
        GuildOnly: never;
        InVoiceChannel: never;
        ModeratorOnly: never;
        NotBlacklisted: never;
        OwnerOnly: never;
    }
}

export default undefined;
