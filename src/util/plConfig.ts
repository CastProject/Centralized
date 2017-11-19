export class PlConfig  {
  public channelMap: {
    logging: {
      info: string,
      warn: string,
      error: string,
      debug: string,
    },
    feedback: string,
  } = {
    feedback: "",
    logging: {
      debug: "",
      error: "",
      info: "",
      warn: "",
    },
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
    (configEntity as any)[key] = object[key];
  });
  return configEntity;
}
