/* eslint-disable */
import { GraphQLClient } from 'graphql-request';
import { GraphQLClientRequestHeaders } from 'graphql-request/build/cjs/types';
import { gql } from 'graphql-request';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
    [_ in K]?: never;
};
export type Incremental<T> =
    | T
    | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: { input: string | number; output: string };
    String: { input: string; output: string };
    Boolean: { input: boolean; output: boolean };
    Int: { input: number; output: number };
    Float: { input: number; output: number };
    ArbitraryMap: { input: any; output: any };
    ObjectID: { input: any; output: any };
    StringMap: { input: any; output: any };
    Time: { input: any; output: any };
};

export type ActiveEmote = {
    __typename?: 'ActiveEmote';
    actor?: Maybe<UserPartial>;
    data: EmotePartial;
    flags: Scalars['Int']['output'];
    id: Scalars['ObjectID']['output'];
    name: Scalars['String']['output'];
    origin_id?: Maybe<Scalars['ObjectID']['output']>;
    timestamp: Scalars['Time']['output'];
};

export type Archive = {
    __typename?: 'Archive';
    content_type: Scalars['String']['output'];
    name: Scalars['String']['output'];
    size: Scalars['Int']['output'];
    url: Scalars['String']['output'];
};

export type AuditLog = {
    __typename?: 'AuditLog';
    actor: UserPartial;
    actor_id: Scalars['ObjectID']['output'];
    changes: Array<AuditLogChange>;
    created_at: Scalars['Time']['output'];
    id: Scalars['ObjectID']['output'];
    kind: Scalars['Int']['output'];
    reason: Scalars['String']['output'];
    target_id: Scalars['ObjectID']['output'];
    target_kind: Scalars['Int']['output'];
};

export type AuditLogChange = {
    __typename?: 'AuditLogChange';
    array_value?: Maybe<AuditLogChangeArray>;
    format: Scalars['Int']['output'];
    key: Scalars['String']['output'];
    value?: Maybe<Scalars['ArbitraryMap']['output']>;
};

export type AuditLogChangeArray = {
    __typename?: 'AuditLogChangeArray';
    added: Array<Maybe<Scalars['ArbitraryMap']['output']>>;
    removed: Array<Maybe<Scalars['ArbitraryMap']['output']>>;
    updated: Array<Maybe<Scalars['ArbitraryMap']['output']>>;
};

export type Ban = {
    __typename?: 'Ban';
    actor?: Maybe<User>;
    actor_id: Scalars['ObjectID']['output'];
    created_at: Scalars['Time']['output'];
    effects: Scalars['Int']['output'];
    expire_at: Scalars['Time']['output'];
    id: Scalars['ObjectID']['output'];
    reason: Scalars['String']['output'];
    victim?: Maybe<User>;
    victim_id: Scalars['ObjectID']['output'];
};

export type ChangeField = {
    __typename?: 'ChangeField';
    index?: Maybe<Scalars['Int']['output']>;
    key: Scalars['String']['output'];
    nested: Scalars['Boolean']['output'];
    old_value?: Maybe<Scalars['String']['output']>;
    type: Scalars['String']['output'];
    value?: Maybe<Scalars['String']['output']>;
};

export type ChangeMap = {
    __typename?: 'ChangeMap';
    actor?: Maybe<User>;
    added: Array<ChangeField>;
    id: Scalars['ObjectID']['output'];
    kind: ObjectKind;
    pulled: Array<ChangeField>;
    pushed: Array<ChangeField>;
    removed: Array<ChangeField>;
    updated: Array<ChangeField>;
};

export enum ChannelEmoteListItemAction {
    Add = 'ADD',
    Remove = 'REMOVE',
    Update = 'UPDATE',
}

export enum ConnectionPlatform {
    Discord = 'DISCORD',
    Twitch = 'TWITCH',
    Youtube = 'YOUTUBE',
}

export type Cosmetic = {
    id: Scalars['ObjectID']['output'];
    kind: CosmeticKind;
    name: Scalars['String']['output'];
};

export type CosmeticBadge = Cosmetic & {
    __typename?: 'CosmeticBadge';
    host: ImageHost;
    id: Scalars['ObjectID']['output'];
    kind: CosmeticKind;
    name: Scalars['String']['output'];
    tag: Scalars['String']['output'];
    tooltip: Scalars['String']['output'];
};

export enum CosmeticKind {
    Badge = 'BADGE',
    Paint = 'PAINT',
}

export type CosmeticOps = {
    __typename?: 'CosmeticOps';
    id: Scalars['ObjectID']['output'];
    updatePaint: CosmeticPaint;
};

