// tslint:disable:max-line-length
import {Cast, Command, Plugin, Response} from "cast";
import {Message, TextChannel} from "discord.js";
import Centralized from "../plugin";

export default class Feedback implements Command {
  public parent: Cast | Plugin;
  public cast: Cast;
  public permission: string = "centralized.feedback";
  public description: string = "Give me feedback about Cast!";
  public arguments: Array<{
    allRemaining?: boolean,
    name: string,
    type: "string" | "number" | "channel" | "mention",
  }> = [
    {
      allRemaining: true,
      name: "Feedback",
      type: "string",
    },
  ];

  public supportedEnvironments: ["dm" | "text"] = ["dm", "text"];

  public async handle(response: Response, message: Message, args: string[]): Promise<void> {
    let centralized: Centralized;
    if (this.parent instanceof Centralized) {
      centralized = this.parent;
    } else {
      await response.reply("Sorry, I don't have a feedback server setup.");
      return;
    }
    const feedback = args.slice(1).join(" ");
    const channel = this.cast.client.channels.get(centralized.pluginConfig.channelMap.feedback);
    if (channel instanceof TextChannel) {
      await message.react("🆗");
      const embed = this.cast.libraries.embedFactory.createEmbed(message.author);
      embed.setAuthor(`${message.author.username}#${message.author.discriminator} [${message.author.id}]`, message.author.avatarURL);
      embed.addField("Feedback", feedback, true);
      if (message.channel instanceof TextChannel) {
        embed.addField("Guild", `${message.guild.name} [${message.guild.id}]`, true);
        embed.addField("Channel", `${message.channel.name} [${message.channel.id}]`, false);
      } else {
        embed.addField("Channel", "Direct Message", true);
      }
      const timestamp = new Date();
      embed.setFooter(`Feedback Report | ${timestamp.toDateString()} ${timestamp.toTimeString()}`);
      await channel.send(embed);
    } else {
      await response.reply("Sorry, I don't have a feedback server setup.");
      this.parent.logger.debug(`Not submittting feedback because there's no feedback channel\n${feedback}`);
    }
  }

}
