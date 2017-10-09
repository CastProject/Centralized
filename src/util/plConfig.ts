export class PlConfig  {
  public channelMap: {
    logging: {
      info: string,
      warn: string,
      error: string,
      debug: string
    },
    feedback: string
  } = {
    logging: {
      info: "",
      warn: "",
      error: "",
      debug: ""
    },
    feedback: ""
  };

  public get json(): string {
    return JSON.stringify(this, undefined, 4);
  }

  [key: string]: any;
}

const configKeys = Object.keys(PlConfig.prototype);

export function deserialize(object: {[key: string]: any}): PlConfig {
  const configEntity = new PlConfig();
  Object.keys(object).forEach((key) => {
    try {
      if (configKeys.indexOf(key) >= 0) {
        configEntity[key] = object[key];
      }
    } catch (e) {}
  });
  return configEntity;
}