export type CosmeticOpsUpdatePaintArgs = {
    definition: CosmeticPaintInput;
};

export type CosmeticPaint = Cosmetic & {
    __typename?: 'CosmeticPaint';
    /** @deprecated use the 'gradients' property */
    angle: Scalars['Int']['output'];
    color?: Maybe<Scalars['Int']['output']>;
    flairs?: Maybe<Array<CosmeticPaintFlair>>;
    /** @deprecated use the 'gradients' property */
    function: CosmeticPaintFunction;
    gradients: Array<CosmeticPaintGradient>;
    id: Scalars['ObjectID']['output'];
    /** @deprecated use the 'gradients' property */
    image_url?: Maybe<Scalars['String']['output']>;
    kind: CosmeticKind;
    name: Scalars['String']['output'];
    /** @deprecated use the 'gradients' property */
    repeat: Scalars['Boolean']['output'];
    shadows?: Maybe<Array<CosmeticPaintShadow>>;
    /** @deprecated use the 'gradients' property */
    shape?: Maybe<Scalars['String']['output']>;
    /** @deprecated use the 'gradients' property */
    stops: Array<CosmeticPaintStop>;
    text?: Maybe<CosmeticPaintText>;
};

export type CosmeticPaintFlair = {
    __typename?: 'CosmeticPaintFlair';
    data: Scalars['String']['output'];
    height: Scalars['Float']['output'];
    kind: CosmeticPaintFlairKind;
    width: Scalars['Float']['output'];
    x_offset: Scalars['Float']['output'];
    y_offset: Scalars['Float']['output'];
};

export enum CosmeticPaintFlairKind {
    Image = 'IMAGE',
    Text = 'TEXT',
    Vector = 'VECTOR',
}

export enum CosmeticPaintFunction {
    LinearGradient = 'LINEAR_GRADIENT',
    RadialGradient = 'RADIAL_GRADIENT',
    Url = 'URL',
}

export type CosmeticPaintGradient = {
    __typename?: 'CosmeticPaintGradient';
    angle: Scalars['Int']['output'];
    at?: Maybe<Array<Scalars['Float']['output']>>;
    canvas_repeat: Scalars['String']['output'];
    function: CosmeticPaintFunction;
    image_url?: Maybe<Scalars['String']['output']>;
    repeat: Scalars['Boolean']['output'];
    shape?: Maybe<Scalars['String']['output']>;
    size?: Maybe<Array<Scalars['Float']['output']>>;
    stops: Array<CosmeticPaintStop>;
};

export type CosmeticPaintInput = {
    angle?: InputMaybe<Scalars['Int']['input']>;
    color?: InputMaybe<Scalars['Int']['input']>;
    function: CosmeticPaintFunction;
    image_url?: InputMaybe<Scalars['String']['input']>;
    name: Scalars['String']['input'];
    repeat: Scalars['Boolean']['input'];
    shadows: Array<CosmeticPaintShadowInput>;
    shape?: InputMaybe<Scalars['String']['input']>;
    stops: Array<CosmeticPaintStopInput>;
};

export type CosmeticPaintShadow = {
    __typename?: 'CosmeticPaintShadow';
    color: Scalars['Int']['output'];
    radius: Scalars['Float']['output'];
    x_offset: Scalars['Float']['output'];
    y_offset: Scalars['Float']['output'];
};

export type CosmeticPaintShadowInput = {
    color: Scalars['Int']['input'];
    radius: Scalars['Float']['input'];
    x_offset: Scalars['Float']['input'];
    y_offset: Scalars['Float']['input'];
};

export type CosmeticPaintStop = {
    __typename?: 'CosmeticPaintStop';
    at: Scalars['Float']['output'];
    center_at?: Maybe<Array<Scalars['Float']['output']>>;
    color: Scalars['Int']['output'];
};

export type CosmeticPaintStopInput = {
    at: Scalars['Float']['input'];
    color: Scalars['Int']['input'];
};

export type CosmeticPaintStroke = {
    __typename?: 'CosmeticPaintStroke';
    color: Scalars['Int']['output'];
    width: Scalars['Float']['output'];
};

export type CosmeticPaintText = {
    __typename?: 'CosmeticPaintText';
    shadows?: Maybe<Array<CosmeticPaintShadow>>;
    stroke?: Maybe<CosmeticPaintStroke>;
    transform?: Maybe<Scalars['String']['output']>;
    variant?: Maybe<Scalars['String']['output']>;
    weight?: Maybe<Scalars['Int']['output']>;
};

export type CosmeticsQuery = {
    __typename?: 'CosmeticsQuery';
    badges: Array<CosmeticBadge>;
    paints: Array<CosmeticPaint>;
};

