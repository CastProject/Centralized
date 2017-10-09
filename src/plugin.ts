import {Plugin, Cast, CommandContainer, Logger} from "cast";
import {TextChannel} from "discord.js";
import {EventEmitter} from "events";
import * as fs from "fs-extra";
import * as path from "path";
import * as PlConfUtil from "./util/plConfig";

const configPath = path.join(__dirname, "config.json");

export default class Centralized extends EventEmitter implements Plugin {

  public cast: Cast;
  // public commands: CommandContainer;
  public logger: Logger;

  public name: string = "Centralized";
  public version: string = "1.0.0";
  public debugMode: boolean = false;
  public pluginConfig: PlConfUtil.PlConfig;
  public listeningEvents: string[] = ["log:info", "log:warn", "log:error", "log:debug"];
  public id: string = this.name.toLowerCase();

  public onLoad(cast: Cast, logger: Logger): Promise<void> {
    return new Promise((resolve) => {
      this.cast = cast;
      this.logger = logger;
      let confLoader = {};
      try {
        confLoader = require(configPath);
      } catch (e) {};
      this.pluginConfig = PlConfUtil.deserialize(confLoader);
      resolve();
    });
  }

  onEnable(): Promise<void> {
    return new Promise((resolve) => {
      this.attachListeners();
      resolve();
    });
  }

  onDisable(): Promise<void> {
    return this.writeJSON();
  }

  public writeJSON(): Promise<void> {
    return fs.writeFile(configPath, this.pluginConfig.json);
  }
  
  private attachListeners(): void {
    const bind = (eventName: "info" | "warn" | "error" | "debug", thisName: "infoChannel" | "warningChannel" | "errorChannel" | "debugChannel") => {
      this.on(`log:${eventName}`, (data) => {
        const channel = this[thisName];
        if (channel) {
          channel.send(`\`\`\`\n${data}\n\`\`\``);
        }
      });
    };
    bind("info", "infoChannel");
    bind("warn", "warningChannel");
    bind("error", "errorChannel");
    bind("debug", "debugChannel");
  }

  private getChannel(type: "info" | "warn" | "error" | "debug"): TextChannel | undefined {
    if (this.cast.client.channels.has(this.pluginConfig.channelMap.logging[type])) {
      const channel = this.cast.client.channels.get(this.pluginConfig.channelMap.logging[type]);
      if (channel instanceof TextChannel) {
        return channel;
      }
    }
    return undefined;
  }

  private get infoChannel(): TextChannel | undefined {
    return this.getChannel("info");
  }

  private get warningChannel(): TextChannel | undefined {
    return this.getChannel("warn");
  }

  private get errorChannel(): TextChannel | undefined {
    return this.getChannel("error");
  }

  private get debugChannel(): TextChannel | undefined {
    return this.getChannel("debug");
  }
}