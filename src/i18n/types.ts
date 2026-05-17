export interface CommonTranslations {
  sidebar: {
    brand: string;
    overview: string;
    peers: string;
    sessions: string;
    conclusions: string;
    settings: string;
  };
  button: {
    save: string;
    cancel: string;
    delete: string;
    create: string;
    send: string;
    test: string;
    view: string;
    previous: string;
    next: string;
    clear: string;
    search: string;
    retry: string;
  };
  table: {
    column: {
      name: string;
      created: string;
      actions: string;
      status: string;
    };
  };
  status: {
    connected: string;
    disconnected: string;
    active: string;
    inactive: string;
    loading: string;
  };
  empty: {
    noWorkspaces: string;
  };
  error: {
    somethingWentWrong: string;
    unexpectedError: string;
    cannotReach: string;
  };
  pagination: {
    pageOf: string;
  };
}

export interface OverviewTranslations {
  title: string;
  workspace: string;
  stats: {
    total: string;
    completed: string;
    inProgress: string;
    pending: string;
  };
  queueFailed: string;
  recentSessions: string;
  noSessions: string;
  noSessionsDesc: string;
}

export interface PeersTranslations {
  title: string;
  workspace: string;
  search: string;
  noPeers: string;
  noPeersDesc: string;
  noSearchResults: string;
  detail: string;
  backToList: string;
  tabs: {
    representation: string;
    card: string;
    chat: string;
  };
  representation: {
    noRepresentation: string;
    noRepresentationDesc: string;
  };
  card: {
    noCard: string;
    noCardDesc: string;
  };
  chat: {
    placeholder: string;
    emptyTitle: string;
    emptyDesc: string;
    reasoningTimeout: string;
    reasoningTimeoutDesc: string;
  };
}

export interface SessionsTranslations {
  title: string;
  workspace: string;
  noSessions: string;
  noSessionsDesc: string;
  view: string;
  backToList: string;
  summary: string;
  noMessages: string;
  noMessagesDesc: string;
  notFound: string;
  notFoundDesc: string;
  sendFailed: string;
  messagePlaceholder: string;
}

export interface ConclusionsTranslations {
  title: string;
  workspace: string;
  search: string;
  searchPlaceholder: string;
  searchFailed: string;
  noConclusions: string;
  noConclusionsDesc: string;
  noSearchResults: string;
  observer: string;
  observed: string;
  session: string;
}

export interface SettingsTranslations {
  title: string;
  apiTitle: string;
  apiDesc: string;
  apiUrlLabel: string;
  apiUrlPlaceholder: string;
  testConnection: string;
  connected: string;
  disconnected: string;
  languageTitle: string;
  languageDesc: string;
  aboutTitle: string;
  aboutDesc: string;
  version: string;
}
