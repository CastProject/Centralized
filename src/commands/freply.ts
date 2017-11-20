// tslint:disable:max-line-length
import {Cast, Command, Plugin, Response} from "cast";
import {Message, TextChannel} from "discord.js";
import Centralized from "../plugin";

export default class FeedbackReply implements Command {
  public parent: Centralized;
  public cast: Cast;
  public permission: string = "centralized.freply";
  public description: string = "Replies to feedback";
  public arguments: Array<{
    allRemaining?: boolean,
    name: string,
    type: "string" | "number" | "channel" | "mention",
  }> = [
    {
      allRemaining: false,
      name: "Feedback ID",
      type: "string",
    },
    {
      allRemaining: true,
      name: "Feedback Reply",
      type: "string",
    },
  ];

  public supportedEnvironments: ["text"] = ["text"];

  public async handle(response: Response, message: Message, args: string[]): Promise<void> {
    const feedbackID = args[1];
    if (!feedbackID.match(/g!?(1|\d{17,19})/)) {
      await response.fail();
      await response.reply("Please provide a valid message ID");
      return;
    }
    const feedbackResponse = args.slice(2).join(" ");

    const feedbackChannel = this.cast.client.channels.get(this.parent.pluginConfig.channelMap.feedback);
    if (feedbackChannel instanceof TextChannel) {
      const feedbackMessage = await feedbackChannel.fetchMessage(feedbackID);
      const feedbackEmbed = feedbackMessage.embeds[0];
      if (feedbackEmbed) {
        let userID: string = feedbackEmbed.author.name.split("[")[1];
        userID = userID.substring(0, userID.length - 1);
        const user = this.cast.client.users.get(userID);
        if (user) {
          const feedbackReply = this.cast.libraries.embedFactory.createEmbed();
          const submittedFeedback = feedbackEmbed.fields[0].value;
          feedbackReply.setAuthor(`${message.author.username}#${message.author.discriminator} [${message.author.id}]`, message.author.avatarURL);
          feedbackReply.setTitle("Your feedback has been responded to");
          feedbackReply.addField("Your Feedback", submittedFeedback);
          feedbackReply.addField("Developer Response", feedbackResponse);
          await user.send(feedbackReply);
          await message.react("🆗");
        } else {
          await response.fail();
          await response.reply("I cannot send messages to that user.");
        }
      } else {
        await response.fail();
        await response.reply("That is not a valid feedback object.");
      }
    } else {
      await response.fail();
      await response.reply("Sorry, I don't have a feedback server setup.");
    }
  }
}
