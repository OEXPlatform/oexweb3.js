export const CALL_CONTRACT = 0x00;
export const CREATE_CONTRACT = 0x01;
export const CALL_CONTRACT_MULTIASSET = 0x02;

export const CREATE_NEW_ACCOUNT = 0x100;
export const UPDATE_ACCOUNT_FOUNDER = 0x101;
export const DELETE_ACCOUNT = 0x102;
export const UPDATE_ACCOUNT_AUTHOR = 0x103;
export const UPDATE_ACCOUNT_DESC = 0x104;

export const INCREASE_ASSET = 0x200;
export const ISSUE_ASSET = 0x201;
export const DESTORY_ASSET = 0x202;
export const SET_ASSET_OWNER = 0x203;
export const UPDATE_ASSET_FOUNDER = 0x204;
export const TRANSFER = 0x205;
export const UPDATE_ASSET_CONTRACT = 0x206;

export const REG_CANDIDATE = 0x300;
export const UPDATE_CANDIDATE_URL = 0x301;
export const UNREG_CANDIDATE = 0x302;
export const REFUND_CANDIDATE = 0x303;
export const VOTE_CANDIDATE = 0x304;
export const UPDATE_CANDIDATE_PUBLICKEY = 0x305;

export const KICKED_CANDIDATE = 0x400;
export const EXIT_TAKEOVER = 0x401;
export const REMOVE_KICKED_CANDIDATE = 0x402;

export const WITHDRAW_FEE = 0x500;