export type CreateEmoteSetInput = {
    name: Scalars['String']['input'];
    privileged?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateReportInput = {
    body: Scalars['String']['input'];
    subject: Scalars['String']['input'];
    target_id: Scalars['ObjectID']['input'];
    target_kind: Scalars['Int']['input'];
};

export type CreateRoleInput = {
    allowed: Scalars['String']['input'];
    color: Scalars['Int']['input'];
    denied: Scalars['String']['input'];
    name: Scalars['String']['input'];
};

export type EditReportInput = {
    assignee?: InputMaybe<Scalars['String']['input']>;
    note?: InputMaybe<EditReportNoteInput>;
    priority?: InputMaybe<Scalars['Int']['input']>;
    status?: InputMaybe<ReportStatus>;
};

export type EditReportNoteInput = {
    content?: InputMaybe<Scalars['String']['input']>;
    internal?: InputMaybe<Scalars['Boolean']['input']>;
    reply?: InputMaybe<Scalars['String']['input']>;
    timestamp?: InputMaybe<Scalars['String']['input']>;
};

export type EditRoleInput = {
    allowed?: InputMaybe<Scalars['String']['input']>;
    color?: InputMaybe<Scalars['Int']['input']>;
    denied?: InputMaybe<Scalars['String']['input']>;
    name?: InputMaybe<Scalars['String']['input']>;
    position?: InputMaybe<Scalars['Int']['input']>;
};

export type Emote = {
    __typename?: 'Emote';
    activity: Array<AuditLog>;
    animated: Scalars['Boolean']['output'];
    channels: UserSearchResult;
    common_names: Array<EmoteCommonName>;
    created_at: Scalars['Time']['output'];
    flags: Scalars['Int']['output'];
    host: ImageHost;
    id: Scalars['ObjectID']['output'];
    lifecycle: Scalars['Int']['output'];
    listed: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    owner?: Maybe<UserPartial>;
    owner_id: Scalars['ObjectID']['output'];
    personal_use: Scalars['Boolean']['output'];
    reports: Array<Report>;
    state: Array<EmoteVersionState>;
    tags: Array<Scalars['String']['output']>;
    trending?: Maybe<Scalars['Int']['output']>;
    versions: Array<EmoteVersion>;
};

export type EmoteActivityArgs = {
    limit?: InputMaybe<Scalars['Int']['input']>;
};

export type EmoteChannelsArgs = {
    limit?: InputMaybe<Scalars['Int']['input']>;
    page?: InputMaybe<Scalars['Int']['input']>;
};

export type EmoteCommonName = {
    __typename?: 'EmoteCommonName';
    count: Scalars['Int']['output'];
    name: Scalars['String']['output'];
};

export type EmoteOps = {
    __typename?: 'EmoteOps';
    id: Scalars['ObjectID']['output'];
    merge: Emote;
    rerun?: Maybe<Emote>;
    update: Emote;
};

export type EmoteOpsMergeArgs = {
    reason?: InputMaybe<Scalars['String']['input']>;
    target_id: Scalars['ObjectID']['input'];
};

export type EmoteOpsUpdateArgs = {
    params: EmoteUpdate;
    reason?: InputMaybe<Scalars['String']['input']>;
};

export type EmotePartial = {
    __typename?: 'EmotePartial';
    animated: Scalars['Boolean']['output'];
    created_at: Scalars['Time']['output'];
    flags: Scalars['Int']['output'];
    host: ImageHost;
    id: Scalars['ObjectID']['output'];
    lifecycle: Scalars['Int']['output'];
    listed: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    owner?: Maybe<UserPartial>;
    owner_id: Scalars['ObjectID']['output'];
    state: Array<EmoteVersionState>;
    tags: Array<Scalars['String']['output']>;
};

export enum EmoteSearchCategory {
    Featured = 'FEATURED',
    Global = 'GLOBAL',
    New = 'NEW',
    Top = 'TOP',
    TrendingDay = 'TRENDING_DAY',
    TrendingMonth = 'TRENDING_MONTH',
    TrendingWeek = 'TRENDING_WEEK',
}

export type EmoteSearchFilter = {
    animated?: InputMaybe<Scalars['Boolean']['input']>;
    aspect_ratio?: InputMaybe<Scalars['String']['input']>;
    authentic?: InputMaybe<Scalars['Boolean']['input']>;
    case_sensitive?: InputMaybe<Scalars['Boolean']['input']>;
    category?: InputMaybe<EmoteSearchCategory>;
    exact_match?: InputMaybe<Scalars['Boolean']['input']>;
    ignore_tags?: InputMaybe<Scalars['Boolean']['input']>;
    personal_use?: InputMaybe<Scalars['Boolean']['input']>;
    zero_width?: InputMaybe<Scalars['Boolean']['input']>;
};

export type EmoteSearchResult = {
    __typename?: 'EmoteSearchResult';
    count: Scalars['Int']['output'];
    items: Array<Maybe<Emote>>;
    max_page: Scalars['Int']['output'];
};

export type EmoteSet = {
    __typename?: 'EmoteSet';
    capacity: Scalars['Int']['output'];
    emote_count: Scalars['Int']['output'];
    emotes: Array<ActiveEmote>;
    flags: Scalars['Int']['output'];
    id: Scalars['ObjectID']['output'];
    name: Scalars['String']['output'];
    origins: Array<EmoteSetOrigin>;
    owner?: Maybe<UserPartial>;
    owner_id?: Maybe<Scalars['ObjectID']['output']>;
    tags: Array<Scalars['String']['output']>;
};

export type EmoteSetEmotesArgs = {
    limit?: InputMaybe<Scalars['Int']['input']>;
    origins?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum EmoteSetName {
    Global = 'GLOBAL',
}

export type EmoteSetOps = {
    __typename?: 'EmoteSetOps';
    delete: Scalars['Boolean']['output'];
    emotes: Array<ActiveEmote>;
    id: Scalars['ObjectID']['output'];
    update: EmoteSet;
};

export type EmoteSetOpsEmotesArgs = {
    action: ListItemAction;
    id: Scalars['ObjectID']['input'];
    name?: InputMaybe<Scalars['String']['input']>;
};

export type EmoteSetOpsUpdateArgs = {
    data: UpdateEmoteSetInput;
};

export type EmoteSetOrigin = {
    __typename?: 'EmoteSetOrigin';
    id: Scalars['ObjectID']['output'];
    slices?: Maybe<Array<Scalars['Int']['output']>>;
    weight: Scalars['Int']['output'];
};

export type EmoteSetOriginInput = {
    id: Scalars['ObjectID']['input'];
    slices?: InputMaybe<Array<Scalars['Int']['input']>>;
    weight: Scalars['Int']['input'];
};

export type EmoteSetPartial = {
    __typename?: 'EmoteSetPartial';
    capacity: Scalars['Int']['output'];
    id: Scalars['ObjectID']['output'];
    name: Scalars['String']['output'];
};

export type EmoteUpdate = {
    deleted?: InputMaybe<Scalars['Boolean']['input']>;
    flags?: InputMaybe<Scalars['Int']['input']>;
    listed?: InputMaybe<Scalars['Boolean']['input']>;
    name?: InputMaybe<Scalars['String']['input']>;
    owner_id?: InputMaybe<Scalars['ObjectID']['input']>;
    personal_use?: InputMaybe<Scalars['Boolean']['input']>;
    tags?: InputMaybe<Array<Scalars['String']['input']>>;
    version_description?: InputMaybe<Scalars['String']['input']>;
    version_name?: InputMaybe<Scalars['String']['input']>;
};

export type EmoteVersion = {
    __typename?: 'EmoteVersion';
    created_at: Scalars['Time']['output'];
    description: Scalars['String']['output'];
    error?: Maybe<Scalars['String']['output']>;
    host: ImageHost;
    id: Scalars['ObjectID']['output'];
    lifecycle: Scalars['Int']['output'];
    listed: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    state: Array<EmoteVersionState>;
};

export enum EmoteVersionState {
    AllowPersonal = 'ALLOW_PERSONAL',
    Listed = 'LISTED',
}

export type Image = {
    __typename?: 'Image';
    format: ImageFormat;
    frame_count: Scalars['Int']['output'];
    height: Scalars['Int']['output'];
    name: Scalars['String']['output'];
    size: Scalars['Int']['output'];
    width: Scalars['Int']['output'];
};

export enum ImageFormat {
    Avif = 'AVIF',
    Gif = 'GIF',
    Png = 'PNG',
    Webp = 'WEBP',
}

export type ImageHost = {
    __typename?: 'ImageHost';
    files: Array<Image>;
    url: Scalars['String']['output'];
};

export type ImageHostFilesArgs = {
    formats?: InputMaybe<Array<ImageFormat>>;
};

export type InboxMessage = Message & {
    __typename?: 'InboxMessage';
    author_id?: Maybe<Scalars['ObjectID']['output']>;
    content: Scalars['String']['output'];
    created_at: Scalars['Time']['output'];
    id: Scalars['ObjectID']['output'];
    important: Scalars['Boolean']['output'];
    kind: MessageKind;
    pinned: Scalars['Boolean']['output'];
    placeholders: Scalars['StringMap']['output'];
    read: Scalars['Boolean']['output'];
    read_at?: Maybe<Scalars['Time']['output']>;
    starred: Scalars['Boolean']['output'];
    subject: Scalars['String']['output'];
};

export enum ListItemAction {
    Add = 'ADD',
    Remove = 'REMOVE',
    Update = 'UPDATE',
}

export type Message = {
    author_id?: Maybe<Scalars['ObjectID']['output']>;
    created_at: Scalars['Time']['output'];
    id: Scalars['ObjectID']['output'];
    kind: MessageKind;
    read: Scalars['Boolean']['output'];
    read_at?: Maybe<Scalars['Time']['output']>;
};

export enum MessageKind {
    EmoteComment = 'EMOTE_COMMENT',
    Inbox = 'INBOX',
    ModRequest = 'MOD_REQUEST',
    News = 'NEWS',
}

export type ModRequestMessage = Message & {
    __typename?: 'ModRequestMessage';
    actor_country_code: Scalars['String']['output'];
    actor_country_name: Scalars['String']['output'];
    author_id?: Maybe<Scalars['ObjectID']['output']>;
    created_at: Scalars['Time']['output'];
    id: Scalars['ObjectID']['output'];
    kind: MessageKind;
    read: Scalars['Boolean']['output'];
    read_at?: Maybe<Scalars['Time']['output']>;
    target_id: Scalars['ObjectID']['output'];
    target_kind: Scalars['Int']['output'];
    wish: Scalars['String']['output'];
};

export type ModRequestMessageList = {
    __typename?: 'ModRequestMessageList';
    messages: Array<ModRequestMessage>;
    total: Scalars['Int']['output'];
};

export type Mutation = {
    __typename?: 'Mutation';
    cosmetics: CosmeticOps;
    createBan?: Maybe<Ban>;
    createCosmeticPaint: Scalars['ObjectID']['output'];
    createEmoteSet?: Maybe<EmoteSet>;
    createReport?: Maybe<Report>;
    createRole?: Maybe<Role>;
    deleteRole: Scalars['String']['output'];
    dismissVoidTargetModRequests: Scalars['Int']['output'];
    editBan?: Maybe<Ban>;
    editReport?: Maybe<Report>;
    editRole?: Maybe<Role>;
    emote: EmoteOps;
    emoteSet?: Maybe<EmoteSetOps>;
    readMessages: Scalars['Int']['output'];
    sendInboxMessage?: Maybe<InboxMessage>;
    user?: Maybe<UserOps>;
};

export type MutationCosmeticsArgs = {
    id: Scalars['ObjectID']['input'];
};

export type MutationCreateBanArgs = {
    anonymous?: InputMaybe<Scalars['Boolean']['input']>;
    effects: Scalars['Int']['input'];
    expire_at?: InputMaybe<Scalars['Time']['input']>;
    reason: Scalars['String']['input'];
    victim_id: Scalars['ObjectID']['input'];
};

export type MutationCreateCosmeticPaintArgs = {
    definition: CosmeticPaintInput;
};

export type MutationCreateEmoteSetArgs = {
    data: CreateEmoteSetInput;
    user_id: Scalars['ObjectID']['input'];
};

export type MutationCreateReportArgs = {
    data: CreateReportInput;
};

export type MutationCreateRoleArgs = {
    data: CreateRoleInput;
};

export type MutationDeleteRoleArgs = {
    role_id: Scalars['ObjectID']['input'];
};

export type MutationDismissVoidTargetModRequestsArgs = {
    object: Scalars['Int']['input'];
};

export type MutationEditBanArgs = {
    ban_id: Scalars['ObjectID']['input'];
    effects?: InputMaybe<Scalars['Int']['input']>;
    expire_at?: InputMaybe<Scalars['String']['input']>;
    reason?: InputMaybe<Scalars['String']['input']>;
};

export type MutationEditReportArgs = {
    data: EditReportInput;
    report_id: Scalars['ObjectID']['input'];
};

export type MutationEditRoleArgs = {
    data: EditRoleInput;
    role_id: Scalars['ObjectID']['input'];
};

export type MutationEmoteArgs = {
    id: Scalars['ObjectID']['input'];
};

export type MutationEmoteSetArgs = {
    id: Scalars['ObjectID']['input'];
};

export type MutationReadMessagesArgs = {
    message_ids: Array<Scalars['ObjectID']['input']>;
    read: Scalars['Boolean']['input'];
};

export type MutationSendInboxMessageArgs = {
    anonymous?: InputMaybe<Scalars['Boolean']['input']>;
    content: Scalars['String']['input'];
    important?: InputMaybe<Scalars['Boolean']['input']>;
    recipients: Array<Scalars['ObjectID']['input']>;
    subject: Scalars['String']['input'];
};

export type MutationUserArgs = {
    id: Scalars['ObjectID']['input'];
};

export enum ObjectKind {
    Ban = 'BAN',
    Emote = 'EMOTE',
    EmoteSet = 'EMOTE_SET',
    Entitlement = 'ENTITLEMENT',
    Message = 'MESSAGE',
    Report = 'REPORT',
    Role = 'ROLE',
    User = 'USER',
}

export enum Permission {
    BypassPrivacy = 'BYPASS_PRIVACY',
    CreateEmote = 'CREATE_EMOTE',
    CreateEmoteSet = 'CREATE_EMOTE_SET',
    CreateReport = 'CREATE_REPORT',
    EditAnyEmote = 'EDIT_ANY_EMOTE',
    EditAnyEmoteSet = 'EDIT_ANY_EMOTE_SET',
    EditEmote = 'EDIT_EMOTE',
    EditEmoteSet = 'EDIT_EMOTE_SET',
    FeatureProfilePictureAnimation = 'FEATURE_PROFILE_PICTURE_ANIMATION',
    FeatureZerowidthEmoteType = 'FEATURE_ZEROWIDTH_EMOTE_TYPE',
    ManageBans = 'MANAGE_BANS',
    ManageContent = 'MANAGE_CONTENT',
    ManageCosmetics = 'MANAGE_COSMETICS',
    ManageReports = 'MANAGE_REPORTS',
    ManageRoles = 'MANAGE_ROLES',
    ManageStack = 'MANAGE_STACK',
    ManageUsers = 'MANAGE_USERS',
    SendMessages = 'SEND_MESSAGES',
    SuperAdministrator = 'SUPER_ADMINISTRATOR',
}

export type Query = {
    __typename?: 'Query';
    actor?: Maybe<User>;
    announcement: Scalars['String']['output'];
    cosmetics: CosmeticsQuery;
    emote?: Maybe<Emote>;
    emoteSet: EmoteSet;
    emoteSetsByID: Array<EmoteSet>;
    emotes: EmoteSearchResult;
    emotesByID: Array<EmotePartial>;
    inbox: Array<InboxMessage>;
    modRequests: ModRequestMessageList;
    namedEmoteSet: EmoteSet;
    proxied_endpoint: Scalars['String']['output'];
    report?: Maybe<Report>;
    reports: Array<Maybe<Report>>;
    role?: Maybe<Role>;
    roles: Array<Maybe<Role>>;
    user: User;
    userByConnection: User;
    users: Array<UserPartial>;
    usersByID: Array<UserPartial>;
};

export type QueryCosmeticsArgs = {
    list?: InputMaybe<Array<Scalars['ObjectID']['input']>>;
};

export type QueryEmoteArgs = {
    id: Scalars['ObjectID']['input'];
};

export type QueryEmoteSetArgs = {
    id: Scalars['ObjectID']['input'];
};

export type QueryEmoteSetsByIdArgs = {
    list: Array<Scalars['ObjectID']['input']>;
};

export type QueryEmotesArgs = {
    filter?: InputMaybe<EmoteSearchFilter>;
    limit?: InputMaybe<Scalars['Int']['input']>;
    page?: InputMaybe<Scalars['Int']['input']>;
    query: Scalars['String']['input'];
    sort?: InputMaybe<Sort>;
};

export type QueryEmotesByIdArgs = {
    list: Array<Scalars['ObjectID']['input']>;
};

export type QueryInboxArgs = {
    after_id?: InputMaybe<Scalars['ObjectID']['input']>;
    limit?: InputMaybe<Scalars['Int']['input']>;
    user_id: Scalars['ObjectID']['input'];
};

export type QueryModRequestsArgs = {
    after_id?: InputMaybe<Scalars['ObjectID']['input']>;
    country?: InputMaybe<Scalars['String']['input']>;
    limit?: InputMaybe<Scalars['Int']['input']>;
    wish?: InputMaybe<Scalars['String']['input']>;
};

export type QueryNamedEmoteSetArgs = {
    name: EmoteSetName;
};

export type QueryProxied_EndpointArgs = {
    id: Scalars['Int']['input'];
    user_id?: InputMaybe<Scalars['ObjectID']['input']>;
};

export type QueryReportArgs = {
    id: Scalars['ObjectID']['input'];
};

export type QueryReportsArgs = {
    after_id?: InputMaybe<Scalars['ObjectID']['input']>;
    before_id?: InputMaybe<Scalars['ObjectID']['input']>;
    limit?: InputMaybe<Scalars['Int']['input']>;
    status?: InputMaybe<ReportStatus>;
};

export type QueryRoleArgs = {
    id: Scalars['ObjectID']['input'];
};

export type QueryUserArgs = {
    id: Scalars['ObjectID']['input'];
};

export type QueryUserByConnectionArgs = {
    id: Scalars['String']['input'];
    platform: ConnectionPlatform;
};

export type QueryUsersArgs = {
    limit?: InputMaybe<Scalars['Int']['input']>;
    page?: InputMaybe<Scalars['Int']['input']>;
    query: Scalars['String']['input'];
};

export type QueryUsersByIdArgs = {
    list: Array<Scalars['ObjectID']['input']>;
};

export type Report = {
    __typename?: 'Report';
    actor: User;
    actor_id: Scalars['ObjectID']['output'];
    assignees: Array<User>;
    body: Scalars['String']['output'];
    created_at: Scalars['Time']['output'];
    id: Scalars['ObjectID']['output'];
    notes: Array<Scalars['String']['output']>;
    priority: Scalars['Int']['output'];
    status: ReportStatus;
    subject: Scalars['String']['output'];
    target_id: Scalars['ObjectID']['output'];
    target_kind: Scalars['Int']['output'];
};

export enum ReportStatus {
    Assigned = 'ASSIGNED',
    Closed = 'CLOSED',
    Open = 'OPEN',
}

export type Role = {
    __typename?: 'Role';
    allowed: Scalars['String']['output'];
    color: Scalars['Int']['output'];
    created_at: Scalars['Time']['output'];
    denied: Scalars['String']['output'];
    id: Scalars['ObjectID']['output'];
    invisible: Scalars['Boolean']['output'];
    members: Array<User>;
    name: Scalars['String']['output'];
    position: Scalars['Int']['output'];
};

export type RoleMembersArgs = {
    limit?: InputMaybe<Scalars['Int']['input']>;
    page?: InputMaybe<Scalars['Int']['input']>;
};

export type Sort = {
    order: SortOrder;
    value: Scalars['String']['input'];
};

export enum SortOrder {
    Ascending = 'ASCENDING',
    Descending = 'DESCENDING',
}

export type UpdateEmoteSetInput = {
    capacity?: InputMaybe<Scalars['Int']['input']>;
    name?: InputMaybe<Scalars['String']['input']>;
    origins?: InputMaybe<Array<EmoteSetOriginInput>>;
};

export type User = {
    __typename?: 'User';
    activity: Array<AuditLog>;
    avatar_url: Scalars['String']['output'];
    biography: Scalars['String']['output'];
    connections: Array<Maybe<UserConnection>>;
    cosmetics: Array<UserCosmetic>;
    created_at: Scalars['Time']['output'];
    display_name: Scalars['String']['output'];
    editor_of: Array<UserEditor>;
    editors: Array<UserEditor>;
    emote_sets: Array<EmoteSet>;
    id: Scalars['ObjectID']['output'];
    inbox_unread_count: Scalars['Int']['output'];
    owned_emotes: Array<Emote>;
    reports: Array<Report>;
    roles: Array<Scalars['ObjectID']['output']>;
    style: UserStyle;
    type: Scalars['String']['output'];
    username: Scalars['String']['output'];
};

export type UserActivityArgs = {
    limit?: InputMaybe<Scalars['Int']['input']>;
};

export type UserConnectionsArgs = {
    type?: InputMaybe<Array<ConnectionPlatform>>;
};

export type UserConnection = {
    __typename?: 'UserConnection';
    display_name: Scalars['String']['output'];
    emote_capacity: Scalars['Int']['output'];
    emote_set_id?: Maybe<Scalars['ObjectID']['output']>;
    id: Scalars['String']['output'];
    linked_at: Scalars['Time']['output'];
    platform: ConnectionPlatform;
    username: Scalars['String']['output'];
};

export type UserConnectionPartial = {
    __typename?: 'UserConnectionPartial';
    display_name: Scalars['String']['output'];
    emote_capacity: Scalars['Int']['output'];
    emote_set_id?: Maybe<Scalars['ObjectID']['output']>;
    id: Scalars['String']['output'];
    linked_at: Scalars['Time']['output'];
    platform: ConnectionPlatform;
    username: Scalars['String']['output'];
};

export type UserConnectionUpdate = {
    emote_set_id?: InputMaybe<Scalars['ObjectID']['input']>;
    unlink?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UserCosmetic = {
    __typename?: 'UserCosmetic';
    id: Scalars['ObjectID']['output'];
    kind: CosmeticKind;
    selected: Scalars['Boolean']['output'];
};

export type UserCosmeticUpdate = {
    id: Scalars['ObjectID']['input'];
    kind: CosmeticKind;
    selected: Scalars['Boolean']['input'];
};

export type UserEditor = {
    __typename?: 'UserEditor';
    added_at: Scalars['Time']['output'];
    id: Scalars['ObjectID']['output'];
    permissions: Scalars['Int']['output'];
    user: UserPartial;
    visible: Scalars['Boolean']['output'];
};

export type UserEditorUpdate = {
    permissions?: InputMaybe<Scalars['Int']['input']>;
    visible?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UserOps = {
    __typename?: 'UserOps';
    connections?: Maybe<Array<Maybe<UserConnection>>>;
    cosmetics?: Maybe<Scalars['Boolean']['output']>;
    editors?: Maybe<Array<Maybe<UserEditor>>>;
    id: Scalars['ObjectID']['output'];
    roles: Array<Scalars['ObjectID']['output']>;
};

export type UserOpsConnectionsArgs = {
    data: UserConnectionUpdate;
    id: Scalars['String']['input'];
};

export type UserOpsCosmeticsArgs = {
    update: UserCosmeticUpdate;
};

export type UserOpsEditorsArgs = {
    data: UserEditorUpdate;
    editor_id: Scalars['ObjectID']['input'];
};

export type UserOpsRolesArgs = {
    action: ListItemAction;
    role_id: Scalars['ObjectID']['input'];
};

export type UserPartial = {
    __typename?: 'UserPartial';
    avatar_url: Scalars['String']['output'];
    biography: Scalars['String']['output'];
    connections: Array<UserConnectionPartial>;
    created_at: Scalars['Time']['output'];
    display_name: Scalars['String']['output'];
    emote_sets: Array<EmoteSetPartial>;
    id: Scalars['ObjectID']['output'];
    roles: Array<Scalars['ObjectID']['output']>;
    style: UserStyle;
    type: Scalars['String']['output'];
    username: Scalars['String']['output'];
};

export type UserPartialConnectionsArgs = {
    type?: InputMaybe<Array<ConnectionPlatform>>;
};

export type UserSearchResult = {
    __typename?: 'UserSearchResult';
    items: Array<UserPartial>;
    total: Scalars['Int']['output'];
};

export type UserStyle = {
    __typename?: 'UserStyle';
    badge?: Maybe<CosmeticBadge>;
    badge_id?: Maybe<Scalars['ObjectID']['output']>;
    color: Scalars['Int']['output'];
    paint?: Maybe<CosmeticPaint>;
    paint_id?: Maybe<Scalars['ObjectID']['output']>;
};

export type GetEmoteSetsByTwitchIdQueryVariables = Exact<{
    twitchId: Scalars['String']['input'];
}>;

export type GetEmoteSetsByTwitchIdQuery = {
    __typename?: 'Query';
    userByConnection: {
        __typename?: 'User';
        id: any;
        emote_sets: Array<{
            __typename?: 'EmoteSet';
            id: any;
            name: string;
            emotes: Array<{
                __typename?: 'ActiveEmote';
                id: any;
                name: string;
                timestamp: any;
                origin_id?: any | null;
                data: { __typename?: 'EmotePartial'; name: string };
            }>;
        }>;
    };
};

export const GetEmoteSetsByTwitchIdDocument = gql`
    query getEmoteSetsByTwitchId($twitchId: String!) {
        userByConnection(platform: TWITCH, id: $twitchId) {
            id
            emote_sets {
                id
                name
                emotes {
                    id
                    name
                    timestamp
                    origin_id
                    data {
                        name
                    }
                }
            }
        }
    }
`;

export type SdkFunctionWrapper = <T>(
    action: (requestHeaders?: Record<string, string>) => Promise<T>,
    operationName: string,
    operationType?: string
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
    return {
        getEmoteSetsByTwitchId(
            variables: GetEmoteSetsByTwitchIdQueryVariables,
            requestHeaders?: GraphQLClientRequestHeaders
        ): Promise<GetEmoteSetsByTwitchIdQuery> {
            return withWrapper(
                (wrappedRequestHeaders) =>
                    client.request<GetEmoteSetsByTwitchIdQuery>(
                        GetEmoteSetsByTwitchIdDocument,
                        variables,
                        { ...requestHeaders, ...wrappedRequestHeaders }
                    ),
                'getEmoteSetsByTwitchId',
                'query'
            );
        },
    };
}
export type Sdk = ReturnType<typeof getSdk>;
