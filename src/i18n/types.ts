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
    sessions: string;
    sessionsDesc: string;
    peers: string;
    peersDesc: string;
    messages: string;
    messagesDesc: string;
    queueLength: string;
    queueLengthDesc: string;
  };
  statsFailed: string;
  queueStatus: string;
  queue: {
    total: string;
    completed: string;
    processing: string;
    pending: string;
  };
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
  noSearchResultsDesc: string;
  detail: string;
  backToList: string;
  header: {
    sessions: string;
    created: string;
  };
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
  searchPlaceholder: string;
  noSessions: string;
  noSessionsDesc: string;
  noSearchResults: string;
  view: string;
  backToList: string;
  info: {
    peer: string;
    messages: string;
    created: string;
  };
  summary: string;
  noMessages: string;
  noMessagesDesc: string;
  notFound: string;
  notFoundDesc: string;
  sendFailed: string;
  messagePlaceholder: string;
  deleteConfirmTitle: string;
  deleteConfirmDesc: string;
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
  filter: {
    allPeers: string;
    sort: string;
    newest: string;
    oldest: string;
  };
  deleteConfirmTitle: string;
  deleteConfirmDesc: string;
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
