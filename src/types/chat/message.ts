export interface Message {
  id: string;
  userMessage: string;
  spectMessage: string | undefined;
  spectSources: any[] | undefined;
  showSources: boolean | undefined;
}
