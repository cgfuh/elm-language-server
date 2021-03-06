import { ClientCapabilities, IConnection } from "vscode-languageserver";
import { injectable, container } from "tsyringe";

export interface IClientSettings {
  elmFormatPath: string;
  elmPath: string;
  elmTestPath: string;
  elmAnalyseTrigger: ElmAnalyseTrigger;
  trace: { server: string };
  extendedCapabilities?: IExtendedCapabilites;
}

export interface IExtendedCapabilites {
  moveFunctionRefactoringSupport: boolean;
  exposeUnexposeSupport: boolean;
}

export type ElmAnalyseTrigger = "change" | "save" | "never";

@injectable()
export class Settings {
  private clientSettings: IClientSettings = {
    elmAnalyseTrigger: "never",
    elmFormatPath: "",
    elmPath: "",
    elmTestPath: "",
    trace: { server: "off" },
  };
  private connection: IConnection;

  private initDone = false;

  constructor(
    config: IClientSettings,
    private clientCapabilities: ClientCapabilities,
  ) {
    this.connection = container.resolve<IConnection>("Connection");
    this.updateSettings(config);
  }

  public initFinished(): void {
    this.initDone = true;
  }

  public async getClientSettings(): Promise<IClientSettings> {
    if (
      this.initDone &&
      this.clientCapabilities.workspace &&
      this.clientCapabilities.workspace.configuration
    ) {
      this.updateSettings(
        await this.connection.workspace.getConfiguration("elmLS"),
      );
    }
    return this.clientSettings;
  }

  public get extendedCapabilities(): IExtendedCapabilites | undefined {
    return this.clientSettings.extendedCapabilities;
  }

  private updateSettings(config: IClientSettings): void {
    this.clientSettings = { ...this.clientSettings, ...config };
  }
}
